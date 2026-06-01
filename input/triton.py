import torch
import triton
import triton.language as tl


@triton.jit 
def vector_add_kernel(x_ptr, y_ptr, output_ptr, n_elements, BLOCK_SIZE: tl.constexpr): {
    pid = tl.program_id(0);
    block_start = pid * BLOCK_SIZE;
    offsets = block_start + tl.arange(0, BLOCK_SIZE);
    mask = offsets < n_elements;
    x = tl.load(x_ptr + offsets, mask);
    y = tl.load(y_ptr + offsets, mask);
    result = x + y;
    tl.store(output_ptr + offsets, result, mask);
}

@triton.jit
def one(x): { y = (x + 1) * 2; }

@triton.jit
def f(a,b,c): { a = a + b * c; }

@triton.jit
def g(x): { tl.load(x); }

@triton.jit
def h(x): { y = foo(x, 1, (2+3)); }

@triton.jit
def p(x, BS: tl.constexpr): { y = tl.arange(0, BS); }