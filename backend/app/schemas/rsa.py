"""Pydantic schemas for RSA cryptosystem."""
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field, field_validator

class KeyPair(BaseModel):
    exp: int = Field(..., alias="exponent")
    mod: int = Field(..., alias="modulus")

class RSAKeyGenRequest(BaseModel):
    p: int = Field(..., description="First prime number (p > 1)")
    q: int = Field(..., description="Second prime number (q > 1, p != q)")
    e: Optional[int] = Field(None, description="Optional chosen public exponent coprime to phi(n)")

class RSAKeyGenResponse(BaseModel):
    p: int
    q: int
    n: int
    phi_n: int
    e: int
    d: int
    public_key: Dict[str, int]
    private_key: Dict[str, int]
    candidate_exponents: List[int]
    derivation_steps: List[str]
    disclaimer: str = "Educational implementation using small primes for visualization. Not cryptographically secure."

class RSAMathStep(BaseModel):
    block_index: int
    m_raw: Optional[str] = None
    m_val: int
    c_val: int
    formula: str
    trace: List[Dict[str, Any]]

class RSAEncryptRequest(BaseModel):
    message: str = Field(..., min_length=1, description="Message to encrypt (integer string or text)")
    message_type: str = Field("text", description="'text' or 'number'")
    e: int = Field(..., description="Public exponent e")
    n: int = Field(..., description="Modulus n")

    @field_validator("message_type")
    @classmethod
    def validate_type(cls, v: str) -> str:
        if v not in ("text", "number"):
            raise ValueError("message_type must be either 'text' or 'number'.")
        return v

class RSAEncryptResponse(BaseModel):
    mode: str
    original: str
    ciphertext: str
    public_key: Dict[str, int]
    blocks: List[RSAMathStep]
    formula: str = "C = M^e mod n"

class RSADecryptRequest(BaseModel):
    ciphertext: str = Field(..., min_length=1, description="Ciphertext to decrypt")
    message_type: str = Field("text", description="'text' or 'number'")
    d: int = Field(..., description="Private exponent d")
    n: int = Field(..., description="Modulus n")

    @field_validator("message_type")
    @classmethod
    def validate_type(cls, v: str) -> str:
        if v not in ("text", "number"):
            raise ValueError("message_type must be either 'text' or 'number'.")
        return v

class RSADecryptResponse(BaseModel):
    mode: str
    original_ciphertext: str
    decrypted_message: str
    private_key: Dict[str, int]
    blocks: List[RSAMathStep]
    formula: str = "M = C^d mod n"
