# Cryptography Algorithm Visualizer & Demonstrator

> **CNS Academic Project** — A full-stack interactive platform for visualizing the internal workings of three foundational cryptographic algorithms.

---

## What This Project Does

This application lets you step through the **exact mathematical operations** performed by real cryptographic algorithms — not simulations or pseudocode, but the actual computation:

- **Vigenère Cipher** — watch every character shift through modular arithmetic
- **AES-128** — inspect each of the 10 rounds and every 4×4 state matrix transformation
- **RSA** — follow the full key derivation, then trace each bit of the square-and-multiply exponentiation

All three algorithms are implemented **from scratch in pure Python** — no `cryptography`, `pycryptodome`, or any black-box crypto library is involved in the computations.

---

## Repository Layout

```
CNS-Cryptography-Lab/
├── frontend/          React 18 + Vite + Tailwind CSS (port 5173)
│   └── README.md      ← Frontend developer guide
│
├── backend/           Python 3 + FastAPI + Pydantic v2 (port 8000)
│   └── README.md      ← Backend developer guide
│
└── README.md          ← You are here — project overview
```

---

## Technology Stack

### Frontend — [`frontend/`](./frontend/README.md)
| | |
|---|---|
| Framework | React 18 (via Vite 6) |
| Routing | React Router DOM v6 |
| Styling | Tailwind CSS 3 (dark glassmorphism theme, JetBrains Mono) |
| HTTP | Axios |
| Icons | Lucide React |

### Backend — [`backend/`](./backend/README.md)
| | |
|---|---|
| Language | Python 3.10+ |
| Framework | FastAPI |
| Validation | Pydantic v2 |
| Server | Uvicorn (ASGI) |
| Tests | Pytest 9.x (28 tests, all passing) |

---

## Architecture Overview

```
Browser (port 5173)
      │
      │  REST / JSON  (Axios)
      ▼
FastAPI Backend (port 8000)
      │
      ├── /api/v1/vigenere/*
      ├── /api/v1/aes/*
      └── /api/v1/rsa/*
            │
            ▼ Service Layer
            │
            ▼ Algorithm Layer (pure Python, no crypto libs)
            │
            ├── algorithms/classical/vigenere.py
            ├── algorithms/symmetric/aes.py
            └── algorithms/asymmetric/rsa.py
```

The algorithm modules are **completely independent** of FastAPI — they can be imported and tested without starting the web server.

---

## Quick Start

You need two terminals running simultaneously.

### Terminal 1 — Backend

```bash
cd backend

# Create and activate virtual environment
python -m venv .venv

# Windows
.\.venv\Scripts\Activate.ps1
# macOS / Linux
source .venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Terminal 2 — Frontend

```bash
cd frontend
npm install
npm run dev
```

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8000 |
| Swagger UI | http://localhost:8000/docs |
| ReDoc | http://localhost:8000/redoc |

> The Vite dev server proxies all `/api` requests to `localhost:8000` automatically.

---

## Algorithms Implemented

### Vigenère Cipher (Classical)

Polyalphabetic substitution over $\mathbb{Z}_{26}$:

- **Encrypt:** $C_i = (P_i + K_i) \bmod 26$
- **Decrypt:** $P_i = (C_i - K_i + 26) \bmod 26$

Returns a per-character step trace with values, key chars, and the full calculation string.

---

### AES-128 (Symmetric — FIPS-197)

Full 10-round implementation with complete state tracing:

| Component | Detail |
|---|---|
| Block size | 128-bit (16 bytes) — $4 \times 4$ column-major state matrix |
| Key size | 128-bit (16 bytes) |
| Rounds | 10 (1 initial + 9 standard + 1 final) |
| Key schedule | `RotWord` + `SubWord` + `Rcon` → 11 round keys |
| S-box | 256-entry bijection verified against FIPS-197 (duplicate-free) |
| GF(2⁸) | Irreducible polynomial $x^8 + x^4 + x^3 + x + 1$ (0x11B) |

**NIST Known-Answer Test Vector:**

| Key | `000102030405060708090a0b0c0d0e0f` |
|---|---|
| Plaintext | `00112233445566778899aabbccddeeff` |
| Ciphertext | `69c4e0d86a7b0430d8cdb78070b4c55a` ✓ |

---

### RSA (Asymmetric)

Full mathematical derivation from primes to ciphertext:

| Step | Formula |
|---|---|
| Modulus | $n = p \times q$ |
| Totient | $\phi(n) = (p-1)(q-1)$ |
| Public exponent | $\gcd(e,\ \phi(n)) = 1$ |
| Private exponent | $d \equiv e^{-1} \pmod{\phi(n)}$ via Extended Euclidean |
| Encrypt | $C = M^e \bmod n$ |
| Decrypt | $M = C^d \bmod n$ |

Exponentiation is performed with the **binary square-and-multiply** method, returning a full per-bit trace.

---

## Running Tests

```bash
cd backend
.\.venv\Scripts\pytest -v
```

```
28 passed in 1.12s
├── test_aes.py         (10) — NIST KAT, all transformations, S-box bijection
├── test_rsa.py          (7) — number theory, keygen, encrypt/decrypt
├── test_vigenere.py     (7) — validation, vectors, case preservation
└── test_api_routes.py   (4) — REST endpoint integration
```

---

## API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/v1/health` | Health check |
| POST | `/api/v1/vigenere/encrypt` | Vigenère encryption |
| POST | `/api/v1/vigenere/decrypt` | Vigenère decryption |
| POST | `/api/v1/aes/encrypt` | AES-128 encryption |
| POST | `/api/v1/aes/decrypt` | AES-128 decryption |
| POST | `/api/v1/rsa/generate-keys` | RSA key generation |
| POST | `/api/v1/rsa/encrypt` | RSA encryption |
| POST | `/api/v1/rsa/decrypt` | RSA decryption |

Full request/response schemas in [`backend/README.md`](./backend/README.md).

---

## Academic Disclaimer

> [!CAUTION]
> This is an **educational implementation** built for a CNS course assignment. It demonstrates internal algorithm mechanics using small, human-readable parameters.
>
> **Do not use this code for real security.** For production cryptography, use audited libraries with appropriate parameters (AES-GCM, RSA-OAEP with 2048-bit+ keys, or post-quantum schemes).
