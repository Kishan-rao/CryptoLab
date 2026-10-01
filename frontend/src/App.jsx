import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Vigenere from './pages/Vigenere';
import AES from './pages/AES';
import RSA from './pages/RSA';
import { Shield, ExternalLink, Code2 } from 'lucide-react';

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0b0f19] text-slate-100 font-sans">
      {/* Navigation Header */}
      <Navbar />

      {/* Main Page Content */}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/vigenere" element={<Vigenere />} />
          <Route path="/aes" element={<AES />} />
          <Route path="/rsa" element={<RSA />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/90 py-8 px-4 sm:px-6 lg:px-8 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="space-y-1">
            <div className="flex items-center justify-center sm:justify-start space-x-2">
              <Shield className="w-4 h-4 text-cyan-400" />
              <span className="font-bold text-white">Cryptography Algorithm Visualizer & Demonstrator</span>
              <span className="px-1.5 py-0.2 rounded bg-slate-800 text-[10px] text-cyan-400 font-mono">CNS Lab</span>
            </div>
            <p className="text-slate-500 text-[11px]">
              Built with React, Vite, Tailwind CSS, Python 3, FastAPI, and Pytest.
            </p>
          </div>

          <div className="flex items-center space-x-6 text-[11px] font-mono">
            <Link to="/vigenere" className="hover:text-cyan-400 transition-colors">Vigenère</Link>
            <Link to="/aes" className="hover:text-cyan-400 transition-colors">AES-128</Link>
            <Link to="/rsa" className="hover:text-cyan-400 transition-colors">RSA</Link>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-6 pt-4 border-t border-slate-900 text-center text-[10px] text-slate-600">
          Academic educational demonstrator for Cryptography and Network Security. Zero external crypto libraries. All cipher algorithms implemented from scratch.
        </div>
      </footer>
    </div>
  );
}
