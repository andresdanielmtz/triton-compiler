import assert from "assert/strict";
import test from "node:test";
import { Parser } from "../parser";
import { TOKEN_TYPE, Token } from "../constants/tokens";
import {
  ProgramNode,
  KernelDefinitionNode,
  VariableAssignmentNode,
  ExpressionStatementNode,
  BinaryExpressionNode,
  FunctionCallNode,
  KeywordArgNode,
  MemberExpressionNode,
  IdentifierNode,
  NumberLiteralNode,
} from "../constants/ast";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Build a minimal @triton.jit kernel token stream with the given body tokens. */
const makeKernelTokens = (
  params: Token[],
  body: Token[]
): Token[] => [
  { type: TOKEN_TYPE.DELIMITER,  value: "@",                line: 1, column: 1  },
  { type: TOKEN_TYPE.IDENTIFIER, value: "triton",           line: 1, column: 2  },
  { type: TOKEN_TYPE.DELIMITER,  value: ".",                line: 1, column: 8  },
  { type: TOKEN_TYPE.IDENTIFIER, value: "jit",              line: 1, column: 9  },
  { type: TOKEN_TYPE.NEWLINE,    value: "\n",               line: 1, column: 12 },
  { type: TOKEN_TYPE.KEYWORD,    value: "def",              line: 2, column: 1  },
  { type: TOKEN_TYPE.IDENTIFIER, value: "my_kernel",        line: 2, column: 5  },
  { type: TOKEN_TYPE.DELIMITER,  value: "(",                line: 2, column: 14 },
  ...params,
  { type: TOKEN_TYPE.DELIMITER,  value: ")",                line: 2, column: 99 },
  { type: TOKEN_TYPE.DELIMITER,  value: ":",                line: 2, column: 100},
  { type: TOKEN_TYPE.NEWLINE,    value: "\n",               line: 2, column: 101},
  { type: TOKEN_TYPE.INDENT,     value: "    ",             line: 3, column: 1  },
  ...body,
  { type: TOKEN_TYPE.DEDENT,     value: "",                 line: 99, column: 1 },
  { type: TOKEN_TYPE.EOF,        value: "",                 line: 99, column: 1 },
];

const id   = (value: string, line = 1, column = 1): Token =>
  ({ type: TOKEN_TYPE.IDENTIFIER, value, line, column });
const op   = (value: string, line = 1, column = 1): Token =>
  ({ type: TOKEN_TYPE.OPERATOR,   value, line, column });
const delim = (value: string, line = 1, column = 1): Token =>
  ({ type: TOKEN_TYPE.DELIMITER,  value, line, column });
const num  = (value: string, line = 1, column = 1): Token =>
  ({ type: TOKEN_TYPE.NUMBER,     value, line, column });


// ─── Program structure ────────────────────────────────────────────────────────

test("parse() returns a Program node", () => {
  const tokens = makeKernelTokens(
    [],
    [id("x"), op("="), id("y")]
  );
  const ast = new Parser(tokens).parse();
  assert.equal(ast.type, "Program");
  assert.ok(Array.isArray(ast.body));
});

test("parse() skips preamble tokens before @triton.jit", () => {
  const tokens: Token[] = [
    id("import"), id("torch"),
    { type: TOKEN_TYPE.NEWLINE, value: "\n", line: 1, column: 12 },
    id("import"), id("triton"),
    { type: TOKEN_TYPE.NEWLINE, value: "\n", line: 2, column: 14 },
    ...makeKernelTokens([], [id("x"), op("="), id("y")]),
  ];
  const ast = new Parser(tokens).parse();
  assert.equal(ast.body.length, 1);
  assert.equal(ast.body[0]!.type, "KernelDefinition");
});

test("parse() collects multiple kernel definitions", () => {
  const kernelTokens = makeKernelTokens([], [id("x"), op("="), id("y")]);
  // Two kernels back-to-back (second reuses same tokens — position overlap is fine for parser)
  const tokens = [...kernelTokens, ...kernelTokens];
  const ast = new Parser(tokens).parse();
  assert.equal(ast.body.length, 2);
});

// ─── Kernel definition ────────────────────────────────────────────────────────

test("parseKernelDefinition() captures decorator and name", () => {
  const tokens = makeKernelTokens([], [id("x"), op("="), id("y")]);
  const ast = new Parser(tokens).parse();
  const kernel = ast.body[0] as KernelDefinitionNode;

  assert.equal(kernel.type, "KernelDefinition");
  assert.equal(kernel.decorator, "@triton.jit");
  assert.equal(kernel.name, "my_kernel");
});

test("parseKernelDefinition() parses empty param list", () => {
  const tokens = makeKernelTokens([], [id("x"), op("="), id("y")]);
  const kernel = (new Parser(tokens).parse().body[0]) as KernelDefinitionNode;
  assert.deepEqual(kernel.params, []);
});

test("parseKernelDefinition() parses simple params", () => {
  const params: Token[] = [
    id("x_ptr"), delim(","), id("y_ptr"), delim(","), id("n_elements"),
  ];
  const tokens = makeKernelTokens(params, [id("x"), op("="), id("y")]);
  const kernel = (new Parser(tokens).parse().body[0]) as KernelDefinitionNode;

  assert.equal(kernel.params.length, 3);
  assert.deepEqual(kernel.params[0], { type: "Param", name: "x_ptr",     constexpr: false });
  assert.deepEqual(kernel.params[1], { type: "Param", name: "y_ptr",     constexpr: false });
  assert.deepEqual(kernel.params[2], { type: "Param", name: "n_elements",constexpr: false });
});

test("parseKernelDefinition() parses tl.constexpr param", () => {
  const params: Token[] = [
    id("BLOCK_SIZE"), delim(":"),
    id("tl"), delim("."), id("constexpr"),
  ];
  const tokens = makeKernelTokens(params, [id("x"), op("="), id("y")]);
  const kernel = (new Parser(tokens).parse().body[0]) as KernelDefinitionNode;

  assert.equal(kernel.params.length, 1);
  assert.deepEqual(kernel.params[0], { type: "Param", name: "BLOCK_SIZE", constexpr: true });
});

test("parseKernelDefinition() parses mixed params with trailing constexpr", () => {
  const params: Token[] = [
    id("x_ptr"), delim(","),
    id("n_elements"), delim(","),
    id("BLOCK_SIZE"), delim(":"), id("tl"), delim("."), id("constexpr"),
  ];
  const tokens = makeKernelTokens(params, [id("x"), op("="), id("y")]);
  const kernel = (new Parser(tokens).parse().body[0]) as KernelDefinitionNode;

  assert.equal(kernel.params.length, 3);
  const [first, second, third] = kernel.params;
  assert.equal(first!.constexpr, false);
  assert.equal(second!.constexpr, false);
  assert.equal(third!.constexpr, true);
  assert.equal(third!.name, "BLOCK_SIZE");

});

// ─── Statements ───────────────────────────────────────────────────────────────

test("parseStatement() produces VariableAssignment for 'x = y'", () => {
  const body: Token[] = [id("x"), op("="), id("y")];
  const tokens = makeKernelTokens([], body);
  const kernel = (new Parser(tokens).parse().body[0]) as KernelDefinitionNode;
  const stmt = kernel.body.statements[0] as VariableAssignmentNode;

  assert.equal(stmt.type, "VariableAssignment");
  assert.equal(stmt.operator, "=");
  assert.deepEqual(stmt.left,  { type: "Identifier", name: "x" });
  assert.deepEqual(stmt.right, { type: "Identifier", name: "y" });
});

test("parseStatement() produces VariableAssignment for compound operators", () => {
  for (const operator of ["+=", "-=", "*=", "/="]) {
    const body: Token[] = [id("x"), op(operator), id("y")];
    const tokens = makeKernelTokens([], body);
    const kernel = (new Parser(tokens).parse().body[0]) as KernelDefinitionNode;
    const stmt = kernel.body.statements[0] as VariableAssignmentNode;

    assert.equal(stmt.type, "VariableAssignment");
    assert.equal(stmt.operator, operator);
  }
});

test("parseStatement() produces ExpressionStatement for standalone call", () => {
  // tl.store(ptr)
  const body: Token[] = [
    id("tl"), delim("."), id("store"),
    delim("("), id("ptr"), delim(")"),
  ];
  const tokens = makeKernelTokens([], body);
  const kernel = (new Parser(tokens).parse().body[0]) as KernelDefinitionNode;
  const stmt = kernel.body.statements[0] as ExpressionStatementNode;

  assert.equal(stmt.type, "ExpressionStatement");
  assert.equal((stmt.expression as FunctionCallNode).type, "FunctionCall");
});

// ─── Expressions ──────────────────────────────────────────────────────────────

test("parsePrimary() handles NumberLiteral", () => {
  const body: Token[] = [id("x"), op("="), num("42")];
  const tokens = makeKernelTokens([], body);
  const kernel = (new Parser(tokens).parse().body[0]) as KernelDefinitionNode;
  const stmt = kernel.body.statements[0] as VariableAssignmentNode;

  assert.deepEqual(stmt.right, { type: "NumberLiteral", value: 42 });
});

test("parseTerm() handles binary + expression", () => {
  // x = a + b
  const body: Token[] = [id("x"), op("="), id("a"), op("+"), id("b")];
  const tokens = makeKernelTokens([], body);
  const kernel = (new Parser(tokens).parse().body[0]) as KernelDefinitionNode;
  const stmt = kernel.body.statements[0] as VariableAssignmentNode;
  const expr = stmt.right as BinaryExpressionNode;

  assert.equal(expr.type, "BinaryExpression");
  assert.equal(expr.operator, "+");
  assert.deepEqual(expr.left,  { type: "Identifier", name: "a" });
  assert.deepEqual(expr.right, { type: "Identifier", name: "b" });
});

test("parseFactor() handles binary * expression", () => {
  // x = pid * BLOCK_SIZE
  const body: Token[] = [id("x"), op("="), id("pid"), op("*"), id("BLOCK_SIZE")];
  const tokens = makeKernelTokens([], body);
  const kernel = (new Parser(tokens).parse().body[0]) as KernelDefinitionNode;
  const stmt = kernel.body.statements[0] as VariableAssignmentNode;
  const expr = stmt.right as BinaryExpressionNode;

  assert.equal(expr.type, "BinaryExpression");
  assert.equal(expr.operator, "*");
});

test("operator precedence: * binds tighter than +", () => {
  // x = a + b * c  →  BinaryExpr(+, a, BinaryExpr(*, b, c))
  const body: Token[] = [
    id("x"), op("="),
    id("a"), op("+"), id("b"), op("*"), id("c"),
  ];
  const tokens = makeKernelTokens([], body);
  const kernel = (new Parser(tokens).parse().body[0]) as KernelDefinitionNode;
  const stmt = kernel.body.statements[0] as VariableAssignmentNode;
  const outer = stmt.right as BinaryExpressionNode;

  assert.equal(outer.operator, "+");
  assert.deepEqual(outer.left, { type: "Identifier", name: "a" });

  const inner = outer.right as BinaryExpressionNode;
  assert.equal(inner.operator, "*");
  assert.deepEqual(inner.left,  { type: "Identifier", name: "b" });
  assert.deepEqual(inner.right, { type: "Identifier", name: "c" });
});

test("parseComparison() handles < operator", () => {
  // mask = offsets < n_elements
  const body: Token[] = [id("mask"), op("="), id("offsets"), op("<"), id("n_elements")];
  const tokens = makeKernelTokens([], body);
  const kernel = (new Parser(tokens).parse().body[0]) as KernelDefinitionNode;
  const stmt = kernel.body.statements[0] as VariableAssignmentNode;
  const expr = stmt.right as BinaryExpressionNode;

  assert.equal(expr.type, "BinaryExpression");
  assert.equal(expr.operator, "<");
  assert.deepEqual(expr.left,  { type: "Identifier", name: "offsets"    });
  assert.deepEqual(expr.right, { type: "Identifier", name: "n_elements" });
});

// ─── Member expressions & function calls ─────────────────────────────────────

test("parsePrimary() handles MemberExpression (tl.program_id)", () => {
  // x = tl.program_id
  const body: Token[] = [id("x"), op("="), id("tl"), delim("."), id("program_id")];
  const tokens = makeKernelTokens([], body);
  const kernel = (new Parser(tokens).parse().body[0]) as KernelDefinitionNode;
  const stmt = kernel.body.statements[0] as VariableAssignmentNode;

  assert.deepEqual(stmt.right, {
    type: "MemberExpression",
    object: "tl",
    property: "program_id",
  });
});

test("parseFunctionCall() handles tl.program_id(0)", () => {
  // pid = tl.program_id(0)
  const body: Token[] = [
    id("pid"), op("="),
    id("tl"), delim("."), id("program_id"),
    delim("("), num("0"), delim(")"),
  ];
  const tokens = makeKernelTokens([], body);
  const kernel = (new Parser(tokens).parse().body[0]) as KernelDefinitionNode;
  const stmt = kernel.body.statements[0] as VariableAssignmentNode;
  const call = stmt.right as FunctionCallNode;

  assert.equal(call.type, "FunctionCall");
  assert.deepEqual(call.callee, { type: "MemberExpression", object: "tl", property: "program_id" });
  assert.equal(call.args.length, 1);
  assert.deepEqual(call.args[0], { type: "NumberLiteral", value: 0 });
});

test("parseFunctionCall() handles tl.arange(0, BLOCK_SIZE)", () => {
  const body: Token[] = [
    id("offsets"), op("="),
    id("tl"), delim("."), id("arange"),
    delim("("), num("0"), delim(","), id("BLOCK_SIZE"), delim(")"),
  ];
  const tokens = makeKernelTokens([], body);
  const kernel = (new Parser(tokens).parse().body[0]) as KernelDefinitionNode;
  const stmt = kernel.body.statements[0] as VariableAssignmentNode;
  const call = stmt.right as FunctionCallNode;

  assert.equal(call.args.length, 2);
  assert.deepEqual(call.args[0], { type: "NumberLiteral", value: 0 });
  assert.deepEqual(call.args[1], { type: "Identifier",    name: "BLOCK_SIZE" });
});

test("parseFunctionCall() handles keyword argument (mask=mask)", () => {
  // x = tl.load(x_ptr, mask=mask)
  const body: Token[] = [
    id("x"), op("="),
    id("tl"), delim("."), id("load"),
    delim("("),
      id("x_ptr"), delim(","),
      id("mask"), op("="), id("mask"),
    delim(")"),
  ];
  const tokens = makeKernelTokens([], body);
  const kernel = (new Parser(tokens).parse().body[0]) as KernelDefinitionNode;
  const stmt = kernel.body.statements[0] as VariableAssignmentNode;
  const call = stmt.right as FunctionCallNode;

  assert.equal(call.args.length, 2);
  assert.deepEqual(call.args[0], { type: "Identifier", name: "x_ptr" });

  const kwarg = call.args[1] as KeywordArgNode;
  assert.equal(kwarg.type, "KeywordArg");
  assert.equal(kwarg.key, "mask");
  assert.deepEqual(kwarg.value, { type: "Identifier", name: "mask" });
});

test("parseFunctionCall() handles empty argument list", () => {
  // x = output.numel()
  const body: Token[] = [
    id("x"), op("="),
    id("output"), delim("."), id("numel"),
    delim("("), delim(")"),
  ];
  const tokens = makeKernelTokens([], body);
  const kernel = (new Parser(tokens).parse().body[0]) as KernelDefinitionNode;
  const stmt = kernel.body.statements[0] as VariableAssignmentNode;
  const call = stmt.right as FunctionCallNode;

  assert.equal(call.type, "FunctionCall");
  assert.equal(call.args.length, 0);
});

// ─── Full kernel integration ──────────────────────────────────────────────────

test("parses the full vector_add_kernel token stream", () => {
  // Mirrors the real token stream from the lexer (INDENT/DEDENT/NEWLINE included)
  const tokens: Token[] = [
    delim("@"),  id("triton"), delim("."), id("jit"),
    { type: TOKEN_TYPE.NEWLINE, value: "\n", line: 1, column: 12 },
    { type: TOKEN_TYPE.KEYWORD, value: "def", line: 2, column: 1 },
    id("vector_add_kernel"),
    delim("("),
      id("x_ptr"), delim(","), id("y_ptr"), delim(","), id("output_ptr"), delim(","),
      id("n_elements"), delim(","),
      id("BLOCK_SIZE"), delim(":"), id("tl"), delim("."), id("constexpr"),
    delim(")"), delim(":"),
    { type: TOKEN_TYPE.NEWLINE, value: "\n", line: 2, column: 100 },
    { type: TOKEN_TYPE.INDENT,  value: "    ", line: 3, column: 1 },
    // pid = tl.program_id(0)
    id("pid"), op("="), id("tl"), delim("."), id("program_id"), delim("("), num("0"), delim(")"),
    // block_start = pid * BLOCK_SIZE
    id("block_start"), op("="), id("pid"), op("*"), id("BLOCK_SIZE"),
    // result = x + y
    id("result"), op("="), id("x"), op("+"), id("y"),
    { type: TOKEN_TYPE.DEDENT, value: "", line: 99, column: 1 },
    { type: TOKEN_TYPE.EOF,    value: "", line: 99, column: 1 },
  ];

  const ast = new Parser(tokens).parse();
  const kernel = ast.body[0] as KernelDefinitionNode;

  assert.equal(kernel.type, "KernelDefinition");
  assert.equal(kernel.name, "vector_add_kernel");
  assert.equal(kernel.decorator, "@triton.jit");
  assert.equal(kernel.params.length, 5);
  assert.equal(kernel.params[4]!.constexpr, true);
  assert.equal(kernel.body.statements.length, 3);
});

// ─── Error handling ───────────────────────────────────────────────────────────

test("throws SyntaxError on missing closing paren in param list", () => {
  const tokens: Token[] = [
    delim("@"), id("triton"), delim("."), id("jit"),
    { type: TOKEN_TYPE.NEWLINE, value: "\n", line: 1, column: 12 },
    { type: TOKEN_TYPE.KEYWORD, value: "def", line: 2, column: 1 },
    id("my_kernel"),
    delim("("), id("x_ptr"),
    // missing ")" — immediately hits EOF
    { type: TOKEN_TYPE.EOF, value: "", line: 2, column: 20 },
  ];

  assert.throws(
    () => new Parser(tokens).parse(),
    SyntaxError
  );
});

test("throws SyntaxError on missing colon after param list", () => {
  const tokens: Token[] = [
    delim("@"), id("triton"), delim("."), id("jit"),
    { type: TOKEN_TYPE.NEWLINE, value: "\n", line: 1, column: 12 },
    { type: TOKEN_TYPE.KEYWORD, value: "def", line: 2, column: 1 },
    id("my_kernel"), delim("("), delim(")"),
    // missing ":"
    id("x"), op("="), id("y"),
    { type: TOKEN_TYPE.EOF, value: "", line: 3, column: 1 },
  ];

  assert.throws(
    () => new Parser(tokens).parse(),
    SyntaxError
  );
});