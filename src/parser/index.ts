import * as fs from "fs";
import * as path from "path";
import { Token } from "./constants/tokens";
import { Parser } from "./parser";

// ─── Token Reader ─────────────────────────────────────────────────────────────

// Basic reading of tokens from the output file for testing purposes.
// todo: replace with a more robust testing strategy that doesn't rely on
//       reading from the output file.
const readTokens = (): Token[] => {
  const OUTPUT_DIRECTORY = path.resolve(__dirname, "../output");
  const TOKENS_FILE = path.join(OUTPUT_DIRECTORY, "tokens.json");
  const tokensData = fs.readFileSync(TOKENS_FILE, "utf-8");
  return JSON.parse(tokensData) as Token[];
};

// ─── Entry Point ─────────────────────────────────────────────────────────────

const main = () => {
  const tokenList: Token[] = readTokens();

  const parser = new Parser(tokenList, true); // debug=true: remove when working
  const ast = parser.parse();

  // Pretty-print the AST to console
  console.log(JSON.stringify(ast, null, 2));

  // Optionally write the AST to output/ast.json next to tokens.json
  const OUTPUT_DIRECTORY = path.resolve(__dirname, "../../output");
  const AST_FILE = path.join(OUTPUT_DIRECTORY, "ast.json");
  fs.mkdirSync(OUTPUT_DIRECTORY, { recursive: true });
  fs.writeFileSync(AST_FILE, JSON.stringify(ast, null, 2), "utf-8");
  console.error(`\nAST written to ${AST_FILE}`);
  console.error("VALID AST");
};

main();