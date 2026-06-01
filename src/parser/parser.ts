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
  IdentifierNode,
  NumberLiteralNode,
  MemberExpressionNode,
} from "./constants/ast";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ARITHMETIC_L1 = new Set(["+", "-"]);      // lower precedence
const ARITHMETIC_L2 = new Set(["*", "/"]);      // higher precedence

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
    const token = this.tokens[this.pos]!;
    this.pos++;
    return token;
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

  /** Program -> Kernel EOF */
  parse(): ProgramNode {
    const kernel = this.parseKernel();
    if (!this.isAtEnd()) {
      const t = this.peek();
      throw new SyntaxError(
        `Unexpected trailing token "${t?.value ?? "EOF"}" ` +
          `at line ${t?.line}, column ${t?.column}`
      );
    }
    return { type: "Program", body: [kernel] };
  }

  // ── Kernel ──────────────────────────────────────────────────────────────────

  /** Kernel -> Decorator KernelDefinition */
  private parseKernel(): KernelDefinitionNode {
    const decorator = this.parseDecorator();
    const defn = this.parseKernelDefinition();
    return { ...defn, decorator };
  }

  /** Decorator -> "@" "triton" "." "jit" */
  private parseDecorator(): string {
    this.expect("@");
    this.expect("triton");
    this.expect(".");
    this.expect("jit");
    return "@triton.jit";
  }

  /** KernelDefinition -> "def" ID "(" ParamList ")" ":" Block */
  private parseKernelDefinition(): Omit<KernelDefinitionNode, "decorator"> {
    this.expect("def");
    const nameToken = this.peek();
    if (nameToken?.type !== "IDENTIFIER") {
      throw new SyntaxError(
        `Expected kernel name (ID) but got "${nameToken?.value ?? "EOF"}" ` +
          `at line ${nameToken?.line}, column ${nameToken?.column}`
      );
    }
    const name = this.advance().value;

    this.expect("(");
    const params = this.parseParamList();
    this.expect(")");
    this.expect(":");

    const body = this.parseBlock();

    return { type: "KernelDefinition", name, params, body };
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
   * Block -> "{" Statement* "}"
   * Grammar uses C-style braces, not Python indentation.
   */
  private parseBlock(): BlockNode {
    this.expect("{");
    const statements: ASTNode[] = [];

    while (!this.isAtEnd() && !this.check("}")) {
      statements.push(this.parseStatement());
    }

    this.expect("}");
    return { type: "Block", statements };
  }

  /**
   * Statement -> VariableAssignment | ExpressionStatement
   */
  private parseStatement(): ASTNode {
    const cur = this.peek();
    const next = this.peekAt(1);

    // VariableAssignment -> ID "=" Expression ";"
    if (
      cur?.type === "IDENTIFIER" &&
      next?.value === "="
    ) {
      return this.parseVariableAssignment();
    }

    // Everything else → ExpressionStatement
    return this.parseExpressionStatement();
  }

  /**
   * VariableAssignment -> ID AssignmentOperator Expression ";"
   */
  private parseVariableAssignment(): VariableAssignmentNode {
    const name = this.advance().value;
    const operator = this.expect("=").value;
    const right = this.parseExpression();
    this.expect(";");

    return {
      type: "VariableAssignment",
      operator,
      left: { type: "Identifier", name },
      right,
    };
  }

  /**
   * ExpressionStatement -> Expression ";"
   */
  private parseExpressionStatement(): ExpressionStatementNode {
    const expression = this.parseExpression();
    this.expect(";");
    return { type: "ExpressionStatement", expression };
  }

  // ── Expressions (precedence climbing) ──────────────────────────────────────

  /** Expression -> Term (ArithmeticOperatorLevelOne Term)* */
  private parseExpression(): ASTNode {
    let left = this.parseTerm();

    while (!this.isAtEnd() && ARITHMETIC_L1.has(this.peek()?.value)) {
      const operator = this.advance().value;
      const right = this.parseTerm();
      left = { type: "BinaryExpression", operator, left, right } as BinaryExpressionNode;
    }

    return left;
  }

  /** Term -> Factor (ArithmeticOperatorLevelTwo Factor)* */
  private parseTerm(): ASTNode {
    let left = this.parseFactor();

    while (!this.isAtEnd() && ARITHMETIC_L2.has(this.peek()?.value)) {
      const operator = this.advance().value;
      const right = this.parseFactor();
      left = { type: "BinaryExpression", operator, left, right } as BinaryExpressionNode;
    }

    return left;
  }

  /** Factor -> NUMBER | "(" Expression ")" | NameOrCall */
  private parseFactor(): ASTNode {
    // Parenthesized expression
    if (this.check("(")) {
      this.advance();
      const expr = this.parseExpression();
      this.expect(")");
      return expr;
    }

    const token = this.peek();

    if (token?.type === "NUMBER") {
      this.advance();
      return { type: "NumberLiteral", value: Number(token.value) } as NumberLiteralNode;
    }

    return this.parseNameOrCall();
  }

  /**
   * NameOrCall ->
   *   ID "." ID "(" (Expression ("," Expression)*)? ")"
   * | ID ("(" (Expression ("," Expression)*)? ")")?
   */
  private parseNameOrCall(): ASTNode {
    const token = this.peek();
    if (token?.type !== "IDENTIFIER") {
      throw new SyntaxError(
        `Expected name (ID) but got "${token?.value ?? "EOF"}" ` +
          `at line ${token?.line}, column ${token?.column}`
      );
    }

    const first = this.advance().value;

    // Member call: ID "." ID "(" ... ")"
    if (this.check(".")) {
      this.advance();
      const secondTok = this.peek();
      if (secondTok?.type !== "IDENTIFIER") {
        throw new SyntaxError(
          `Expected member name (ID) but got "${secondTok?.value ?? "EOF"}" ` +
            `at line ${secondTok?.line}, column ${secondTok?.column}`
        );
      }
      const second = this.advance().value;

      // Grammar requires a call after member selection
      if (!this.check("(")) {
        const t = this.peek();
        throw new SyntaxError(
          `Expected "(" after "${first}.${second}" but got "${t?.value ?? "EOF"}" ` +
            `at line ${t?.line}, column ${t?.column}`
        );
      }

      const member: MemberExpressionNode = {
        type: "MemberExpression",
        object: first,
        property: second,
      };

      return this.parseFunctionCall(member);
    }

    // Optional call: ID "(" ... ")"
    if (this.check("(")) {
      const callee: IdentifierNode = { type: "Identifier", name: first };
      return this.parseFunctionCall(callee);
    }

    return { type: "Identifier", name: first } as IdentifierNode;
  }

  // ── Function Calls ──────────────────────────────────────────────────────────

  /** FunctionCall -> callee "(" (Expression ("," Expression)*)? ")" */
  private parseFunctionCall(callee: ASTNode): FunctionCallNode {
    this.expect("(");
    const args: ASTNode[] = [];

    if (!this.check(")")) {
      args.push(this.parseExpression());

      while (this.check(",")) {
        this.advance(); // consume ","
        if (this.check(")")) break; // trailing comma
        args.push(this.parseExpression());
      }
    }

    this.expect(")");
    return { type: "FunctionCall", callee, args };
  }

  // (No keyword-args in the provided grammar)
}