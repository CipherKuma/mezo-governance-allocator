import { useState } from "react";
import { useAccount } from "wagmi";
import { TrendingUp, Info } from "lucide-react";
import {
  useVotingPower,
  useIsVerifiedVoter,
  useTreasuryBalance,
  useWriteAllocator,
  useHasGas,
  formatEther,
} from "../hooks/useAllocatorContract";
import { GAUGES, CATEGORY_COLORS } from "../lib/gauges";
import { RegisterVoterCard } from "./RegisterVoterCard";

export function VotePanel() {
  const { address, isConnected } = useAccount();
  const { data: votingPower, refetch: refetchPower } = useVotingPower(address);
  const { data: isVerified, refetch: refetchVerified } =
    useIsVerifiedVoter(address);
  const { data: treasury } = useTreasuryBalance();
  const { castVote, isPending } = useWriteAllocator();
  const { hasGas } = useHasGas();

  const [weights, setWeights] = useState([3000, 2000, 1500, 3500]);
  const totalWeight = weights.reduce((s, w) => s + w, 0);
  const isValid = totalWeight === 10000;

  const treasuryNum = treasury ? Number(formatEther(treasury)) : 0;
  const powerFormatted = votingPower
    ? Number(formatEther(votingPower)).toLocaleString(undefined, {
        maximumFractionDigits: 2,
      })
    : "0";

  function updateWeight(idx: number, val: number) {
    setWeights((prev) => {
      const next = [...prev];
      next[idx] = val;
      return next;
    });
  }

  async function handleVote() {
    await castVote(
      GAUGES.map((g) => g.id),
      weights.map((w) => BigInt(w)),
    );
  }

  // Precise, honest reason the write path is unavailable.
  const blockedReason = !isConnected
    ? "Connect a Mezo wallet to cast a vote"
    : !hasGas
      ? "Need testnet BTC for gas to vote"
      : !isVerified
        ? "Awaiting voter registration (Sybil gate)"
        : !votingPower || votingPower === 0n
          ? "Lock MEZO to gain veMEZO voting power"
          : !isValid
            ? `Weights must sum to 10000 (currently ${totalWeight})`
            : null;

  return (
    <div className="space-y-5">
      {isConnected && address && !isVerified && (
        <RegisterVoterCard
          address={address}
          onRegistered={() => refetchVerified()}
        />
      )}

      <div className="rounded-xl border border-white/10 bg-graphite/80 p-4 shadow-glass">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white/50">
            <TrendingUp size={16} />
            <span className="text-sm">
              Your veMEZO power:{" "}
              <span className="font-semibold text-white">{powerFormatted}</span>
            </span>
          </div>
          <span
            className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
              isValid
                ? "border border-musd/20 bg-musd/5 text-musd"
                : "border border-red-500/20 bg-red-500/5 text-red-400"
            }`}
          >
            {totalWeight} / 10000 bps
          </span>
        </div>
        <p className="mt-2 flex items-center gap-1.5 text-xs text-white/35">
          <Info size={12} />
          Set how the {treasuryNum.toLocaleString()} MUSD treasury is routed
          next epoch. Preview is live; casting writes on-chain.
        </p>
      </div>

      <div className="space-y-3">
        {GAUGES.map((gauge, idx) => {
          const musdShare = (treasuryNum * weights[idx]) / 10000;
          return (
            <div
              key={gauge.label}
              className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4"
            >
              <div className="mb-1 flex items-center justify-between">
                <span className="text-sm font-medium">{gauge.label}</span>
                <span className="font-mono text-sm text-btc">
                  {(weights[idx] / 100).toFixed(1)}%
                </span>
              </div>
              <div className="mb-3 flex items-center gap-2">
                <span
                  className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${
                    CATEGORY_COLORS[gauge.category] ??
                    "text-white/40 border-white/10"
                  }`}
                >
                  {gauge.category}
                </span>
                <span className="text-[11px] text-white/35">
                  ≈{" "}
                  {musdShare.toLocaleString(undefined, {
                    maximumFractionDigits: 0,
                  })}{" "}
                  MUSD next epoch
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={10000}
                step={100}
                value={weights[idx]}
                onChange={(e) => updateWeight(idx, Number(e.target.value))}
                className="w-full accent-btc"
              />
            </div>
          );
        })}
      </div>

      <button
        onClick={handleVote}
        disabled={Boolean(blockedReason) || isPending}
        title={blockedReason ?? undefined}
        className="w-full rounded-xl bg-btc px-4 py-3 text-sm font-semibold text-black transition-colors hover:bg-btc/90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {isPending ? "Casting vote…" : (blockedReason ?? "Cast Vote On-Chain")}
      </button>
    </div>
  );
}
