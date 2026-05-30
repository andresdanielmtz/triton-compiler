# Triton Compiler

A Triton compiler implemented in TypeScript. The project is structured into two main components:
- **Lexer**: implemented and tested
- **Parser**: currently being implemented

## Getting started

```bash
npm i
```

## Scripts

- Build everything: `npm run build`
- Build lexer only (emits to `dist/lexer`): `npm run build-lexer`
- Build parser only (emits to `dist/parser`): `npm run build-parser`

- Run lexer: `npm run start-lexer`
- Build + run lexer (quick local loop): `npm run dev-lexer`
- Print lexer tokens: `npm run tokens-lexer`

## Input

We'll use Triton as our input language. You can find the specification for the language [in this link.](https://triton-lang.org/main/index.html).

See `/input` for sample Triton files.

## Project Structure

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

The project uses Node's built-in test runner. The lexer tests are written in TypeScript under `src/lexer/tests/`, compiled to `dist/lexer/tests/`, and then executed from the compiled output.

Run them with:

```bash
npm test
```

The current test case checks the lexer output for a small Triton-like snippet and verifies that token types, values, line numbers, and column numbers are preserved correctly.
