import { useState } from "react";
import { useAccount } from "wagmi";
import { Vote, ShieldCheck, TrendingUp } from "lucide-react";
import {
  useVotingPower,
  useIsVerifiedVoter,
  useWriteAllocator,
  useHasGas,
  formatEther,
} from "../hooks/useAllocatorContract";

const GAUGES = [
  { id: 1n, label: "BTC/MUSD Pool" },
  { id: 2n, label: "MUSD Savings" },
  { id: 3n, label: "Validator Yield" },
  { id: 4n, label: "Ecosystem Grants" },
];

export function VotePanel() {
  const { address } = useAccount();
  const { data: votingPower } = useVotingPower(address);
  const { data: isVerified } = useIsVerifiedVoter(address);
  const { castVote, isPending } = useWriteAllocator();
  const { hasGas } = useHasGas();

  const [weights, setWeights] = useState([3000, 2000, 1500, 3500]);

  const totalWeight = weights.reduce((s, w) => s + w, 0);
  const isValid = totalWeight === 10000;

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

  if (!isVerified) {
    return (
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-8 text-center">
        <ShieldCheck size={32} className="mx-auto mb-3 text-white/20" />
        <p className="text-sm text-white/40">
          Your address is not a verified voter.
        </p>
        <p className="mt-1 text-xs text-white/25">
          The contract owner must call registerVoter() for your address.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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

      <div className="space-y-4">
        {GAUGES.map((gauge, idx) => (
          <div
            key={gauge.label}
            className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4"
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium">{gauge.label}</span>
              <span className="font-mono text-sm text-btc">
                {(weights[idx] / 100).toFixed(1)}%
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
            <div className="mt-1 flex justify-between text-[10px] text-white/25">
              <span>0%</span>
              <span>100%</span>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleVote}
        disabled={
          isPending || !hasGas || !isValid || !votingPower || votingPower === 0n
        }
        className="w-full rounded-xl bg-btc px-4 py-3 text-sm font-semibold text-black transition-colors hover:bg-btc/90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {isPending
          ? "Casting vote..."
          : !isValid
            ? `Weights must sum to 10000 (currently ${totalWeight})`
            : "Cast Vote On-Chain"}
      </button>
    </div>
  );
}
