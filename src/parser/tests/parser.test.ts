import assert from "assert/strict";
import test from "node:test";

import fs from "fs";
import path from "path";
import { execSync } from "child_process";

function runPipeline(source: string): boolean {
  const inputFile = path.resolve("input/triton.py");

  fs.writeFileSync(inputFile, source);

  try {
    execSync("npm run pipeline", {
      stdio: "pipe",
    });

    return true;
  } catch {
    return false;
  }
}

function expectValid(source: string) {
  assert.equal(runPipeline(source), true);
}

function expectInvalid(source: string) {
  assert.equal(runPipeline(source), false);
}


// ─────────────────────────────────────────────────────────────
// VALID KERNELS
// ─────────────────────────────────────────────────────────────

test("valid: parenthesized arithmetic expression", () => {
  expectValid(`
@triton.jit
def one(x): { y = (x + 1) * 2; }
`);
});

test("valid: operator precedence", () => {
  expectValid(`
@triton.jit
def f(a,b,c): { a = a + b * c; }
`);
});

test("valid: standalone function call", () => {
  expectValid(`
@triton.jit
def g(x): { tl.load(x); }
`);
});

test("valid: nested function arguments", () => {
  expectValid(`
@triton.jit
def h(x): { y = foo(x, 1, (2+3)); }
`);
});

test("valid: constexpr parameter", () => {
  expectValid(`
@triton.jit
def p(x, BS: tl.constexpr): { y = tl.arange(0, BS); }
`);
});

test("valid: multiline kernel", () => {
  expectValid(`
@triton.jit
def add(x, y): {
  z = x + y;
}
`);
});

test("valid: realistic Triton kernel", () => {
  expectValid(`
@triton.jit
def k(x, out, BS: tl.constexpr): {
  pid = tl.program_id(0);
  offs = pid * BS + tl.arange(0, BS);
  tl.store(out + offs, tl.load(x + offs));
}
`);
});

// ─────────────────────────────────────────────────────────────
// INVALID KERNELS
// ─────────────────────────────────────────────────────────────

test("invalid: missing kernel decorator", () => {
  expectInvalid(`
def no_decorator(x): { y = x + 1; }
`);
});

test("invalid: missing block braces", () => {
  expectInvalid(`
@triton.jit
def bad_block(x): y = x + 1;
`);
});

test("invalid: missing semicolon", () => {
  expectInvalid(`
@triton.jit
def bad_semi(x): { y = x + 1 }
`);
});

test("invalid: incomplete expression", () => {
  expectInvalid(`
@triton.jit
def bad_expr(x): { y = x + ; }
`);
});

test("invalid: missing closing brace", () => {
  expectInvalid(`
@triton.jit
def kwarg(x): { y = tl.load(x, mask=1);
`);
});

test("invalid: unsupported control flow", () => {
  expectInvalid(`
@triton.jit
def control(x): { if (x) { y = 1; } }
`);
});