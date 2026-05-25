import { useState } from "react";
import { Lock, Unlock, TrendingUp } from "lucide-react";
import { useAccount } from "wagmi";
import {
  useVotingPower,
  useUserLock,
  useTokenBalance,
  useContractAddresses,
  useWriteAllocator,
  useHasGas,
  formatEther,
  parseEther,
} from "../hooks/useAllocatorContract";

export function LockPanel() {
  const { address } = useAccount();
  const { mockMezoAddress } = useContractAddresses();
  const { data: mezoBalance } = useTokenBalance(mockMezoAddress, address);
  const { data: votingPower } = useVotingPower(address);
  const { data: lockData } = useUserLock(address);
  const { lockMezo, isPending } = useWriteAllocator();
  const { hasGas } = useHasGas();

  const [lockAmount, setLockAmount] = useState("1000");
  const [lockDays, setLockDays] = useState(180);

  const balanceFormatted = mezoBalance
    ? Number(formatEther(mezoBalance)).toLocaleString(undefined, {
        maximumFractionDigits: 0,
      })
    : "0";

  const powerFormatted = votingPower
    ? Number(formatEther(votingPower)).toLocaleString(undefined, {
        maximumFractionDigits: 2,
      })
    : "0";

  const hasLock = lockData && lockData[0] > 0n;
  const lockExpiry = hasLock
    ? new Date(Number(lockData[1]) * 1000).toLocaleDateString()
    : null;
  const lockedAmount = hasLock
    ? Number(formatEther(lockData[0])).toLocaleString(undefined, {
        maximumFractionDigits: 0,
      })
    : null;

  async function handleLock() {
    const amount = parseEther(lockAmount);
    await lockMezo(amount, BigInt(lockDays));
  }

  return (
    <section className="rounded-xl border border-btc/20 bg-graphite/80 p-5 shadow-glass">
      <div className="mb-4 flex items-center gap-2 text-btc">
        <Lock size={18} />
        <h3 className="text-sm font-semibold uppercase tracking-wider">
          veMEZO Lock
        </h3>
      </div>

      {hasLock && (
        <div className="mb-4 rounded-lg border border-btc/10 bg-btc/5 p-3">
          <div className="mb-1 text-xs text-ivory/50">Active Lock</div>
          <div className="text-lg font-bold text-ivory">
            {lockedAmount} MEZO
          </div>
          <div className="flex items-center justify-between text-xs text-ivory/50">
            <span>Expires {lockExpiry}</span>
            <span className="flex items-center gap-1 text-musd">
              <TrendingUp size={12} />
              {powerFormatted} veMEZO
            </span>
          </div>
        </div>
      )}

      <div className="mb-3 text-xs text-ivory/50">
        Balance: {balanceFormatted} MEZO
      </div>

      <div className="mb-3">
        <label className="mb-1 block text-xs text-ivory/40">
          Lock Amount (MEZO)
        </label>
        <input
          type="text"
          inputMode="numeric"
          value={lockAmount}
          onChange={(e) => {
            const v = e.target.value.replace(/[^0-9]/g, "");
            setLockAmount(v);
          }}
          className="w-full rounded-lg border border-ivory/10 bg-graphite px-3 py-2 text-sm text-ivory outline-none focus:border-btc/40"
        />
      </div>

      <div className="mb-4">
        <div className="mb-1 flex items-center justify-between text-xs text-ivory/40">
          <span>Lock Duration</span>
          <span className="text-btc">{lockDays} days</span>
        </div>
        <input
          type="range"
          min={7}
          max={1456}
          step={7}
          value={lockDays}
          onChange={(e) => setLockDays(Number(e.target.value))}
          className="w-full accent-btc"
        />
        <div className="flex justify-between text-[10px] text-ivory/30">
          <span>1 week</span>
          <span>4 years</span>
        </div>
      </div>

      <button
        onClick={handleLock}
        disabled={isPending || !hasGas || !lockAmount || lockAmount === "0"}
        className="w-full rounded-lg bg-btc px-4 py-2.5 text-sm font-semibold text-graphite transition-colors hover:bg-btc/90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {isPending ? "Locking..." : "Lock MEZO → veMEZO"}
      </button>
    </section>
  );
}
