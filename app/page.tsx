'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <div className="max-w-3xl mx-auto py-24 px-6">

        {/* Masthead — like a journal header */}
        <header className="text-center mb-20">
          <div className="label-caps mb-3">Established MMXXV</div>
          <h1 className="text-5xl font-display tracking-tight mb-3">
            AssetView
          </h1>
          <div className="h-px w-16 bg-rule-heavy mx-auto my-4" />
          <p className="lead">
            Professional crypto asset intelligence
          </p>
        </header>

        {/* Two-column index — like a table of contents */}
        <main className="grid md:grid-cols-2 gap-px bg-rule border border-rule">
          <Link
            href="/token"
            className="group bg-paper p-10 hover:bg-paper-alt transition-colors"
          >
            <div className="label-caps mb-4">§ I</div>
            <h3 className="text-xl font-display mb-3">
              Token Analysis
            </h3>
            <p className="text-slate-academic text-sm leading-relaxed mb-6">
              Deep dive into individual tokens with price history,
              supply data, and fundamentals.
            </p>
            <span className="font-ui text-xs tracking-widest uppercase
                             text-accent-dim group-hover:text-accent
                             border-b border-transparent group-hover:border-accent
                             pb-0.5 transition-all">
              Analyze Tokens →
            </span>
          </Link>

          <Link
            href="/compare"
            className="group bg-paper p-10 hover:bg-paper-alt transition-colors"
          >
            <div className="label-caps mb-4">§ II</div>
            <h3 className="text-xl font-display mb-3">
              Compare Assets
            </h3>
            <p className="text-slate-academic text-sm leading-relaxed mb-6">
              Side-by-side comparison of multiple cryptocurrencies
              and their metrics.
            </p>
            <span className="font-ui text-xs tracking-widest uppercase
                             text-accent-dim group-hover:text-accent
                             border-b border-transparent group-hover:border-accent
                             pb-0.5 transition-all">
              Start Comparing →
            </span>
          </Link>
        </main>


      </div>
    </div>
  );
}