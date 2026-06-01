import { Token } from "./constants/tokens";
import {
  ASTNode,
  ProgramNode,
  KernelDefinitionNode,
  ParamNode,
  BlockNode,
  VariableAssignmentNode,
  ExpressionStatementNode,
  BinaryExpressionNode,
  FunctionCallNode,
  KeywordArgNode,
  IdentifierNode,
  NumberLiteralNode,
  StringLiteralNode,
  MemberExpressionNode,
} from "./constants/ast";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ASSIGNMENT_OPERATORS = new Set(["=", "+=", "-=", "*=", "/="]);
const ARITHMETIC_L1 = new Set(["+", "-"]);         // lower precedence
const ARITHMETIC_L2 = new Set(["*", "/", "%"]);    // higher precedence
const COMPARISON_OPS = new Set(["<", ">", "<=", ">=", "==", "!="]);

// ─── Parser Class ─────────────────────────────────────────────────────────────

export class Parser {
  private tokens: Token[];
  private pos: number = 0;

  constructor(tokens: Token[], debug = false) {
    // Strip newlines — they guided the lexer but carry no AST meaning.
    // Filter by both type name and value to handle any lexer variations.
    const SKIP_TYPES = new Set([
      "NEWLINE", "NL", "WHITESPACE",
      "INDENT",  // Python-style indent marker — your lexer emits these
      "DEDENT",  // Python-style dedent marker
      "EOF",     // end-of-file sentinel
    ]);

    this.tokens = tokens.filter((t) => {
      if (SKIP_TYPES.has(t.type)) return false;
      if (t.value === "\n" || t.value === "\r\n" || t.value === "\r") return false;
      return true;
    });

    if (debug) {
      console.error("=== Tokens after filtering ===");
      this.tokens.forEach((t, i) =>
        console.error(`  [${i}] ${t.type.padEnd(12)} "${t.value}" @ ${t.line}:${t.column}`)
      );
      console.error("==============================\n");
    }
  }

  // ── Cursor helpers ──────────────────────────────────────────────────────────

  private peek(): Token {
    return this.tokens[this.pos]!;
  }

  private peekAt(offset: number): Token | undefined {
    return this.tokens[this.pos + offset];
  }

  private advance(): Token {
    const token = this.tokens[this.pos];
    this.pos++;
    return token!;
  }

  private isAtEnd(): boolean {
    return this.pos >= this.tokens.length;
  }

  /** Consume a token, throw if it doesn't match the expected value/type. */
  private expect(value: string): Token {
    const token = this.peek();
    if (!token || token.value !== value) {
      throw new SyntaxError(
        `Expected "${value}" but got "${token?.value ?? "EOF"}" ` +
          `at line ${token?.line}, column ${token?.column}`
      );
    }
    return this.advance();
  }

  /** Return true (and do NOT consume) if the current token matches. */
  private check(value: string): boolean {
    return !this.isAtEnd() && this.peek().value === value;
  }

  /** Consume and return true only if the current token matches. */
  private match(...values: string[]): boolean {
    if (values.includes(this.peek()?.value)) {
      this.advance();
      return true;
    }
    return false;
  }

  // ── Entry Point ─────────────────────────────────────────────────────────────

  /**
   * Program -> (non-kernel-preamble)* KernelDefinition* EOF
   *
   * Skips import statements and any other top-level code that precedes
   * a @triton.jit decorator. Only nodes that start with "@" are parsed
   * as kernel definitions; everything else is consumed and discarded.
   */
  parse(): ProgramNode {
    const body: ASTNode[] = [];

    while (!this.isAtEnd()) {
      if (this.check("@")) {
        body.push(this.parseKernelDefinition());
      } else {
        // Skip tokens that belong to import lines or other preamble
        // until we hit the next "@" or EOF.
        this.advance();
      }
    }

    return { type: "Program", body };
  }

  // ── Kernel ──────────────────────────────────────────────────────────────────

  /**
   * KernelDefinition -> Decorator "def" ID "(" ParamList ")" ":" Block
   */
  private parseKernelDefinition(): KernelDefinitionNode {
    // Decorator: @triton.jit
    this.expect("@");
    const decoratorObj = this.advance().value;   // "triton"
    this.expect(".");
    const decoratorProp = this.advance().value;  // "jit"
    const decorator = `@${decoratorObj}.${decoratorProp}`;

    // def <name>
    this.expect("def");
    const name = this.advance().value;

    // ( ParamList )
    this.expect("(");
    const params = this.parseParamList();
    this.expect(")");
    this.expect(":");

    // Block (indent-delimited — we use implicit block via remaining tokens)
    const body = this.parseBlock();

    return { type: "KernelDefinition", decorator, name, params, body };
  }

  // ── Parameters ──────────────────────────────────────────────────────────────

  /**
   * ParamList -> ε | Param ("," Param)*
   */
  private parseParamList(): ParamNode[] {
    const params: ParamNode[] = [];
    if (this.check(")")) return params;

    params.push(this.parseParam());

    while (this.check(",")) {
      this.advance(); // consume ","
      if (this.check(")")) break; // trailing comma
      params.push(this.parseParam());
    }

    return params;
  }

  /**
   * Param -> ID (":" "tl" "." "constexpr")?
   */
  private parseParam(): ParamNode {
    const name = this.advance().value;
    let constexpr = false;

    if (this.check(":")) {
      this.advance(); // ":"
      this.expect("tl");
      this.expect(".");
      this.expect("constexpr");
      constexpr = true;
    }

    return { type: "Param", name, constexpr };
  }

  // ── Block & Statements ──────────────────────────────────────────────────────

  /**
   * Block -> Statement*
   * (Python-style indentation is already gone; we parse until EOF
   *  or until we see a top-level "def"/"@" that starts a new kernel.)
   */
  private parseBlock(): BlockNode {
    const statements: ASTNode[] = [];

    while (!this.isAtEnd() && !this.isNewKernelStart()) {
      statements.push(this.parseStatement());
    }

    return { type: "Block", statements };
  }

  /** True when the next token begins a new kernel (@) or top-level def. */
  private isNewKernelStart(): boolean {
    const peek = this.peek()?.value;
    return peek === "@" || peek === "def";
  }

  /**
   * Statement -> VariableAssignment | ExpressionStatement
   *
   * Disambiguation:  ID  =  …   → assignment
   *                  ID  .  …   → expression (member call)
   *                  ID  (  …   → expression (call)
   */
  private parseStatement(): ASTNode {
    const cur = this.peek();
    const next = this.peekAt(1);

    // ID followed by an assignment operator → VariableAssignment
    if (
      cur?.type === "IDENTIFIER" &&
      next?.type === "OPERATOR" &&
      ASSIGNMENT_OPERATORS.has(next.value)
    ) {
      return this.parseVariableAssignment();
    }

    // Everything else → ExpressionStatement
    return this.parseExpressionStatement();
  }

  /**
   * VariableAssignment -> ID AssignmentOperator Expression
   */
  private parseVariableAssignment(): VariableAssignmentNode {
    const name = this.advance().value;
    const operator = this.advance().value; // "=", "+=", etc.
    const right = this.parseExpression();

    return {
      type: "VariableAssignment",
      operator,
      left: { type: "Identifier", name },
      right,
    };
  }

  /**
   * ExpressionStatement -> Expression
   */
  private parseExpressionStatement(): ExpressionStatementNode {
    const expression = this.parseExpression();
    return { type: "ExpressionStatement", expression };
  }

  // ── Expressions (precedence climbing) ──────────────────────────────────────

  /**
   * Expression -> Comparison (handles +, -, *, /, <, >, ==, etc.)
   */
  private parseExpression(): ASTNode {
    return this.parseComparison();
  }

  /**
   * Comparison -> Term (ComparisonOp Term)*
   */
  private parseComparison(): ASTNode {
    let left = this.parseTerm();

    while (!this.isAtEnd() && COMPARISON_OPS.has(this.peek()?.value)) {
      const operator = this.advance().value;
      const right = this.parseTerm();
      left = { type: "BinaryExpression", operator, left, right } as BinaryExpressionNode;
    }

    return left;
  }

  /**
   * Term -> Factor (("+"|"-") Factor)*
   */
  private parseTerm(): ASTNode {
    let left = this.parseFactor();

    while (!this.isAtEnd() && ARITHMETIC_L1.has(this.peek()?.value)) {
      const operator = this.advance().value;
      const right = this.parseFactor();
      left = { type: "BinaryExpression", operator, left, right } as BinaryExpressionNode;
    }

    return left;
  }

  /**
   * Factor -> Unary (("*"|"/") Unary)*
   */
  private parseFactor(): ASTNode {
    let left = this.parsePrimary();

    while (!this.isAtEnd() && ARITHMETIC_L2.has(this.peek()?.value)) {
      const operator = this.advance().value;
      const right = this.parsePrimary();
      left = { type: "BinaryExpression", operator, left, right } as BinaryExpressionNode;
    }

    return left;
  }

  // ── Primary ─────────────────────────────────────────────────────────────────

  /**
   * Primary -> NUMBER | STRING | FunctionCall | MemberExpression | Identifier
   *
   * Handles:
   *   tl.arange(0, BLOCK_SIZE)   → FunctionCall   (callee = MemberExpression)
   *   tl.load(ptr, mask=mask)    → FunctionCall   (with KeywordArgs)
   *   pid                        → Identifier
   *   42                         → NumberLiteral
   */
  private parsePrimary(): ASTNode {
    const token = this.peek();

    // Number literal
    if (token.type === "NUMBER") {
      this.advance();
      return { type: "NumberLiteral", value: Number(token.value) } as NumberLiteralNode;
    }

    // String literal
    if (token.type === "STRING") {
      this.advance();
      // Strip surrounding quotes
      const raw = token.value.replace(/^["']|["']$/g, "");
      return { type: "StringLiteral", value: raw } as StringLiteralNode;
    }

    // Identifier — could become a MemberExpression or FunctionCall
    if (token.type === "IDENTIFIER") {
      const name = this.advance().value;

      // Member access:  name "." property
      if (this.check(".")) {
        this.advance(); // consume "."
        const property = this.advance().value;

        const member: MemberExpressionNode = {
          type: "MemberExpression",
          object: name,
          property,
        };

        // Function call:  name.property "(" args ")"
        if (this.check("(")) {
          return this.parseFunctionCall(member);
        }

        return member;
      }

      // Plain function call:  name "(" args ")"
      if (this.check("(")) {
        const callee: IdentifierNode = { type: "Identifier", name };
        return this.parseFunctionCall(callee);
      }

      // Plain identifier
      return { type: "Identifier", name } as IdentifierNode;
    }

    throw new SyntaxError(
      `Unexpected token "${token.value}" (${token.type}) ` +
        `at line ${token.line}, column ${token.column}`
    );
  }

  // ── Function Calls ──────────────────────────────────────────────────────────

  /**
   * FunctionCall -> callee "(" ArgList ")"
   *
   * ArgList -> ε | Arg ("," Arg)*
   * Arg     -> (ID "=")? Expression        ← positional or keyword
   */
  private parseFunctionCall(callee: ASTNode): FunctionCallNode {
    this.expect("(");
    const args: ASTNode[] = [];

    if (!this.check(")")) {
      args.push(this.parseArg());

      while (this.check(",")) {
        this.advance(); // consume ","
        if (this.check(")")) break; // trailing comma
        args.push(this.parseArg());
      }
    }

    this.expect(")");
    return { type: "FunctionCall", callee, args };
  }

  /**
   * Arg -> (ID "=")? Expression
   *
   * Keyword arg detection: ID followed immediately by "=" that is NOT
   * part of a comparison operator (!=, ==, >=, <=).
   */
  private parseArg(): ASTNode {
    const cur = this.peek();
    const next = this.peekAt(1);

    const isKeyword =
      cur?.type === "IDENTIFIER" &&
      next?.type === "OPERATOR" &&
      next?.value === "=";

    if (isKeyword) {
      const key = this.advance().value;
      this.advance(); // "="
      const value = this.parseExpression();
      return { type: "KeywordArg", key, value } as KeywordArgNode;
    }

    return this.parseExpression();
  }
}