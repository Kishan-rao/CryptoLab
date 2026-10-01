"""API Route endpoints for Vigenère cipher."""
from fastapi import APIRouter, HTTPException, status
from app.schemas.vigenere import (
    VigenereEncryptRequest,
    VigenereDecryptRequest,
    VigenereResponse
)
from app.services.vigenere_service import VigenereService

router = APIRouter()

@router.post(
    "/encrypt",
    response_model=VigenereResponse,
    summary="Encrypt plaintext using Vigenère cipher",
    status_code=status.HTTP_200_OK,
)
def encrypt(request: VigenereEncryptRequest):
    try:
        return VigenereService.encrypt(request.plaintext, request.key)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.post(
    "/decrypt",
    response_model=VigenereResponse,
    summary="Decrypt ciphertext using Vigenère cipher",
    status_code=status.HTTP_200_OK,
)
def decrypt(request: VigenereDecryptRequest):
    try:
        return VigenereService.decrypt(request.ciphertext, request.key)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
