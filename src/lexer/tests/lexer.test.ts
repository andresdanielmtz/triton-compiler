import assert from "assert/strict";
import test from "node:test";

import { TOKEN_TYPE } from "../constants/tokens";
import { tokenizeSource } from "../readFile";

test("tokenizeSource preserves token types and positions", () => {
  const source = "while foo = 10\nx += 2\nmsg = \"hi\"";
  const tokens = tokenizeSource(source);

  assert.deepEqual(tokens, [
    { type: TOKEN_TYPE.KEYWORD, value: "while", line: 1, column: 1 },
    { type: TOKEN_TYPE.IDENTIFIER, value: "foo", line: 1, column: 7 },
    { type: TOKEN_TYPE.OPERATOR, value: "=", line: 1, column: 11 },
    { type: TOKEN_TYPE.NUMBER, value: "10", line: 1, column: 13 },
    { type: TOKEN_TYPE.NEWLINE, value: "\n", line: 1, column: 15 },
    { type: TOKEN_TYPE.IDENTIFIER, value: "x", line: 2, column: 1 },
    { type: TOKEN_TYPE.OPERATOR, value: "+=", line: 2, column: 3 },
    { type: TOKEN_TYPE.NUMBER, value: "2", line: 2, column: 6 },
    { type: TOKEN_TYPE.NEWLINE, value: "\n", line: 2, column: 7 },
    { type: TOKEN_TYPE.IDENTIFIER, value: "msg", line: 3, column: 1 },
    { type: TOKEN_TYPE.OPERATOR, value: "=", line: 3, column: 5 },
    { type: TOKEN_TYPE.STRING, value: '"hi"', line: 3, column: 7 },
  ]);
});