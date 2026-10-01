"""Service layer for AES-128."""
from app.algorithms.symmetric.aes import (
    aes_encrypt_block,
    aes_decrypt_block
)
from app.utils.encoding import (
    hex_to_bytes,
    bytes_to_hex
)
from app.schemas.aes import (
    AESEncryptResponse,
    AESDecryptResponse,
    AESRoundTrace,
    AESOperationTrace
)

class AESService:
    @staticmethod
    def encrypt(plaintext_hex: str, key_hex: str) -> AESEncryptResponse:
        pt_bytes = hex_to_bytes(plaintext_hex)
        key_bytes = hex_to_bytes(key_hex)
        
        ct_bytes, trace = aes_encrypt_block(pt_bytes, key_bytes)
        
        rounds = []
        for r_dict in trace["rounds"]:
            ops = [AESOperationTrace(**op) for op in r_dict["operations"]]
            rounds.append(AESRoundTrace(
                round=r_dict["round"],
                round_type=r_dict["round_type"],
                round_key_hex=r_dict["round_key_hex"],
                operations=ops
            ))
            
        return AESEncryptResponse(
            mode="encrypt",
            plaintext_hex=bytes_to_hex(pt_bytes),
            key_hex=bytes_to_hex(key_bytes),
            ciphertext_hex=bytes_to_hex(ct_bytes),
            initial_state=trace["initial_state"],
            key_schedule=trace["key_schedule"],
            rounds=rounds
        )

    @staticmethod
    def decrypt(ciphertext_hex: str, key_hex: str) -> AESDecryptResponse:
        ct_bytes = hex_to_bytes(ciphertext_hex)
        key_bytes = hex_to_bytes(key_hex)
        
        pt_bytes, trace = aes_decrypt_block(ct_bytes, key_bytes)
        
        rounds = []
        for r_dict in trace["rounds"]:
            ops = [AESOperationTrace(**op) for op in r_dict["operations"]]
            rounds.append(AESRoundTrace(
                round=r_dict["round"],
                round_type=r_dict["round_type"],
                round_key_hex=r_dict["round_key_hex"],
                operations=ops
            ))
            
        return AESDecryptResponse(
            mode="decrypt",
            ciphertext_hex=bytes_to_hex(ct_bytes),
            key_hex=bytes_to_hex(key_bytes),
            plaintext_hex=bytes_to_hex(pt_bytes),
            initial_state=trace["initial_state"],
            key_schedule=trace["key_schedule"],
            rounds=rounds
        )
