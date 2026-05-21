import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { ShieldCheck, Wallet } from "lucide-react";
import { useIsVerifiedVoter } from "../hooks/useAllocatorContract";

export function WalletAuthPanel() {
  const { address, isConnected, chain } = useAccount();
  const { data: isVerified } = useIsVerifiedVoter(address);

  return (
    <section className="rounded-xl border border-ivory/10 bg-graphite/80 p-5 shadow-glass">
      <div className="mb-3 flex items-center gap-2 text-ivory/70">
        <Wallet size={18} />
        <h3 className="text-sm font-semibold uppercase tracking-wider">
          Mezo Passport
        </h3>
      </div>

      <div className="mb-3">
        <ConnectButton
          showBalance={true}
          chainStatus="icon"
          accountStatus="address"
        />
      </div>

      {isConnected && (
        <div className="flex items-center gap-3 text-xs text-ivory/50">
          <span>Chain: {chain?.name ?? "Unknown"}</span>
          {isVerified ? (
            <span className="flex items-center gap-1 rounded-full bg-musd/10 px-2 py-0.5 text-musd">
              <ShieldCheck size={12} />
              Verified Voter
            </span>
          ) : (
            <span className="rounded-full bg-ivory/5 px-2 py-0.5 text-ivory/40">
              Not Verified
            </span>
          )}
        </div>
      )}
    </section>
  );
}
