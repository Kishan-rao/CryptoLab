import React, { useState } from 'react';
import { Cpu, Lock, Unlock, RefreshCw, AlertCircle, KeyRound, Sparkles, ChevronLeft, ChevronRight, Layers, Info } from 'lucide-react';
import InputPanel from '../components/InputPanel';
import OutputPanel from '../components/OutputPanel';
import StateMatrix from '../components/StateMatrix';
import api from '../services/api';
import { formatHexWithSpaces, isValidHex, cleanHex } from '../utils/formatters';

const NIST_KAT = {
  key: '000102030405060708090a0b0c0d0e0f',
  plaintext: '00112233445566778899aabbccddeeff',
  ciphertext: '69c4e0d86a7b0430d8cdb78070b4c55a',
};

export default function AES() {
  const [plaintextHex, setPlaintextHex] = useState(NIST_KAT.plaintext);
  const [keyHex, setKeyHex] = useState(NIST_KAT.key);
  const [mode, setMode] = useState('encrypt');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [response, setResponse] = useState(null);

  // Stepper state
  const [activeRoundIdx, setActiveRoundIdx] = useState(0);
  const [activeOpIdx, setActiveOpIdx] = useState(0);
  const [showKeySchedule, setShowKeySchedule] = useState(false);

  const handleLoadNistVector = () => {
    setPlaintextHex(NIST_KAT.plaintext);
    setKeyHex(NIST_KAT.key);
    setError(null);
    setResponse(null);
  };

  const handleSwap = () => {
    if (response) {
      const resultHex = mode === 'encrypt' ? response.ciphertext_hex : response.plaintext_hex;
      setPlaintextHex(resultHex);
      setMode(mode === 'encrypt' ? 'decrypt' : 'encrypt');
      setResponse(null);
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setError(null);

    const cleanPt = cleanHex(plaintextHex);
    const cleanK = cleanHex(keyHex);

    if (cleanPt.length !== 32) {
      setError(`Plaintext/Input must be exactly 32 hex characters (128 bits), received ${cleanPt.length}.`);
      return;
    }
    if (cleanK.length !== 32) {
      setError(`Cipher Key must be exactly 32 hex characters (128 bits), received ${cleanK.length}.`);
      return;
    }

    setLoading(true);
    try {
      if (mode === 'encrypt') {
        const res = await api.aesEncrypt(cleanPt, cleanK);
        setResponse(res);
        setActiveRoundIdx(0);
        setActiveOpIdx(0);
      } else {
        const res = await api.aesDecrypt(cleanPt, cleanK);
        setResponse(res);
        setActiveRoundIdx(0);
        setActiveOpIdx(0);
      }
    } catch (err) {
      setError(err.message || 'AES execution encountered an error.');
      setResponse(null);
    } finally {
      setLoading(false);
    }
  };

  const activeRound = response?.rounds?.[activeRoundIdx];
  const activeOp = activeRound?.operations?.[activeOpIdx] || activeRound?.operations?.[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-cyan-950/70 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-extrabold text-white">AES-128 Visualizer</h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/30 font-mono">
                  FIPS-197 Standard
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                128-bit Block Size • 128-bit Key • 10 Rounds • 4×4 State Transformations
              </p>
            </div>
          </div>
        </div>

        {/* Controls Header: NIST Preset & Mode toggle */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleLoadNistVector}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 text-xs font-mono transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Load NIST Test Vector</span>
          </button>

          <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => {
                setMode('encrypt');
                setResponse(null);
              }}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                mode === 'encrypt'
                  ? 'bg-cyan-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Encrypt</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('decrypt');
                setResponse(null);
              }}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                mode === 'decrypt'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Unlock className="w-3.5 h-3.5" />
              <span>Decrypt</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form: Inputs (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <form onSubmit={handleSubmit} className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Block & Key Input (Hex)
              </h3>
              <span className="text-[11px] text-slate-500 font-mono">16 bytes / 32 hex chars</span>
            </div>

            {/* Plaintext / Ciphertext input */}
            <InputPanel
              label={mode === 'encrypt' ? 'Plaintext Block (128-bit Hex)' : 'Ciphertext Block (128-bit Hex)'}
              value={plaintextHex}
              onChange={setPlaintextHex}
              placeholder="00112233445566778899aabbccddeeff"
              hint="Exactly 32 hex digits (0-9, a-f)."
              badge="128-bit"
            />

            {/* Key input */}
            <InputPanel
              label="Cipher Key (128-bit Hex)"
              value={keyHex}
              onChange={setKeyHex}
              placeholder="000102030405060708090a0b0c0d0e0f"
              hint="Exactly 32 hex digits (0-9, a-f)."
              badge="128-bit"
            />

            {/* Error banner */}
            {error && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit & Swap buttons */}
            <div className="flex items-center space-x-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl text-sm font-bold text-white shadow-lg transition-all ${
                  mode === 'encrypt'
                    ? 'bg-cyan-600 hover:bg-cyan-500 shadow-cyan-950'
                    : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-950'
                } disabled:opacity-50`}
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : mode === 'encrypt' ? (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Run AES-128 Encryption</span>
                  </>
                ) : (
                  <>
                    <Unlock className="w-4 h-4" />
                    <span>Run AES-128 Decryption</span>
                  </>
                )}
              </button>

              {response && (
                <button
                  type="button"
                  onClick={handleSwap}
                  title="Feed output block into opposite operation"
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              )}
            </div>
          </form>

          {/* Key Schedule Inspector Toggle */}
          {response && response.key_schedule && (
            <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-cyan-400">
                  <KeyRound className="w-4 h-4" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                    Key Schedule (11 Round Keys)
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setShowKeySchedule(!showKeySchedule)}
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-mono underline"
                >
                  {showKeySchedule ? 'Hide' : 'Inspect'}
                </button>
              </div>

              {showKeySchedule && (
                <div className="space-y-1.5 pt-2 max-h-64 overflow-y-auto pr-1">
                  {response.key_schedule.map((rk, idx) => (
                    <div
                      key={idx}
                      className={`p-2 rounded-lg border text-xs font-mono flex items-center justify-between ${
                        activeRoundIdx === idx
                          ? 'bg-cyan-950/60 border-cyan-500 text-cyan-200'
                          : 'bg-slate-950/80 border-slate-800 text-slate-400'
                      }`}
                    >
                      <span className="font-bold text-slate-300">Round {idx}:</span>
                      <span className="text-white font-mono">{formatHexWithSpaces(rk)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Architecture Summary Box */}
          <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-3">
            <div className="flex items-center space-x-2 text-slate-300">
              <Info className="w-4 h-4 text-cyan-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                AES-128 Structure (SPN)
              </h4>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              AES organizes 16 bytes into a 4×4 byte matrix in <strong className="text-slate-300">column-major order</strong>.
              Rounds 1–9 apply 4 distinct invertible transformations: <span className="text-cyan-300">SubBytes</span> (non-linear S-box), <span className="text-cyan-300">ShiftRows</span> (permutation), <span className="text-cyan-300">MixColumns</span> (Galois Field matrix multiplication), and <span className="text-cyan-300">AddRoundKey</span> (XOR).
            </p>
          </div>
        </div>

        {/* Right Area: Results, Stepper & 4x4 State Matrix (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Result Output Panel */}
          <OutputPanel
            label={mode === 'encrypt' ? 'Ciphertext Block (128-bit Hex)' : 'Plaintext Block (128-bit Hex)'}
            value={response ? (mode === 'encrypt' ? response.ciphertext_hex : response.plaintext_hex) : ''}
            mode={mode === 'encrypt' ? 'ciphertext' : 'plaintext'}
            extraInfo={
              response ? (
                <>
                  <span>Block Length: <strong className="text-white">16 bytes / 128 bits</strong></span>
                  {response.ciphertext_hex === NIST_KAT.ciphertext && (
                    <span className="text-emerald-400 font-bold flex items-center space-x-1">
                      <span>✓ Official NIST KAT Match</span>
                    </span>
                  )}
                </>
              ) : null
            }
          />

          {/* Interactive Round & Operation Stepper */}
          {response && (
            <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-6">
              {/* Stepper Header: Round Selector Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Layers className="w-4 h-4 text-cyan-400" />
                    <h4 className="text-sm font-bold text-white">
                      Execution Stepper: {activeRound?.round_type} (Round {activeRoundIdx} of 10)
                    </h4>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      type="button"
                      disabled={activeRoundIdx === 0}
                      onClick={() => {
                        setActiveRoundIdx((prev) => Math.max(0, prev - 1));
                        setActiveOpIdx(0);
                      }}
                      className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      disabled={activeRoundIdx === response.rounds.length - 1}
                      onClick={() => {
                        setActiveRoundIdx((prev) => Math.min(response.rounds.length - 1, prev + 1));
                        setActiveOpIdx(0);
                      }}
                      className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Round Number Pills */}
                <div className="flex items-center space-x-1 overflow-x-auto py-1">
                  {response.rounds.map((r, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setActiveRoundIdx(idx);
                        setActiveOpIdx(0);
                      }}
                      className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-all flex-shrink-0 ${
                        activeRoundIdx === idx
                          ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20'
                          : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700'
                      }`}
                    >
                      R{r.round}
                    </button>
                  ))}
                </div>
              </div>

              {/* Operation Pills within Selected Round */}
              {activeRound && (
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800">
                  {activeRound.operations.map((op, opI) => (
                    <button
                      key={opI}
                      type="button"
                      onClick={() => setActiveOpIdx(opI)}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
                        activeOpIdx === opI
                          ? 'bg-slate-100 text-slate-900 shadow font-bold'
                          : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      {op.name}
                    </button>
                  ))}
                </div>
              )}

              {/* Operation Description Banner */}
              {activeOp && (
                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-mono text-cyan-300">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-white text-sm">{activeOp.name}</span>
                    <span className="text-[11px] text-slate-500">Round {activeRoundIdx}</span>
                  </div>
                  <p className="text-slate-400 text-xs">{activeOp.description}</p>
                </div>
              )}

              {/* State Matrix & Round Key Matrices */}
              {activeOp && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Current State Matrix */}
                  <StateMatrix
                    matrix={activeOp.state}
                    title={`${activeOp.name} State Matrix`}
                    subtitle="State after transformation"
                    colorTheme={activeOp.name === 'MixColumns' ? 'emerald' : activeOp.name === 'SubBytes' ? 'indigo' : 'cyan'}
                  />

                  {/* If AddRoundKey, show the Round Key Matrix alongside */}
                  {activeOp.round_key ? (
                    <StateMatrix
                      matrix={activeOp.round_key}
                      title={`Round Key ${activeRoundIdx}`}
                      subtitle={`XORed with state in Round ${activeRoundIdx}`}
                      colorTheme="amber"
                    />
                  ) : (
                    <div className="glass-panel rounded-2xl p-5 border border-slate-800 flex flex-col justify-center items-center text-center space-y-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-800/90 flex items-center justify-center text-cyan-400">
                        <Layers className="w-5 h-5" />
                      </div>
                      <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                        Transformation Inspector
                      </h5>
                      <p className="text-xs text-slate-400 max-w-xs leading-relaxed font-mono">
                        {activeOp.name === 'SubBytes' && 'Each byte s[r,c] is substituted with S_BOX[s[r,c]]. Non-linear step providing confusion.'}
                        {activeOp.name === 'ShiftRows' && 'Rows 1, 2, and 3 are cyclically shifted by 1, 2, and 3 bytes left. Linear step providing diffusion.'}
                        {activeOp.name === 'MixColumns' && 'Each 4-byte column is multiplied with fixed matrix in GF(2^8). High diffusion across all 16 bytes.'}
                        {activeOp.name === 'InvShiftRows' && 'Rows 1, 2, and 3 are cyclically shifted right by 1, 2, and 3 bytes.'}
                        {activeOp.name === 'InvSubBytes' && 'Bytes replaced using the Inverse S-box.'}
                        {activeOp.name === 'InvMixColumns' && 'Columns multiplied with inverse matrix in GF(2^8).'}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
