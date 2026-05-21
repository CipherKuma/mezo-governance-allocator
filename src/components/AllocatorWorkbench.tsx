import { ArrowUpRight, SlidersHorizontal } from "lucide-react";
import type { AllocationImpact, Gauge, Position } from "../lib/allocator";
import { GaugeCard } from "./GaugeCard";

type Props = {
  gauges: Gauge[];
  position: Position;
  impact: AllocationImpact;
  hasAllocator: boolean;
  onGaugeWeightChange: (gaugeId: string, nextWeight: number) => void;
  onPositionChange: (position: Position) => void;
  onSimulate: () => void;
};

export function AllocatorWorkbench({
  gauges,
  position,
  impact,
  hasAllocator,
  onGaugeWeightChange,
  onPositionChange,
  onSimulate,
}: Props) {
  return (
    <div className="rounded-lg border border-white/10 bg-[#0d0f0b]/90 p-3 shadow-glass sm:p-4">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <SlidersHorizontal size={16} className="text-musd" />
            Allocation console
          </div>
          <p className="mt-1 text-xs text-white/48">
            Vote weights must total 10,000 bps. The receipt label shows whether
            proof is fixture or live testnet.
          </p>
        </div>
        <button
          onClick={onSimulate}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-btc px-4 py-2 text-sm font-semibold text-black transition hover:bg-[#ffad3b]"
        >
          Simulate Allocation <ArrowUpRight size={15} />
        </button>
      </div>

      <div className="grid gap-3 lg:grid-cols-[0.78fr_1.2fr]">
        <div className="rounded-lg border border-white/10 bg-black/35 p-4">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm font-semibold text-white">Position</span>
            <span className="rounded-full bg-musd/12 px-3 py-1 text-xs text-musd">
              veBTC #{position.tokenId}
            </span>
          </div>

          <Control
            label="Locked BTC"
            value={position.lockedBtc}
            min={0.1}
            max={5}
            step={0.1}
            suffix="BTC"
            onChange={(lockedBtc) =>
              onPositionChange({ ...position, lockedBtc })
            }
          />
          <Control
            label="Days remaining"
            value={position.daysRemaining}
            min={1}
            max={28}
            step={1}
            suffix="days"
            onChange={(daysRemaining) =>
              onPositionChange({ ...position, daysRemaining })
            }
          />
          <Control
            label="MEZO boost"
            value={position.mezoBoost}
            min={0}
            max={10_000}
            step={100}
            suffix="MEZO"
            onChange={(mezoBoost) =>
              onPositionChange({ ...position, mezoBoost })
            }
          />

          <div className="mt-5 rounded-lg border border-white/10 bg-white/[0.035] p-4">
            <div className="flex items-center justify-between text-xs text-white/48">
              <span>Leading gauge</span>
              <span>{impact.leadingWeightBps} bps</span>
            </div>
            <div className="mt-2 text-xl font-semibold text-white">
              {impact.leadingGaugeId}
            </div>
            <div className="mt-4 text-xs text-white/48">
              {hasAllocator
                ? "Allocator address configured; browser demo still waits for a funded wallet transaction."
                : "Live submission waits for deployed allocator address and funded wallet proof."}
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {gauges.map((gauge) => (
            <GaugeCard
              key={gauge.id}
              gauge={gauge}
              onWeightChange={onGaugeWeightChange}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function Control({
  label,
  value,
  min,
  max,
  step,
  suffix,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix: string;
  onChange: (value: number) => void;
}) {
  return (
    <label className="mb-4 block">
      <div className="mb-2 flex items-center justify-between text-xs text-white/55">
        <span>{label}</span>
        <span className="text-white">
          {value.toLocaleString()} {suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="range-control"
      />
    </label>
  );
}
