'use client';

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
import { isValidEthereumAddress, shortenAddress } from "@/lib/tokenUtils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Category {
  name: string;
  walletAddress: string;
  balance: number;
  percentage: number;
}

// ─── Palette — muted, editorial ───────────────────────────────────────────────

const PALETTE = [
  "#34567a", // accent blue
  "#8a6d1f", // olive/warning
  "#2d6a4f", // forest green
  "#9b2c2c", // deep red
  "#5a7a9e", // soft accent
  "#8a8578", // rule-heavy
  "#6b5b95", // muted purple
  "#a67c52", // warm brown
  "#3d6b7d", // teal-slate
  "#7d5a5a", // muted rose
  "#4a6a4a", // sage
  "#6b6b8a", // slate-violet
  "#8a6a4a", // tan
  "#5a5a5a", // grey
];

// ─── Mock fetch ───────────────────────────────────────────────────────────────

async function fetchBalance(_address: string): Promise<number> {
  await new Promise((r) => setTimeout(r, 300 + Math.random() * 400));
  return Math.floor(Math.random() * 9_000_000 + 1_000_000);
}

// ─── Custom tooltip ───────────────────────────────────────────────────────────

function CustomTooltip(
  {
    active,
    payload,
  }: TooltipProps<number, string> & { payload?: Array<{ payload: Category }> }
) {
  if (!active || !payload?.length) return null;
  const cat: Category = payload[0].payload;
  return (
    <div className="border border-rule bg-paper px-4 py-3 text-sm">
      <p className="font-display text-ink mb-1">{cat.name}</p>
      <p className="font-mono text-accent text-base tabular-nums">
        {cat.percentage.toFixed(2)}%
      </p>
      <p className="font-mono text-slate-academic text-xs tabular-nums">
        {cat.balance.toLocaleString()} tokens
      </p>
      <p className="font-mono text-slate-academic-dim text-xs mt-1">
        {shortenAddress(cat.walletAddress)}
      </p>
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
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="label-caps">
        {label}
      </label>
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        onKeyDown={(e) => e.key === "Enter" && onEnter?.()}
        className="input-academic"
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
    <div className="flex items-center justify-between border-b border-rule py-3 last:border-0">
      <div className="flex items-center gap-3 min-w-0">
        <span
          className="w-2.5 h-2.5 flex-shrink-0"
          style={{ background: color }}
        />
        <span className="font-body text-ink truncate">{cat.name}</span>
        <span className="font-mono text-xs text-slate-academic-dim truncate hidden sm:inline">
          {shortenAddress(cat.walletAddress)}
        </span>
      </div>
      <div className="flex items-center gap-4 flex-shrink-0">
        {cat.percentage > 0 && (
          <span className="font-mono text-sm text-accent tabular-nums">
            {cat.percentage.toFixed(1)}%
          </span>
        )}
        <button
          onClick={() => onRemove(index)}
          className="font-mono text-slate-academic-dim hover:text-negative transition text-lg leading-none bg-transparent cursor-pointer"
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
  initialCategories?: Omit<Category, "balance" | "percentage">[];
}

export default function TokenomicsChart({
  initialCategories = [],
}: TokenomicsChartProps) {
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
      {
        name: nameInput.trim(),
        walletAddress: addressInput.trim(),
        balance: 0,
        percentage: 0,
      },
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
        categories.map(async (cat) => ({
          ...cat,
          balance: await fetchBalance(cat.walletAddress),
        }))
      );
      const total = withBalances.reduce((sum, c) => sum + c.balance, 0);
      const withPercentages = withBalances
        .map((c) => ({
          ...c,
          percentage: total > 0 ? (c.balance / total) * 100 : 0,
        }))
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
    <div className="border border-rule bg-paper mb-10">
      {/* Header */}
      <div className="px-6 py-3 border-b border-rule flex items-baseline justify-between">
        <div className="label-caps">Token Distribution</div>
        <div className="label-caps text-slate-academic-dim">
          Wallet allocation
        </div>
      </div>

      <div className="p-6">
        <p className="font-body text-sm text-slate-academic mb-5">
          Add wallet addresses to visualise allocation.
        </p>

        {/* Input form */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
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

        <div className="flex gap-3 mb-6">
          <button onClick={handleAdd} className="btn-academic flex-1">
            Add Entry
          </button>
          <button
            onClick={handleGenerate}
            disabled={loading || categories.length === 0}
            className="btn-academic-primary flex-1"
          >
            {loading ? "Fetching…" : "Generate Chart"}
          </button>
          <button
            onClick={handleReset}
            className="btn-academic px-4"
            title="Reset"
          >
            Reset
          </button>
        </div>

        {error && (
          <div className="border-l-2 border-negative bg-negative-bg px-4 py-3 mb-5">
            <p className="font-body text-sm text-negative">{error}</p>
          </div>
        )}

        {/* Category list */}
        {categories.length > 0 && (
          <div className="mb-6 border-t border-rule">
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
            <div className="border-t border-rule pt-6">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categories}
                    cx="50%"
                    cy="50%"
                    innerRadius="55%"
                    outerRadius="80%"
                    paddingAngle={1}
                    dataKey="percentage"
                    nameKey="name"
                    animationBegin={0}
                    animationDuration={800}
                    stroke="#faf9f6"
                    strokeWidth={1}
                  >
                    {categories.map((_, i) => (
                      <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    formatter={(value) => (
                      <span
                        style={{
                          color: "#5a6472",
                          fontSize: 12,
                          fontFamily:
                            "Charter, Iowan Old Style, Georgia, serif",
                        }}
                      >
                        {value}
                      </span>
                    )}
                    iconType="square"
                    iconSize={9}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Summary stats */}
            <div className="mt-6 grid grid-cols-3 gap-px bg-rule border border-rule">
              {[
                { label: "Categories", value: categories.length.toString() },
                {
                  label: "Total Tracked",
                  value: total.toLocaleString(),
                },
                { label: "Largest", value: categories[0]?.name ?? "—" },
              ].map(({ label, value }) => (
                <div key={label} className="bg-paper px-4 py-4 text-center">
                  <div className="font-mono text-sm text-ink tabular-nums truncate mb-1">
                    {value}
                  </div>
                  <div className="label-caps">{label}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}