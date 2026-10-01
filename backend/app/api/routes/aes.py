"""API Route endpoints for AES-128."""
from fastapi import APIRouter, HTTPException, status
from app.schemas.aes import (
    AESEncryptRequest,
    AESEncryptResponse,
    AESDecryptRequest,
    AESDecryptResponse
)
from app.services.aes_service import AESService

router = APIRouter()

@router.post(
    "/encrypt",
    response_model=AESEncryptResponse,
    summary="Encrypt 128-bit hex block using AES-128",
    status_code=status.HTTP_200_OK
)
def encrypt(request: AESEncryptRequest):
    try:
        return AESService.encrypt(request.plaintext_hex, request.key_hex)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.post(
    "/decrypt",
    response_model=AESDecryptResponse,
    summary="Decrypt 128-bit hex block using AES-128",
    status_code=status.HTTP_200_OK
)
def decrypt(request: AESDecryptRequest):
    try:
        return AESService.decrypt(request.ciphertext_hex, request.key_hex)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
