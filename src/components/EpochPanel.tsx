import { Clock, CheckCircle } from "lucide-react";
import {
  useCurrentEpoch,
  useEpochTimeRemaining,
  useTreasuryBalance,
  useWriteAllocator,
  useHasGas,
  formatEther,
} from "../hooks/useAllocatorContract";

export function EpochPanel() {
  const { data: epoch } = useCurrentEpoch();
  const { data: remaining } = useEpochTimeRemaining();
  const { data: treasury } = useTreasuryBalance();
  const { settleEpoch, isPending } = useWriteAllocator();
  const { hasGas } = useHasGas();

  const epochNum = epoch ? Number(epoch) : 0;
  const remainingSec = remaining ? Number(remaining) : 0;
  const canSettle = remainingSec === 0 && epochNum > 0;
  const treasuryFormatted = treasury
    ? Number(formatEther(treasury)).toLocaleString(undefined, {
        maximumFractionDigits: 0,
      })
    : "0";

  const minutes = Math.floor(remainingSec / 60);
  const seconds = remainingSec % 60;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
          <div className="mb-1 text-xs text-white/30">Current Epoch</div>
          <div className="text-3xl font-bold">{epochNum}</div>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
          <div className="mb-1 text-xs text-white/30">Time Remaining</div>
          <div className="text-3xl font-bold">
            {remainingSec > 0 ? (
              <>
                {minutes}
                <span className="text-lg text-white/40">m </span>
                {seconds}
                <span className="text-lg text-white/40">s</span>
              </>
            ) : (
              <span className="text-musd">Ready</span>
            )}
          </div>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
          <div className="mb-1 text-xs text-white/30">Treasury to Settle</div>
          <div className="text-3xl font-bold">
            {treasuryFormatted}
            <span className="ml-1 text-lg text-musd/60">MUSD</span>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6">
        <div className="mb-4 flex items-center gap-2">
          <Clock size={18} className="text-white/40" />
          <h3 className="text-sm font-semibold">Epoch Settlement</h3>
        </div>
        <p className="mb-4 text-sm leading-relaxed text-white/40">
          When an epoch ends, settlement distributes the entire MUSD treasury
          proportionally to each gauge based on its share of total votes. After
          settlement, a new epoch begins and votes reset.
        </p>
        <button
          onClick={() => settleEpoch()}
          disabled={isPending || !hasGas || !canSettle}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-musd/10 px-4 py-3 text-sm font-semibold text-musd transition-colors hover:bg-musd/20 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <CheckCircle size={16} />
          {isPending
            ? "Settling..."
            : canSettle
              ? "Settle Epoch & Distribute MUSD"
              : `Epoch ends in ${minutes}m ${seconds}s`}
        </button>
      </div>
    </div>
  );
}
