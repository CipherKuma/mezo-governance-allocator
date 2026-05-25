import { useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useBalance } from "wagmi";
import {
  Landmark,
  Lock,
  Vote,
  Clock,
  Droplets,
  LogOut,
  Bitcoin,
  ShieldCheck,
  Home,
} from "lucide-react";
import { TreasuryPanel } from "../components/TreasuryPanel";
import { LockPanel } from "../components/LockPanel";
import { VotePanel } from "../components/VotePanel";
import { FaucetPanel } from "../components/FaucetPanel";
import { EpochPanel } from "../components/EpochPanel";
import { LiveProofPanel } from "../components/LiveProofPanel";
import { GasGate } from "../components/GasGate";
import { WalletGate } from "../components/WalletGate";
import { useHasGas } from "../hooks/useAllocatorContract";

type Section = "treasury" | "proof" | "lock" | "vote" | "epochs" | "faucet";

const navItems: { id: Section; label: string; icon: typeof Landmark }[] = [
  { id: "treasury", label: "Treasury", icon: Landmark },
  { id: "proof", label: "Live Proof", icon: ShieldCheck },
  { id: "lock", label: "Lock MEZO", icon: Lock },
  { id: "vote", label: "Vote", icon: Vote },
  { id: "epochs", label: "Epochs", icon: Clock },
  { id: "faucet", label: "Faucet", icon: Droplets },
];

export function Dashboard({
  readOnly,
  onExitDemo,
}: {
  readOnly: boolean;
  onExitDemo: () => void;
}) {
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
      <aside className="hidden w-[220px] flex-col border-r border-white/[0.06] bg-[hsl(0,0%,4%)] md:flex">
        <div className="flex items-center gap-2.5 px-5 py-5">
          <img
            src="/borealis.png"
            alt="Borealis"
            className="h-8 w-8 rounded-lg"
          />
          <span className="text-sm font-semibold tracking-tight">Borealis</span>
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
          {readOnly ? (
            <div className="flex flex-col gap-2">
              <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-btc/20 bg-btc/10 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-btc">
                Read-only demo
              </span>
              <ConnectButton.Custom>
                {({ openConnectModal }) => (
                  <button
                    onClick={openConnectModal}
                    className="rounded-lg bg-white/[0.06] px-3 py-2 text-xs font-medium text-white/80 transition-colors hover:bg-white/[0.1]"
                  >
                    Connect Mezo wallet
                  </button>
                )}
              </ConnectButton.Custom>
              <button
                onClick={onExitDemo}
                className="flex items-center gap-1.5 text-xs text-white/30 transition-colors hover:text-white/60"
              >
                <Home size={12} />
                Back to home
              </button>
            </div>
          ) : (
            <>
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
            </>
          )}
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        {/* Mobile top bar: logo + chain + horizontal nav (sidebar is hidden < md) */}
        <div className="sticky top-0 z-10 border-b border-white/[0.06] bg-[hsl(0,0%,5%)]/90 backdrop-blur-md md:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <span className="flex items-center gap-2 text-sm font-semibold">
              <img
                src="/borealis.png"
                alt="Borealis"
                className="h-6 w-6 rounded-md"
              />
              Borealis
            </span>
            <div className="flex items-center gap-1.5">
              <span className="rounded-full border border-musd/20 bg-musd/5 px-2 py-0.5 text-[10px] font-medium text-musd">
                31611
              </span>
              {readOnly ? (
                <ConnectButton.Custom>
                  {({ openConnectModal }) => (
                    <button
                      onClick={openConnectModal}
                      className="rounded-full bg-white/[0.08] px-2.5 py-0.5 text-[10px] font-medium text-white/80"
                    >
                      Connect
                    </button>
                  )}
                </ConnectButton.Custom>
              ) : (
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 font-mono text-[10px] text-white/60">
                  {shortAddr}
                </span>
              )}
            </div>
          </div>
          <nav className="flex gap-1 overflow-x-auto px-3 pb-2">
            {navItems.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActive(id)}
                className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  active === id
                    ? "bg-white/[0.1] text-white"
                    : "text-white/40 hover:text-white/70"
                }`}
              >
                <Icon size={13} />
                {label}
              </button>
            ))}
          </nav>
        </div>

        <header className="sticky top-0 z-10 hidden items-center justify-between border-b border-white/[0.06] bg-[hsl(0,0%,5%)]/80 px-6 py-4 backdrop-blur-md md:flex">
          <h2 className="text-lg font-semibold capitalize">
            {active === "lock"
              ? "Lock MEZO"
              : active === "proof"
                ? "Live Proof"
                : active}
          </h2>
          <div className="flex items-center gap-2">
            {!readOnly && (
              <span className="flex items-center gap-1.5 rounded-full border border-btc/20 bg-btc/5 px-2.5 py-1 text-[11px] font-medium text-btc">
                <Bitcoin size={12} />
                {btcFormatted} BTC
              </span>
            )}
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 font-mono text-[11px] text-white/60">
              {readOnly ? "demo · read-only" : shortAddr}
            </span>
            <span className="rounded-full border border-musd/20 bg-musd/5 px-2.5 py-1 text-[11px] font-medium text-musd">
              Chain 31611
            </span>
          </div>
        </header>

        <div className="mx-auto max-w-3xl px-4 py-6 md:px-6 md:py-8">
          {readOnly && active !== "proof" && <WalletGate />}
          {!readOnly && !hasGas && <GasGate />}
          {active === "treasury" && <TreasuryPanel />}
          {active === "proof" && <LiveProofPanel />}
          {active === "lock" && <LockPanel />}
          {active === "vote" && <VotePanel />}
          {active === "epochs" && <EpochPanel />}
          {active === "faucet" && <FaucetPanel />}
        </div>
      </main>
    </div>
  );
}
