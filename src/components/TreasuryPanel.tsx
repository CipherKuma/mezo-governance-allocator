import { Landmark, Clock, ArrowDownToLine, Route } from "lucide-react";
import {
  useTreasuryBalance,
  useCurrentEpoch,
  useEpochTimeRemaining,
  useGaugeTotals,
  useWriteAllocator,
  useHasGas,
  formatEther,
  parseEther,
} from "../hooks/useAllocatorContract";
import { useAccount } from "wagmi";
import { GAUGES, CATEGORY_COLORS } from "../lib/gauges";

export function TreasuryPanel() {
  const { isConnected } = useAccount();
  const { data: treasury } = useTreasuryBalance();
  const { data: epoch } = useCurrentEpoch();
  const { data: remaining } = useEpochTimeRemaining();
  const { shares } = useGaugeTotals(GAUGES.map((g) => g.id));
  const { depositTreasury, settleEpoch, isPending } = useWriteAllocator();
  const { hasGas } = useHasGas();

  const treasuryNum = treasury ? Number(formatEther(treasury)) : 0;
  const treasuryFormatted = treasuryNum.toLocaleString(undefined, {
    maximumFractionDigits: 2,
  });

  const epochNum = epoch ? Number(epoch) : 0;
  const remainingSec = remaining ? Number(remaining) : 0;
  const canSettle = remainingSec === 0;
  const minutes = Math.floor(remainingSec / 60);
  const seconds = remainingSec % 60;
  const timeDisplay =
    remainingSec > 0 ? `${minutes}m ${seconds}s` : "Ready to settle";

  const writeBlocked = !isConnected
    ? "Connect a Mezo wallet"
    : !hasGas
      ? "Need BTC for gas"
      : null;

  return (
    <div className="space-y-4">
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
            disabled={isPending || Boolean(writeBlocked)}
            title={writeBlocked ?? undefined}
            className="flex items-center gap-1.5 rounded-lg bg-musd/20 px-3 py-2 text-xs font-medium text-musd transition-colors hover:bg-musd/30 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ArrowDownToLine size={14} />
            Deposit 1K MUSD
          </button>
          <button
            onClick={() => settleEpoch()}
            disabled={isPending || Boolean(writeBlocked) || !canSettle}
            title={
              writeBlocked ?? (!canSettle ? "Epoch still open" : undefined)
            }
            className="rounded-lg bg-btc/20 px-3 py-2 text-xs font-medium text-btc transition-colors hover:bg-btc/30 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Settle Epoch
          </button>
        </div>
      </section>

      <section className="rounded-xl border border-white/10 bg-graphite/80 p-5 shadow-glass">
        <div className="mb-4 flex items-center gap-2 text-white/70">
          <Route size={16} />
          <h3 className="text-sm font-semibold uppercase tracking-wider">
            Capital routing (live votes)
          </h3>
        </div>
        <div className="space-y-3">
          {GAUGES.map((gauge, idx) => {
            const share = shares[idx] ?? 0;
            const musd = (treasuryNum * share) / 100;
            return (
              <div key={gauge.label}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span className="text-white/80">{gauge.label}</span>
                    <span
                      className={`rounded-full border px-1.5 py-0.5 text-[9px] font-medium ${
                        CATEGORY_COLORS[gauge.category] ??
                        "text-white/40 border-white/10"
                      }`}
                    >
                      {gauge.category}
                    </span>
                  </span>
                  <span className="font-mono text-xs text-white/50">
                    {share.toFixed(1)}% ·{" "}
                    {musd.toLocaleString(undefined, {
                      maximumFractionDigits: 0,
                    })}{" "}
                    MUSD
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-btc to-musd"
                    style={{ width: `${Math.max(share, 0.5)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
        <p className="mt-4 text-xs leading-relaxed text-white/35">
          Shares are computed from live on-chain vote weight per gauge. At epoch
          settlement the treasury is distributed in exactly these proportions —
          MEZO holders steer where Bitcoin-backed MUSD flows.
        </p>
      </section>
    </div>
  );
}
