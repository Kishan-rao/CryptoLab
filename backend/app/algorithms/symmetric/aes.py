"""Pure AES-128 (Advanced Encryption Standard - FIPS-197) implementation from scratch.
128-bit block size (16 bytes), 128-bit key size (16 bytes), 10 rounds.
Zero external cryptography libraries.
"""
from typing import List, Dict, Any, Tuple
from app.utils.encoding import (
    hex_to_bytes,
    bytes_to_hex,
    bytes_to_matrix,
    matrix_to_bytes,
    matrix_to_hex_grid
)
from app.utils.math_utils import gmul

# ==============================================================================
# AES S-box and Inverse S-box Tables (FIPS-197 Standard)
# ==============================================================================

S_BOX = [
    0x63, 0x7c, 0x77, 0x7b, 0xf2, 0x6b, 0x6f, 0xc5, 0x30, 0x01, 0x67, 0x2b, 0xfe, 0xd7, 0xab, 0x76,
    0xca, 0x82, 0xc9, 0x7d, 0xfa, 0x59, 0x47, 0xf0, 0xad, 0xd4, 0xa2, 0xaf, 0x9c, 0xa4, 0x72, 0xc0,
    0xb7, 0xfd, 0x93, 0x26, 0x36, 0x3f, 0xf7, 0xcc, 0x34, 0xa5, 0xe5, 0xf1, 0x71, 0xd8, 0x31, 0x15,
    0x04, 0xc7, 0x23, 0xc3, 0x18, 0x96, 0x05, 0x9a, 0x07, 0x12, 0x80, 0xe2, 0xeb, 0x27, 0xb2, 0x75,
    0x09, 0x83, 0x2c, 0x1a, 0x1b, 0x6e, 0x5a, 0xa0, 0x52, 0x3b, 0xd6, 0xb3, 0x29, 0xe3, 0x2f, 0x84,
    0x53, 0xd1, 0x00, 0xed, 0x20, 0xfc, 0xb1, 0x5b, 0x6a, 0xcb, 0xbe, 0x39, 0x4a, 0x4c, 0x58, 0xcf,
    0xd0, 0xef, 0xaa, 0xfb, 0x43, 0x4d, 0x33, 0x85, 0x45, 0xf9, 0x02, 0x7f, 0x50, 0x3c, 0x9f, 0xa8,
    0x51, 0xa3, 0x40, 0x8f, 0x92, 0x9d, 0x38, 0xf5, 0xbc, 0xb6, 0xda, 0x21, 0x10, 0xff, 0xf3, 0xd2,
    0xcd, 0x0c, 0x13, 0xec, 0x5f, 0x97, 0x44, 0x17, 0xc4, 0xa7, 0x7e, 0x3d, 0x64, 0x5d, 0x19, 0x73,
    0x60, 0x81, 0x4f, 0xdc, 0x22, 0x2a, 0x90, 0x88, 0x46, 0xee, 0xb8, 0x14, 0xde, 0x5e, 0x0b, 0xdb,
    0xe0, 0x32, 0x3a, 0x0a, 0x49, 0x06, 0x24, 0x5e, 0xc2, 0xd3, 0xac, 0x62, 0x91, 0x95, 0xe4, 0x79,
    0xe7, 0xc8, 0x37, 0x6d, 0x8d, 0xd5, 0x4e, 0xa9, 0x6c, 0x56, 0xf4, 0xea, 0x65, 0x7a, 0xae, 0x08,
    0xba, 0x78, 0x25, 0x2e, 0x1c, 0xa6, 0xb4, 0xc6, 0xe8, 0xdd, 0x74, 0x1f, 0x4b, 0xbd, 0x8b, 0x8a,
    0x70, 0x3e, 0xb5, 0x66, 0x48, 0x03, 0xf6, 0x0e, 0x61, 0x35, 0x57, 0xb9, 0x86, 0xc1, 0x1d, 0x9e,
    0xe1, 0xf8, 0x98, 0x11, 0x69, 0xd9, 0x8e, 0x94, 0x9b, 0x1e, 0x87, 0xe9, 0xce, 0x55, 0x28, 0xdf,
    0x8c, 0xa1, 0x89, 0x0d, 0xbf, 0xe6, 0x42, 0x68, 0x41, 0x99, 0x2d, 0x0f, 0xb0, 0x54, 0xbb, 0x16
]

INV_S_BOX = [
    0x52, 0x09, 0x6a, 0xd5, 0x30, 0x36, 0xa5, 0x38, 0xbf, 0x40, 0xa3, 0x9e, 0x81, 0xf3, 0xd7, 0xfb,
    0x7c, 0xe3, 0x39, 0x82, 0x9b, 0x2f, 0xff, 0x87, 0x34, 0x8e, 0x43, 0x44, 0xc4, 0xde, 0xe9, 0xcb,
    0x54, 0x7b, 0x94, 0x32, 0xa6, 0xc2, 0x23, 0x3d, 0xee, 0x4c, 0x95, 0x0b, 0x42, 0xfa, 0xc3, 0x4e,
    0x08, 0x2e, 0xa1, 0x66, 0x28, 0xd9, 0x24, 0xb2, 0x76, 0x5b, 0xa2, 0x49, 0x6d, 0x8b, 0xd1, 0x25,
    0x72, 0xf8, 0xf6, 0x64, 0x86, 0x68, 0x98, 0x16, 0xd4, 0xa4, 0x5c, 0xcc, 0x5d, 0x65, 0xb6, 0x92,
    0x6c, 0x70, 0x48, 0x50, 0xfd, 0xed, 0xb9, 0xda, 0x5e, 0x15, 0x46, 0x57, 0xa7, 0x8d, 0x9d, 0x84,
    0x90, 0xd8, 0xab, 0x00, 0x8c, 0xbc, 0xd3, 0x0a, 0xf7, 0xe4, 0x58, 0x05, 0xb8, 0xb3, 0x45, 0x06,
    0xd0, 0x2c, 0x1e, 0x8f, 0xca, 0x3f, 0x0f, 0x02, 0xc1, 0xaf, 0xbd, 0x03, 0x01, 0x13, 0x8a, 0x6b,
    0x3a, 0x91, 0x11, 0x41, 0x4f, 0x67, 0xdc, 0xea, 0x97, 0xf2, 0xcf, 0xce, 0xf0, 0xb4, 0xe6, 0x73,
    0x96, 0xac, 0x74, 0x22, 0xe7, 0xad, 0x35, 0x85, 0xe2, 0xf9, 0x37, 0xe8, 0x1c, 0x75, 0xdf, 0x6e,
    0x47, 0xf1, 0x1a, 0x71, 0x1d, 0x29, 0xc5, 0x89, 0x6f, 0xb7, 0x62, 0x0e, 0xaa, 0x18, 0xbe, 0x1b,
    0xfc, 0x56, 0x3e, 0x4b, 0xc6, 0xd2, 0x79, 0x20, 0x9a, 0xdb, 0xc0, 0xfe, 0x78, 0xcd, 0x5a, 0xf4,
    0x1f, 0xdd, 0xa8, 0x33, 0x88, 0x07, 0xc7, 0x31, 0xb1, 0x12, 0x10, 0x59, 0x27, 0x80, 0xec, 0x5f,
    0x60, 0x51, 0x7f, 0xa9, 0x19, 0xb5, 0x4a, 0x0d, 0x2d, 0xe5, 0x7a, 0x9f, 0x93, 0xc9, 0x9c, 0xef,
    0xa0, 0xe0, 0x3b, 0x4d, 0xae, 0x2a, 0xf5, 0xb0, 0xc8, 0xeb, 0xbb, 0x3c, 0x83, 0x53, 0x99, 0x61,
    0x17, 0x2b, 0x04, 0x7e, 0xba, 0x77, 0xd6, 0x26, 0xe1, 0x69, 0x14, 0x63, 0x55, 0x21, 0x0c, 0x7d
]

# Round Constants Rcon[1..10] as 32-bit words (highest byte is RC[i], rest 0)
RCON = [
    0x00, # unused 0-index
    0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80, 0x1B, 0x36
]

# ==============================================================================
# Key Expansion Functions
# ==============================================================================

def rot_word(word: List[int]) -> List[int]:
    """Perform cyclic permutation of 4-byte word: [a0, a1, a2, a3] -> [a1, a2, a3, a0]."""
    return [word[1], word[2], word[3], word[0]]

def sub_word(word: List[int]) -> List[int]:
    """Apply S-box substitution to each of the 4 bytes in a word."""
    return [S_BOX[b] for b in word]

def key_expansion(key: bytes) -> List[List[List[int]]]:
    """Expand 16-byte key into 11 round keys (each represented as 4x4 matrix).
    Total of 44 words (4 bytes each).
    """
    if len(key) != 16:
        raise ValueError(f"AES-128 requires 16 bytes key (128 bits), got {len(key)} bytes.")
    
    # 44 words of 4 bytes each
    w = [[0] * 4 for _ in range(44)]
    
    # First 4 words are constructed directly from key bytes
    for i in range(4):
        w[i] = [key[4 * i], key[4 * i + 1], key[4 * i + 2], key[4 * i + 3]]
    
    # Expand remaining 40 words
    for i in range(4, 44):
        temp = list(w[i - 1])
        if i % 4 == 0:
            temp = sub_word(rot_word(temp))
            temp[0] ^= RCON[i // 4]
        w[i] = [w[i - 4][j] ^ temp[j] for j in range(4)]
    
    # Group words into 11 round keys of 4x4 matrices (column-major)
    round_keys = []
    for r in range(11):
        round_words = w[r * 4 : (r + 1) * 4]
        # round_words is 4 columns of 4 bytes
        matrix = [[round_words[c][row] for c in range(4)] for row in range(4)]
        round_keys.append(matrix)
    
    return round_keys

# ==============================================================================
# AES Core Transformations
# ==============================================================================

def add_round_key(state: List[List[int]], round_key: List[List[int]]) -> List[List[int]]:
    """Bitwise XOR between state matrix and round key matrix."""
    return [[state[r][c] ^ round_key[r][c] for c in range(4)] for r in range(4)]

def sub_bytes(state: List[List[int]]) -> List[List[int]]:
    """Apply non-linear byte substitution using S-box."""
    return [[S_BOX[state[r][c]] for c in range(4)] for r in range(4)]

def inv_sub_bytes(state: List[List[int]]) -> List[List[int]]:
    """Apply inverse byte substitution using Inv S-box."""
    return [[INV_S_BOX[state[r][c]] for c in range(4)] for r in range(4)]

def shift_rows(state: List[List[int]]) -> List[List[int]]:
    """Circularly left shift the rows of the state matrix.
    Row 0: no shift
    Row 1: shift left 1
    Row 2: shift left 2
    Row 3: shift left 3
    """
    new_state = [[0] * 4 for _ in range(4)]
    new_state[0] = list(state[0])
    new_state[1] = [state[1][1], state[1][2], state[1][3], state[1][0]]
    new_state[2] = [state[2][2], state[2][3], state[2][0], state[2][1]]
    new_state[3] = [state[3][3], state[3][0], state[3][1], state[3][2]]
    return new_state

def inv_shift_rows(state: List[List[int]]) -> List[List[int]]:
    """Circularly right shift the rows of the state matrix.
    Row 0: no shift
    Row 1: shift right 1
    Row 2: shift right 2
    Row 3: shift right 3
    """
    new_state = [[0] * 4 for _ in range(4)]
    new_state[0] = list(state[0])
    new_state[1] = [state[1][3], state[1][0], state[1][1], state[1][2]]
    new_state[2] = [state[2][2], state[2][3], state[2][0], state[2][1]]
    new_state[3] = [state[3][1], state[3][2], state[3][3], state[3][0]]
    return new_state

def mix_columns(state: List[List[int]]) -> List[List[int]]:
    """Mix columns transformation via matrix multiplication in GF(2^8).
    [s'0,c]   [02 03 01 01] [s0,c]
    [s'1,c] = [01 02 03 01] [s1,c]
    [s'2,c]   [01 01 02 03] [s2,c]
    [s'3,c]   [03 01 01 02] [s3,c]
    """
    new_state = [[0] * 4 for _ in range(4)]
    for c in range(4):
        s0, s1, s2, s3 = state[0][c], state[1][c], state[2][c], state[3][c]
        new_state[0][c] = gmul(0x02, s0) ^ gmul(0x03, s1) ^ s2 ^ s3
        new_state[1][c] = s0 ^ gmul(0x02, s1) ^ gmul(0x03, s2) ^ s3
        new_state[2][c] = s0 ^ s1 ^ gmul(0x02, s2) ^ gmul(0x03, s3)
        new_state[3][c] = gmul(0x03, s0) ^ s1 ^ s2 ^ gmul(0x02, s3)
    return new_state

def inv_mix_columns(state: List[List[int]]) -> List[List[int]]:
    """Inverse mix columns transformation via matrix multiplication in GF(2^8).
    Matrix multipliers: 0x0E, 0x0B, 0x0D, 0x09
    """
    new_state = [[0] * 4 for _ in range(4)]
    for c in range(4):
        s0, s1, s2, s3 = state[0][c], state[1][c], state[2][c], state[3][c]
        new_state[0][c] = gmul(0x0E, s0) ^ gmul(0x0B, s1) ^ gmul(0x0D, s2) ^ gmul(0x09, s3)
        new_state[1][c] = gmul(0x09, s0) ^ gmul(0x0E, s1) ^ gmul(0x0B, s2) ^ gmul(0x0D, s3)
        new_state[2][c] = gmul(0x0D, s0) ^ gmul(0x09, s1) ^ gmul(0x0E, s2) ^ gmul(0x0B, s3)
        new_state[3][c] = gmul(0x0B, s0) ^ gmul(0x0D, s1) ^ gmul(0x09, s2) ^ gmul(0x0E, s3)
    return new_state

# ==============================================================================
# Full AES-128 Encryption & Decryption with Comprehensive Tracing
# ==============================================================================

def aes_encrypt_block(plaintext_bytes: bytes, key_bytes: bytes) -> Tuple[bytes, Dict[str, Any]]:
    """Perform AES-128 encryption on 16-byte block with complete step-by-step tracing."""
    if len(plaintext_bytes) != 16:
        raise ValueError(f"Plaintext must be exactly 16 bytes (128 bits), got {len(plaintext_bytes)} bytes.")
    if len(key_bytes) != 16:
        raise ValueError(f"Key must be exactly 16 bytes (128 bits), got {len(key_bytes)} bytes.")
    
    round_keys = key_expansion(key_bytes)
    key_schedule_hex = [bytes_to_hex(matrix_to_bytes(rk)) for rk in round_keys]
    
    state = bytes_to_matrix(plaintext_bytes)
    initial_state_hex = matrix_to_hex_grid(state)
    
    rounds_data = []
    
    # Round 0: Initial AddRoundKey
    state = add_round_key(state, round_keys[0])
    rounds_data.append({
        "round": 0,
        "round_type": "Initial Round",
        "round_key_hex": key_schedule_hex[0],
        "operations": [
            {
                "name": "AddRoundKey",
                "description": "Bitwise XOR of input state with Round 0 key",
                "state": matrix_to_hex_grid(state),
                "round_key": matrix_to_hex_grid(round_keys[0])
            }
        ]
    })
    
    # Rounds 1 to 9: Standard Rounds
    for r in range(1, 10):
        ops = []
        
        # 1. SubBytes
        state = sub_bytes(state)
        ops.append({
            "name": "SubBytes",
            "description": "Non-linear byte substitution using 16x16 S-box",
            "state": matrix_to_hex_grid(state)
        })
        
        # 2. ShiftRows
        state = shift_rows(state)
        ops.append({
            "name": "ShiftRows",
            "description": "Circular byte shift of state rows by offsets [0, 1, 2, 3]",
            "state": matrix_to_hex_grid(state)
        })
        
        # 3. MixColumns
        state = mix_columns(state)
        ops.append({
            "name": "MixColumns",
            "description": "Column-wise matrix multiplication over GF(2^8) with irreducible polynomial 0x11B",
            "state": matrix_to_hex_grid(state)
        })
        
        # 4. AddRoundKey
        state = add_round_key(state, round_keys[r])
        ops.append({
            "name": "AddRoundKey",
            "description": f"Bitwise XOR with Round {r} key",
            "state": matrix_to_hex_grid(state),
            "round_key": matrix_to_hex_grid(round_keys[r])
        })
        
        rounds_data.append({
            "round": r,
            "round_type": "Standard Round",
            "round_key_hex": key_schedule_hex[r],
            "operations": ops
        })
    
    # Round 10: Final Round (MixColumns omitted)
    final_ops = []
    state = sub_bytes(state)
    final_ops.append({
        "name": "SubBytes",
        "description": "Non-linear byte substitution using S-box",
        "state": matrix_to_hex_grid(state)
    })
    
    state = shift_rows(state)
    final_ops.append({
        "name": "ShiftRows",
        "description": "Circular byte shift of state rows by offsets [0, 1, 2, 3]",
        "state": matrix_to_hex_grid(state)
    })
    
    state = add_round_key(state, round_keys[10])
    final_ops.append({
        "name": "AddRoundKey",
        "description": "Bitwise XOR with Final Round 10 key",
        "state": matrix_to_hex_grid(state),
        "round_key": matrix_to_hex_grid(round_keys[10])
    })
    
    rounds_data.append({
        "round": 10,
        "round_type": "Final Round (No MixColumns)",
        "round_key_hex": key_schedule_hex[10],
        "operations": final_ops
    })
    
    ciphertext_bytes = matrix_to_bytes(state)
    
    trace = {
        "initial_state": initial_state_hex,
        "key_schedule": key_schedule_hex,
        "rounds": rounds_data
    }
    
    return ciphertext_bytes, trace

def aes_decrypt_block(ciphertext_bytes: bytes, key_bytes: bytes) -> Tuple[bytes, Dict[str, Any]]:
    """Perform AES-128 decryption on 16-byte block with complete step-by-step tracing."""
    if len(ciphertext_bytes) != 16:
        raise ValueError(f"Ciphertext must be exactly 16 bytes (128 bits), got {len(ciphertext_bytes)} bytes.")
    if len(key_bytes) != 16:
        raise ValueError(f"Key must be exactly 16 bytes (128 bits), got {len(key_bytes)} bytes.")
    
    round_keys = key_expansion(key_bytes)
    key_schedule_hex = [bytes_to_hex(matrix_to_bytes(rk)) for rk in round_keys]
    
    state = bytes_to_matrix(ciphertext_bytes)
    initial_state_hex = matrix_to_hex_grid(state)
    
    rounds_data = []
    
    # Round 0 of Decryption: Initial AddRoundKey with Round 10 key
    state = add_round_key(state, round_keys[10])
    rounds_data.append({
        "round": 0,
        "round_type": "Initial Decryption Round",
        "round_key_hex": key_schedule_hex[10],
        "operations": [
            {
                "name": "AddRoundKey",
                "description": "Initial XOR of ciphertext state with Round 10 key",
                "state": matrix_to_hex_grid(state),
                "round_key": matrix_to_hex_grid(round_keys[10])
            }
        ]
    })
    
    # Decryption Rounds 1 to 9 (corresponding to original rounds 9 down to 1)
    for step_num, r in enumerate(range(9, 0, -1), start=1):
        ops = []
        
        # 1. InvShiftRows
        state = inv_shift_rows(state)
        ops.append({
            "name": "InvShiftRows",
            "description": "Circular right shift of rows by offsets [0, 1, 2, 3]",
            "state": matrix_to_hex_grid(state)
        })
        
        # 2. InvSubBytes
        state = inv_sub_bytes(state)
        ops.append({
            "name": "InvSubBytes",
            "description": "Inverse byte substitution using Inv S-box",
            "state": matrix_to_hex_grid(state)
        })
        
        # 3. AddRoundKey
        state = add_round_key(state, round_keys[r])
        ops.append({
            "name": "AddRoundKey",
            "description": f"Bitwise XOR with Round {r} key",
            "state": matrix_to_hex_grid(state),
            "round_key": matrix_to_hex_grid(round_keys[r])
        })
        
        # 4. InvMixColumns
        state = inv_mix_columns(state)
        ops.append({
            "name": "InvMixColumns",
            "description": "Inverse MixColumns transformation in GF(2^8)",
            "state": matrix_to_hex_grid(state)
        })
        
        rounds_data.append({
            "round": step_num,
            "round_type": f"Inverse Standard Round (Key {r})",
            "round_key_hex": key_schedule_hex[r],
            "operations": ops
        })
    
    # Final Decryption Round (corresponding to Round 0 key)
    final_ops = []
    state = inv_shift_rows(state)
    final_ops.append({
        "name": "InvShiftRows",
        "description": "Circular right shift of rows by offsets [0, 1, 2, 3]",
        "state": matrix_to_hex_grid(state)
    })
    
    state = inv_sub_bytes(state)
    final_ops.append({
        "name": "InvSubBytes",
        "description": "Inverse byte substitution using Inv S-box",
        "state": matrix_to_hex_grid(state)
    })
    
    state = add_round_key(state, round_keys[0])
    final_ops.append({
        "name": "AddRoundKey",
        "description": "Final bitwise XOR with Round 0 key to recover plaintext",
        "state": matrix_to_hex_grid(state),
        "round_key": matrix_to_hex_grid(round_keys[0])
    })
    
    rounds_data.append({
        "round": 10,
        "round_type": "Final Decryption Round (Key 0)",
        "round_key_hex": key_schedule_hex[0],
        "operations": final_ops
    })
    
    plaintext_bytes = matrix_to_bytes(state)
    
    trace = {
        "initial_state": initial_state_hex,
        "key_schedule": key_schedule_hex,
        "rounds": rounds_data
    }
    
    return plaintext_bytes, trace
