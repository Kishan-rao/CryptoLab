# Cryptography Algorithm Visualizer & Demonstrator — Task Checklist

This task checklist tracks the implementation, validation, and completion status of the **Cryptography Algorithm Visualizer & Demonstrator (CNS Lab)** project.

---

## Phase 1: Project Setup & Baseline Infrastructure
- [x] Initialize root configuration (`.gitignore`, root metadata)
- [x] Setup FastAPI backend structure (`backend/app/...`)
  - [x] Configure `backend/requirements.txt` (FastAPI, Pydantic, Uvicorn, Pytest)
  - [x] Implement `backend/app/main.py` with CORS middleware and global error handlers
  - [x] Implement `GET /api/v1/health` endpoint
  - [x] Configure Python virtual environment and install backend dependencies
- [x] Setup React + Vite frontend structure (`frontend/...`)
  - [x] Initialize Vite React project
  - [x] Configure Tailwind CSS and PostCSS
  - [x] Setup React Router (`/`, `/vigenere`, `/aes`, `/rsa`)
  - [x] Setup Axios API client (`src/services/api.js`)
  - [x] Implement shared UI components (`Navbar.jsx`, `AlgorithmCard.jsx`, `InputPanel.jsx`, `OutputPanel.jsx`)
- [x] Verify frontend and backend connection via the health endpoint

---

## Phase 2: Vigenère Cipher (Classical Cryptography)
- [x] Implement core algorithm in `backend/app/algorithms/classical/vigenere.py`:
  - [x] Key validation (alphabet only, non-empty, case-insensitive)
  - [x] Key normalization and cyclic repetition
  - [x] Character-to-index conversion ($A=0 \dots Z=25$)
  - [x] Modular addition: $C = (P + K) \pmod{26}$
  - [x] Modular subtraction: $P = (C - K) \pmod{26}$
  - [x] Case preservation / character handling for spaces and punctuation
  - [x] Detailed step-by-step calculation trace generation
- [x] Implement Pydantic schemas in `backend/app/schemas/vigenere.py`
- [x] Implement service layer in `backend/app/services/vigenere_service.py`
- [x] Expose REST endpoints in `backend/app/api/routes/vigenere.py`:
  - [x] `POST /api/v1/vigenere/encrypt`
  - [x] `POST /api/v1/vigenere/decrypt`
- [x] Write Pytest tests in `backend/tests/test_vigenere.py`:
  - [x] Test standard encryption & decryption
  - [x] Test key repetition
  - [x] Test uppercase, lowercase, and mixed-case handling
  - [x] Test non-alphabetic character handling
  - [x] Test invalid key validation errors
  - [x] Test empty input validation errors
  - [x] Test round-trip encryption/decryption
- [x] Build React Vigenère page (`frontend/src/pages/Vigenere.jsx` & `src/components/StepViewer.jsx`):
  - [x] Plaintext & Key inputs with character counters
  - [x] Encrypt / Decrypt toggle and action triggers
  - [x] Interactive step-by-step computation table / cards
  - [x] Mathematical formula card ($C = (P+K) \bmod 26$, $P = (C-K) \bmod 26$)
  - [x] Tabular cipher / Polyalphabetic explanation card
  - [x] Graceful client-side and server-side error display

---

## Phase 3: RSA (Asymmetric Cryptography)
- [x] Implement mathematical utilities in `backend/app/utils/math_utils.py`:
  - [x] Deterministic / Miller-Rabin primality testing
  - [x] Greatest Common Divisor (Euclidean algorithm)
  - [x] Extended Euclidean Algorithm (computing $x, y$ such that $ax + by = \gcd(a, b)$)
  - [x] Modular multiplicative inverse ($d \equiv e^{-1} \pmod{\phi(n)}$)
  - [x] Efficient modular exponentiation ($b^e \pmod m$ via square-and-multiply)
- [x] Implement RSA algorithm in `backend/app/algorithms/asymmetric/rsa.py`:
  - [x] Prime validation for $p$ and $q$ ($p \ne q$, both prime)
  - [x] Modulus $n = p \times q$
  - [x] Euler's totient $\phi(n) = (p-1)(q-1)$
  - [x] Public exponent $e$ validation ($1 < e < \phi(n)$, $\gcd(e, \phi(n)) = 1$)
  - [x] Automatic candidate $e$ selection helper
  - [x] Private exponent computation $d \equiv e^{-1} \pmod{\phi(n)}$
  - [x] Integer and text message encryption: $C = M^e \pmod n$
  - [x] Decryption: $M = C^d \pmod n$
  - [x] Intermediate step traces with detailed square-and-multiply and modular steps
- [x] Implement Pydantic schemas in `backend/app/schemas/rsa.py`
- [x] Implement service layer in `backend/app/services/rsa_service.py`
- [x] Expose REST endpoints in `backend/app/api/routes/rsa.py`:
  - [x] `POST /api/v1/rsa/generate-keys`
  - [x] `POST /api/v1/rsa/encrypt`
  - [x] `POST /api/v1/rsa/decrypt`
- [x] Write Pytest tests in `backend/tests/test_rsa.py`:
  - [x] Unit tests for `gcd`, `extended_gcd`, `mod_inverse`, `mod_exp`
  - [x] Primality test validation
  - [x] Key generation correctness ($e \times d \equiv 1 \pmod{\phi(n)}$)
  - [x] Encryption and decryption correctness
  - [x] Round-trip encryption/decryption
  - [x] Validation errors for non-prime $p, q$, equal primes, invalid $e$, and $M \ge n$
- [x] Build React RSA page (`frontend/src/pages/RSA.jsx`):
  - [x] Interactive Key Generation section ($p, q$, candidate $e$ picker, preset prime generator)
  - [x] Distinct Public Key $(e, n)$ and Private Key $(d, n)$ badges
  - [x] Math derivation breakdown ($\phi(n)$, formula explanations)
  - [x] Message encryption & decryption panels (number / text support)
  - [x] Step-by-step modular exponentiation viewer
  - [x] Prominent Educational / Small-parameter academic disclaimer

---

## Phase 4: AES-128 (Symmetric Cryptography) — Manual Scratch Implementation
- [x] Implement AES-128 in `backend/app/algorithms/symmetric/aes.py`:
  - [x] Standard S-box and Inverse S-box tables (manual implementation matching FIPS-197)
  - [x] Round Constant table (`Rcon`)
  - [x] 4x4 State matrix representation (column-major byte ordering)
  - [x] Galois Field $GF(2^8)$ multiplication with polynomial $x^8 + x^4 + x^3 + x + 1$ (0x11B)
  - [x] Key Expansion (RotWord, SubWord, XOR with Rcon, producing 11 round keys of 16 bytes)
  - [x] Transformations:
    - [x] `AddRoundKey`
    - [x] `SubBytes` & `InvSubBytes`
    - [x] `ShiftRows` & `InvShiftRows`
    - [x] `MixColumns` & `InvMixColumns`
  - [x] Encryption flow:
    - [x] Round 0: Initial AddRoundKey
    - [x] Rounds 1–9: SubBytes, ShiftRows, MixColumns, AddRoundKey
    - [x] Round 10: SubBytes, ShiftRows, AddRoundKey
  - [x] Decryption flow:
    - [x] Round 10: Initial AddRoundKey
    - [x] Rounds 9–1: InvShiftRows, InvSubBytes, AddRoundKey, InvMixColumns
    - [x] Round 0: InvShiftRows, InvSubBytes, AddRoundKey
  - [x] Comprehensive trace generation:
    - [x] Round-by-round and operation-by-operation 4x4 state matrix snapshots
    - [x] Key schedule expansion display
- [x] Mandatory Known-Answer Test (KAT) validation:
  - [x] Key: `000102030405060708090a0b0c0d0e0f`
  - [x] Plaintext: `00112233445566778899aabbccddeeff`
  - [x] Expected Ciphertext: `69c4e0d86a7b0430d8cdb78070b4c55a`
  - [x] Decryption matches original plaintext exactly
- [x] Implement Pydantic schemas in `backend/app/schemas/aes.py`
- [x] Implement service layer in `backend/app/services/aes_service.py`
- [x] Expose REST endpoints in `backend/app/api/routes/aes.py`:
  - [x] `POST /api/v1/aes/encrypt`
  - [x] `POST /api/v1/aes/decrypt`
- [x] Write Pytest tests in `backend/tests/test_aes.py`:
  - [x] Mandatory NIST KAT vector test
  - [x] Round-trip encryption and decryption
  - [x] Key expansion validation
  - [x] Individual transformation unit tests (SubBytes, ShiftRows, MixColumns, AddRoundKey)
  - [x] Input validation tests (invalid hex, key length $\ne$ 32 chars, plaintext length $\ne$ 32 chars)
- [x] Build React AES page & components (`frontend/src/pages/AES.jsx`, `src/components/StateMatrix.jsx`):
  - [x] Hexadecimal 32-char (128-bit) input panel with instant validation & byte count
  - [x] 1-Click "Load Official NIST Test Vector" preset button
  - [x] Round-by-round navigator (Round 0 to Round 10)
  - [x] Operation navigator within each round (SubBytes, ShiftRows, MixColumns, AddRoundKey)
  - [x] Interactive 4x4 StateMatrix visualization with row/column headers and byte hex inspection
  - [x] Key expansion schedule inspector
  - [x] Educational AES structural diagram & phase breakdown

---

## Phase 5: UI Integration, Shared Polish & Educational Features
- [x] Build Home Page (`frontend/src/pages/Home.jsx`):
  - [x] Hero section highlighting Classical, Symmetric, and Asymmetric pillars
  - [x] Algorithm comparison cards with badges and routing
  - [x] Quick navigation and visual overview of cryptography taxonomy
- [x] Shared UI polish:
  - [x] Navbar with active tab indicator, GitHub link, and theme styling
  - [x] Global academic disclaimer banner
  - [x] Loading spinners and error callouts for API calls
  - [x] Responsive layouts for desktop and mobile viewports
  - [x] Copy-to-clipboard buttons for ciphertexts, keys, and test vectors

---

## Phase 6: Comprehensive Verification & Documentation
- [x] Run full Pytest test suite and ensure 100% pass rate
- [x] End-to-end integration test of all API endpoints
- [x] Create detailed, high quality `README.md`:
  - [x] Title, Objective, Features, Tech Stack
  - [x] Architecture diagrams (Mermaid)
  - [x] Mathematical foundations for Vigenère, AES-128, and RSA
  - [x] API documentation with request/response examples
  - [x] Setup and execution instructions for Backend & Frontend
  - [x] Test execution instructions
  - [x] AES NIST test vector verification
  - [x] Limitations & Academic disclaimer
- [x] Git repository hygiene (clean commits, `.gitignore` covering Python cache, node_modules, etc.)
