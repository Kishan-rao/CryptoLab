import React, { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Shield, Key, Lock, Cpu, Activity, AlertTriangle } from 'lucide-react';
import api from '../services/api';

export default function Navbar() {
  const [backendStatus, setBackendStatus] = useState('checking');

  useEffect(() => {
    const ping = async () => {
      try {
        await api.checkHealth();
        setBackendStatus('online');
      } catch {
        setBackendStatus('offline');
      }
    };
    ping();
    const interval = setInterval(ping, 15000);
    return () => clearInterval(interval);
  }, []);

  const navLinks = [
    { to: '/', label: 'Overview', icon: Shield, exact: true },
    { to: '/vigenere', label: 'Vigenère Cipher', icon: Key, badge: 'Classical' },
    { to: '/aes', label: 'AES-128', icon: Cpu, badge: 'Symmetric' },
    { to: '/rsa', label: 'RSA', icon: Lock, badge: 'Asymmetric' },
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-[#0b0f19]/80 border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Lab Branding */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-300">
                  CryptoLab
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700/60 font-mono">
                  CNS
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Algorithm Visualizer & Demonstrator
              </p>
            </div>
          </Link>

          {/* Navigation Items */}
          <nav className="flex items-center space-x-1 sm:space-x-2">
            {navLinks.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.exact}
                  className={({ isActive }) =>
                    `flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-slate-800/90 text-cyan-400 shadow-sm border border-cyan-500/30'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden md:inline">{item.label}</span>
                  {item.badge && (
                    <span className="hidden xl:inline text-[10px] px-1.5 py-0.2 rounded bg-slate-700/60 text-slate-300 font-mono">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Backend Status Indicator */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-mono">
              <span
                className={`w-2 h-2 rounded-full ${
                  backendStatus === 'online'
                    ? 'bg-emerald-400 animate-pulse'
                    : backendStatus === 'offline'
                    ? 'bg-rose-500'
                    : 'bg-amber-400'
                }`}
              />
              <span className="text-slate-400 hidden sm:inline">
                API {backendStatus === 'online' ? 'Online' : backendStatus === 'offline' ? 'Offline' : 'Connecting'}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Top Banner Notice: Educational Disclaimer */}
      <div className="bg-gradient-to-r from-indigo-950/60 via-slate-900/60 to-cyan-950/60 border-t border-b border-indigo-900/30 py-1 px-4 text-center text-[11px] text-slate-400 flex items-center justify-center space-x-2">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
        <span>
          Academic Educational Visualizer (CNS Assignment). Built from scratch without black-box crypto libraries. Not intended for production cryptographic security.
        </span>
      </div>
    </header>
  );
}
