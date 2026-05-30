import torch
import triton
import triton.language as tl


@triton.jit
def vector_add_kernel(
    x_ptr, y_ptr, output_ptr,
    n_elements,
    BLOCK_SIZE: tl.constexpr
):
    pid = tl.program_id(0)

    block_start = pid * BLOCK_SIZE
    offsets = block_start + tl.arange(0, BLOCK_SIZE)

    mask = offsets < n_elements

    x = tl.load(x_ptr + offsets, mask=mask)
    y = tl.load(y_ptr + offsets, mask=mask)

    result = x + y

    tl.store(output_ptr + offsets, result, mask=mask)


def vector_add(x, y):
    output = torch.empty_like(x)

    n_elements = output.numel()

    grid = lambda meta: (
        triton.cdiv(n_elements, meta["BLOCK_SIZE"]),
    )

    vector_add_kernel[grid](
        x, y, output,
        n_elements,
        BLOCK_SIZE=1024
    )

    return output


# Run example
if __name__ == "__main__":
    size = 4096

    x = torch.rand(size, device="cuda")
    y = torch.rand(size, device="cuda")

    output = vector_add(x, y)

    print(output)