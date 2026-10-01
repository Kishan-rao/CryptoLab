"""Vigenère Cipher implementation from scratch.
Polyalphabetic substitution cipher using modular arithmetic over the Latin alphabet (A-Z).
Formula:
    Encryption: C = (P + K) mod 26
    Decryption: P = (C - K) mod 26
"""
from typing import List, Dict, Any, Tuple

def validate_and_normalize_key(key: str) -> str:
    """Validate that the key consists solely of alphabetic characters and is non-empty.
    Returns normalized uppercase key.
    """
    if not key:
        raise ValueError("Key cannot be empty.")
    
    cleaned = key.strip()
    if not cleaned:
        raise ValueError("Key cannot consist only of whitespace.")
    
    if not cleaned.isalpha():
        raise ValueError("Key must contain only alphabetic characters (A-Z, a-z).")
    
    return cleaned.upper()

def char_to_index(char: str) -> int:
    """Convert an uppercase character (A-Z) to index 0-25."""
    return ord(char.upper()) - ord('A')

def index_to_char(idx: int, uppercase: bool = True) -> str:
    """Convert index 0-25 to corresponding character, preserving case."""
    base = ord('A') if uppercase else ord('a')
    return chr(base + (idx % 26))

def vigenere_encrypt(plaintext: str, key: str) -> Tuple[str, List[Dict[str, Any]]]:
    """Encrypt plaintext using Vigenère cipher and generate detailed step-by-step traces.
    Preserves case and non-alphabetic characters (spaces, punctuation).
    Only alphabetic characters advance the key position.
    """
    if not plaintext:
        raise ValueError("Plaintext cannot be empty.")
    
    normalized_key = validate_and_normalize_key(key)
    key_len = len(normalized_key)
    
    ciphertext_chars = []
    steps = []
    key_index = 0
    alpha_pos = 0

    for idx, char in enumerate(plaintext):
        if char.isalpha():
            is_upper = char.isupper()
            p_val = char_to_index(char)
            k_char = normalized_key[key_index % key_len]
            k_val = char_to_index(k_char)
            c_val = (p_val + k_val) % 26
            c_char = index_to_char(c_val, uppercase=is_upper)
            
            ciphertext_chars.append(c_char)
            steps.append({
                "position": alpha_pos,
                "text_index": idx,
                "plaintext_char": char,
                "plaintext_value": p_val,
                "key_char": k_char,
                "key_value": k_val,
                "ciphertext_value": c_val,
                "ciphertext_char": c_char,
                "calculation": f"({p_val} + {k_val}) mod 26 = {c_val}"
            })
            key_index += 1
            alpha_pos += 1
        else:
            # Non-alphabetic character preserved as-is
            ciphertext_chars.append(char)
            steps.append({
                "position": alpha_pos,
                "text_index": idx,
                "plaintext_char": char,
                "plaintext_value": -1,
                "key_char": "-",
                "key_value": -1,
                "ciphertext_value": -1,
                "ciphertext_char": char,
                "calculation": f"Preserved '{char}' (non-alphabetic)"
            })

    return "".join(ciphertext_chars), steps

def vigenere_decrypt(ciphertext: str, key: str) -> Tuple[str, List[Dict[str, Any]]]:
    """Decrypt ciphertext using Vigenère cipher and generate detailed step-by-step traces.
    Formula: P = (C - K) mod 26
    """
    if not ciphertext:
        raise ValueError("Ciphertext cannot be empty.")
    
    normalized_key = validate_and_normalize_key(key)
    key_len = len(normalized_key)
    
    plaintext_chars = []
    steps = []
    key_index = 0
    alpha_pos = 0

    for idx, char in enumerate(ciphertext):
        if char.isalpha():
            is_upper = char.isupper()
            c_val = char_to_index(char)
            k_char = normalized_key[key_index % key_len]
            k_val = char_to_index(k_char)
            p_val = (c_val - k_val + 26) % 26
            p_char = index_to_char(p_val, uppercase=is_upper)
            
            plaintext_chars.append(p_char)
            steps.append({
                "position": alpha_pos,
                "text_index": idx,
                "ciphertext_char": char,
                "ciphertext_value": c_val,
                "key_char": k_char,
                "key_value": k_val,
                "plaintext_value": p_val,
                "plaintext_char": p_char,
                "calculation": f"({c_val} - {k_val}) mod 26 = {p_val}"
            })
            key_index += 1
            alpha_pos += 1
        else:
            plaintext_chars.append(char)
            steps.append({
                "position": alpha_pos,
                "text_index": idx,
                "ciphertext_char": char,
                "ciphertext_value": -1,
                "key_char": "-",
                "key_value": -1,
                "plaintext_value": -1,
                "plaintext_char": char,
                "calculation": f"Preserved '{char}' (non-alphabetic)"
            })

    return "".join(plaintext_chars), steps
