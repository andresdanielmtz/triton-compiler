import * as fs from "fs";
import * as path from "path";
import { readTritonFile, tokenizeSource } from "./readFile";

const OUTPUT_DIRECTORY = path.resolve(__dirname, "../output");
console.log(`Output directory: ${OUTPUT_DIRECTORY}`);
const OUTPUT_FILE = path.join(OUTPUT_DIRECTORY, "tokens.json");
const WRITE_OUTPUT_TOKENS = process.argv.includes("--tokens");

/**
 * Entry point
 */
const main = () => {
    const sourceCode = readTritonFile("triton"); // triton.py
    const tokenList = tokenizeSource(sourceCode);

    if (WRITE_OUTPUT_TOKENS) {
        fs.mkdirSync(OUTPUT_DIRECTORY, { recursive: true });
        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(tokenList, null, 2));
        console.log(`Tokens written to ${OUTPUT_FILE}`);
    } else {
        console.log(sourceCode);
        console.log(tokenList);
    }
};

main();
