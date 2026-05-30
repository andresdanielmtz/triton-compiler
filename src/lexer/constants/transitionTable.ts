import { TOKEN_TYPE } from "./tokens";
import { Automaton, DIGIT, LETTER, STRING_CHARACTER, TransitionTable, matchAutomataToken } from "./automaton";

/**
 * Automaton that recognizes the `while` keyword using a single transition chain.
 */
const WHILE_KEYWORD_AUTOMATON: Automaton = {
  name: "WHILE_KEYWORD",
  tokenType: TOKEN_TYPE.KEYWORD,
  startState: "START",
  acceptStates: ["WHILE"],
  transitions: {
    START: { w: "W" },
    W: { h: "WH" },
    WH: { i: "WHI" },
    WHI: { l: "WHIL" },
    WHIL: { e: "WHILE" },
    WHILE: {},
  },
};

/**
 * Automaton that recognizes the `if`, `else`, and `elif` keywords.
 * All successful paths finish in the same `END` accept state.
 */
const CONDITIONAL_KEYWORD_AUTOMATON: Automaton = {
  name: "CONDITIONAL_KEYWORD",
  tokenType: TOKEN_TYPE.KEYWORD,
  startState: "START",
  acceptStates: ["END"],
  transitions: {
    START: { i: "I", e: "E" },
    I: { f: "END" },
    E: { l: "EL" },
    EL: { s: "ELS", i: "ELI" },
    ELS: { e: "END" },
    ELI: { f: "END" },
    END: {},
  },
};

/**
 * Automaton that recognizes identifier names that start with a letter or underscore.
 */
const NAME_AUTOMATON: Automaton = {
  name: "NAME",
  tokenType: TOKEN_TYPE.IDENTIFIER,
  startState: "START",
  acceptStates: ["NAME"],
  transitions: {
    START: { [LETTER]: "NAME", _: "NAME" },
    NAME: { [LETTER]: "NAME", _: "NAME", [DIGIT]: "NAME" },
  },
};

/**
 * Automaton that recognizes integer and decimal number literals.
 */
const NUMBER_AUTOMATON: Automaton = {
  name: "NUMBER",
  tokenType: TOKEN_TYPE.NUMBER,
  startState: "START",
  acceptStates: ["NUMBER", "NUMBER_FRACTION"],
  transitions: {
    START: { [DIGIT]: "NUMBER" },
    NUMBER: { [DIGIT]: "NUMBER", ".": "DECIMAL_POINT" },
    DECIMAL_POINT: { [DIGIT]: "NUMBER_FRACTION" },
    NUMBER_FRACTION: { [DIGIT]: "NUMBER_FRACTION" },
  },
};

/**
 * Automaton that recognizes single-quoted and double-quoted string literals.
 */
const STRING_AUTOMATON: Automaton = {
  name: "STRING",
  tokenType: TOKEN_TYPE.STRING,
  startState: "START",
  acceptStates: ["STRING_END"],
  transitions: {
    START: { '"': "DOUBLE_STRING", "'": "SINGLE_STRING" },
    DOUBLE_STRING: { '"': "STRING_END", [STRING_CHARACTER]: "DOUBLE_STRING" },
    SINGLE_STRING: { "'": "STRING_END", [STRING_CHARACTER]: "SINGLE_STRING" },
    STRING_END: {},
  },
};

/**
 * Automaton that recognizes arithmetic operators: `+`, `-`, `*`, `/`, `//`, `%`, and `**`.
 */
const ARITHMETIC_OPERATOR_AUTOMATON: Automaton = {
  name: "ARITHMETIC_OPERATOR",
  tokenType: TOKEN_TYPE.OPERATOR,
  startState: "START",
  acceptStates: ["END", "TIMES", "DIVIDE"],
  transitions: {
    START: { "+": "END", "-": "END", "*": "TIMES", "/": "DIVIDE", "%": "END" },
    TIMES: { "*": "END" },
    DIVIDE: { "/": "END" },
    END: {},
  },
};

/**
 * Ordered collection of transition-table automata used by the lexer before regex fallback.
 */
const tokenAutomata: readonly Automaton[] = [
  WHILE_KEYWORD_AUTOMATON,
  CONDITIONAL_KEYWORD_AUTOMATON,
  NAME_AUTOMATON,
  NUMBER_AUTOMATON,
  STRING_AUTOMATON,
  ARITHMETIC_OPERATOR_AUTOMATON,
];

/**
 * Finds the first transition-table automaton that recognizes the source input.
 * @param sourceInput The complete input fragment to classify.
 * @returns The token type produced by the matched automaton, or undefined when none match.
 */
export const matchTransitionTableToken = (sourceInput: string): TOKEN_TYPE | undefined =>
  matchAutomataToken(tokenAutomata, sourceInput);

export {
  ARITHMETIC_OPERATOR_AUTOMATON,
  CONDITIONAL_KEYWORD_AUTOMATON,
  NAME_AUTOMATON,
  NUMBER_AUTOMATON,
  STRING_AUTOMATON,
  WHILE_KEYWORD_AUTOMATON,
  tokenAutomata,
};
export type { Automaton, TransitionTable };
