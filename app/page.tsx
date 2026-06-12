'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-16">
        <header className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-4">
            AssetView
          </h1>
          <p className="text-xl text-gray-300">
            Professional Crypto Asset Intelligence
          </p>
        </header>

        <main className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold text-white mb-4">
              Professional Crypto Asset Intelligence
            </h2>
            <p className="text-gray-300">
              Comprehensive market data, tokenomics, and research tools for informed investment decisions
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Link href="/token" 
              className="bg-white/10 backdrop-blur-lg rounded-xl p-8 hover:bg-white/20 transition-all group">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="text-2xl font-semibold text-white mb-2">Token Analysis</h3>
              <p className="text-gray-300 mb-4">
                Deep dive into individual tokens with price history, supply data, and fundamentals
              </p>
              <span className="text-purple-400 group-hover:text-purple-300">
                Analyze Tokens →
              </span>
            </Link>

            <Link href="/compare"
              className="bg-white/10 backdrop-blur-lg rounded-xl p-8 hover:bg-white/20 transition-all group">
              <div className="text-5xl mb-4">⚖️</div>
              <h3 className="text-2xl font-semibold text-white mb-2">Compare Assets</h3>
              <p className="text-gray-300 mb-4">
                Side-by-side comparison of multiple cryptocurrencies and their metrics
              </p>
              <span className="text-purple-400 group-hover:text-purple-300">
                Start Comparing →
              </span>
            </Link>
          </div>
        </main>

        <footer className="text-center mt-16 pt-8 border-t border-white/10">
          <p className="text-gray-400">
            © 2024 AssetView. Professional cryptocurrency research platform.
          </p>
        </footer>
      </div>
    </div>
  );
}