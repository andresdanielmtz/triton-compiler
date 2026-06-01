/**
 * Regex patterns for the Triton subset supported by this project.
 */

// Operators (grammar subset)
export const PLUS = /\+/;
export const MINUS = /-/;
export const TIMES = /\*/;
export const DIVIDE = /\//;
export const ASSIGN = /=/;

/**
 * Single regex expression for every supported operator in the grammar.
 */
export const OPERATOR_REGEX_EXP = /^(?:\+|-|\*|\/|=)$/;

/**
 * Combined operator regex patterns for easier access.
 */
export const operators = {
  OPERATOR: OPERATOR_REGEX_EXP,
  ASSIGN,
  PLUS,
  MINUS,
  TIMES,
  DIVIDE,
};

/**
 * Array of operator patterns with their names for iteration.
 */
export const operatorList = [
  { name: "PLUS", pattern: PLUS },
  { name: "MINUS", pattern: MINUS },
  { name: "TIMES", pattern: TIMES },
  { name: "DIVIDE", pattern: DIVIDE },
  { name: "ASSIGN", pattern: ASSIGN },
];

// Parentheses
export const LPAREN = /\(/;
export const RPAREN = /\)/;

// Brackets
export const LBRACKET = /\[/;
export const RBRACKET = /\]/;

// Braces
export const LBRACE = /\{/;
export const RBRACE = /\}/;

// Punctuation delimiters
export const COMMA = /,/;
export const COLON = /:/;
export const DOT = /\./;
export const AT = /@/;
export const ARROW = /->/;
export const SEMICOLON = /;/;

// Bitwise and symbolic delimiters
export const TILDE = /~/;
export const AMPERSAND = /&/;
export const PIPE = /\|/;
export const CARET = /\^/;
export const LSHIFT = /<</;
export const RSHIFT = />>/;

/**
 * Single regex expression for every supported delimiter.
 *
 * Detected delimiters:
 * - -> (ARROW)
 * - << (LSHIFT)
 * - >> (RSHIFT)
 * - (  (LPAREN)
 * - )  (RPAREN)
 * - [  (LBRACKET)
 * - ]  (RBRACKET)
 * - {  (LBRACE)
 * - }  (RBRACE)
 * - ,  (COMMA)
 * - :  (COLON)
 * - .  (DOT)
 * - @  (AT)
 * - ~  (TILDE)
 * - &  (AMPERSAND)
 * - |  (PIPE)
 * - ^  (CARET)
 */
export const DELIMITER_REGEX_EXP = /^(?:->|<<|>>|\(|\)|\[|\]|\{|\}|,|:|;|\.|@|~|&|\||\^)$/;

/**
 * Combined delimiter regex patterns for easier access.
 */
export const delimiters = {
  DELIMITER: DELIMITER_REGEX_EXP,
  LPAREN,
  RPAREN,
  LBRACKET,
  RBRACKET,
  LBRACE,
  RBRACE,
  COMMA,
  COLON,
  SEMICOLON,
  DOT,
  AT,
  ARROW,
  TILDE,
  AMPERSAND,
  PIPE,
  CARET,
  LSHIFT,
  RSHIFT,
};

/**
 * Array of delimiter patterns with their names for iteration.
 */
export const delimiterList = [
  { name: "ARROW", pattern: ARROW },
  { name: "LSHIFT", pattern: LSHIFT },
  { name: "RSHIFT", pattern: RSHIFT },
  { name: "LPAREN", pattern: LPAREN },
  { name: "RPAREN", pattern: RPAREN },
  { name: "LBRACKET", pattern: LBRACKET },
  { name: "RBRACKET", pattern: RBRACKET },
  { name: "LBRACE", pattern: LBRACE },
  { name: "RBRACE", pattern: RBRACE },
  { name: "COMMA", pattern: COMMA },
  { name: "COLON", pattern: COLON },
  { name: "SEMICOLON", pattern: SEMICOLON },
  { name: "DOT", pattern: DOT },
  { name: "AT", pattern: AT },
  { name: "TILDE", pattern: TILDE },
  { name: "AMPERSAND", pattern: AMPERSAND },
  { name: "PIPE", pattern: PIPE },
  { name: "CARET", pattern: CARET },
];

// Indentation
export const NEWLINE = /^(?:\r?\n)$/;
export const INDENT = /^[ \t]+/;
export const DEDENT = /(?<![\s\S])/;

/**
 * Combined indentation regex patterns for easier access.
 */
export const indentation = {
  NEWLINE,
  INDENT,
  DEDENT,
};

/**
 * Array of indentation patterns with their names for iteration.
 */
export const indentationList = [
  { name: "NEWLINE", pattern: NEWLINE },
  { name: "INDENT", pattern: INDENT },
  { name: "DEDENT", pattern: DEDENT },
];

// Grammar keywords / reserved identifiers
export const DEF = /\bdef\b/;
export const TRITON = /\btriton\b/;
export const JIT = /\bjit\b/;
export const CONSTEXPR = /\bconstexpr\b/;

/**
 * Single regex expression for every supported keyword.
 *
 * Detected keywords:
 * - def (DEF)
 * - return (RETURN)
 * - if (IF)
 * - else (ELSE)
 * - elif (ELIF)
 * - for (FOR)
 * - while (WHILE)
 * - in (IN)
 * - is (IS)
 * - and (AND)
 * - or (OR)
 * - not (NOT)
 * - True (TRUE)
 * - False (FALSE)
 * - None (NONE)
 * - pass (PASS)
 * - break (BREAK)
 * - continue (CONTINUE)
 */
export const KEYWORD_REGEX_EXP = /^(?:def|triton|jit|constexpr)$/;

/**
 * Combined keyword regex patterns for easier access.
 */
export const keywords = {
  KEYWORD: KEYWORD_REGEX_EXP,
  DEF,
  TRITON,
  JIT,
  CONSTEXPR,
};

/**
 * Array of keyword patterns with their names for iteration.
 */
export const keywordList = [
  { name: "DEF", pattern: DEF },
  { name: "TRITON", pattern: TRITON },
  { name: "JIT", pattern: JIT },
  { name: "CONSTEXPR", pattern: CONSTEXPR },
];

/**
 * Global combined exports for every regex pattern group.
 */
export const allPatterns = {
  ...operators,
  ...delimiters,
  ...indentation,
  ...keywords,
};

export const allPatternList = [
  ...operatorList,
  ...delimiterList,
  ...indentationList,
  ...keywordList,
];
