import { Landmark, Clock, ArrowDownToLine } from "lucide-react";
import {
  useTreasuryBalance,
  useCurrentEpoch,
  useEpochTimeRemaining,
  useWriteAllocator,
  useHasGas,
  formatEther,
  parseEther,
} from "../hooks/useAllocatorContract";

export function TreasuryPanel() {
  const { data: treasury } = useTreasuryBalance();
  const { data: epoch } = useCurrentEpoch();
  const { data: remaining } = useEpochTimeRemaining();
  const { depositTreasury, settleEpoch, isPending } = useWriteAllocator();
  const { hasGas } = useHasGas();

  const treasuryFormatted = treasury
    ? Number(formatEther(treasury)).toLocaleString(undefined, {
        maximumFractionDigits: 2,
      })
    : "—";

  const epochNum = epoch ? Number(epoch) : 0;
  const remainingSec = remaining ? Number(remaining) : 0;
  const canSettle = remainingSec === 0;

  const minutes = Math.floor(remainingSec / 60);
  const seconds = remainingSec % 60;
  const timeDisplay =
    remainingSec > 0 ? `${minutes}m ${seconds}s` : "Ready to settle";

  return (
    <section className="rounded-xl border border-musd/20 bg-graphite/80 p-5 shadow-glass">
      <div className="mb-4 flex items-center gap-2 text-musd">
        <Landmark size={18} />
        <h3 className="text-sm font-semibold uppercase tracking-wider">
          MUSD Treasury
        </h3>
      </div>

      <div className="mb-4 text-3xl font-bold text-ivory">
        {treasuryFormatted}{" "}
        <span className="text-base font-normal text-musd/70">MUSD</span>
      </div>

      <div className="mb-4 flex items-center gap-4 text-sm text-ivory/60">
        <div className="flex items-center gap-1">
          <Clock size={14} />
          <span>Epoch {epochNum}</span>
        </div>
        <div>{timeDisplay}</div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => depositTreasury(parseEther("1000"))}
          disabled={isPending || !hasGas}
          className="flex items-center gap-1.5 rounded-lg bg-musd/20 px-3 py-2 text-xs font-medium text-musd transition-colors hover:bg-musd/30 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ArrowDownToLine size={14} />
          Deposit 1K MUSD
        </button>
        <button
          onClick={() => settleEpoch()}
          disabled={isPending || !hasGas || !canSettle}
          className="rounded-lg bg-btc/20 px-3 py-2 text-xs font-medium text-btc transition-colors hover:bg-btc/30 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Settle Epoch
        </button>
      </div>
    </section>
  );
}
