"""Service layer for RSA cryptosystem."""
from app.algorithms.asymmetric.rsa import (
    generate_rsa_keys,
    rsa_encrypt_message,
    rsa_decrypt_message
)
from app.schemas.rsa import (
    RSAKeyGenResponse,
    RSAEncryptResponse,
    RSADecryptResponse,
    RSAMathStep
)
from typing import Optional

class RSAService:
    @staticmethod
    def generate_keys(p: int, q: int, e: Optional[int] = None) -> RSAKeyGenResponse:
        data = generate_rsa_keys(p, q, chosen_e=e)
        return RSAKeyGenResponse(**data)

    @staticmethod
    def encrypt(message: str, message_type: str, e: int, n: int) -> RSAEncryptResponse:
        is_num = (message_type == "number")
        data = rsa_encrypt_message(message, e, n, is_numeric=is_num)
        blocks = [RSAMathStep(**b) for b in data["blocks"]]
        return RSAEncryptResponse(
            mode=data["mode"],
            original=data["original"],
            ciphertext=data["ciphertext"],
            public_key={"e": e, "n": n},
            blocks=blocks
        )

    @staticmethod
    def decrypt(ciphertext: str, message_type: str, d: int, n: int) -> RSADecryptResponse:
        is_num = (message_type == "number")
        data = rsa_decrypt_message(ciphertext, d, n, is_numeric=is_num)
        blocks = [RSAMathStep(**b) for b in data["blocks"]]
        return RSADecryptResponse(
            mode=data["mode"],
            original_ciphertext=data["original_ciphertext"],
            decrypted_message=data["decrypted_message"],
            private_key={"d": d, "n": n},
            blocks=blocks
        )
