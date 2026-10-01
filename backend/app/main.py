"""FastAPI Application Entry Point for Cryptography Algorithm Visualizer & Demonstrator."""
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

from app.api.routes import vigenere, aes, rsa

app = FastAPI(
    title="Cryptography Algorithm Visualizer & Demonstrator API",
    description="Educational REST API demonstrating Classical (Vigenère), Symmetric (AES-128), and Asymmetric (RSA) Cryptography.",
    version="1.0.0",
)

# CORS configuration for React frontend development
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi.encoders import jsonable_encoder

# Global validation error formatting
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = []
    for error in exc.errors():
        field = " -> ".join(str(loc) for loc in error.get("loc", []))
        msg = error.get("msg", "Invalid value")
        errors.append(f"{field}: {msg}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "detail": "Validation error: " + "; ".join(errors),
            "errors": jsonable_encoder(exc.errors())
        }
    )

# Health endpoint
@app.get("/api/v1/health", tags=["Health"])
async def health_check():
    return {
        "status": "ok",
        "app": "Cryptography Algorithm Visualizer & Demonstrator",
        "version": "1.0.0",
        "algorithms": ["vigenere", "aes-128", "rsa"],
        "disclaimer": "Educational demonstration only. Not for production cryptographic security."
    }

# Register algorithm routers
app.include_router(vigenere.router, prefix="/api/v1/vigenere", tags=["Vigenère Cipher (Classical)"])
app.include_router(aes.router, prefix="/api/v1/aes", tags=["AES-128 (Symmetric)"])
app.include_router(rsa.router, prefix="/api/v1/rsa", tags=["RSA (Asymmetric)"])
