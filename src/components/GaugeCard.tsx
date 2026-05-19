import { Landmark, ShieldCheck, Sprout, Waves } from "lucide-react";
import type { Gauge } from "../lib/allocator";

type Props = {
  gauge: Gauge;
  onWeightChange: (gaugeId: string, nextWeight: number) => void;
};

const iconByKind = {
  staking: Waves,
  validator: ShieldCheck,
  ecosystem: Sprout,
  boost: Landmark
};

export function GaugeCard({ gauge, onWeightChange }: Props) {
  const Icon = iconByKind[gauge.kind];
  const delta = gauge.proposedWeightBps - gauge.currentWeightBps;
  const width = `${gauge.proposedWeightBps / 100}%`;

  return (
    <article className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-btc/12 text-btc">
            <Icon size={17} />
          </span>
          <div>
            <h3 className="text-sm font-semibold text-white">{gauge.label}</h3>
            <p className="text-xs capitalize text-white/42">{gauge.kind} gauge</p>
          </div>
        </div>
        <span className={delta >= 0 ? "text-xs text-musd" : "text-xs text-btc"}>
          {delta >= 0 ? "+" : ""}
          {delta} bps
        </span>
      </div>

      <div className="mb-3 h-2 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-musd transition-all duration-500" style={{ width }} />
      </div>

      <input
        type="range"
        min={0}
        max={7000}
        step={100}
        value={gauge.proposedWeightBps}
        onChange={(event) => onWeightChange(gauge.id, Number(event.target.value))}
        className="range-control"
        aria-label={`${gauge.label} weight`}
      />

      <dl className="mt-4 grid grid-cols-3 gap-2 text-xs">
        <Metric label="Weight" value={`${(gauge.proposedWeightBps / 100).toFixed(0)}%`} />
        <Metric label="Fee APR" value={`${gauge.feeApr}%`} />
        <Metric label="BTC depth" value={`${gauge.btcDepth}`} />
      </dl>
    </article>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-black/28 p-2">
      <dt className="text-white/40">{label}</dt>
      <dd className="mt-1 font-semibold text-white">{value}</dd>
    </div>
  );
}
