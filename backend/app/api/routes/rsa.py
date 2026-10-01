"""API Route endpoints for RSA cryptosystem."""
from fastapi import APIRouter, HTTPException, status
from app.schemas.rsa import (
    RSAKeyGenRequest,
    RSAKeyGenResponse,
    RSAEncryptRequest,
    RSAEncryptResponse,
    RSADecryptRequest,
    RSADecryptResponse
)
from app.services.rsa_service import RSAService

router = APIRouter()

@router.post(
    "/generate-keys",
    response_model=RSAKeyGenResponse,
    summary="Generate RSA key pair from primes p and q",
    status_code=status.HTTP_200_OK
)
def generate_keys(request: RSAKeyGenRequest):
    try:
        return RSAService.generate_keys(request.p, request.q, request.e)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.post(
    "/encrypt",
    response_model=RSAEncryptResponse,
    summary="Encrypt message using RSA public key (e, n)",
    status_code=status.HTTP_200_OK
)
def encrypt(request: RSAEncryptRequest):
    try:
        return RSAService.encrypt(request.message, request.message_type, request.e, request.n)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.post(
    "/decrypt",
    response_model=RSADecryptResponse,
    summary="Decrypt ciphertext using RSA private key (d, n)",
    status_code=status.HTTP_200_OK
)
def decrypt(request: RSADecryptRequest):
    try:
        return RSAService.decrypt(request.ciphertext, request.message_type, request.d, request.n)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
