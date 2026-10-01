import React, { useState } from 'react';
import { Copy, Check, Terminal } from 'lucide-react';
import { copyToClipboard } from '../utils/formatters';

export default function OutputPanel({
  label = 'Output Result',
  value,
  mode = 'result',
  emptyMessage = 'Run encryption or decryption to view output.',
  extraInfo,
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!value) return;
    const ok = await copyToClipboard(value);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-5 border border-slate-800">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            {label}
          </h4>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 font-mono capitalize">
            {mode}
          </span>
        </div>

        {value && (
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs transition-all"
            title="Copy to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-medium">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        )}
      </div>

      {value ? (
        <div className="space-y-3">
          <div className="bg-slate-950/90 rounded-xl p-4 border border-slate-800 font-mono text-sm sm:text-base text-cyan-300 break-all select-all shadow-inner">
            {value}
          </div>
          {extraInfo && (
            <div className="text-xs text-slate-400 font-mono flex items-center justify-between pt-1">
              {extraInfo}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-slate-950/40 rounded-xl p-8 border border-dashed border-slate-800 text-center text-slate-500 text-sm">
          {emptyMessage}
        </div>
      )}
    </div>
  );
}
