import React, { useState } from 'react';
import { Grid, Eye } from 'lucide-react';

export default function StateMatrix({
  matrix = [],
  title = 'State Matrix (4×4)',
  subtitle = 'Column-major byte array (128 bits)',
  highlightCells = null, // Set or callback: (r, c) => boolean
  colorTheme = 'cyan', // 'cyan', 'indigo', 'emerald', 'amber'
}) {
  const [hoveredCell, setHoveredCell] = useState(null);

  if (!matrix || matrix.length !== 4) {
    return (
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-500 text-xs font-mono text-center">
        No state matrix available
      </div>
    );
  }

  // Theme palettes for visual variety
  const themeClasses = {
    cyan: 'border-cyan-500/30 text-cyan-300 bg-cyan-950/20 hover:bg-cyan-900/40 hover:border-cyan-400',
    indigo: 'border-indigo-500/30 text-indigo-300 bg-indigo-950/20 hover:bg-indigo-900/40 hover:border-indigo-400',
    emerald: 'border-emerald-500/30 text-emerald-300 bg-emerald-950/20 hover:bg-emerald-900/40 hover:border-emerald-400',
    amber: 'border-amber-500/30 text-amber-300 bg-amber-950/20 hover:bg-amber-900/40 hover:border-amber-400',
  };

  const activeTheme = themeClasses[colorTheme] || themeClasses.cyan;

  return (
    <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-slate-800 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Grid className="w-4 h-4 text-cyan-400" />
          <h5 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
            {title}
          </h5>
        </div>
        <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">
          {subtitle}
        </span>
      </div>

      {/* 4x4 Grid with Column & Row Headers */}
      <div className="inline-block p-3 rounded-xl bg-slate-950/80 border border-slate-800">
        <div className="grid grid-cols-5 gap-1.5 font-mono text-center">
          {/* Header Row (Empty corner + Col 0..3) */}
          <div className="text-[10px] text-slate-600 flex items-center justify-center font-bold">r\c</div>
          {[0, 1, 2, 3].map((colIdx) => (
            <div key={colIdx} className="text-[10px] text-slate-400 font-bold py-0.5">
              c{colIdx}
            </div>
          ))}

          {/* Matrix Rows */}
          {matrix.map((row, r) => (
            <React.Fragment key={r}>
              {/* Row Header */}
              <div className="text-[10px] text-slate-400 font-bold flex items-center justify-center">
                r{r}
              </div>

              {/* Row Cells */}
              {row.map((cellHex, c) => {
                const isHovered = hoveredCell && hoveredCell.r === r && hoveredCell.c === c;
                const isCustomHighlighted = highlightCells ? highlightCells(r, c) : false;
                
                return (
                  <button
                    key={`${r}-${c}`}
                    type="button"
                    onMouseEnter={() => setHoveredCell({ r, c, hex: cellHex })}
                    onMouseLeave={() => setHoveredCell(null)}
                    onClick={() => setHoveredCell({ r, c, hex: cellHex })}
                    className={`w-9 h-9 sm:w-11 sm:h-11 rounded-lg border font-mono text-xs sm:text-sm font-bold flex items-center justify-center transition-all ${
                      isCustomHighlighted
                        ? 'border-amber-400 bg-amber-950/60 text-amber-200 ring-1 ring-amber-400/50'
                        : isHovered
                        ? 'ring-2 ring-cyan-400 scale-105 z-10 ' + activeTheme
                        : activeTheme
                    }`}
                  >
                    {String(cellHex).toUpperCase()}
                  </button>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Byte Inspection Bar */}
      <div className="h-8 flex items-center px-3 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px] font-mono text-slate-300">
        {hoveredCell ? (
          <div className="flex items-center space-x-3 w-full justify-between">
            <span className="flex items-center space-x-1.5">
              <Eye className="w-3.5 h-3.5 text-cyan-400" />
              <span>Cell [{hoveredCell.r}, {hoveredCell.c}]:</span>
              <span className="text-cyan-300 font-bold">0x{hoveredCell.hex.toUpperCase()}</span>
            </span>
            <span className="text-slate-400">
              Dec: <span className="text-white font-semibold">{parseInt(hoveredCell.hex, 16)}</span>
            </span>
            <span className="text-slate-400 hidden sm:inline">
              Bin: <span className="text-white font-semibold">{parseInt(hoveredCell.hex, 16).toString(2).padStart(8, '0')}</span>
            </span>
          </div>
        ) : (
          <span className="text-slate-500 italic">
            Hover over any byte cell to inspect its decimal & binary representation
          </span>
        )}
      </div>
    </div>
  );
}
