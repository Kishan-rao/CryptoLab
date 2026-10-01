"""Mathematical foundations: Number theory, modular arithmetic, and Galois Field GF(2^8)."""
from typing import Tuple, List, Dict, Any

# ==============================================================================
# Number Theory & Modular Arithmetic (for RSA)
# ==============================================================================

def gcd(a: int, b: int) -> int:
    """Compute the Greatest Common Divisor using Euclidean Algorithm."""
    a, b = abs(a), abs(b)
    while b != 0:
        a, b = b, a % b
    return a

def extended_gcd(a: int, b: int) -> Tuple[int, int, int]:
    """Extended Euclidean Algorithm.
    Returns (g, x, y) such that a*x + b*y = g = gcd(a, b).
    """
    if b == 0:
        return a, 1, 0
    g, x1, y1 = extended_gcd(b, a % b)
    x = y1
    y = x1 - (a // b) * y1
    return g, x, y

def mod_inverse(e: int, m: int) -> int:
    """Compute the modular multiplicative inverse d = e^(-1) mod m.
    Raises ValueError if gcd(e, m) != 1.
    """
    g, x, _ = extended_gcd(e, m)
    if g != 1:
        raise ValueError(f"Modular inverse does not exist: gcd({e}, {m}) = {g} != 1")
    return (x % m + m) % m

def is_prime(n: int) -> bool:
    """Deterministic primality test for educational values and small-to-medium primes."""
    if n <= 1:
        return False
    if n <= 3:
        return True
    if n % 2 == 0 or n % 3 == 0:
        return False
    
    # Trial division up to sqrt(n)
    i = 5
    while i * i <= n:
        if n % i == 0 or n % (i + 2) == 0:
            return False
        i += 6
    return True

def mod_exp(base: int, exp: int, mod: int) -> int:
    """Fast modular exponentiation: (base^exp) % mod using binary square-and-multiply."""
    if mod == 1:
        return 0
    result = 1
    base = base % mod
    current_exp = exp
    while current_exp > 0:
        if current_exp % 2 == 1:
            result = (result * base) % mod
        base = (base * base) % mod
        current_exp //= 2
    return result

def mod_exp_trace(base: int, exp: int, mod: int) -> Tuple[int, List[Dict[str, Any]]]:
    """Fast modular exponentiation with a step-by-step trace of the Square-and-Multiply method."""
    if mod == 1:
        return 0, [{"step": 0, "operation": "mod 1", "bit": 0, "accumulator": 0}]
    
    binary_exp = bin(exp)[2:]
    trace = []
    accum = 1
    base_val = base % mod

    for idx, bit_char in enumerate(binary_exp):
        bit = int(bit_char)
        prev_accum = accum
        accum = (accum * accum) % mod
        op_desc = f"Square: ({prev_accum}^2) mod {mod} = {accum}"
        
        mult_desc = None
        if bit == 1:
            prev_mult = accum
            accum = (accum * base_val) % mod
            mult_desc = f"Multiply: ({prev_mult} * {base_val}) mod {mod} = {accum}"
        
        trace.append({
            "step": idx + 1,
            "bit": bit,
            "square_result": op_desc,
            "multiply_result": mult_desc,
            "current_value": accum
        })

    return accum, trace


# ==============================================================================
# Galois Field GF(2^8) Arithmetic (for AES FIPS-197)
# Irreducible polynomial: m(x) = x^8 + x^4 + x^3 + x + 1 (0x11B)
# ==============================================================================

def xtime(b: int) -> int:
    """Multiply byte b by polynomial x (0x02) in GF(2^8).
    If the high bit (0x80) is set, shift left and XOR with 0x1B.
    """
    b &= 0xFF
    if (b & 0x80) != 0:
        return ((b << 1) ^ 0x1B) & 0xFF
    return (b << 1) & 0xFF

def gmul(a: int, b: int) -> int:
    """Multiplication of two bytes in GF(2^8) modulo x^8 + x^4 + x^3 + x + 1."""
    p = 0
    a &= 0xFF
    b &= 0xFF
    for _ in range(8):
        if (b & 1) != 0:
            p ^= a
        hi_bit_set = (a & 0x80) != 0
        a = (a << 1) & 0xFF
        if hi_bit_set:
            a ^= 0x1B
        b >>= 1
    return p & 0xFF
