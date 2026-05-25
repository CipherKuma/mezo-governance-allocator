import { Droplets } from "lucide-react";
import { useAccount } from "wagmi";
import {
  useTokenBalance,
  useContractAddresses,
  useWriteAllocator,
  useHasGas,
  formatEther,
  parseEther,
} from "../hooks/useAllocatorContract";

export function FaucetPanel() {
  const { address } = useAccount();
  const { mockMezoAddress, mockMusdAddress } = useContractAddresses();
  const { data: mezoBalance } = useTokenBalance(mockMezoAddress, address);
  const { data: musdBalance } = useTokenBalance(mockMusdAddress, address);
  const { faucetMezo, faucetMusd, isPending } = useWriteAllocator();
  const { hasGas } = useHasGas();

  const fmt = (val: bigint | undefined) =>
    val
      ? Number(formatEther(val)).toLocaleString(undefined, {
          maximumFractionDigits: 0,
        })
      : "0";

  return (
    <section className="rounded-xl border border-ivory/10 bg-graphite/80 p-5 shadow-glass">
      <div className="mb-3 flex items-center gap-2 text-ivory/70">
        <Droplets size={18} />
        <h3 className="text-sm font-semibold uppercase tracking-wider">
          Testnet Faucet
        </h3>
      </div>

      <div className="mb-3 grid grid-cols-2 gap-3 text-sm">
        <div>
          <div className="text-xs text-ivory/40">MEZO</div>
          <div className="font-mono text-ivory">{fmt(mezoBalance)}</div>
        </div>
        <div>
          <div className="text-xs text-ivory/40">MUSD</div>
          <div className="font-mono text-musd">{fmt(musdBalance)}</div>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => faucetMezo(parseEther("10000"))}
          disabled={isPending || !hasGas}
          className="flex-1 rounded-lg border border-btc/20 px-3 py-2 text-xs font-medium text-btc transition-colors hover:bg-btc/10 disabled:cursor-not-allowed disabled:opacity-40"
        >
          +10K MEZO
        </button>
        <button
          onClick={() => faucetMusd(parseEther("10000"))}
          disabled={isPending || !hasGas}
          className="flex-1 rounded-lg border border-musd/20 px-3 py-2 text-xs font-medium text-musd transition-colors hover:bg-musd/10 disabled:cursor-not-allowed disabled:opacity-40"
        >
          +10K MUSD
        </button>
      </div>
    </section>
  );
}
