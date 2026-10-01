# CNS Cryptography Lab — Backend API

FastAPI REST API powering the **Cryptography Algorithm Visualizer & Demonstrator**.

## 1. Features
- **Classical Cryptography**: Vigenère cipher with complete character trace and modular arithmetic over $\mathbb{Z}_{26}$.
- **Symmetric Cryptography**: Pure manual implementation of AES-128 (FIPS-197) with 10 rounds, S-box, Key Expansion, and 4×4 state matrix snapshots. Validated against the official NIST Known-Answer Test (KAT) vector.
- **Asymmetric Cryptography**: Pure manual implementation of RSA public-key cryptosystem with primality validation, Extended Euclidean Algorithm, modular inverse, and square-and-multiply modular exponentiation.
- **Strict Decoupling**: Pure mathematical algorithms decoupled from FastAPI routes via an intermediate service layer.

---

## 2. Setup & Installation

### Requirements
- Python 3.10+ (tested on Python 3.13)

### Installation
```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv .venv

# Activate virtual environment
# Windows (PowerShell):
.\.venv\Scripts\Activate.ps1
# Linux/macOS:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

---

## 3. Running the Server

Start the development server using Uvicorn:
```bash
uvicorn app.main:app --reload --port 8000
```
Interactive Swagger documentation will be available at:
- `http://localhost:8000/docs`
- `http://localhost:8000/redoc`

---

## 4. Running Tests

Run the complete Pytest test suite:
```bash
pytest
```
To run tests with verbose output:
```bash
pytest -v
```

---

## 5. Endpoints Reference

### Health
- `GET /api/v1/health`

### Vigenère Cipher
- `POST /api/v1/vigenere/encrypt`
- `POST /api/v1/vigenere/decrypt`

### AES-128
- `POST /api/v1/aes/encrypt`
- `POST /api/v1/aes/decrypt`

### RSA
- `POST /api/v1/rsa/generate-keys`
- `POST /api/v1/rsa/encrypt`
- `POST /api/v1/rsa/decrypt`
