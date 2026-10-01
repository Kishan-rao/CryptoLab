"""RSA Cryptosystem implementation from scratch.
Asymmetric cryptography based on the integer factorization problem.
Formulas:
    n = p * q
    phi(n) = (p - 1) * (q - 1)
    gcd(e, phi(n)) = 1
    d = e^(-1) mod phi(n)
    Encryption: C = M^e mod n
    Decryption: M = C^d mod n
"""
from typing import Tuple, List, Dict, Any, Optional
from app.utils.math_utils import (
    gcd,
    extended_gcd,
    mod_inverse,
    mod_exp,
    mod_exp_trace,
    is_prime
)

def validate_prime_parameters(p: int, q: int) -> None:
    """Validate that p and q are prime, distinct, and greater than 1."""
    if p <= 1:
        raise ValueError(f"p={p} is invalid. p must be a prime number > 1.")
    if q <= 1:
        raise ValueError(f"q={q} is invalid. q must be a prime number > 1.")
    if p == q:
        raise ValueError("p and q must be distinct primes (p != q).")
    if not is_prime(p):
        raise ValueError(f"p={p} is not a prime number.")
    if not is_prime(q):
        raise ValueError(f"q={q} is not a prime number.")

def suggest_candidate_exponents(phi_n: int, limit: int = 5) -> List[int]:
    """Suggest small valid public exponents e coprime to phi(n)."""
    candidates = []
    # Common standard candidate starts: 3, 5, 17, 257, 65537, or sequential odd numbers
    pool = [3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 257, 65537]
    for cand in pool:
        if 1 < cand < phi_n and gcd(cand, phi_n) == 1:
            candidates.append(cand)
            if len(candidates) >= limit:
                return candidates
    
    # Fallback to search odd numbers
    for cand in range(3, min(phi_n, 1000), 2):
        if cand not in candidates and gcd(cand, phi_n) == 1:
            candidates.append(cand)
            if len(candidates) >= limit:
                break
    return candidates

def generate_rsa_keys(p: int, q: int, chosen_e: Optional[int] = None) -> Dict[str, Any]:
    """Generate RSA public and private key pairs with detailed mathematical derivation."""
    validate_prime_parameters(p, q)
    
    n = p * q
    phi_n = (p - 1) * (q - 1)
    
    if phi_n <= 1:
        raise ValueError("Primes too small to construct valid phi(n).")

    candidates = suggest_candidate_exponents(phi_n)
    
    if chosen_e is None:
        if not candidates:
            raise ValueError(f"No suitable public exponent e found for phi(n)={phi_n}.")
        e = candidates[0]
    else:
        e = chosen_e
        if not (1 < e < phi_n):
            raise ValueError(f"Public exponent e={e} must satisfy 1 < e < phi(n)={phi_n}.")
        g = gcd(e, phi_n)
        if g != 1:
            raise ValueError(f"e={e} is not coprime with phi(n)={phi_n} (gcd={g}).")
    
    # Compute private key exponent d
    d = mod_inverse(e, phi_n)
    
    derivation_steps = [
        f"Step 1: Compute modulus n = p * q = {p} * {q} = {n}",
        f"Step 2: Compute Euler's Totient phi(n) = (p - 1) * (q - 1) = ({p} - 1) * ({q} - 1) = {phi_n}",
        f"Step 3: Select public exponent e = {e} such that gcd({e}, {phi_n}) = 1",
        f"Step 4: Compute private exponent d = e^(-1) mod phi(n) using Extended Euclidean Algorithm: {e} * {d} mod {phi_n} = 1",
        f"Step 5: Form Public Key (e, n) = ({e}, {n})",
        f"Step 6: Form Private Key (d, n) = ({d}, {n})"
    ]

    return {
        "p": p,
        "q": q,
        "n": n,
        "phi_n": phi_n,
        "e": e,
        "d": d,
        "public_key": {"e": e, "n": n},
        "private_key": {"d": d, "n": n},
        "candidate_exponents": candidates,
        "derivation_steps": derivation_steps
    }

def rsa_encrypt_number(m: int, e: int, n: int) -> Tuple[int, List[Dict[str, Any]]]:
    """Encrypt a single integer block m using public key (e, n).
    Requires 0 <= m < n.
    """
    if m < 0 or m >= n:
        raise ValueError(f"Message number {m} must satisfy 0 <= message < n={n}.")
    
    c, trace = mod_exp_trace(m, e, n)
    return c, trace

def rsa_decrypt_number(c: int, d: int, n: int) -> Tuple[int, List[Dict[str, Any]]]:
    """Decrypt a single ciphertext integer block c using private key (d, n).
    Requires 0 <= c < n.
    """
    if c < 0 or c >= n:
        raise ValueError(f"Ciphertext number {c} must satisfy 0 <= c < n={n}.")
    
    m, trace = mod_exp_trace(c, d, n)
    return m, trace

def rsa_encrypt_message(message: str, e: int, n: int, is_numeric: bool = False) -> Dict[str, Any]:
    """Encrypt message (either direct integer or ASCII string character-by-character)."""
    if is_numeric:
        try:
            m = int(message.strip())
        except ValueError:
            raise ValueError(f"Message '{message}' is not a valid integer for numeric encryption mode.")
        c, trace = rsa_encrypt_number(m, e, n)
        return {
            "mode": "numeric",
            "original": message,
            "ciphertext": str(c),
            "blocks": [
                {
                    "block_index": 0,
                    "m_raw": message,
                    "m_val": m,
                    "c_val": c,
                    "formula": f"C = {m}^{e} mod {n} = {c}",
                    "trace": trace
                }
            ]
        }
    else:
        # String mode: character by character (or ASCII codes)
        if not message:
            raise ValueError("Message cannot be empty.")
        blocks = []
        cipher_vals = []
        for idx, ch in enumerate(message):
            m_val = ord(ch)
            if m_val >= n:
                raise ValueError(
                    f"Character '{ch}' (ASCII {m_val}) exceeds modulus n={n}. "
                    f"Please choose larger primes p, q so that n > 127."
                )
            c_val, trace = rsa_encrypt_number(m_val, e, n)
            cipher_vals.append(str(c_val))
            blocks.append({
                "block_index": idx,
                "m_raw": ch,
                "m_val": m_val,
                "c_val": c_val,
                "formula": f"C[{idx}] = '{ch}' ({m_val})^{e} mod {n} = {c_val}",
                "trace": trace[:4] # Keep top trace steps for concise UI
            })
        
        return {
            "mode": "text",
            "original": message,
            "ciphertext": ",".join(cipher_vals),
            "blocks": blocks
        }

def rsa_decrypt_message(ciphertext: str, d: int, n: int, is_numeric: bool = False) -> Dict[str, Any]:
    """Decrypt message (either direct integer or comma-separated ASCII cipher values)."""
    if not ciphertext:
        raise ValueError("Ciphertext cannot be empty.")
    
    if is_numeric:
        try:
            c = int(ciphertext.strip())
        except ValueError:
            raise ValueError(f"Ciphertext '{ciphertext}' is not a valid integer for numeric decryption mode.")
        m, trace = rsa_decrypt_number(c, d, n)
        return {
            "mode": "numeric",
            "original_ciphertext": ciphertext,
            "decrypted_message": str(m),
            "blocks": [
                {
                    "block_index": 0,
                    "c_val": c,
                    "m_val": m,
                    "m_raw": str(m),
                    "formula": f"M = {c}^{d} mod {n} = {m}",
                    "trace": trace
                }
            ]
        }
    else:
        # String mode: comma separated or space separated numbers
        cleaned = ciphertext.replace(" ", "")
        parts = [p for p in cleaned.split(",") if p]
        if not parts:
            raise ValueError("No valid ciphertext blocks found. Expected comma-separated integers.")
        
        blocks = []
        decrypted_chars = []
        for idx, part in enumerate(parts):
            try:
                c_val = int(part)
            except ValueError:
                raise ValueError(f"Block '{part}' is not a valid integer.")
            m_val, trace = rsa_decrypt_number(c_val, d, n)
            ch = chr(m_val) if 0 <= m_val <= 0x10FFFF else "?"
            decrypted_chars.append(ch)
            blocks.append({
                "block_index": idx,
                "c_val": c_val,
                "m_val": m_val,
                "m_raw": ch,
                "formula": f"M[{idx}] = {c_val}^{d} mod {n} = {m_val} ('{ch}')",
                "trace": trace[:4]
            })
        
        return {
            "mode": "text",
            "original_ciphertext": ciphertext,
            "decrypted_message": "".join(decrypted_chars),
            "blocks": blocks
        }
