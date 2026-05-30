import * as fs from "fs";
import * as path from "path";
import { TOKEN_TYPE, Token } from "./constants/tokens";
import { DELIMITER_REGEX_EXP, KEYWORD_REGEX_EXP, NEWLINE, OPERATOR_REGEX_EXP } from "./constants/regex";
import { matchTransitionTableToken } from "./constants/transitionTable";

const TWO_CHARACTER_TOKENS = new Set(["//", "**", "<=", ">=", "==", "!=", "+=", "-=", "*=", "/=", "->", "<<", ">>"]);
const SINGLE_CHARACTER_TOKENS = new Set(["+", "-", "*", "/", "%", "<", ">", "=", "(", ")", "[", "]", "{", "}", ",", ":", ".", "@", "#", "~", "&", "|", "^"]);

const isWhitespace = (character: string): boolean => /\s/.test(character);
const isDigit = (character: string): boolean => /^\d$/.test(character);
const isIdentifierStart = (character: string): boolean => /^[A-Za-z_]$/.test(character);
const isIdentifierPart = (character: string): boolean => /^[A-Za-z0-9_]$/.test(character);

/**
 * Read and return the parse source code.
 * It will be a string containining the entirety of the source code, incluiding whitespaces and comments, as they are needed for the lexer to generate the correct tokens.
 */
export const readTritonFile = (fileName: string): string => {
  const tritonPath = path.resolve(__dirname, `../../input/${fileName}.py`);
  const sourceCode: string = fs.readFileSync(tritonPath, "utf-8");
  return sourceCode;
};

/**
 * Reads a quoted string lexeme from a line, including the opening and closing quotes when present.
 * @param lineText The source line being scanned.
 * @param startIndex The index where the string quote starts.
 * @returns The complete string lexeme found from the starting quote.
 */
const readString = (lineText: string, startIndex: number): string => {
  const quote = lineText[startIndex];
  let currentIndex = startIndex + 1; // Start after the opening quote

  while (currentIndex < lineText.length) {
    const character = lineText[currentIndex];

    if (character === "\\") {
      currentIndex += 2;
      continue;
    }

    currentIndex++;

    if (character === quote) {
      break;
    }
  }

  return lineText.slice(startIndex, currentIndex);
};

/**
 * Reads an integer or decimal number lexeme from a line.
 * @param lineText The source line being scanned.
 * @param startIndex The index where the number starts.
 * @returns The complete numeric lexeme found from the starting digit.
 */
const readNumber = (lineText: string, startIndex: number): string => {
  let currentIndex = startIndex;

  // Read the integer part of the number
  while (currentIndex < lineText.length && isDigit(lineText[currentIndex] ?? "")) {
    currentIndex++;
  }

  // Check for a decimal point followed by more digits to read the fractional part
  if (lineText[currentIndex] === "." && isDigit(lineText[currentIndex + 1] ?? "")) {
    currentIndex++;

    while (currentIndex < lineText.length && isDigit(lineText[currentIndex] ?? "")) {
      currentIndex++;
    }
  }

  return lineText.slice(startIndex, currentIndex);
};

/**
 * Reads an identifier-like lexeme from a line.
 * @param lineText The source line being scanned.
 * @param startIndex The index where the identifier starts.
 * @returns The complete identifier lexeme found from the starting character.
 */
const readIdentifier = (lineText: string, startIndex: number): string => {
  let currentIndex = startIndex;

  while (currentIndex < lineText.length && isIdentifierPart(lineText[currentIndex] ?? "")) {
    currentIndex++;
  }

  return lineText.slice(startIndex, currentIndex);
};

/**
 * Reads the next lexeme from a line using the current character to choose the correct scanner.
 * @param lineText The source line being scanned.
 * @param startIndex The index where the next lexeme starts.
 * @returns The next lexeme found at the given index.
 */
const readNextLexeme = (lineText: string, startIndex: number): string => {
  const character = lineText[startIndex] ?? "";
  const twoCharacterToken = lineText.slice(startIndex, startIndex + 2);

  if (character === '"' || character === "'") {
    return readString(lineText, startIndex);
  }

  if (TWO_CHARACTER_TOKENS.has(twoCharacterToken)) {
    return twoCharacterToken;
  }

  if (SINGLE_CHARACTER_TOKENS.has(character)) {
    return character;
  }

  if (isDigit(character)) {
    return readNumber(lineText, startIndex);
  }

  if (isIdentifierStart(character)) {
    return readIdentifier(lineText, startIndex);
  }

  return character;
};

/**
 * Tokenizes a single source line from left to right while preserving token column positions.
 * @param lineText The source line being tokenized.
 * @param line The 1-based line number for generated tokens.
 * @returns A list of tokens found in the line.
 */
export const tokenizeLine = (lineText: string, line: number): Token[] => {
  const tokens: Token[] = [];
  let currentIndex = 0;

  while (currentIndex < lineText.length) {
    const character = lineText[currentIndex] ?? "";

    if (isWhitespace(character)) {
      currentIndex++;
      continue;
    }

    const column = currentIndex + 1;
    const lexeme = readNextLexeme(lineText, currentIndex);
    tokens.push(matchToken(lexeme, line, column));
    currentIndex += lexeme.length;
  }

  return tokens;
};

/**
 * Tokenizes source code while preserving newline tokens between source lines.
 * @param sourceCode The full source code text to tokenize.
 * @returns A list of tokens found in the source code.
 */
export const tokenizeSource = (sourceCode: string): Token[] => {
  const tokens: Token[] = [];
  const newlineRegex = /\r?\n/g;
  let lineStartIndex = 0;
  let line = 1;
  let newlineMatch: RegExpExecArray | null;

  while ((newlineMatch = newlineRegex.exec(sourceCode)) !== null) {
    const lineText = sourceCode.slice(lineStartIndex, newlineMatch.index);
    tokens.push(...tokenizeLine(lineText, line));
    tokens.push({ type: TOKEN_TYPE.NEWLINE, value: newlineMatch[0], line, column: lineText.length + 1 });

    line++;
    lineStartIndex = newlineMatch.index + newlineMatch[0].length;
  }

  if (lineStartIndex < sourceCode.length) {
    tokens.push(...tokenizeLine(sourceCode.slice(lineStartIndex), line));
  }

  return tokens;
};

/**
 * This method takes a string of source code and matches it against the defined token patterns to determine its token type using Regex.
 * @param sourceInput The string of source code to be matched against token patterns.
 * @returns The token type that matches the input source code string. If no match is found, it defaults to TOKEN_TYPE.IDENTIFIER.
 */
export const matchToken = (sourceInput: string, line: number, column: number): Token => {
  const outputToken: Token = { type: TOKEN_TYPE.IDENTIFIER, value: sourceInput, line: line, column: column };
  const transitionTableTokenType = matchTransitionTableToken(sourceInput);

  switch (true) {
    case transitionTableTokenType !== undefined:
      outputToken.type = transitionTableTokenType;
      break;
    case KEYWORD_REGEX_EXP.test(sourceInput):
      outputToken.type = TOKEN_TYPE.KEYWORD;
      break;
    case OPERATOR_REGEX_EXP.test(sourceInput):
      outputToken.type = TOKEN_TYPE.OPERATOR;
      break;
    case DELIMITER_REGEX_EXP.test(sourceInput):
      outputToken.type = TOKEN_TYPE.DELIMITER;
      break;
    case NEWLINE.test(sourceInput):
      outputToken.type = TOKEN_TYPE.NEWLINE;
      break;
    // todo: add more cases for other token types (e.g., NUMBER, STRING, PUNCTUATION, COMMENT, WHITESPACE)
    default:
      outputToken.type = TOKEN_TYPE.IDENTIFIER;
  }
  return outputToken;
};
