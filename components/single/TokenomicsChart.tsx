
"use client";

import React, { useState, useCallback } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps,
} from "recharts";
import { isValidEthereumAddress, shortenAddress } from "../tokenUtils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Category {
  name: string;
  walletAddress: string;
  balance: number;
  percentage: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PALETTE = [
  "#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444",
  "#06b6d4", "#84cc16", "#f97316", "#6366f1", "#ec4899",
  "#14b8a6", "#eab308", "#a855f7", "#f43f5e",
];

// ─── Mock fetch (replace with real API) ──────────────────────────────────────

async function fetchBalance(_address: string): Promise<number> {
  await new Promise((r) => setTimeout(r, 300 + Math.random() * 400));
  return Math.floor(Math.random() * 9_000_000 + 1_000_000);
}

// ─── Custom tooltip ───────────────────────────────────────────────────────────

// TooltipProps typing from recharts may not include the runtime `payload` shape used here,
// augment the recharts TooltipProps with a precise payload shape so we avoid `any`.
function CustomTooltip(
  { active, payload }: TooltipProps<number, string> & { payload?: Array<{ payload: Category }> }
) {
  if (!active || !payload?.length) return null;
  const cat: Category = payload[0].payload;
  return (
    <div className="rounded-xl border border-blue-700/40 bg-slate-900/95 px-4 py-3 shadow-2xl text-sm space-y-1">
      <p className="text-white font-semibold">{cat.name}</p>
      <p className="text-blue-300">{cat.percentage.toFixed(2)}%</p>
      <p className="text-slate-400">{cat.balance.toLocaleString()} tokens</p>
      <p className="text-slate-500 text-xs">{shortenAddress(cat.walletAddress)}</p>
    </div>
  );
}

// ─── Small sub-components ─────────────────────────────────────────────────────

function InputRow({
  label,
  id,
  value,
  onChange,
  placeholder,
  onEnter,
}: {
  label: string;
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  onEnter?: () => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-xs text-slate-400 font-medium">
        {label}
      </label>
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        onKeyDown={(e) => e.key === "Enter" && onEnter?.()}
        className="bg-slate-800 border border-blue-900/40 text-white text-sm rounded-lg px-3 py-2.5 placeholder-slate-600 focus:outline-none focus:border-blue-500 transition"
      />
    </div>
  );
}

function CategoryItem({
  cat,
  index,
  color,
  onRemove,
}: {
  cat: Category;
  index: number;
  color: string;
  onRemove: (i: number) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-slate-800/60 border border-slate-700/40 px-3 py-2 text-sm">
      <div className="flex items-center gap-2 min-w-0">
        <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: color }} />
        <span className="text-white font-medium truncate">{cat.name}</span>
        <span className="text-slate-500 text-xs truncate hidden sm:inline">{shortenAddress(cat.walletAddress)}</span>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        {cat.percentage > 0 && (
          <span className="text-blue-300 font-semibold">{cat.percentage.toFixed(1)}%</span>
        )}
        <button
          onClick={() => onRemove(index)}
          className="text-slate-500 hover:text-red-400 transition text-lg leading-none"
          aria-label="Remove"
        >
          ×
        </button>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface TokenomicsChartProps {
  /** Optional initial categories (e.g. loaded from an API) */
  initialCategories?: Omit<Category, "balance" | "percentage">[];
}

export default function TokenomicsChart({ initialCategories = [] }: TokenomicsChartProps) {
  const [categories, setCategories] = useState<Category[]>(
    initialCategories.map((c) => ({ ...c, balance: 0, percentage: 0 }))
  );
  const [nameInput, setNameInput] = useState("");
  const [addressInput, setAddressInput] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);

  const handleAdd = useCallback(() => {
    setError("");
    if (!nameInput.trim() || !addressInput.trim()) {
      setError("Please enter both a category name and wallet address.");
      return;
    }
    if (!isValidEthereumAddress(addressInput.trim())) {
      setError("Enter a valid Ethereum address (0x…).");
      return;
    }
    setCategories((prev) => [
      ...prev,
      { name: nameInput.trim(), walletAddress: addressInput.trim(), balance: 0, percentage: 0 },
    ]);
    setNameInput("");
    setAddressInput("");
    setGenerated(false);
  }, [nameInput, addressInput]);

  const handleRemove = useCallback((index: number) => {
    setCategories((prev) => prev.filter((_, i) => i !== index));
    setGenerated(false);
  }, []);

  const handleGenerate = useCallback(async () => {
    if (categories.length === 0) {
      setError("Add at least one category first.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const withBalances = await Promise.all(
        categories.map(async (cat) => ({ ...cat, balance: await fetchBalance(cat.walletAddress) }))
      );
      const total = withBalances.reduce((sum, c) => sum + c.balance, 0);
      const withPercentages = withBalances
        .map((c) => ({ ...c, percentage: total > 0 ? (c.balance / total) * 100 : 0 }))
        .sort((a, b) => b.percentage - a.percentage);
      setCategories(withPercentages);
      setGenerated(true);
    } finally {
      setLoading(false);
    }
  }, [categories]);

  const handleReset = useCallback(() => {
    setCategories([]);
    setGenerated(false);
    setError("");
    setNameInput("");
    setAddressInput("");
  }, []);

  const total = categories.reduce((s, c) => s + c.balance, 0);

  return (
    <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-br from-slate-900 to-slate-800 p-5 shadow-xl shadow-black/40 mb-5">
      {/* Header */}
      <div className="mb-5">
        <h4 className="text-white font-semibold text-base flex items-center gap-2">
          <span className="text-blue-400">◕</span> Token Distribution
        </h4>
        <p className="text-slate-500 text-xs mt-1">Add wallet addresses to visualise allocation</p>
      </div>

      {/* Input form */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        <InputRow
          label="Category name"
          id="cat-name"
          value={nameInput}
          onChange={setNameInput}
          placeholder="e.g. Team, Treasury…"
          onEnter={handleAdd}
        />
        <InputRow
          label="Wallet address"
          id="wallet-addr"
          value={addressInput}
          onChange={setAddressInput}
          placeholder="0x…"
          onEnter={handleAdd}
        />
      </div>

      <div className="flex gap-2 mb-4">
        <button
          onClick={handleAdd}
          className="flex-1 bg-blue-700 hover:bg-blue-600 text-white text-sm font-semibold rounded-lg py-2 transition"
        >
          + Add
        </button>
        <button
          onClick={handleGenerate}
          disabled={loading || categories.length === 0}
          className="flex-1 bg-indigo-700 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg py-2 transition"
        >
          {loading ? "Fetching…" : "Generate Chart"}
        </button>
        <button
          onClick={handleReset}
          className="px-3 text-slate-400 hover:text-red-400 text-sm transition"
          title="Reset"
        >
          ↺
        </button>
      </div>

      {error && (
        <p className="text-red-400 text-xs mb-3 px-1">{error}</p>
      )}

      {/* Category list */}
      {categories.length > 0 && (
        <div className="space-y-1.5 mb-5">
          {categories.map((cat, i) => (
            <CategoryItem
              key={`${cat.walletAddress}-${i}`}
              cat={cat}
              index={i}
              color={PALETTE[i % PALETTE.length]}
              onRemove={handleRemove}
            />
          ))}
        </div>
      )}

      {/* Chart */}
      {generated && categories.length > 0 && (
        <>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={categories}
                cx="50%"
                cy="50%"
                innerRadius="55%"
                outerRadius="80%"
                paddingAngle={2}
                dataKey="percentage"
                nameKey="name"
                animationBegin={0}
                animationDuration={800}
              >
                {categories.map((_, i) => (
                  <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                formatter={(value) => <span style={{ color: "#cbd5e1", fontSize: 12 }}>{value}</span>}
                iconType="circle"
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Summary stats */}
          <div className="mt-4 grid grid-cols-3 gap-3 text-center">
            {[
              { label: "Categories", value: categories.length },
              { label: "Total Tracked", value: total.toLocaleString() },
              { label: "Largest", value: categories[0]?.name ?? "—" },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-xl bg-slate-800/60 border border-slate-700/30 py-3 px-2">
                <div className="text-blue-300 font-bold text-sm truncate">{value}</div>
                <div className="text-slate-500 text-xs mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}