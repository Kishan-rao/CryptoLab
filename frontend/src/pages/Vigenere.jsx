import React, { useState } from 'react';
import { Key, Lock, Unlock, RefreshCw, AlertCircle, Info, BookOpen } from 'lucide-react';
import InputPanel from '../components/InputPanel';
import OutputPanel from '../components/OutputPanel';
import StepViewer from '../components/StepViewer';
import api from '../services/api';

export default function Vigenere() {
  const [inputText, setInputText] = useState('ATTACK AT DAWN');
  const [key, setKey] = useState('LEMON');
  const [mode, setMode] = useState('encrypt'); // 'encrypt' or 'decrypt'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [response, setResponse] = useState(null);

  // Sample presets for quick testing
  const presets = [
    { label: 'Attack at Dawn', text: 'ATTACK AT DAWN', key: 'LEMON' },
    { label: 'Hello CNS Lab', text: 'HELLO CNS LAB', key: 'CRYPTO' },
    { label: 'Geeks Example', text: 'GEEKSFORGEEKS', key: 'AYUSH' },
  ];

  const handleApplyPreset = (preset) => {
    setInputText(preset.text);
    setKey(preset.key);
    setError(null);
    setResponse(null);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'encrypt') {
        const res = await api.vigenereEncrypt(inputText, key);
        setResponse(res);
      } else {
        const res = await api.vigenereDecrypt(inputText, key);
        setResponse(res);
      }
    } catch (err) {
      setError(err.message || 'An error occurred during Vigenère execution.');
      setResponse(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSwap = () => {
    if (response && response.result) {
      setInputText(response.result);
      setMode(mode === 'encrypt' ? 'decrypt' : 'encrypt');
      setResponse(null);
      setError(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-950/70 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white">Vigenère Cipher</h1>
              <p className="text-xs text-slate-400 font-mono">
                Classical Polyalphabetic Substitution Cipher • Z26 Modular Arithmetic
              </p>
            </div>
          </div>
        </div>

        {/* Mode Switcher */}
        <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => {
              setMode('encrypt');
              setResponse(null);
            }}
            className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mode === 'encrypt'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Encrypt Mode</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('decrypt');
              setResponse(null);
            }}
            className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mode === 'decrypt'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Unlock className="w-3.5 h-3.5" />
            <span>Decrypt Mode</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Form Inputs & Outputs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Input Form (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <form onSubmit={handleSubmit} className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                <span>Operation Parameters</span>
              </h3>
              
              {/* Presets dropdown/buttons */}
              <div className="flex items-center space-x-1">
                {presets.map((p, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleApplyPreset(p)}
                    className="text-[10px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono"
                  >
                    {p.label.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Text Input */}
            <InputPanel
              label={mode === 'encrypt' ? 'Plaintext (P)' : 'Ciphertext (C)'}
              value={inputText}
              onChange={setInputText}
              placeholder={mode === 'encrypt' ? 'Enter plaintext message...' : 'Enter ciphertext to decrypt...'}
              type="textarea"
              rows={3}
              hint="Letters (A-Z) will be shifted; spaces and punctuation are preserved."
            />

            {/* Key Input */}
            <InputPanel
              label="Secret Key (K)"
              value={key}
              onChange={setKey}
              placeholder="e.g. LEMON"
              hint="Alphabetic only (A-Z). Automatically cyclically repeated."
              badge="Repeated"
            />

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex items-center space-x-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl text-sm font-bold text-white shadow-lg transition-all ${
                  mode === 'encrypt'
                    ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-950'
                    : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-950'
                } disabled:opacity-50`}
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : mode === 'encrypt' ? (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Run Vigenère Encryption</span>
                  </>
                ) : (
                  <>
                    <Unlock className="w-4 h-4" />
                    <span>Run Vigenère Decryption</span>
                  </>
                )}
              </button>

              {response && (
                <button
                  type="button"
                  onClick={handleSwap}
                  title="Use result as input for opposite operation"
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              )}
            </div>
          </form>

          {/* Mathematical Foundations Card */}
          <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-3">
            <div className="flex items-center space-x-2 text-cyan-400">
              <BookOpen className="w-4 h-4" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Mathematical Definition
              </h4>
            </div>
            <div className="bg-slate-950 rounded-xl p-3 border border-slate-800 font-mono text-xs space-y-2 text-slate-300">
              <div>
                <span className="text-slate-500 block text-[10px]">Alphabet Indexing:</span>
                A = 0, B = 1, C = 2, ..., Z = 25
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Encryption Formula:</span>
                <span className="text-emerald-400 font-bold">C_i = (P_i + K_i) mod 26</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Decryption Formula:</span>
                <span className="text-indigo-400 font-bold">P_i = (C_i - K_i + 26) mod 26</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Output & Intermediate Tracing (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Result Panel */}
          <OutputPanel
            label={mode === 'encrypt' ? 'Generated Ciphertext' : 'Decrypted Plaintext'}
            value={response ? response.result : ''}
            mode={mode === 'encrypt' ? 'ciphertext' : 'plaintext'}
            extraInfo={
              response ? (
                <>
                  <span>Normalized Key: <strong className="text-white">{response.key}</strong></span>
                  <span>Total Calculated Chars: <strong className="text-white">{response.steps.filter(s => s.plaintext_value >= 0 || s.ciphertext_value >= 0).length}</strong></span>
                </>
              ) : null
            }
          />

          {/* Step-by-Step Character Trace */}
          {response && response.steps && (
            <StepViewer
              steps={response.steps}
              mode={mode}
              title={`Step-by-Step Vigenère ${mode === 'encrypt' ? 'Encryption' : 'Decryption'} Calculation`}
              formula={response.formula}
            />
          )}
        </div>
      </div>
    </div>
  );
}
