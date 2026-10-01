# CNS Cryptography Lab — Frontend

React 18 single-page application that visualizes the step-by-step execution of Vigenère, AES-128, and RSA cryptographic algorithms. Built with Vite and Tailwind CSS.

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Project Structure](#project-structure)
3. [Pages](#pages)
4. [Components](#components)
5. [Services & Utilities](#services--utilities)
6. [Styling System](#styling-system)
7. [Dev Server & Proxy](#dev-server--proxy)
8. [Available Scripts](#available-scripts)
9. [Environment Variables](#environment-variables)
10. [Building for Production](#building-for-production)

---

## Tech Stack

| Package | Version | Role |
|---|---|---|
| `react` | ^18.3.1 | UI framework |
| `react-dom` | ^18.3.1 | DOM renderer |
| `react-router-dom` | ^6.28.2 | Client-side routing |
| `axios` | ^1.7.9 | HTTP REST client |
| `lucide-react` | ^0.475.0 | Icon library |
| `vite` | ^6.1.0 | Build tool & dev server |
| `@vitejs/plugin-react` | ^4.3.4 | Vite React plugin (Babel) |
| `tailwindcss` | ^3.4.17 | Utility-first CSS |
| `postcss` + `autoprefixer` | latest | CSS processing pipeline |

---

## Project Structure

```
frontend/
├── index.html                  # Root HTML — loads Google Fonts (JetBrains Mono)
├── package.json
├── vite.config.js              # Dev port 5173, /api proxy → localhost:8000
├── tailwind.config.js          # Custom 'cipher' color palette + mono font
├── postcss.config.js
│
└── src/
    ├── main.jsx                # React root — mounts <App /> with <BrowserRouter>
    ├── App.jsx                 # Route definitions + persistent layout footer
    ├── index.css               # Tailwind directives, .glass-panel, scrollbar styles
    │
    ├── pages/
    │   ├── Home.jsx            # Landing: overview cards + algorithm comparison table
    │   ├── Vigenere.jsx        # Vigenère encrypt/decrypt + step trace table
    │   ├── AES.jsx             # AES hex inputs + round stepper + state matrices
    │   └── RSA.jsx             # RSA keygen + math derivation + exponentiation trace
    │
    ├── components/
    │   ├── Navbar.jsx          # Top navigation with active-link highlighting + health badge
    │   ├── AlgorithmCard.jsx   # Summary card used on the Home page
    │   ├── InputPanel.jsx      # Reusable labelled input/textarea with badge, hint, counter
    │   ├── OutputPanel.jsx     # Read-only monospace output with copy-to-clipboard
    │   ├── StepViewer.jsx      # Searchable Vigenère character-by-character trace table
    │   └── StateMatrix.jsx     # 4×4 AES state grid with hover byte inspector
    │
    ├── services/
    │   └── api.js              # Axios client — all 8 backend endpoints
    │
    └── utils/
        └── formatters.js       # cleanHex, isValidHex, formatHexWithSpaces, copyToClipboard
```

---

## Pages

### `/` — Home (`Home.jsx`)

Landing page presenting the three algorithm categories as interactive cards with key facts and formulas. Includes a comparison taxonomy table (Classical vs Symmetric vs Asymmetric) and the NIST verification banner.

### `/vigenere` — Vigenère Cipher (`Vigenere.jsx`)

- Mode toggle: **Encrypt** / **Decrypt**
- Plaintext/ciphertext textarea + key input
- Preset buttons with example vectors
- Swap button (feed ciphertext back as input for decryption)
- `StepViewer` table showing every character: input char, input value, key char, key value, calculation string, result value, result char

### `/aes` — AES-128 (`AES.jsx`)

- Hex plaintext and hex key inputs (validated to exactly 32 hex characters)
- **Load NIST Test Vector** preset button
- Encrypt / Decrypt mode toggle
- Swap button (output hex → input for reverse operation)
- Round pill selector (R0–R10) and operation pill selector within each round
- `StateMatrix` showing the 4×4 state after the selected operation
- Side-by-side round key matrix when `AddRoundKey` is selected
- Key Schedule inspector panel (all 11 round keys)

### `/rsa` — RSA (`RSA.jsx`)

- **Step 1 — Key Generation**: p, q, e inputs + prime preset buttons → derives n, φ(n), e, d
- Key derivation trace (all 6 derivation steps)
- Public Key (e, n) and Private Key (d, n) display cards
- **Step 2 — Message Operation**: Number / Text mode toggle, Encrypt / Decrypt toggle
- Output panel + per-block Square-and-Multiply exponentiation trace (up to 6 steps shown)
- Swap button (feed encrypted ciphertext directly into decrypt input)

---

## Components

### `Navbar.jsx`
Top navigation bar. Active link detection via `useLocation`. Polls `GET /api/v1/health` on mount and shows a live backend status indicator (green dot = connected, red = unreachable).

### `AlgorithmCard.jsx`
Reusable card for the Home page. Props: `title`, `subtitle`, `badge`, `description`, `formula`, `features[]`, `link`, `color`. Uses glassmorphism styling.

### `InputPanel.jsx`
Polymorphic input component. Props:
- `label`, `value`, `onChange`, `type` (`"text"` | `"textarea"` | `"number"`)
- `placeholder`, `hint`, `badge`, `error`
- `presets[]` — array of `{ label, value }` preset buttons
- `monospace` — enables `font-mono` class

### `OutputPanel.jsx`
Read-only output panel. Props:
- `label`, `value`, `mode` (`"ciphertext"` | `"plaintext"`)
- `extraInfo` — optional JSX rendered below the output
- Includes a copy-to-clipboard button using `navigator.clipboard`

### `StepViewer.jsx`
Renders the Vigenère character trace as a searchable table. Columns: `#`, Input char, Input value, Key (K), Key value, Modular calculation, Result value, Result char. Adapts column labels for encrypt vs decrypt mode. Clicking a row highlights it in a spotlight banner above the table.

### `StateMatrix.jsx`
Renders a 4×4 AES state grid. Each cell shows the 2-digit hex value. Hovering a cell shows a byte inspector bar with the byte in Hex, Decimal, and Binary. Supports `colorTheme` prop (`"cyan"` | `"indigo"` | `"emerald"` | `"amber"`).

---

## Services & Utilities

### `src/services/api.js`

Axios client with base URL `http://localhost:8000/api/v1` (or `VITE_API_URL` env var).

```js
api.checkHealth()
api.vigenereEncrypt(plaintext, key)
api.vigenereDecrypt(ciphertext, key)
api.aesEncrypt(plaintext_hex, key_hex)
api.aesDecrypt(ciphertext_hex, key_hex)
api.rsaGenerateKeys(p, q, e?)
api.rsaEncrypt(message, message_type, e, n)
api.rsaDecrypt(ciphertext, message_type, d, n)
```

All methods throw a normalized `Error` with a human-readable message extracted from the backend's `detail` field on HTTP 4xx/5xx.

### `src/utils/formatters.js`

```js
cleanHex(str)              // strip spaces, lowercase — "00 1A 2B" → "001a2b"
isValidHex(str)            // true if all chars in [0-9a-fA-F]
formatHexWithSpaces(str)   // "001a2b" → "00 1a 2b"
copyToClipboard(text)      // navigator.clipboard.writeText wrapper
```

---

## Styling System

### Tailwind Custom Tokens (`tailwind.config.js`)

| Token | Value | Usage |
|---|---|---|
| `cipher-bg` | `#0b0f19` | Page background |
| `cipher-card` | `#111827` | Card surfaces |
| `cipher-border` | `#1f2937` | Borders and dividers |
| `cipher-muted` | `#9ca3af` | Secondary text |
| `cipher-accent` | `#38bdf8` | Primary highlight |
| `font-mono` | JetBrains Mono → Fira Code → monospace | All code/hex values |

### Custom CSS (`index.css`)

```css
.glass-panel   /* translucent dark glass card — bg + border + backdrop-blur */
```

Custom scrollbar styles applied globally for the dark theme.

### Color Scheme per Algorithm Page

| Page | Accent |
|---|---|
| Vigenère | Amber / Yellow |
| AES-128 | Cyan / Sky |
| RSA | Indigo / Violet |

---

## Dev Server & Proxy

Vite runs on **port 5173** and proxies all requests beginning with `/api` to `http://localhost:8000`:

```js
// vite.config.js
proxy: {
  '/api': {
    target: 'http://localhost:8000',
    changeOrigin: true,
  }
}
```

This means in development you call `/api/v1/...` from the frontend and Vite forwards it to FastAPI — no CORS issues and no hardcoded backend URLs in component code.

---

## Available Scripts

Run from the `frontend/` directory:

```bash
npm run dev      # Start Vite dev server at http://localhost:5173
npm run build    # Production build → dist/
npm run preview  # Serve the production build locally
```

---

## Environment Variables

Create a `.env.local` file in `frontend/` to override defaults:

```env
# Override the backend API base URL (e.g. for a deployed backend)
VITE_API_URL=https://your-backend.example.com/api/v1
```

If `VITE_API_URL` is not set, the Axios client falls back to `http://localhost:8000/api/v1`.

> [!NOTE]
> All Vite environment variables must be prefixed with `VITE_` to be exposed to the browser bundle.

---

## Building for Production

```bash
npm run build
```

Output is written to `frontend/dist/`. Serve it with any static file host (Nginx, Vercel, Netlify, GitHub Pages, etc.).

For a deployed backend, set the `VITE_API_URL` environment variable in your hosting platform's build settings — the frontend will point directly to the backend API URL instead of relying on the Vite proxy.

> [!IMPORTANT]
> Ensure the FastAPI backend has the production frontend origin added to its CORS `allow_origins` list in `backend/app/main.py`.
