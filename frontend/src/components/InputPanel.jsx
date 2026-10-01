import React from 'react';
import { HelpCircle, Sparkles } from 'lucide-react';

export default function InputPanel({
  label,
  value,
  onChange,
  placeholder,
  hint,
  type = 'text',
  rows = 3,
  presets = [],
  onSelectPreset,
  error,
  badge,
  disabled = false,
}) {
  return (
    <div className="space-y-1.5">
      {/* Label & Header Controls */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
          <span>{label}</span>
          {badge && (
            <span className="text-[10px] lowercase px-1.5 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700 font-mono">
              {badge}
            </span>
          )}
        </label>
        
        {/* Presets if available */}
        {presets.length > 0 && onSelectPreset && (
          <div className="flex items-center space-x-1.5">
            <span className="text-[11px] text-slate-400 flex items-center mr-1">
              <Sparkles className="w-3 h-3 text-cyan-400 mr-1" />
              Presets:
            </span>
            {presets.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onSelectPreset(preset.value)}
                className="text-[11px] px-2 py-0.5 rounded bg-slate-800/80 hover:bg-cyan-950 text-slate-300 hover:text-cyan-300 border border-slate-700/80 hover:border-cyan-500/50 transition-all font-mono"
              >
                {preset.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Input or Textarea */}
      {type === 'textarea' ? (
        <textarea
          rows={rows}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border font-mono text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition-all ${
            error
              ? 'border-rose-500/80 focus:border-rose-500 focus:ring-1 focus:ring-rose-500/50'
              : 'border-slate-700/80 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/40'
          }`}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border font-mono text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition-all ${
            error
              ? 'border-rose-500/80 focus:border-rose-500 focus:ring-1 focus:ring-rose-500/50'
              : 'border-slate-700/80 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/40'
          }`}
        />
      )}

      {/* Helper text or Error message */}
      <div className="flex items-center justify-between text-xs">
        {error ? (
          <p className="text-rose-400 font-medium">{error}</p>
        ) : hint ? (
          <p className="text-slate-400 flex items-center space-x-1">
            <HelpCircle className="w-3 h-3 text-slate-500" />
            <span>{hint}</span>
          </p>
        ) : <span />}

        {value !== undefined && (
          <span className="text-[11px] text-slate-500 font-mono">
            {value.length} {type === 'textarea' || type === 'text' ? 'chars' : ''}
          </span>
        )}
      </div>
    </div>
  );
}
