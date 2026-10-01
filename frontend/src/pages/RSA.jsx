import React, { useState } from 'react';
import { Lock, Unlock, Key, RefreshCw, AlertCircle, Shield, Sparkles, BookOpen, ChevronRight, Hash, Type } from 'lucide-react';
import InputPanel from '../components/InputPanel';
import OutputPanel from '../components/OutputPanel';
import api from '../services/api';

const PRIME_PRESETS = [
  { label: 'Textbook (61, 53)', p: 61, q: 53, e: 17 },
  { label: 'Small (17, 19)', p: 17, q: 19, e: 5 },
  { label: 'Medium (47, 59)', p: 47, q: 59, e: 17 },
  { label: 'Three-Digit (101, 103)', p: 101, q: 103, e: 7 },
];

export default function RSA() {
  // Key Generation State
  const [p, setP] = useState(61);
  const [q, setQ] = useState(53);
  const [chosenE, setChosenE] = useState(17);
  const [keyGenData, setKeyGenData] = useState(null);
  const [keyGenLoading, setKeyGenLoading] = useState(false);
  const [keyGenError, setKeyGenError] = useState(null);

  // Message Operation State
  const [message, setMessage] = useState('65');
  const [messageType, setMessageType] = useState('number'); // 'number' or 'text'
  const [mode, setMode] = useState('encrypt'); // 'encrypt' or 'decrypt'
  const [opLoading, setOpLoading] = useState(false);
  const [opError, setOpError] = useState(null);
  const [opResponse, setOpResponse] = useState(null);

  const handleGenerateKeys = async (overrideP, overrideQ, overrideE) => {
    setKeyGenLoading(true);
    setKeyGenError(null);
    const targetP = overrideP !== undefined ? overrideP : p;
    const targetQ = overrideQ !== undefined ? overrideQ : q;
    const targetE = overrideE !== undefined ? overrideE : chosenE;

    try {
      const data = await api.rsaGenerateKeys(targetP, targetQ, targetE);
      setKeyGenData(data);
      if (data.e) setChosenE(data.e);
    } catch (err) {
      setKeyGenError(err.message || 'Key generation failed.');
      setKeyGenData(null);
    } finally {
      setKeyGenLoading(false);
    }
  };

  const handleApplyPreset = (preset) => {
    setP(preset.p);
    setQ(preset.q);
    setChosenE(preset.e);
    handleGenerateKeys(preset.p, preset.q, preset.e);
  };

  const handleExecuteOperation = async (e) => {
    if (e) e.preventDefault();
    setOpError(null);

    if (!keyGenData) {
      setOpError('Please generate an RSA key pair first before running encryption/decryption.');
      return;
    }

    setOpLoading(true);
    try {
      if (mode === 'encrypt') {
        const res = await api.rsaEncrypt(
          message,
          messageType,
          keyGenData.public_key.e,
          keyGenData.public_key.n
        );
        setOpResponse(res);
      } else {
        const res = await api.rsaDecrypt(
          message,
          messageType,
          keyGenData.private_key.d,
          keyGenData.private_key.n
        );
        setOpResponse(res);
      }
    } catch (err) {
      setOpError(err.message || 'RSA operation failed.');
      setOpResponse(null);
    } finally {
      setOpLoading(false);
    }
  };

  const handleSwapToDecrypt = () => {
    if (opResponse && opResponse.ciphertext) {
      setMessage(opResponse.ciphertext);
      setMode('decrypt');
      setOpResponse(null);
      setOpError(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-950/70 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-extrabold text-white">RSA Cryptosystem</h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-500/30 font-mono">
                  Asymmetric Public-Key
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Prime Factorization • Euler's Totient • Extended Euclidean Algorithm • Square-and-Multiply
              </p>
            </div>
          </div>
        </div>

        {/* Academic Notice Banner */}
        <div className="px-3.5 py-1.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-xs text-indigo-200 font-mono flex items-center space-x-2 self-start sm:self-auto">
          <Shield className="w-4 h-4 text-indigo-400 flex-shrink-0" />
          <span>Educational parameters used for visual clarity</span>
        </div>
      </div>

      {/* Section 1: Interactive Key Generation */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Key className="w-4 h-4 text-cyan-400" />
              <span>Step 1: RSA Key Generation</span>
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Choose two distinct primes p and q to derive modulus n, φ(n), and exponents (e, d).
            </p>
          </div>

          {/* Prime Presets */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-slate-400 flex items-center mr-1">
              <Sparkles className="w-3 h-3 text-cyan-400 mr-1" />
              Presets:
            </span>
            {PRIME_PRESETS.map((pst, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplyPreset(pst)}
                className="text-[11px] px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all font-mono"
              >
                {pst.label}
              </button>
            ))}
          </div>
        </div>

        {/* Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <InputPanel
            label="First Prime (p)"
            type="number"
            value={p}
            onChange={(val) => setP(parseInt(val, 10) || '')}
            placeholder="e.g. 61"
            hint="Must be prime"
          />
          <InputPanel
            label="Second Prime (q)"
            type="number"
            value={q}
            onChange={(val) => setQ(parseInt(val, 10) || '')}
            placeholder="e.g. 53"
            hint="Must be prime and p != q"
          />
          <InputPanel
            label="Public Exponent (e)"
            type="number"
            value={chosenE}
            onChange={(val) => setChosenE(parseInt(val, 10) || '')}
            placeholder="e.g. 17"
            hint="Must be coprime to φ(n)"
          />
        </div>

        {/* Generate Button & Error */}
        <div className="flex items-center space-x-4">
          <button
            type="button"
            onClick={() => handleGenerateKeys()}
            disabled={keyGenLoading}
            className="flex items-center space-x-2 py-2 px-5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-950 transition-all disabled:opacity-50"
          >
            {keyGenLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Key className="w-4 h-4" />
            )}
            <span>Generate Key Pair</span>
          </button>

          {keyGenError && (
            <div className="text-rose-400 text-xs flex items-center space-x-1.5 font-medium">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{keyGenError}</span>
            </div>
          )}
        </div>

        {/* Generated Keys Display Box */}
        {keyGenData && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-slate-800">
            {/* Modulus n */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                Modulus (n = p × q)
              </span>
              <div className="text-xl font-bold font-mono text-white">
                {keyGenData.n}
              </div>
              <span className="text-[11px] text-slate-500 font-mono">
                {keyGenData.p} × {keyGenData.q}
              </span>
            </div>

            {/* Euler's Totient phi(n) */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                Euler's Totient φ(n)
              </span>
              <div className="text-xl font-bold font-mono text-cyan-300">
                {keyGenData.phi_n}
              </div>
              <span className="text-[11px] text-slate-500 font-mono">
                ({keyGenData.p} - 1) × ({keyGenData.q} - 1)
              </span>
            </div>

            {/* Public Key (e, n) */}
            <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-emerald-400 uppercase font-bold block">
                  Public Key (e, n)
                </span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-900/80 text-emerald-300 uppercase font-mono">
                  Shareable
                </span>
              </div>
              <div className="text-lg font-bold font-mono text-emerald-300">
                ({keyGenData.public_key.e}, {keyGenData.public_key.n})
              </div>
              <span className="text-[11px] text-emerald-500 font-mono">
                Used for encryption
              </span>
            </div>

            {/* Private Key (d, n) */}
            <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-rose-400 uppercase font-bold block">
                  Private Key (d, n)
                </span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-900/80 text-rose-300 uppercase font-mono">
                  Keep Secret
                </span>
              </div>
              <div className="text-lg font-bold font-mono text-rose-300">
                ({keyGenData.private_key.d}, {keyGenData.private_key.n})
              </div>
              <span className="text-[11px] text-rose-500 font-mono">
                Used for decryption
              </span>
            </div>
          </div>
        )}

        {/* Derivation Steps Accordion/List */}
        {keyGenData && keyGenData.derivation_steps && (
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
            <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
              <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
              <span>Mathematical Derivation Trace</span>
            </h5>
            <div className="space-y-1 font-mono text-xs text-slate-300 pl-2 border-l border-slate-700">
              {keyGenData.derivation_steps.map((st, i) => (
                <div key={i} className="py-0.5">
                  {st}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Section 2: Encryption & Decryption Execution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Col: Operation Form (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <form onSubmit={handleExecuteOperation} className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Step 2: Message Operation
              </h3>
              
              {/* Type Switcher: Number vs Text */}
              <div className="flex items-center bg-slate-900 p-0.5 rounded-lg border border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setMessageType('number');
                    setMessage('65');
                    setOpResponse(null);
                  }}
                  className={`flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-mono transition-all ${
                    messageType === 'number'
                      ? 'bg-slate-700 text-white font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Hash className="w-3 h-3" />
                  <span>Number</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMessageType('text');
                    setMessage('CNS');
                    setOpResponse(null);
                  }}
                  className={`flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-mono transition-all ${
                    messageType === 'text'
                      ? 'bg-slate-700 text-white font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Type className="w-3 h-3" />
                  <span>Text</span>
                </button>
              </div>
            </div>

            {/* Mode Switcher */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-900 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setMode('encrypt');
                  setOpResponse(null);
                }}
                className={`flex items-center justify-center space-x-2 py-2 rounded-lg text-xs font-semibold transition-all ${
                  mode === 'encrypt'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Encrypt (Public Key)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('decrypt');
                  setOpResponse(null);
                }}
                className={`flex items-center justify-center space-x-2 py-2 rounded-lg text-xs font-semibold transition-all ${
                  mode === 'decrypt'
                    ? 'bg-rose-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Unlock className="w-3.5 h-3.5" />
                <span>Decrypt (Private Key)</span>
              </button>
            </div>

            {/* Message Input */}
            <InputPanel
              label={mode === 'encrypt' ? 'Input Message (M)' : 'Ciphertext to Decrypt (C)'}
              value={message}
              onChange={setMessage}
              placeholder={
                mode === 'encrypt'
                  ? messageType === 'number' ? 'e.g. 65' : 'e.g. CNS'
                  : messageType === 'number' ? 'e.g. 2790' : 'e.g. 2790, 1420, 890'
              }
              hint={
                mode === 'encrypt'
                  ? messageType === 'number'
                    ? `Must be integer M < n (${keyGenData ? keyGenData.n : 'modulus'})`
                    : `ASCII characters where each char value < n (${keyGenData ? keyGenData.n : 'modulus'})`
                  : 'Ciphertext integer or comma-separated integers'
              }
            />

            {/* Error banner */}
            {opError && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{opError}</span>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex items-center space-x-3 pt-2">
              <button
                type="submit"
                disabled={opLoading}
                className={`flex-1 flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl text-sm font-bold text-white shadow-lg transition-all ${
                  mode === 'encrypt'
                    ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-950'
                    : 'bg-rose-600 hover:bg-rose-500 shadow-rose-950'
                } disabled:opacity-50`}
              >
                {opLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : mode === 'encrypt' ? (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Run RSA Encryption (C = M^e mod n)</span>
                  </>
                ) : (
                  <>
                    <Unlock className="w-4 h-4" />
                    <span>Run RSA Decryption (M = C^d mod n)</span>
                  </>
                )}
              </button>

              {opResponse && mode === 'encrypt' && (
                <button
                  type="button"
                  onClick={handleSwapToDecrypt}
                  title="Feed generated ciphertext to decryption"
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Right Col: Output & Mathematical Steps (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <OutputPanel
            label={mode === 'encrypt' ? 'Generated RSA Ciphertext (C)' : 'Decrypted Original Message (M)'}
            value={opResponse ? (mode === 'encrypt' ? opResponse.ciphertext : opResponse.decrypted_message) : ''}
            mode={mode === 'encrypt' ? 'ciphertext' : 'plaintext'}
            extraInfo={
              opResponse ? (
                <>
                  <span>Formula: <strong className="text-cyan-300">{opResponse.formula}</strong></span>
                  <span>Total Blocks: <strong className="text-white">{opResponse.blocks.length}</strong></span>
                </>
              ) : null
            }
          />

          {/* Block-by-Block Modular Exponentiation Viewer */}
          {opResponse && opResponse.blocks && (
            <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <BookOpen className="w-4 h-4 text-cyan-400" />
                  <h4 className="text-sm font-bold text-white">
                    Modular Exponentiation Trace (Square-and-Multiply)
                  </h4>
                </div>
                <span className="text-xs font-mono text-slate-400">
                  {opResponse.blocks.length} block(s)
                </span>
              </div>

              <div className="space-y-4">
                {opResponse.blocks.map((b, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between font-mono text-xs">
                      <span className="text-cyan-400 font-bold">
                        Block #{b.block_index} {b.m_raw ? `(Char: '${b.m_raw}')` : ''}
                      </span>
                      <span className="text-white bg-slate-800 px-2 py-0.5 rounded font-bold">
                        {b.formula}
                      </span>
                    </div>

                    {/* Top Square-and-Multiply steps */}
                    {b.trace && b.trace.length > 0 && (
                      <div className="pt-2 border-t border-slate-800/80">
                        <span className="text-[10px] text-slate-500 uppercase font-mono block mb-1">
                          Binary Square-and-Multiply Intermediate Steps:
                        </span>
                        <div className="space-y-1 font-mono text-[11px] text-slate-400 pl-2 border-l border-slate-800">
                          {b.trace.slice(0, 6).map((step, sIdx) => (
                            <div key={sIdx} className="flex items-center space-x-2">
                              <span className="text-slate-600">Step {step.step} (bit {step.bit}):</span>
                              <span>{step.square_result}</span>
                              {step.multiply_result && (
                                <span className="text-emerald-400">→ {step.multiply_result}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
