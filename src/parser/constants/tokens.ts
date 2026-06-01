/**
 * This file defines the various token types that the lexer will recognize in the source code.
 * todo: it might be a good idea to join the constants between the lexer and the parser into a single file or folder; but that would require to restructure the project a bit, so for now we can keep them separate and just make sure to keep them in sync as we develop.
 */
enum TOKEN_TYPE {
    IDENTIFIER = "IDENTIFIER",
    NUMBER = "NUMBER",
    STRING = "STRING",
    OPERATOR = "OPERATOR",
    KEYWORD = "KEYWORD",
    DELIMITER = "DELIMITER",
    INDENT = "INDENT",
    DEDENT = "DEDENT",
    NEWLINE = "NEWLINE",
    PUNCTUATION = "PUNCTUATION",
    COMMENT = "COMMENT",
    WHITESPACE = "WHITESPACE",
    EOF = "EOF"
}

interface Token {
    type: TOKEN_TYPE;
    value: string;
    line: number;
    column: number;
}

export { TOKEN_TYPE };
export type { Token };
