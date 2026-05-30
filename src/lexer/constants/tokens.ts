/**
 * This file defines the various token types that the lexer will recognize in the source code.
 */
enum TOKEN_TYPE {
    IDENTIFIER = "IDENTIFIER",
    NUMBER = "NUMBER",
    STRING = "STRING",
    OPERATOR = "OPERATOR",
    KEYWORD = "KEYWORD",
    DELIMITER = "DELIMITER",
    NEWLINE = "NEWLINE",
    INDENT = "INDENT",
    DEDENT = "DEDENT",
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
