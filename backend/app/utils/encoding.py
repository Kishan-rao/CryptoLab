"""Encoding and conversion utilities for hex, bytes, and matrix operations."""
from typing import List

def clean_hex_string(hex_str: str) -> str:
    """Remove spaces, prefixes (0x), and lowercase the hex string."""
    s = hex_str.strip().replace(" ", "").replace("0x", "").replace("0X", "")
    return s.lower()

def hex_to_bytes(hex_str: str) -> bytes:
    """Convert hex string to bytes with validation."""
    clean = clean_hex_string(hex_str)
    if len(clean) % 2 != 0:
        raise ValueError("Hex string must have an even number of characters.")
    try:
        return bytes.fromhex(clean)
    except ValueError as e:
        raise ValueError(f"Invalid hexadecimal string: {str(e)}")

def bytes_to_hex(data: bytes) -> str:
    """Convert bytes to lowercase hex string."""
    return data.hex().lower()

def bytes_to_matrix(data: bytes) -> List[List[int]]:
    """Convert 16 bytes to 4x4 state matrix in column-major order (FIPS-197 standard).
    state[r][c] = data[r + 4 * c]
    """
    if len(data) != 16:
        raise ValueError(f"State matrix requires exactly 16 bytes, received {len(data)} bytes.")
    state = [[0] * 4 for _ in range(4)]
    for c in range(4):
        for r in range(4):
            state[r][c] = data[r + 4 * c]
    return state

def matrix_to_bytes(state: List[List[int]]) -> bytes:
    """Convert 4x4 state matrix in column-major order to 16 bytes."""
    byte_list = bytearray(16)
    for c in range(4):
        for r in range(4):
            byte_list[r + 4 * c] = state[r][c] & 0xFF
    return bytes(byte_list)

def matrix_to_hex_grid(matrix: List[List[int]]) -> List[List[str]]:
    """Convert integer matrix to 2-character lowercase hex string matrix."""
    return [[f"{val & 0xFF:02x}" for val in row] for row in matrix]

def hex_grid_to_matrix(grid: List[List[str]]) -> List[List[int]]:
    """Convert 4x4 2-char hex string grid to integer matrix."""
    return [[int(cell, 16) & 0xFF for cell in row] for row in grid]
