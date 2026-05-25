import { Landmark, Lock, LayoutGrid, Timer } from "lucide-react";
import {
  useTreasuryBalance,
  useTotalLocked,
  useCurrentEpoch,
  useEpochTimeRemaining,
  useEpochDuration,
  useGaugeTotals,
  formatEther,
} from "../hooks/useAllocatorContract";
import { GAUGES, CATEGORY_COLORS } from "../lib/gauges";
import { CountUp } from "./CountUp";
import { AllocationDonut } from "./AllocationDonut";
import { ActivityFeed } from "./ActivityFeed";

export function OverviewPanel() {
  const { data: treasury } = useTreasuryBalance();
  const { data: locked } = useTotalLocked();
  const { data: epoch } = useCurrentEpoch();
  const { data: remaining } = useEpochTimeRemaining();
  const { data: duration } = useEpochDuration();
  const { totals, sum, shares } = useGaugeTotals(GAUGES.map((g) => g.id));

  const treasuryNum = treasury ? Number(formatEther(treasury)) : 0;
  const lockedNum = locked ? Number(formatEther(locked as bigint)) : 0;
  const epochNum = epoch ? Number(epoch) : 0;
  const durSec = duration ? Number(duration) : 300;
  const remSec = remaining ? Number(remaining) : 0;
  const progress =
    durSec > 0 ? Math.min(100, ((durSec - remSec) / durSec) * 100) : 0;
  const tvl = treasuryNum + lockedNum;

  const metrics = [
    {
      icon: Landmark,
      label: "MUSD treasury",
      value: treasuryNum,
      suffix: " MUSD",
      color: "text-musd",
    },
    {
      icon: Lock,
      label: "MEZO locked (veMEZO)",
      value: lockedNum,
      suffix: " MEZO",
      color: "text-btc",
    },
    {
      icon: LayoutGrid,
      label: "Active gauges",
      value: GAUGES.length,
      suffix: "",
      color: "text-violet-400",
    },
    {
      icon: Timer,
      label: "Current epoch",
      value: epochNum,
      prefix: "#",
      suffix: "",
      color: "text-sky-400",
    },
  ];

  const maxVotes = totals.length
    ? Math.max(...totals.map((t) => Number(formatEther(t))))
    : 0;

  return (
    <div className="space-y-4">
      {/* Headline TVL */}
      <section className="rounded-xl border border-btc/20 bg-gradient-to-br from-btc/[0.08] to-transparent p-5 shadow-glass">
        <div className="text-xs uppercase tracking-wider text-white/40">
          Total value governed
        </div>
        <div className="mt-1 text-4xl font-bold text-ivory">
          <CountUp value={tvl} suffix="" />
          <span className="ml-2 text-base font-normal text-white/40">
            MUSD + MEZO routed by veMEZO votes
          </span>
        </div>
      </section>

      {/* Metric bento */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <div
              key={m.label}
              className="rounded-xl border border-white/10 bg-graphite/80 p-4 shadow-glass"
            >
              <Icon size={16} className={m.color} />
              <div className="mt-2 text-xl font-bold text-ivory">
                <CountUp value={m.value} prefix={m.prefix} suffix={m.suffix} />
              </div>
              <div className="mt-0.5 text-[11px] uppercase tracking-wider text-white/35">
                {m.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Epoch progress */}
      <section className="rounded-xl border border-white/10 bg-graphite/80 p-5 shadow-glass">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-white/70">Epoch {epochNum} progress</span>
          <span className="font-mono text-xs text-white/45">
            {remSec > 0
              ? `${Math.floor(remSec / 60)}m ${remSec % 60}s left`
              : "Ready to settle"}
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.06]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-btc to-musd transition-[width] duration-700"
            style={{ width: `${Math.max(progress, 2)}%` }}
          />
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Capital allocation donut */}
        <section className="rounded-xl border border-white/10 bg-graphite/80 p-5 shadow-glass">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/70">
            Capital allocation
          </h3>
          <AllocationDonut
            shares={shares.length ? shares : GAUGES.map(() => 0)}
            labels={GAUGES.map((g) => g.label)}
            centerLabel="routed next epoch"
            centerValue={`${treasuryNum.toLocaleString(undefined, { maximumFractionDigits: 0 })} MUSD`}
          />
        </section>

        {/* Vote weight bars */}
        <section className="rounded-xl border border-white/10 bg-graphite/80 p-5 shadow-glass">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/70">
            veMEZO vote weight
          </h3>
          <div className="space-y-3">
            {GAUGES.map((g, i) => {
              const v = totals[i] ? Number(formatEther(totals[i])) : 0;
              const pct = maxVotes > 0 ? (v / maxVotes) * 100 : 0;
              return (
                <div key={g.label}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2">
                      <span className="text-white/75">{g.label}</span>
                      <span
                        className={`rounded-full border px-1.5 py-0.5 text-[9px] font-medium ${CATEGORY_COLORS[g.category] ?? "text-white/40 border-white/10"}`}
                      >
                        {g.category}
                      </span>
                    </span>
                    <span className="font-mono text-white/45">
                      {v.toLocaleString(undefined, {
                        maximumFractionDigits: 0,
                      })}
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.06]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-musd to-emerald-300 transition-[width] duration-700"
                      style={{ width: `${Math.max(pct, 1)}%` }}
                    />
                  </div>
                </div>
              );
            })}
            <p className="pt-1 text-[11px] text-white/30">
              {sum > 0n
                ? "Total veMEZO cast across gauges, read live from chain."
                : "No votes cast in the current epoch yet."}
            </p>
          </div>
        </section>
      </div>

      <ActivityFeed />
    </div>
  );
}
