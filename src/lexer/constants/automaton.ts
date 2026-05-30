import { TOKEN_TYPE } from "./tokens";

export type TransitionState = string;
export type TransitionSymbol = string;

export type TransitionTable = Record<TransitionState, Partial<Record<TransitionSymbol, TransitionState>>>;

export const LETTER = "LETTER";
export const DIGIT = "DIGIT";
export const STRING_CHARACTER = "STRING_CHARACTER";

/**
 * Defines a deterministic finite automaton that can classify a complete source input as a token type.
 */
export interface Automaton {
  name: string;
  tokenType: TOKEN_TYPE;
  startState: TransitionState;
  acceptStates: readonly TransitionState[];
  transitions: TransitionTable;
}

/**
 * Checks whether a single input symbol belongs to a supported transition class.
 * @param transitionSymbol The transition key from the current state's transition table.
 * @param sourceSymbol The current input character being consumed by the automaton.
 * @returns True when the transition key is a class that contains the input character.
 */
const matchesTransitionClass = (transitionSymbol: TransitionSymbol, sourceSymbol: string): boolean => {
  switch (transitionSymbol) {
    case LETTER:
      return /^[A-Za-z]$/.test(sourceSymbol);
    case DIGIT:
      return /^\d$/.test(sourceSymbol);
    case STRING_CHARACTER:
      return sourceSymbol.length === 1;
    default:
      return false;
  }
};

/**
 * Resolves the next state for one source symbol, checking exact transitions before class transitions.
 * @param transitions The current state's transition definitions.
 * @param sourceSymbol The input character to consume.
 * @returns The next state, or undefined when no transition matches.
 */
const findNextState = (
  transitions: Partial<Record<TransitionSymbol, TransitionState>> | undefined,
  sourceSymbol: string,
): TransitionState | undefined => {
  if (transitions === undefined) {
    return undefined;
  }

  const exactNextState = transitions[sourceSymbol];

  if (exactNextState !== undefined) {
    return exactNextState;
  }

  const matchingTransition = Object.entries(transitions).find(([transitionSymbol]) =>
    matchesTransitionClass(transitionSymbol, sourceSymbol),
  );

  return matchingTransition?.[1];
};

/**
 * Runs a source input through one automaton and returns true only when the whole input ends in an accept state.
 * @param automaton The automaton that contains the transition table and accepted final states.
 * @param sourceInput The complete input fragment to classify.
 * @returns True when the input follows valid transitions and finishes in an accept state.
 */
export const runAutomaton = (automaton: Automaton, sourceInput: string): boolean => {
  let currentState = automaton.startState;

  for (const symbol of sourceInput) {
    const nextState = findNextState(automaton.transitions[currentState], symbol);

    if (nextState === undefined) {
      return false;
    }

    currentState = nextState;
  }

  return automaton.acceptStates.includes(currentState);
};

/**
 * Finds the first automaton that recognizes the source input.
 * @param automata The ordered automata collection to evaluate.
 * @param sourceInput The complete input fragment to classify.
 * @returns The token type produced by the matched automaton, or undefined when none match.
 */
export const matchAutomataToken = (automata: readonly Automaton[], sourceInput: string): TOKEN_TYPE | undefined => {
  const matchedAutomaton = automata.find((automaton) => runAutomaton(automaton, sourceInput));
  return matchedAutomaton?.tokenType;
};
