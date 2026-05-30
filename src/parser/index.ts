import * as fs from "fs";
import * as path from "path";
import { Token } from "./constants"

const readTokens = (): Token[] => { 
    const OUTPUT_DIRECTORY = path.resolve(__dirname, "../../output");
    const TOKENS_FILE = path.join(OUTPUT_DIRECTORY, "tokens.json");
    const tokensData = fs.readFileSync(TOKENS_FILE, "utf-8");
    const tokens = JSON.parse(tokensData);
    return tokens;
}

// For now, just print the tokens
const tokenList = readTokens();
console.log(tokenList);