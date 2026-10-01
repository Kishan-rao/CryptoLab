import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

export default function AlgorithmCard({
  title,
  subtitle,
  category,
  categoryColor,
  icon: Icon,
  description,
  formula,
  features,
  linkTo,
}) {
  return (
    <div className="glass-panel rounded-2xl p-6 flex flex-col justify-between hover:border-slate-700 transition-all hover:shadow-xl hover:shadow-cyan-500/5 group">
      <div>
        {/* Header with Category Badge */}
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-center text-cyan-400 group-hover:scale-110 group-hover:border-cyan-500/40 transition-all">
            <Icon className="w-6 h-6" />
          </div>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${categoryColor}`}>
            {category}
          </span>
        </div>

        {/* Title & Subtitle */}
        <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors">
          {title}
        </h3>
        <p className="text-xs text-slate-400 font-mono mb-3">{subtitle}</p>

        {/* Description */}
        <p className="text-sm text-slate-300 mb-4 leading-relaxed">
          {description}
        </p>

        {/* Formula Box */}
        {formula && (
          <div className="bg-slate-900/90 rounded-lg p-2.5 border border-slate-800 font-mono text-xs text-cyan-300 mb-4 overflow-x-auto">
            <span className="text-slate-500 block text-[10px] uppercase font-sans mb-0.5">Core Formula</span>
            {formula}
          </div>
        )}

        {/* Key Features / Learning Points */}
        <div className="space-y-1.5 mb-6">
          {features.map((feature, idx) => (
            <div key={idx} className="flex items-center text-xs text-slate-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mr-2 flex-shrink-0" />
              <span>{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Action Button */}
      <Link
        to={linkTo}
        className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-cyan-600/90 hover:text-white text-cyan-400 border border-slate-700/80 hover:border-cyan-500/50 text-sm font-semibold transition-all group-hover:shadow-md"
      >
        <span>Explore Algorithm</span>
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </Link>
    </div>
  );
}
