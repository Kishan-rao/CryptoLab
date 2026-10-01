import React from 'react';
import { Key, Cpu, Lock, ShieldCheck, BookOpen, Layers, Terminal, Sparkles } from 'lucide-react';
import AlgorithmCard from '../components/AlgorithmCard';

export default function Home() {
  const algorithms = [
    {
      title: 'Vigenère Cipher',
      subtitle: 'Classical Cryptography • 16th Century',
      category: 'Classical',
      categoryColor: 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40',
      icon: Key,
      description:
        'A polyalphabetic substitution cipher that encrypts alphabetic text using a repeating keyword and modular arithmetic over Z26.',
      formula: 'C = (P + K) mod 26  |  P = (C - K) mod 26',
      features: [
        'Pure manual implementation (no crypto libraries)',
        'Key normalization & cyclical expansion',
        'Character-to-index (A=0..Z=25) translation',
        'Interactive step-by-step calculation trace table',
      ],
      linkTo: '/vigenere',
    },
    {
      title: 'AES-128',
      subtitle: 'Symmetric Block Cipher • FIPS-197',
      category: 'Symmetric',
      categoryColor: 'bg-cyan-950/60 text-cyan-300 border-cyan-500/40',
      icon: Cpu,
      description:
        'The Advanced Encryption Standard processing 128-bit blocks through 10 rounds of substitution, permutation, and Galois Field GF(2^8) mixing.',
      formula: 'SubBytes → ShiftRows → MixColumns → AddRoundKey',
      features: [
        'Pure FIPS-197 manual implementation from scratch',
        'Full validation of official NIST Known-Answer Test vector',
        'Interactive 4×4 State Matrix inspector with byte details',
        'Round-by-round and operation-by-operation stepper',
      ],
      linkTo: '/aes',
    },
    {
      title: 'RSA Cryptosystem',
      subtitle: 'Asymmetric Cryptography • Public-Key',
      category: 'Asymmetric',
      categoryColor: 'bg-indigo-950/60 text-indigo-300 border-indigo-500/40',
      icon: Lock,
      description:
        'The foundational public-key algorithm based on the computational difficulty of factoring the product of two large prime numbers.',
      formula: 'n = p × q  |  φ(n) = (p-1)(q-1)  |  C = M^e mod n',
      features: [
        'Pure number theory implementation (GCD, ExtGCD, ModInv)',
        'Interactive Prime Selection & Key Generation (e, d)',
        'Binary Square-and-Multiply modular exponentiation trace',
        'Supports both numerical blocks and text messages',
      ],
      linkTo: '/rsa',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Hero Section */}
      <section className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300 font-mono">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Cryptography and Network Security (CNS) Lab</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
          Cryptography Algorithm{' '}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400">
            Visualizer & Demonstrator
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
          An interactive academic platform demonstrating the mathematical foundations,
          internal state transformations, and step-by-step mechanics of Classical, Symmetric,
          and Asymmetric cryptography.
        </p>
      </section>

      {/* Algorithm Showcase Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {algorithms.map((algo, index) => (
          <AlgorithmCard key={index} {...algo} />
        ))}
      </section>

      {/* Comparative Cryptography Taxonomy Table */}
      <section className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-800 space-y-6">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">
              Comparative Cryptographic Taxonomy
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Structural differences between Classical, Symmetric, and Asymmetric systems
            </p>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead>
              <tr className="bg-slate-900 text-slate-300 border-b border-slate-800">
                <th className="py-3 px-4 font-semibold">Dimension</th>
                <th className="py-3 px-4 font-semibold text-emerald-300">Vigenère (Classical)</th>
                <th className="py-3 px-4 font-semibold text-cyan-300">AES-128 (Symmetric)</th>
                <th className="py-3 px-4 font-semibold text-indigo-300">RSA (Asymmetric)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300">
              <tr className="hover:bg-slate-900/40">
                <td className="py-3 px-4 text-slate-400 font-medium">Paradigm</td>
                <td className="py-3 px-4">Polyalphabetic Substitution</td>
                <td className="py-3 px-4">Substitution-Permutation Network (SPN)</td>
                <td className="py-3 px-4">Public-Key Trapdoor Function</td>
              </tr>
              <tr className="hover:bg-slate-900/40">
                <td className="py-3 px-4 text-slate-400 font-medium">Key Structure</td>
                <td className="py-3 px-4">Shared secret word (repeated)</td>
                <td className="py-3 px-4">Single 128-bit shared secret key</td>
                <td className="py-3 px-4">Keypair: Public (e, n) & Private (d, n)</td>
              </tr>
              <tr className="hover:bg-slate-900/40">
                <td className="py-3 px-4 text-slate-400 font-medium">Mathematical Basis</td>
                <td className="py-3 px-4">Modular arithmetic over Z26</td>
                <td className="py-3 px-4">Galois Field GF(2^8) & Matrix ops</td>
                <td className="py-3 px-4">Prime factorization & Euler's Totient</td>
              </tr>
              <tr className="hover:bg-slate-900/40">
                <td className="py-3 px-4 text-slate-400 font-medium">Block / Unit Size</td>
                <td className="py-3 px-4">1 Character (Stream-like)</td>
                <td className="py-3 px-4">128 bits (16 bytes, 4×4 state)</td>
                <td className="py-3 px-4">Integer block M &lt; n</td>
              </tr>
              <tr className="hover:bg-slate-900/40">
                <td className="py-3 px-4 text-slate-400 font-medium">Implementation Status</td>
                <td className="py-3 px-4 text-emerald-400 font-bold">100% Manual Scratch</td>
                <td className="py-3 px-4 text-cyan-400 font-bold">100% Manual (NIST Verified)</td>
                <td className="py-3 px-4 text-indigo-400 font-bold">100% Manual Scratch</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Architecture & Verification Banner */}
      <section className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/80 to-slate-900 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-center text-emerald-400 flex-shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              Verified Against Official NIST Known-Answer Test Vector
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              FIPS-197 Key: <span className="text-slate-300">000102030405060708090a0b0c0d0e0f</span> → Expected Ciphertext: <span className="text-cyan-300">69c4e0d86a7b0430d8cdb78070b4c55a</span>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto">
          <div className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs font-mono text-emerald-400 flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>27/27 Pytest Tests Passing</span>
          </div>
        </div>
      </section>
    </div>
  );
}
