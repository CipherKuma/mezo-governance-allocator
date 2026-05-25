import { useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useBalance } from "wagmi";
import {
  Landmark,
  Lock,
  Vote,
  Clock,
  Droplets,
  RadioTower,
  LogOut,
  Bitcoin,
} from "lucide-react";
import { TreasuryPanel } from "../components/TreasuryPanel";
import { LockPanel } from "../components/LockPanel";
import { VotePanel } from "../components/VotePanel";
import { FaucetPanel } from "../components/FaucetPanel";
import { EpochPanel } from "../components/EpochPanel";
import { GasGate } from "../components/GasGate";
import { useHasGas } from "../hooks/useAllocatorContract";

type Section = "treasury" | "lock" | "vote" | "epochs" | "faucet";

const navItems: { id: Section; label: string; icon: typeof Landmark }[] = [
  { id: "treasury", label: "Treasury", icon: Landmark },
  { id: "lock", label: "Lock MEZO", icon: Lock },
  { id: "vote", label: "Vote", icon: Vote },
  { id: "epochs", label: "Epochs", icon: Clock },
  { id: "faucet", label: "Faucet", icon: Droplets },
];

export function Dashboard() {
  const [active, setActive] = useState<Section>("treasury");
  const { address } = useAccount();
  const { data: btcBalance } = useBalance({ address });
  const { hasGas } = useHasGas();

  const shortAddr = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : "";

  const btcFormatted = btcBalance
    ? (Number(btcBalance.value) / 10 ** btcBalance.decimals).toLocaleString(
        undefined,
        { maximumFractionDigits: 4 },
      )
    : "—";

  return (
    <div className="flex h-screen bg-[hsl(0,0%,5%)] text-white">
      <aside className="flex w-[220px] flex-col border-r border-white/[0.06] bg-[hsl(0,0%,4%)]">
        <div className="flex items-center gap-2.5 px-5 py-5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-btc/30 bg-btc/10 text-btc">
            <RadioTower size={15} />
          </span>
          <span className="text-sm font-semibold tracking-tight">
            Allocator
          </span>
        </div>

        <nav className="mt-2 flex flex-1 flex-col gap-0.5 px-3">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActive(id)}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-[13px] font-medium transition-colors ${
                active === id
                  ? "bg-white/[0.08] text-white"
                  : "text-white/40 hover:bg-white/[0.04] hover:text-white/70"
              }`}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </nav>

        <div className="border-t border-white/[0.06] px-4 py-4">
          <div className="mb-2 text-[10px] uppercase tracking-wider text-white/25">
            Connected
          </div>
          <div className="mb-3 font-mono text-xs text-white/60">
            {shortAddr}
          </div>
          <ConnectButton.Custom>
            {({ openAccountModal }) => (
              <button
                onClick={openAccountModal}
                className="flex items-center gap-1.5 text-xs text-white/30 transition-colors hover:text-white/60"
              >
                <LogOut size={12} />
                Manage
              </button>
            )}
          </ConnectButton.Custom>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-white/[0.06] bg-[hsl(0,0%,5%)]/80 px-6 py-4 backdrop-blur-md">
          <h2 className="text-lg font-semibold capitalize">
            {active === "lock" ? "Lock MEZO" : active}
          </h2>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full border border-btc/20 bg-btc/5 px-2.5 py-1 text-[11px] font-medium text-btc">
              <Bitcoin size={12} />
              {btcFormatted} BTC
            </span>
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 font-mono text-[11px] text-white/60">
              {shortAddr}
            </span>
            <span className="rounded-full border border-musd/20 bg-musd/5 px-2.5 py-1 text-[11px] font-medium text-musd">
              Chain 31611
            </span>
          </div>
        </header>

        <div className="mx-auto max-w-3xl px-6 py-8">
          {!hasGas && <GasGate />}
          {active === "treasury" && <TreasuryPanel />}
          {active === "lock" && <LockPanel />}
          {active === "vote" && <VotePanel />}
          {active === "epochs" && <EpochPanel />}
          {active === "faucet" && <FaucetPanel />}
        </div>
      </main>
    </div>
  );
}
