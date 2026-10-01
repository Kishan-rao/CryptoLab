import React, { useState } from 'react';
import { Table, Search, ChevronRight } from 'lucide-react';

export default function StepViewer({
  steps = [],
  mode = 'encrypt',
  title = 'Character Calculation Trace',
  formula = 'C = (P + K) mod 26',
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStep, setSelectedStep] = useState(null);

  if (!steps || steps.length === 0) {
    return null;
  }

  const isEncrypt = mode === 'encrypt';

  const filteredSteps = steps.filter((s) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const pChar = (s.plaintext_char || '').toLowerCase();
    const cChar = (s.ciphertext_char || '').toLowerCase();
    const kChar = (s.key_char || '').toLowerCase();
    const calc = (s.calculation || '').toLowerCase();
    return pChar.includes(term) || cChar.includes(term) || kChar.includes(term) || calc.includes(term);
  });

  return (
    <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <Table className="w-4 h-4 text-cyan-400" />
            <h4 className="text-base font-bold text-white">{title}</h4>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
              {steps.length} {steps.length === 1 ? 'step' : 'steps'}
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Formula: <span className="text-cyan-300 font-semibold">{formula}</span>
          </p>
        </div>

        {/* Filter Input */}
        {steps.length > 5 && (
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search steps..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>
        )}
      </div>

      {/* Selected Step Spotlight Banner */}
      {selectedStep && (
        <div className="p-3.5 rounded-xl bg-gradient-to-r from-cyan-950/40 via-slate-900 to-indigo-950/40 border border-cyan-500/30 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center space-x-3">
            <span className="text-cyan-400 font-bold">Step #{selectedStep.position}:</span>
            <span className="text-slate-300">
              Input <span className="text-white font-bold bg-slate-800 px-1.5 py-0.5 rounded">'{selectedStep.plaintext_char || selectedStep.ciphertext_char}'</span>
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-slate-300">
              Key <span className="text-amber-300 font-bold bg-slate-800 px-1.5 py-0.5 rounded">'{selectedStep.key_char}'</span>
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-cyan-300 font-semibold">{selectedStep.calculation}</span>
          </div>
          <button
            onClick={() => setSelectedStep(null)}
            className="text-[11px] text-slate-400 hover:text-white underline ml-2"
          >
            Clear
          </button>
        </div>
      )}

      {/* Responsive Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/70">
        <table className="w-full text-left border-collapse text-xs font-mono">
          <thead>
            <tr className="bg-slate-900/90 text-slate-400 border-b border-slate-800">
              <th className="py-2.5 px-3 font-semibold">#</th>
              <th className="py-2.5 px-3 font-semibold">
                {isEncrypt ? 'Plaintext (P)' : 'Ciphertext (C)'}
              </th>
              <th className="py-2.5 px-3 font-semibold">Value</th>
              <th className="py-2.5 px-3 font-semibold">Key (K)</th>
              <th className="py-2.5 px-3 font-semibold">Key Val</th>
              <th className="py-2.5 px-3 font-semibold">Modular Calculation</th>
              <th className="py-2.5 px-3 font-semibold">Result Val</th>
              <th className="py-2.5 px-3 font-semibold">
                {isEncrypt ? 'Ciphertext (C)' : 'Plaintext (P)'}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredSteps.map((step, idx) => {
              const isSelected = selectedStep && selectedStep.position === step.position;
              return (
                <tr
                  key={idx}
                  onClick={() => setSelectedStep(step)}
                  className={`cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-cyan-950/40 text-cyan-200'
                      : 'hover:bg-slate-800/50 text-slate-300'
                  }`}
                >
                  <td className="py-2 px-3 text-slate-500">{step.position}</td>
                  
                  {/* Input Char */}
                  <td className="py-2 px-3">
                    <span className="px-1.5 py-0.5 rounded bg-slate-800 text-white font-bold">
                      {isEncrypt ? step.plaintext_char : step.ciphertext_char}
                    </span>
                  </td>

                  {/* Input Value */}
                  <td className="py-2 px-3 text-slate-400">
                    {isEncrypt
                      ? step.plaintext_value >= 0 ? step.plaintext_value : '—'
                      : step.ciphertext_value >= 0 ? step.ciphertext_value : '—'}
                  </td>

                  {/* Key Char */}
                  <td className="py-2 px-3">
                    {step.key_char !== '-' ? (
                      <span className="px-1.5 py-0.5 rounded bg-amber-950/60 border border-amber-600/30 text-amber-300 font-bold">
                        {step.key_char}
                      </span>
                    ) : (
                      <span className="text-slate-600">—</span>
                    )}
                  </td>

                  {/* Key Value */}
                  <td className="py-2 px-3 text-slate-400">
                    {step.key_value >= 0 ? step.key_value : '—'}
                  </td>

                  {/* Calculation string */}
                  <td className="py-2 px-3 text-cyan-300">
                    {step.calculation}
                  </td>

                  {/* Result Value */}
                  <td className="py-2 px-3 text-slate-400">
                    {isEncrypt
                      ? step.ciphertext_value >= 0 ? step.ciphertext_value : '—'
                      : step.plaintext_value >= 0 ? step.plaintext_value : '—'}
                  </td>

                  {/* Result Char */}
                  <td className="py-2 px-3">
                    <span className="px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 font-bold">
                      {isEncrypt ? step.ciphertext_char : step.plaintext_char}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
