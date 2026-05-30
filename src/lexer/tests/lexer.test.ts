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
    { type: TOKEN_TYPE.EOF, value: "", line: 3, column: 1 },
  ]);
});

test("tokenizeSource emits INDENT/DEDENT for indented blocks", () => {
  const source = "def foo:\n  x = 1\n  y = 2\nz = 3";
  const tokens = tokenizeSource(source);

  assert.deepEqual(tokens, [
    { type: TOKEN_TYPE.KEYWORD, value: "def", line: 1, column: 1 },
    { type: TOKEN_TYPE.IDENTIFIER, value: "foo", line: 1, column: 5 },
    { type: TOKEN_TYPE.DELIMITER, value: ":", line: 1, column: 8 },
    { type: TOKEN_TYPE.NEWLINE, value: "\n", line: 1, column: 9 },

    { type: TOKEN_TYPE.INDENT, value: "  ", line: 2, column: 1 },
    { type: TOKEN_TYPE.IDENTIFIER, value: "x", line: 2, column: 3 },
    { type: TOKEN_TYPE.OPERATOR, value: "=", line: 2, column: 5 },
    { type: TOKEN_TYPE.NUMBER, value: "1", line: 2, column: 7 },
    { type: TOKEN_TYPE.NEWLINE, value: "\n", line: 2, column: 8 },

    { type: TOKEN_TYPE.IDENTIFIER, value: "y", line: 3, column: 3 },
    { type: TOKEN_TYPE.OPERATOR, value: "=", line: 3, column: 5 },
    { type: TOKEN_TYPE.NUMBER, value: "2", line: 3, column: 7 },
    { type: TOKEN_TYPE.NEWLINE, value: "\n", line: 3, column: 8 },

    { type: TOKEN_TYPE.DEDENT, value: "", line: 4, column: 1 },
    { type: TOKEN_TYPE.IDENTIFIER, value: "z", line: 4, column: 1 },
    { type: TOKEN_TYPE.OPERATOR, value: "=", line: 4, column: 3 },
    { type: TOKEN_TYPE.NUMBER, value: "3", line: 4, column: 5 },

    { type: TOKEN_TYPE.EOF, value: "", line: 4, column: 1 },
  ]);
});