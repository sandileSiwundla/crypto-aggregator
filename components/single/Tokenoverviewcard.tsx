import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  Legend,
} from "recharts";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AtomData {
  price: number;
  marketCap: number;
  circulatingSupply: number;
  totalSupply: number;
  stakingRatio: number; // %
  stakedAmount: number; // tokens
  targetStakingRatio: number; // %
  inflationRate: number; // %
  minInflation: number;
  maxInflation: number;
  stakingAPR: number; // %
  unbondingDays: number;
  volume24h: number;
  communityTax: number; // %
  validatorCommission: number; // % avg
}

// ─── Hardcoded Data (sourced from CoinMarketCap / Everstake / Figment, H1 2025) ─

export const ATOM_DATA: AtomData = {
  price: 1.69,
  marketCap: 808_490_510,
  circulatingSupply: 516_052_884,
  totalSupply: 516_452_861,
  stakingRatio: 60,
  stakedAmount: 274_040_000,
  targetStakingRatio: 67,
  inflationRate: 9,
  minInflation: 7,
  maxInflation: 20,
  stakingAPR: 16.34,
  unbondingDays: 21,
  volume24h: 21_970_000,
  communityTax: 2,
  validatorCommission: 7.5,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toFixed(2);
}

// ─── Shared design tokens ─────────────────────────────────────────────────────

const BLUE_GRADIENT = "from-slate-900 to-slate-800";
const CARD_BORDER = "border border-blue-500/20";
const HEADER_GRADIENT = "bg-gradient-to-r from-blue-800 to-blue-600";
const ATOM_LOGO =
  "https://s2.coinmarketcap.com/static/img/coins/64x64/3794.png";

const CHART_COLORS = {
  staked: "#3b82f6",
  unstaked: "#1e3a5f",
  inflation: "#60a5fa",
  community: "#818cf8",
  validators: "#34d399",
  delegators: "#f59e0b",
  rewards: "#a78bfa",
};

// ─── SectionWrapper (mirrors original) ───────────────────────────────────────

interface SectionWrapperProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  rightSlot?: React.ReactNode;
  noPad?: boolean;
}

function SectionWrapper({
  children,
  title,
  subtitle,
  rightSlot,
  noPad = false,
}: SectionWrapperProps) {
  return (
    <div
      className={`relative rounded-2xl ${CARD_BORDER} bg-gradient-to-br ${BLUE_GRADIENT} shadow-xl shadow-black/40 mb-5 overflow-hidden transition-all hover:-translate-y-1 hover:shadow-blue-500/20 hover:border-blue-500/40`}
    >
      {/* top shimmer */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/60 to-transparent" />

      <div className={noPad ? "" : "p-5"}>
        {/* Header */}
        <div className={`flex items-center justify-between ${noPad ? "p-5 pb-3" : "mb-4 pb-3"} border-b border-blue-900/30`}>
          <div className="flex items-center gap-3">
            <img
              src={ATOM_LOGO}
              alt="ATOM"
              className="w-10 h-10 rounded-lg shadow-lg shadow-blue-500/20"
              onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
            />
            <div>
              <h4 className="text-white font-semibold text-base leading-tight">{title}</h4>
              {subtitle && (
                <span className="text-slate-400 text-xs font-medium">{subtitle}</span>
              )}
            </div>
          </div>
          {rightSlot}
        </div>

        {noPad ? <div className="px-5 pb-5">{children}</div> : children}

        {/* Watermark */}
        <div className={`flex justify-end ${noPad ? "px-5 pb-3" : "mt-3"} opacity-60`}>
          <span className="text-blue-300 text-xs font-medium">
            Powered by ABC Africa Blockchain Club
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── MetricRow (mirrors original) ────────────────────────────────────────────

function MetricRow({
  label,
  value,
  valueClass = "",
}: {
  label: string;
  value: string;
  valueClass?: "positive" | "negative" | "warning" | "";
}) {
  const valStyle =
    valueClass === "positive"
      ? "text-emerald-300 bg-emerald-900/20"
      : valueClass === "negative"
      ? "text-red-300 bg-red-900/20"
      : valueClass === "warning"
      ? "text-amber-300 bg-amber-900/20"
      : "text-blue-200 bg-blue-900/10";

  return (
    <div className="flex border-b border-blue-900/30 last:border-0">
      <div className="flex-1 px-4 py-3 text-sm font-medium text-slate-300 bg-slate-800/60">
        {label}
      </div>
      <div className={`flex-1 px-4 py-3 text-sm font-semibold text-center ${valStyle}`}>
        {value}
      </div>
    </div>
  );
}

function TableHeader() {
  return (
    <div
      className={`flex ${HEADER_GRADIENT} font-semibold text-white text-xs uppercase tracking-wide`}
    >
      <div className="flex-1 px-4 py-2.5">Metric</div>
      <div className="flex-1 px-4 py-2.5 text-center">Value</div>
    </div>
  );
}

// ─── 1. Staking Distribution (Pie) ───────────────────────────────────────────

export function StakingDistributionChart({ data }: { data: AtomData }) {
  const pieData = [
    { name: "Staked ATOM", value: data.stakedAmount },
    { name: "Unstaked / Liquid", value: data.circulatingSupply - data.stakedAmount },
  ];

  const COLORS = [CHART_COLORS.staked, CHART_COLORS.unstaked];

  const stakedPct = ((data.stakedAmount / data.circulatingSupply) * 100).toFixed(1);
  const liquidPct = (100 - parseFloat(stakedPct)).toFixed(1);

  return (
    <SectionWrapper
      title="Staking Distribution"
      subtitle={`Target: ${data.targetStakingRatio}% staked`}
      rightSlot={
        <div className="text-right">
          <div className="text-blue-300 text-lg font-bold">{stakedPct}% Staked</div>
          <div className="text-amber-300 text-xs font-semibold px-2 py-0.5 rounded bg-amber-900/30">
            Below 67% Target
          </div>
        </div>
      }
    >
      <div className="flex flex-col items-center mt-2 mb-4">
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={3}
              dataKey="value"
              stroke="none"
            >
              {pieData.map((_, i) => (
                <Cell key={i} fill={COLORS[i]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(val: number) => [`${fmt(val)} ATOM`, ""]}
              contentStyle={{
                background: "#0f172a",
                border: "1px solid #1e3a5f",
                borderRadius: "8px",
                color: "#93c5fd",
                fontSize: "12px",
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Legend */}
        <div className="flex gap-6 mt-1">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ background: CHART_COLORS.staked }} />
            <span className="text-slate-300 text-xs">Staked {stakedPct}%</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ background: CHART_COLORS.unstaked }} />
            <span className="text-slate-300 text-xs">Liquid {liquidPct}%</span>
          </div>
        </div>
      </div>

      <div className="rounded-xl overflow-hidden border border-blue-900/30">
        <TableHeader />
        <MetricRow label="Total Staked" value={`${fmt(data.stakedAmount)} ATOM`} />
        <MetricRow label="Liquid Supply" value={`${fmt(data.circulatingSupply - data.stakedAmount)} ATOM`} />
        <MetricRow label="Current Staking Ratio" value={`${stakedPct}%`} valueClass="warning" />
        <MetricRow label="Target Staking Ratio" value={`${data.targetStakingRatio}%`} />
        <MetricRow label="Unbonding Period" value={`${data.unbondingDays} Days`} />
      </div>
    </SectionWrapper>
  );
}

// ─── 2. Dynamic Inflation Model (Bar) ────────────────────────────────────────

export function InflationModelChart({ data }: { data: AtomData }) {
  // Simulate inflation at different staking ratios
  const scenarios = [
    { ratio: "40%", inflation: 20, label: "Max Inflation" },
    { ratio: "50%", inflation: 16, label: "" },
    { ratio: "60%", inflation: 9, label: "Current" },
    { ratio: "67%", inflation: 9, label: "Target" },
    { ratio: "75%", inflation: 7, label: "Min Inflation" },
    { ratio: "85%", inflation: 7, label: "" },
  ];

  return (
    <SectionWrapper
      title="Dynamic Inflation Model"
      subtitle="Inflation adjusts to hit 67% staking target"
      rightSlot={
        <div className="text-right">
          <div className="text-blue-300 text-lg font-bold">{data.inflationRate}% Now</div>
          <div className="text-slate-400 text-xs">7%–20% range</div>
        </div>
      }
    >
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={scenarios} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <XAxis
            dataKey="ratio"
            tick={{ fill: "#94a3b8", fontSize: 11 }}
            axisLine={{ stroke: "#1e3a5f" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "#94a3b8", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip
            formatter={(val: number) => [`${val}%`, "Inflation Rate"]}
            contentStyle={{
              background: "#0f172a",
              border: "1px solid #1e3a5f",
              borderRadius: "8px",
              color: "#93c5fd",
              fontSize: "12px",
            }}
          />
          <Bar dataKey="inflation" radius={[4, 4, 0, 0]}>
            {scenarios.map((entry, i) => (
              <Cell
                key={i}
                fill={entry.label === "Current" ? "#60a5fa" : entry.label === "Target" ? "#34d399" : "#1e3a5f"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="rounded-xl overflow-hidden border border-blue-900/30 mt-4">
        <TableHeader />
        <MetricRow label="Current Inflation Rate" value={`${data.inflationRate}%`} valueClass="warning" />
        <MetricRow label="Minimum Inflation" value={`${data.minInflation}%`} valueClass="positive" />
        <MetricRow label="Maximum Inflation" value={`${data.maxInflation}%`} valueClass="negative" />
        <MetricRow label="Max Annual Rate Change" value="±13% / year" />
        <MetricRow label="Inflation to Stakers" value="98% of issuance" valueClass="positive" />
        <MetricRow label="Community Pool Share" value="2% of issuance" />
      </div>
    </SectionWrapper>
  );
}

// ─── 3. Reward Distribution (Pie) ────────────────────────────────────────────

export function RewardDistributionChart({ data }: { data: AtomData }) {
  const rewardSplit = [
    { name: "Stakers (Delegators)", value: 92.5 },
    { name: "Validators (Commission)", value: data.validatorCommission },
    { name: "Community Pool", value: data.communityTax },
  ];

  const COLORS = [CHART_COLORS.delegators, CHART_COLORS.validators, CHART_COLORS.community];

  return (
    <SectionWrapper
      title="Reward Distribution"
      subtitle="How block rewards are split per block"
      rightSlot={
        <div className="text-right">
          <div className="text-emerald-300 text-lg font-bold">{data.stakingAPR}% APR</div>
          <div className="text-slate-400 text-xs">H1 2025 (Everstake)</div>
        </div>
      }
    >
      <div className="flex flex-col items-center mt-2 mb-4">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={rewardSplit}
              cx="50%"
              cy="50%"
              outerRadius={80}
              paddingAngle={3}
              dataKey="value"
              stroke="none"
              label={({ name, value }) => `${value}%`}
              labelLine={false}
            >
              {rewardSplit.map((_, i) => (
                <Cell key={i} fill={COLORS[i]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(val: number) => [`${val}%`, ""]}
              contentStyle={{
                background: "#0f172a",
                border: "1px solid #1e3a5f",
                borderRadius: "8px",
                color: "#93c5fd",
                fontSize: "12px",
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        <div className="flex flex-wrap justify-center gap-4 mt-1">
          {rewardSplit.map((entry, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ background: COLORS[i] }} />
              <span className="text-slate-300 text-xs">{entry.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl overflow-hidden border border-blue-900/30">
        <TableHeader />
        <MetricRow label="Delegator Net APR" value={`~${data.stakingAPR}%`} valueClass="positive" />
        <MetricRow label="Avg Validator Commission" value={`${data.validatorCommission}%`} />
        <MetricRow label="Community Pool Tax" value={`${data.communityTax}%`} />
        <MetricRow label="H1 2025 Rewards Issued" value="19.26M ATOM" />
        <MetricRow label="Avg Monthly Distribution" value="3.21M ATOM" />
        <MetricRow label="Reward Source" value="Inflation + Tx Fees" />
      </div>
    </SectionWrapper>
  );
}

// ─── 4. Supply Overview ───────────────────────────────────────────────────────

export function SupplyOverviewChart({ data }: { data: AtomData }) {
  const supplyBars = [
    { name: "Staked", value: Math.round(data.stakedAmount / 1_000_000), fill: CHART_COLORS.staked },
    {
      name: "Liquid",
      value: Math.round((data.circulatingSupply - data.stakedAmount) / 1_000_000),
      fill: CHART_COLORS.unstaked,
    },
    {
      name: "Non-Circ.",
      value: Math.round((data.totalSupply - data.circulatingSupply) / 1_000_000),
      fill: "#334155",
    },
  ];

  return (
    <SectionWrapper
      title="Supply Overview"
      subtitle="ATOM has no hard supply cap — dynamic inflation"
      rightSlot={
        <div className="text-right">
          <div className="text-blue-300 text-lg font-bold">{fmt(data.circulatingSupply)}</div>
          <div className="text-slate-400 text-xs">Circulating Supply</div>
        </div>
      }
    >
      <ResponsiveContainer width="100%" height={170}>
        <BarChart
          data={supplyBars}
          layout="vertical"
          margin={{ top: 4, right: 24, left: 8, bottom: 4 }}
        >
          <XAxis
            type="number"
            tick={{ fill: "#94a3b8", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}M`}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fill: "#94a3b8", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={70}
          />
          <Tooltip
            formatter={(val: number) => [`${val}M ATOM`, ""]}
            contentStyle={{
              background: "#0f172a",
              border: "1px solid #1e3a5f",
              borderRadius: "8px",
              color: "#93c5fd",
              fontSize: "12px",
            }}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
            {supplyBars.map((entry, i) => (
              <Cell key={i} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="rounded-xl overflow-hidden border border-blue-900/30 mt-4">
        <TableHeader />
        <MetricRow label="Circulating Supply" value={`${fmt(data.circulatingSupply)} ATOM`} />
        <MetricRow label="Total Supply" value={`${fmt(data.totalSupply)} ATOM`} />
        <MetricRow label="Max Supply" value="No Cap (Infinite)" valueClass="warning" />
        <MetricRow label="Market Cap" value={`$${fmt(data.marketCap)}`} />
        <MetricRow label="Price (USD)" value={`$${data.price.toFixed(2)}`} />
        <MetricRow label="IBC Connected Chains" value="150+ chains (2025)" valueClass="positive" />
      </div>
    </SectionWrapper>
  );
}

// ─── 5. Value Accrual Breakdown ───────────────────────────────────────────────

export function ValueAccrualChart() {
  const accrualData = [
    { category: "Tx Fees (Hub)", score: 20, fill: CHART_COLORS.staked },
    { category: "Inflation Rewards", score: 90, fill: CHART_COLORS.rewards },
    { category: "IBC Zone Fees", score: 5, fill: CHART_COLORS.community },
    { category: "Interchain Security", score: 35, fill: CHART_COLORS.validators },
    { category: "Governance Power", score: 75, fill: CHART_COLORS.delegators },
  ];

  return (
    <SectionWrapper
      title="Value Accrual Breakdown"
      subtitle="ATOM revenue sources — community debate ongoing"
      rightSlot={
        <div className="text-right">
          <div className="text-amber-300 text-xs font-semibold px-2 py-0.5 rounded bg-amber-900/30">
            Overhaul In Progress
          </div>
        </div>
      }
    >
      <div className="mb-3 px-1 text-slate-400 text-xs leading-relaxed">
        Relative contribution score (0–100). IBC zone fees do not automatically
        flow to ATOM holders — a core community concern driving the 2025
        tokenomics overhaul.
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={accrualData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
          <XAxis
            dataKey="category"
            tick={{ fill: "#94a3b8", fontSize: 10 }}
            axisLine={{ stroke: "#1e3a5f" }}
            tickLine={false}
            interval={0}
            height={50}
            angle={-12}
            textAnchor="end"
          />
          <YAxis
            tick={{ fill: "#94a3b8", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            domain={[0, 100]}
            tickFormatter={(v) => `${v}`}
          />
          <Tooltip
            formatter={(val: number) => [`Score: ${val}/100`, ""]}
            contentStyle={{
              background: "#0f172a",
              border: "1px solid #1e3a5f",
              borderRadius: "8px",
              color: "#93c5fd",
              fontSize: "12px",
            }}
          />
          <Bar dataKey="score" radius={[4, 4, 0, 0]}>
            {accrualData.map((entry, i) => (
              <Cell key={i} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="rounded-xl overflow-hidden border border-blue-900/30 mt-4">
        <TableHeader />
        <MetricRow label="Inflation → Stakers" value="✅ Direct (98%)" valueClass="positive" />
        <MetricRow label="Hub Tx Fees → Stakers" value="✅ Direct" valueClass="positive" />
        <MetricRow label="IBC Zone Fees → ATOM" value="❌ Not Automatic" valueClass="negative" />
        <MetricRow label="Interchain Security Revenue" value="Partial / In Dev" valueClass="warning" />
        <MetricRow label="Emissions Selling Pressure" value="~22% of rewards sold" valueClass="negative" />
        <MetricRow label="Tokenomics Overhaul Status" value="Active (2025–2026)" valueClass="warning" />
      </div>
    </SectionWrapper>
  );
}

// ─── Main Composed Component ──────────────────────────────────────────────────

export default function AtomTokenomics() {
  const data = ATOM_DATA;

  return (
    <div className="space-y-0 font-sans max-w-xl mx-auto">
      <StakingDistributionChart data={data} />
      <InflationModelChart data={data} />
      <RewardDistributionChart data={data} />
      <SupplyOverviewChart data={data} />
      <ValueAccrualChart />
    </div>
  );
}