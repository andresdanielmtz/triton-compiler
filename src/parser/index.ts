import * as fs from "fs";
import * as path from "path";
import { Token } from "./constants"

// Basic reading of tokens from the output file for testing purposes.
// todo, this should be replaced with a more robust testing strategy that doesn't rely on reading from the output file, but for now it serves as a simple way to verify that the tokens are being generated correctly.
const readTokens = (): Token[] => {
    const OUTPUT_DIRECTORY = path.resolve(__dirname, "../../output");
    const TOKENS_FILE = path.join(OUTPUT_DIRECTORY, "tokens.json");
    const tokensData = fs.readFileSync(TOKENS_FILE, "utf-8");
    const tokens = JSON.parse(tokensData);
    return tokens;
}

const main = () => {
    const tokenList: Token[] = readTokens();
    console.log(tokenList);
}
main();
