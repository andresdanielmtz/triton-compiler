import assert from "assert/strict";
import test from "node:test";

import { TOKEN_TYPE } from "../constants/tokens";
import { tokenizeSource } from "../readFile";

test("tokenizeSource preserves token types and positions", () => {
  const source = "@triton.jit\ndef f(x): { y = x + 1; }";
  const tokens = tokenizeSource(source);

  assert.deepEqual(tokens, [
    { type: TOKEN_TYPE.DELIMITER, value: "@", line: 1, column: 1 },
    { type: TOKEN_TYPE.KEYWORD, value: "triton", line: 1, column: 2 },
    { type: TOKEN_TYPE.DELIMITER, value: ".", line: 1, column: 8 },
    { type: TOKEN_TYPE.KEYWORD, value: "jit", line: 1, column: 9 },
    { type: TOKEN_TYPE.NEWLINE, value: "\n", line: 1, column: 12 },

    { type: TOKEN_TYPE.KEYWORD, value: "def", line: 2, column: 1 },
    { type: TOKEN_TYPE.IDENTIFIER, value: "f", line: 2, column: 5 },
    { type: TOKEN_TYPE.DELIMITER, value: "(", line: 2, column: 6 },
    { type: TOKEN_TYPE.IDENTIFIER, value: "x", line: 2, column: 7 },
    { type: TOKEN_TYPE.DELIMITER, value: ")", line: 2, column: 8 },
    { type: TOKEN_TYPE.DELIMITER, value: ":", line: 2, column: 9 },
    { type: TOKEN_TYPE.DELIMITER, value: "{", line: 2, column: 11 },
    { type: TOKEN_TYPE.IDENTIFIER, value: "y", line: 2, column: 13 },
    { type: TOKEN_TYPE.OPERATOR, value: "=", line: 2, column: 15 },
    { type: TOKEN_TYPE.IDENTIFIER, value: "x", line: 2, column: 17 },
    { type: TOKEN_TYPE.OPERATOR, value: "+", line: 2, column: 19 },
    { type: TOKEN_TYPE.NUMBER, value: "1", line: 2, column: 21 },
    { type: TOKEN_TYPE.DELIMITER, value: ";", line: 2, column: 22 },
    { type: TOKEN_TYPE.DELIMITER, value: "}", line: 2, column: 24 },

    { type: TOKEN_TYPE.EOF, value: "", line: 2, column: 1 },
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