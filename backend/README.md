# CNS Cryptography Lab — Backend API

FastAPI REST API powering the **Cryptography Algorithm Visualizer & Demonstrator**. Provides pure-Python cryptographic computations and returns detailed step-by-step traces to the React frontend.

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Project Structure](#project-structure)
3. [Setup & Installation](#setup--installation)
4. [Running the Server](#running-the-server)
5. [Running Tests](#running-tests)
6. [API Reference](#api-reference)
7. [Algorithm Modules](#algorithm-modules)
8. [Schemas](#schemas)
9. [Utils](#utils)
10. [NIST Test Vector](#nist-test-vector)

---

## Tech Stack

| Package | Version | Role |
|---|---|---|
| `fastapi` | latest | Async REST API framework |
| `uvicorn` | latest | ASGI server |
| `pydantic` | v2 | Request/response schema validation |
| `pytest` | ^9.x | Test runner |
| `httpx` / `starlette.testclient` | latest | Integration test client |

**Python requirement:** 3.10+ (developed and tested on Python 3.13.0)

---

## Project Structure

```
backend/
├── app/
│   ├── main.py                         # FastAPI app, CORS, validation error handler
│   │
│   ├── api/
│   │   └── routes/
│   │       ├── vigenere.py             # POST /api/v1/vigenere/{encrypt,decrypt}
│   │       ├── aes.py                  # POST /api/v1/aes/{encrypt,decrypt}
│   │       └── rsa.py                  # POST /api/v1/rsa/{generate-keys,encrypt,decrypt}
│   │
│   ├── services/
│   │   ├── vigenere_service.py         # Packages Vigenère output into Pydantic response
│   │   ├── aes_service.py              # Packages AES round traces into Pydantic response
│   │   └── rsa_service.py              # Packages RSA keygen & step data into Pydantic response
│   │
│   ├── algorithms/                     # Pure Python — no external crypto libraries
│   │   ├── classical/
│   │   │   └── vigenere.py             # Key norm, encrypt, decrypt, per-char trace
│   │   ├── symmetric/
│   │   │   └── aes.py                  # Full AES-128 FIPS-197: S-box, Key Expansion, 10 rounds
│   │   └── asymmetric/
│   │       └── rsa.py                  # Keygen, encrypt, decrypt, square-and-multiply trace
│   │
│   ├── schemas/
│   │   ├── vigenere.py                 # VigenereEncryptRequest/Response, VigenereStep
│   │   ├── aes.py                      # AESEncrypt/DecryptRequest/Response, round trace models
│   │   └── rsa.py                      # RSAKeyGenRequest/Response, RSAMathStep, Encrypt/Decrypt
│   │
│   └── utils/
│       ├── encoding.py                 # hex_to_bytes, bytes_to_hex, bytes_to_matrix, matrix_to_bytes, matrix_to_hex_grid, clean_hex_string
│       └── math_utils.py               # gcd, extended_gcd, mod_inverse, is_prime, mod_exp, mod_exp_trace, xtime, gmul
│
├── tests/
│   ├── test_vigenere.py                # 7 tests
│   ├── test_aes.py                     # 10 tests (includes NIST KAT + S-box bijection)
│   ├── test_rsa.py                     # 7 tests
│   └── test_api_routes.py              # 4 integration tests
│
├── pytest.ini                          # testpaths = tests, pythonpath = .
└── requirements.txt
```

---

## Setup & Installation

```bash
# From the project root, navigate into the backend directory
cd backend

# Create a virtual environment
python -m venv .venv

# Activate it
# Windows (PowerShell):
.\.venv\Scripts\Activate.ps1
# macOS / Linux:
source .venv/bin/activate

# Install all dependencies
pip install -r requirements.txt
```

`requirements.txt` installs:
```
fastapi
uvicorn[standard]
pydantic
pytest
httpx
```

---

## Running the Server

```bash
uvicorn app.main:app --reload --port 8000
```

| URL | Purpose |
|---|---|
| `http://localhost:8000` | API root |
| `http://localhost:8000/api/v1/health` | Health check |
| `http://localhost:8000/docs` | Swagger UI (interactive) |
| `http://localhost:8000/redoc` | ReDoc documentation |

The server enables CORS for `http://localhost:5173` (Vite dev server) and `http://localhost:3000` by default.

---

## Running Tests

```bash
# Run all 28 tests
pytest

# Verbose — see individual test names
pytest -v

# Run a specific suite
pytest tests/test_aes.py
pytest tests/test_rsa.py
pytest tests/test_vigenere.py
pytest tests/test_api_routes.py
```

Expected result: **28 passed**.

| Test File | Tests | What's Covered |
|---|---|---|
| `test_aes.py` | 10 | NIST KAT, encrypt/decrypt roundtrip, key expansion, all 4 transformations invertibility, S-box bijection |
| `test_rsa.py` | 7 | GCD/ExtGCD/ModInv, keygen, numeric roundtrip, text roundtrip, overflow validation, service layer |
| `test_vigenere.py` | 7 | Key validation, classic vectors, case preservation, step content, service layer, empty input |
| `test_api_routes.py` | 4 | Health, Vigenère API, AES API, RSA API (HTTP integration) |

---

## API Reference

### `GET /api/v1/health`

```json
{
  "status": "ok",
  "app": "Cryptography Algorithm Visualizer & Demonstrator",
  "version": "1.0.0",
  "algorithms": ["vigenere", "aes-128", "rsa"]
}
```

---

### Vigenère — `POST /api/v1/vigenere/encrypt`

**Request:**
```json
{ "plaintext": "HELLO CNS LAB", "key": "KEY" }
```

**Response:**
```json
{
  "mode": "encrypt",
  "result": "RIJVS ...",
  "key_used": "KEY",
  "steps": [
    {
      "position": 0,
      "plaintext_char": "H", "plaintext_value": 7,
      "key_char": "K",       "key_value": 10,
      "ciphertext_value": 17, "ciphertext_char": "R",
      "calculation": "(7 + 10) mod 26 = 17"
    }
  ]
}
```

### `POST /api/v1/vigenere/decrypt`

Same structure as encrypt but body uses `ciphertext` and response `mode` is `"decrypt"`. Step objects have `ciphertext_char`/`ciphertext_value` as input and `plaintext_char`/`plaintext_value` as output.

---

### AES-128 — `POST /api/v1/aes/encrypt`

**Request:**
```json
{
  "plaintext_hex": "00112233445566778899aabbccddeeff",
  "key_hex":       "000102030405060708090a0b0c0d0e0f"
}
```

**Response (abbreviated):**
```json
{
  "mode": "encrypt",
  "plaintext_hex":  "00112233445566778899aabbccddeeff",
  "ciphertext_hex": "69c4e0d86a7b0430d8cdb78070b4c55a",
  "key_hex":        "000102030405060708090a0b0c0d0e0f",
  "key_schedule":   ["000102030405060708090a0b0c0d0e0f", "...×11"],
  "initial_state":  [["00","10","20","30"],["..."]],
  "rounds": [
    {
      "round": 0,
      "round_type": "Initial Round",
      "round_key_hex": "000102...",
      "operations": [
        {
          "name": "AddRoundKey",
          "description": "Bitwise XOR of input state with Round 0 key",
          "state": [["00","4f","54","fa"],["..."]],
          "round_key": [["00","01","02","03"],["..."]]
        }
      ]
    }
  ]
}
```

Rounds 1–9 have 4 operations each (`SubBytes`, `ShiftRows`, `MixColumns`, `AddRoundKey`).  
Round 10 has 3 operations (`SubBytes`, `ShiftRows`, `AddRoundKey`).

### `POST /api/v1/aes/decrypt`

Body: `{ "ciphertext_hex": "...", "key_hex": "..." }`.  
Response: same structure, `mode = "decrypt"`, `plaintext_hex` is the output.  
Decryption rounds use `InvShiftRows`, `InvSubBytes`, `AddRoundKey`, `InvMixColumns`.

---

### RSA — `POST /api/v1/rsa/generate-keys`

**Request:**
```json
{ "p": 61, "q": 53, "e": 17 }
```
`e` is optional — if omitted, the first suitable candidate is auto-selected.

**Response:**
```json
{
  "p": 61, "q": 53,
  "n": 3233, "phi_n": 3120,
  "e": 17,   "d": 2753,
  "public_key":  { "e": 17,   "n": 3233 },
  "private_key": { "d": 2753, "n": 3233 },
  "candidate_exponents": [17, 3, 5, 7, 11],
  "derivation_steps": [
    "Step 1: Compute modulus n = p * q = 61 * 53 = 3233",
    "Step 2: Compute Euler's Totient phi(n) = ...",
    "..."
  ],
  "disclaimer": "Educational implementation..."
}
```

### `POST /api/v1/rsa/encrypt`

**Request:**
```json
{ "message": "65", "message_type": "number", "e": 17, "n": 3233 }
```
`message_type` is `"number"` (single integer) or `"text"` (ASCII character-by-character).

**Response:**
```json
{
  "mode": "numeric",
  "original": "65",
  "ciphertext": "2790",
  "public_key": { "e": 17, "n": 3233 },
  "blocks": [
    {
      "block_index": 0,
      "m_val": 65, "c_val": 2790,
      "formula": "C = 65^17 mod 3233 = 2790",
      "trace": [
        { "step": 1, "bit": 1, "square_result": "Square: (1^2) mod 3233 = 1", "multiply_result": "Multiply: (1 * 65) mod 3233 = 65", "current_value": 65 }
      ]
    }
  ]
}
```

### `POST /api/v1/rsa/decrypt`

```json
{ "ciphertext": "2790", "message_type": "number", "d": 2753, "n": 3233 }
```

Response: `decrypted_message: "65"`, `blocks[]` with `c_val`, `m_val`, formula, and trace.

For `message_type: "text"` the ciphertext is a comma-separated list of integers (one per character), and the decrypted message is the reconstructed string.

---

## Algorithm Modules

All modules in `app/algorithms/` are importable without FastAPI:

```python
from app.algorithms.classical.vigenere import vigenere_encrypt, vigenere_decrypt
from app.algorithms.symmetric.aes import aes_encrypt_block, aes_decrypt_block
from app.algorithms.asymmetric.rsa import generate_rsa_keys, rsa_encrypt_message, rsa_decrypt_message
```

### `vigenere.py`

```python
vigenere_encrypt(plaintext: str, key: str) -> Tuple[str, List[dict]]
vigenere_decrypt(ciphertext: str, key: str) -> Tuple[str, List[dict]]
```

Key is normalised (uppercase, non-alpha stripped). Non-alphabetic input characters are passed through unchanged. Returns `(result_string, steps_list)`.

### `aes.py`

```python
aes_encrypt_block(plaintext_bytes: bytes, key_bytes: bytes) -> Tuple[bytes, dict]
aes_decrypt_block(ciphertext_bytes: bytes, key_bytes: bytes) -> Tuple[bytes, dict]
```

Both require exactly 16 bytes input and 16 bytes key. Returns `(output_bytes, trace_dict)` where `trace_dict` has `initial_state`, `key_schedule`, and `rounds`.

Key components: `S_BOX` (256-entry bijection, FIPS-197), `INV_S_BOX`, `RCON`, `key_expansion`, `sub_bytes`, `inv_sub_bytes`, `shift_rows`, `inv_shift_rows`, `mix_columns`, `inv_mix_columns`, `add_round_key`.

State matrix is **column-major**: `state[r][c] = block[r + 4*c]`.

### `rsa.py`

```python
generate_rsa_keys(p, q, chosen_e=None) -> dict
rsa_encrypt_message(message, e, n, is_numeric=False) -> dict
rsa_decrypt_message(ciphertext, d, n, is_numeric=False) -> dict
```

Validates primality of p and q using trial division. Exponentiation uses `mod_exp_trace` from `math_utils` for the binary square-and-multiply trace.

---

## Schemas

All schemas use Pydantic v2. Key models:

| Model | File | Purpose |
|---|---|---|
| `VigenereEncryptRequest` | `schemas/vigenere.py` | Validates `plaintext`, `key` |
| `VigenereEncryptResponse` | `schemas/vigenere.py` | `mode`, `result`, `key_used`, `steps[]` |
| `VigenereStep` | `schemas/vigenere.py` | Per-character trace object |
| `AESEncryptRequest` | `schemas/aes.py` | Validates & normalises 32-char hex inputs |
| `AESEncryptResponse` | `schemas/aes.py` | Full round trace response |
| `AESRoundTrace` | `schemas/aes.py` | Round number, type, key, `operations[]` |
| `AESOperationTrace` | `schemas/aes.py` | Operation name, description, state 4×4, optional round_key |
| `RSAKeyGenRequest` | `schemas/rsa.py` | `p`, `q`, optional `e` |
| `RSAKeyGenResponse` | `schemas/rsa.py` | Full key derivation |
| `RSAEncryptRequest` | `schemas/rsa.py` | `message`, `message_type`, `e`, `n` |
| `RSAMathStep` | `schemas/rsa.py` | Per-block block_index, m_val, c_val, formula, trace |

---

## Utils

### `encoding.py`

```python
clean_hex_string(s: str) -> str          # strip spaces, lowercase
hex_to_bytes(hex_str: str) -> bytes      # "001a2b" → b'\x00\x1a\x2b'
bytes_to_hex(b: bytes) -> str            # b'\x00\x1a' → "001a"
bytes_to_matrix(b: bytes) -> List[List[int]]   # 16 bytes → 4×4 column-major
matrix_to_bytes(m: List[List[int]]) -> bytes   # 4×4 → 16 bytes
matrix_to_hex_grid(m) -> List[List[str]]       # 4×4 ints → 4×4 two-char hex strings
```

### `math_utils.py`

```python
gcd(a, b) -> int
extended_gcd(a, b) -> Tuple[int, int, int]     # (g, x, y) where a*x + b*y = g
mod_inverse(e, m) -> int                        # raises ValueError if gcd != 1
is_prime(n) -> bool                             # trial division up to sqrt(n)
mod_exp(base, exp, mod) -> int                  # fast binary exponentiation
mod_exp_trace(base, exp, mod) -> Tuple[int, List[dict]]  # with per-bit trace
xtime(b) -> int                                 # GF(2^8) multiply by x (0x02)
gmul(a, b) -> int                               # GF(2^8) full multiplication
```

---

## NIST Test Vector

The AES implementation is validated against the official FIPS-197 Known-Answer Test:

| Parameter | Hex Value |
|---|---|
| Key | `000102030405060708090a0b0c0d0e0f` |
| Plaintext | `00112233445566778899aabbccddeeff` |
| Ciphertext | `69c4e0d86a7b0430d8cdb78070b4c55a` |

Test: `tests/test_aes.py::test_aes_nist_known_answer_vector_encryption`

The S-box is also verified as a valid bijection by `test_sbox_is_valid_bijection` — `sorted(S_BOX) == list(range(256))` and `INV_S_BOX[S_BOX[i]] == i` for all i.
