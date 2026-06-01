import torch
import triton
import triton.language as tl


@triton.jit 
def f(a,b,c): { a = a + b * c; }
