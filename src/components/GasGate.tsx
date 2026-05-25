import { AlertTriangle, ExternalLink } from "lucide-react";
import { BTC_FAUCET_URL } from "../hooks/useAllocatorContract";

export function GasGate() {
  return (
    <div className="mb-6 rounded-xl border border-amber-500/20 bg-amber-500/[0.06] p-4">
      <div className="mb-2 flex items-center gap-2 text-amber-400">
        <AlertTriangle size={16} />
        <span className="text-sm font-semibold">No BTC for gas</span>
      </div>
      <p className="mb-3 text-sm leading-relaxed text-white/50">
        Every transaction on Mezo is paid for in native BTC. Your wallet has no
        BTC, so transactions are disabled. Claim testnet BTC from the faucet,
        then return to use the app.
      </p>
      <a
        href={BTC_FAUCET_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500/15 px-3 py-2 text-xs font-medium text-amber-300 transition-colors hover:bg-amber-500/25"
      >
        Claim BTC from Mezo faucet
        <ExternalLink size={13} />
      </a>
    </div>
  );
}
