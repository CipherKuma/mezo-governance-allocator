import { Eye } from "lucide-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export function WalletGate() {
  return (
    <div className="mb-6 rounded-xl border border-musd/20 bg-musd/[0.06] p-4">
      <div className="mb-2 flex items-center gap-2 text-musd">
        <Eye size={16} />
        <span className="text-sm font-semibold">Read-only demo mode</span>
      </div>
      <p className="mb-3 text-sm leading-relaxed text-white/50">
        Every number on this screen is read live from the Borealis contract on
        Mezo testnet — no mock data. Connect a Mezo wallet to lock MEZO, cast
        gauge votes, and settle epochs. Write actions stay disabled until a
        wallet with BTC for gas is connected.
      </p>
      <ConnectButton.Custom>
        {({ openConnectModal }) => (
          <button
            onClick={openConnectModal}
            className="inline-flex items-center gap-1.5 rounded-lg bg-musd/15 px-3 py-2 text-xs font-medium text-musd transition-colors hover:bg-musd/25"
          >
            Connect Mezo Wallet
          </button>
        )}
      </ConnectButton.Custom>
    </div>
  );
}
