"""Pydantic schemas for Vigenère cipher."""
from typing import List, Optional
from pydantic import BaseModel, Field, field_validator

class VigenereStep(BaseModel):
    position: int = Field(..., description="Alphabet character position index")
    text_index: int = Field(..., description="Original index in raw text")
    plaintext_char: Optional[str] = Field(None, description="Plaintext character")
    plaintext_value: Optional[int] = Field(None, description="0-25 numerical value of plaintext character")
    key_char: str = Field(..., description="Repeated key character")
    key_value: int = Field(..., description="0-25 numerical value of key character")
    ciphertext_char: Optional[str] = Field(None, description="Ciphertext character")
    ciphertext_value: Optional[int] = Field(None, description="0-25 numerical value of ciphertext character")
    calculation: str = Field(..., description="Formula representation")

class VigenereEncryptRequest(BaseModel):
    plaintext: str = Field(..., min_length=1, description="Message to encrypt")
    key: str = Field(..., min_length=1, description="Alphabetical key")

    @field_validator("key")
    @classmethod
    def validate_key(cls, v: str) -> str:
        s = v.strip()
        if not s:
            raise ValueError("Key cannot be empty or solely whitespace.")
        if not s.isalpha():
            raise ValueError("Key must contain only alphabetic characters (A-Z, a-z).")
        return s

class VigenereDecryptRequest(BaseModel):
    ciphertext: str = Field(..., min_length=1, description="Ciphertext to decrypt")
    key: str = Field(..., min_length=1, description="Alphabetical key")

    @field_validator("key")
    @classmethod
    def validate_key(cls, v: str) -> str:
        s = v.strip()
        if not s:
            raise ValueError("Key cannot be empty or solely whitespace.")
        if not s.isalpha():
            raise ValueError("Key must contain only alphabetic characters (A-Z, a-z).")
        return s

class VigenereResponse(BaseModel):
    mode: str = Field(..., description="'encrypt' or 'decrypt'")
    result: str = Field(..., description="Output text")
    original_text: str = Field(..., description="Input text")
    key: str = Field(..., description="Normalized key")
    key_stream: str = Field(..., description="Repeated key sequence corresponding to text")
    steps: List[VigenereStep]
    formula: str = Field(..., description="Mathematical formula applied")
