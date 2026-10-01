"""Pydantic schemas for AES-128."""
from typing import List, Optional
from pydantic import BaseModel, Field, field_validator
from app.utils.encoding import clean_hex_string

class AESOperationTrace(BaseModel):
    name: str = Field(..., description="Operation name (e.g., SubBytes, ShiftRows, MixColumns, AddRoundKey)")
    description: str = Field(..., description="Explanation of transformation")
    state: List[List[str]] = Field(..., description="4x4 hexadecimal state matrix representation")
    round_key: Optional[List[List[str]]] = Field(None, description="4x4 hexadecimal round key matrix if AddRoundKey")

class AESRoundTrace(BaseModel):
    round: int = Field(..., description="Round number (0 to 10)")
    round_type: str = Field(..., description="Type of round (Initial, Standard, Final)")
    round_key_hex: str = Field(..., description="16-byte round key as 32 hex characters")
    operations: List[AESOperationTrace]

class AESEncryptRequest(BaseModel):
    plaintext_hex: str = Field(..., min_length=32, max_length=40, description="128-bit plaintext as 32 hex characters")
    key_hex: str = Field(..., min_length=32, max_length=40, description="128-bit key as 32 hex characters")

    @field_validator("plaintext_hex")
    @classmethod
    def validate_plaintext(cls, v: str) -> str:
        s = clean_hex_string(v)
        if len(s) != 32:
            raise ValueError(f"Plaintext must be exactly 32 hex characters (128 bits), got {len(s)}.")
        try:
            bytes.fromhex(s)
        except ValueError:
            raise ValueError("Plaintext must be a valid hexadecimal string.")
        return s

    @field_validator("key_hex")
    @classmethod
    def validate_key(cls, v: str) -> str:
        s = clean_hex_string(v)
        if len(s) != 32:
            raise ValueError(f"Key must be exactly 32 hex characters (128 bits), got {len(s)}.")
        try:
            bytes.fromhex(s)
        except ValueError:
            raise ValueError("Key must be a valid hexadecimal string.")
        return s

class AESDecryptRequest(BaseModel):
    ciphertext_hex: str = Field(..., min_length=32, max_length=40, description="128-bit ciphertext as 32 hex characters")
    key_hex: str = Field(..., min_length=32, max_length=40, description="128-bit key as 32 hex characters")

    @field_validator("ciphertext_hex")
    @classmethod
    def validate_ciphertext(cls, v: str) -> str:
        s = clean_hex_string(v)
        if len(s) != 32:
            raise ValueError(f"Ciphertext must be exactly 32 hex characters (128 bits), got {len(s)}.")
        try:
            bytes.fromhex(s)
        except ValueError:
            raise ValueError("Ciphertext must be a valid hexadecimal string.")
        return s

    @field_validator("key_hex")
    @classmethod
    def validate_key(cls, v: str) -> str:
        s = clean_hex_string(v)
        if len(s) != 32:
            raise ValueError(f"Key must be exactly 32 hex characters (128 bits), got {len(s)}.")
        try:
            bytes.fromhex(s)
        except ValueError:
            raise ValueError("Key must be a valid hexadecimal string.")
        return s

class AESEncryptResponse(BaseModel):
    mode: str = "encrypt"
    plaintext_hex: str
    key_hex: str
    ciphertext_hex: str
    initial_state: List[List[str]]
    key_schedule: List[str]
    rounds: List[AESRoundTrace]

class AESDecryptResponse(BaseModel):
    mode: str = "decrypt"
    ciphertext_hex: str
    key_hex: str
    plaintext_hex: str
    initial_state: List[List[str]]
    key_schedule: List[str]
    rounds: List[AESRoundTrace]
