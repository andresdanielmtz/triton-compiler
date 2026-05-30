/**
 * Regex patterns for Python keywords, operators, delimiters, and indentation.
 */

// Comparison operators
export const LT = /</;
export const GT = />/;
export const LE = /<=/;
export const GE = />=/;
export const EQ = /==/;
export const NE = /!=/;

// Assignment operators
export const ASSIGN = /=/;
export const PLUSEQ = /\+=/;
export const MINUSEQ = /-=/;
export const TIMESEQ = /\*=/;
export const DIVEQ = /\/=/;

/**
 * Single regex expression for supported comparison and assignment operators.
 *
 * Detected operators:
 * - <= (LE)
 * - >= (GE)
 * - == (EQ)
 * - != (NE)
 * - += (PLUSEQ)
 * - -= (MINUSEQ)
 * - *= (TIMESEQ)
 * - /= (DIVEQ)
 * - <  (LT)
 * - >  (GT)
 * - =  (ASSIGN)
 */
export const OPERATOR_REGEX_EXP = /^(?:<=|>=|==|!=|\+=|-=|\*=|\/=|<|>|=)$/;

/**
 * Combined operator regex patterns for easier access.
 */
export const operators = {
  OPERATOR: OPERATOR_REGEX_EXP,
  LT,
  GT,
  LE,
  GE,
  EQ,
  NE,
  ASSIGN,
  PLUSEQ,
  MINUSEQ,
  TIMESEQ,
  DIVEQ,
};

/**
 * Array of operator patterns with their names for iteration.
 */
export const operatorList = [
  { name: "LE", pattern: LE },
  { name: "GE", pattern: GE },
  { name: "EQ", pattern: EQ },
  { name: "NE", pattern: NE },
  { name: "LT", pattern: LT },
  { name: "GT", pattern: GT },
  { name: "ASSIGN", pattern: ASSIGN },
  { name: "PLUSEQ", pattern: PLUSEQ },
  { name: "MINUSEQ", pattern: MINUSEQ },
  { name: "TIMESEQ", pattern: TIMESEQ },
  { name: "DIVEQ", pattern: DIVEQ },
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
export const DELIMITER_REGEX_EXP = /^(?:->|<<|>>|\(|\)|\[|\]|\{|\}|,|:|\.|@|~|&|\||\^)$/;

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

// Function definition
export const DEF = /\bdef\b/;

// Return statement
export const RETURN = /\breturn\b/;

// Conditional statements
export const IF = /\bif\b/;
export const ELSE = /\belse\b/;
export const ELIF = /\belif\b/;

// Loops
export const FOR = /\bfor\b/;
export const WHILE = /\bwhile\b/;

// Membership and identity operators
export const IN = /\bin\b/;
export const IS = /\bis\b/;

// Logical operators
export const AND = /\band\b/;
export const OR = /\bor\b/;
export const NOT = /\bnot\b/;

// Boolean and None literals
export const TRUE = /\bTrue\b/;
export const FALSE = /\bFalse\b/;
export const NONE = /\bNone\b/;

// Control flow statements
export const PASS = /\bpass\b/;
export const BREAK = /\bbreak\b/;
export const CONTINUE = /\bcontinue\b/;

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
export const KEYWORD_REGEX_EXP =
  /^(?:def|return|if|else|elif|for|while|in|is|and|or|not|True|False|None|pass|break|continue)$/;

/**
 * Combined keyword regex patterns for easier access.
 */
export const keywords = {
  KEYWORD: KEYWORD_REGEX_EXP,
  DEF,
  RETURN,
  IF,
  ELSE,
  ELIF,
  FOR,
  WHILE,
  IN,
  IS,
  AND,
  OR,
  NOT,
  TRUE,
  FALSE,
  NONE,
  PASS,
  BREAK,
  CONTINUE,
};

/**
 * Array of keyword patterns with their names for iteration.
 */
export const keywordList = [
  { name: "DEF", pattern: DEF },
  { name: "RETURN", pattern: RETURN },
  { name: "IF", pattern: IF },
  { name: "ELSE", pattern: ELSE },
  { name: "ELIF", pattern: ELIF },
  { name: "FOR", pattern: FOR },
  { name: "WHILE", pattern: WHILE },
  { name: "IN", pattern: IN },
  { name: "IS", pattern: IS },
  { name: "AND", pattern: AND },
  { name: "OR", pattern: OR },
  { name: "NOT", pattern: NOT },
  { name: "TRUE", pattern: TRUE },
  { name: "FALSE", pattern: FALSE },
  { name: "NONE", pattern: NONE },
  { name: "PASS", pattern: PASS },
  { name: "BREAK", pattern: BREAK },
  { name: "CONTINUE", pattern: CONTINUE },
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
