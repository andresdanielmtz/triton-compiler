# Triton Compiler

A Triton compiler implemented in TypeScript. The project is structured into two main components:
- **Lexer**
- **Parser**

Original Lexer implementation got made in [this repo](https://github.com/andresdanielmtz/TC3002B-Lexer), but it was moved here to be part of the same project as the other parts of the compiler.

## Scripts

### Getting started

Since it is a NodeJS project, feel free to just use `npm` to install dependencies and run scripts. If you prefer using `yarn` or `pnpm`, you can adjust the commands accordingly.
```bash
npm i
```

---

### Run the project

If you want to check the entire pipeline, feel free to use `npm run pipeline` to build and run the lexer and parser in sequence. However, for development purposes, you can use the following commands to build and run each component separately:

| Description | Command |
| --- | --- |
| Build everything | `npm run build` |
| Build lexer only (emits to `dist/lexer`) | `npm run build-lexer` |
| Build parser only (emits to `dist/parser`) | `npm run build-parser` |
| Run lexer | `npm run start-lexer` |
| Build + run lexer (quick local loop) | `npm run dev-lexer` |
| Print lexer tokens and store them | `npm run tokens-lexer` |
| Clean build artifacts | `npm run clean` |

## Input

We'll use Triton as our input language. You can find the specification for the language [in this link.](https://triton-lang.org/main/index.html).

See `/input` for sample Triton files.

## Project Structure

To-do: Add more details about the project structure, but for now, here is a high-level overview of the directory layout:
```text
.
├── input/
│   └── triton.py
├── src/
│   ├── lexer/
│   │   ├── index.ts
│   │   ├── readFile.ts
│   │   ├── constants/
│   │   └── tests/
│   └── parser/
│       └── index.ts
├── package.json
├── README.md
├── TODO.md
└── tsconfig.json
```

## Github Workflow

The GitHub workflow runs the test suite on pushes and pull requests to `main`, so you can use the following command locally to check that it passes:

```bash
npm run test
```

## Tests

The project uses Node's built-in test runner. The lexer tests are written in TypeScript under `src/lexer/tests/` and `src/parser/tests/`, compiled to `dist/lexer/tests/` and `dist/parser/tests/`, and then executed from the compiled output.

Run them with:

```bash
npm test
```

The current test case checks the lexer output for a small Triton-like snippet and verifies that token types, values, line numbers, and column numbers are preserved correctly.
It also checks for the parser to correctly build an AST from the same input.