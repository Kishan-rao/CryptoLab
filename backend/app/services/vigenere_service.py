"""Service layer for Vigenère cipher."""
from app.algorithms.classical.vigenere import (
    vigenere_encrypt,
    vigenere_decrypt,
    validate_and_normalize_key
)
from app.schemas.vigenere import VigenereResponse, VigenereStep

class VigenereService:
    @staticmethod
    def encrypt(plaintext: str, key: str) -> VigenereResponse:
        norm_key = validate_and_normalize_key(key)
        ciphertext, raw_steps = vigenere_encrypt(plaintext, norm_key)
        
        # Build repeated key stream for alphabetic characters
        key_chars = [s["key_char"] for s in raw_steps if s["key_char"] != "-"]
        key_stream = "".join(key_chars)

        steps = [VigenereStep(**s) for s in raw_steps]

        return VigenereResponse(
            mode="encrypt",
            result=ciphertext,
            original_text=plaintext,
            key=norm_key,
            key_stream=key_stream,
            steps=steps,
            formula="C = (P + K) mod 26"
        )

    @staticmethod
    def decrypt(ciphertext: str, key: str) -> VigenereResponse:
        norm_key = validate_and_normalize_key(key)
        plaintext, raw_steps = vigenere_decrypt(ciphertext, norm_key)
        
        key_chars = [s["key_char"] for s in raw_steps if s["key_char"] != "-"]
        key_stream = "".join(key_chars)

        steps = [VigenereStep(**s) for s in raw_steps]

        return VigenereResponse(
            mode="decrypt",
            result=plaintext,
            original_text=ciphertext,
            key=norm_key,
            key_stream=key_stream,
            steps=steps,
            formula="P = (C - K) mod 26"
        )
