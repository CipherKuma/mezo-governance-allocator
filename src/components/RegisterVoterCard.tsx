import { useState } from "react";
import { ShieldCheck, ExternalLink, Loader2, CheckCircle } from "lucide-react";

type RegState =
  | { step: "idle" }
  | { step: "pending" }
  | { step: "done"; txHash: string; explorerUrl: string }
  | { step: "error"; message: string }
  | { step: "already" };

export function RegisterVoterCard({
  address,
  onRegistered,
}: {
  address: string;
  onRegistered: () => void;
}) {
  const [state, setState] = useState<RegState>({ step: "idle" });

  async function handleRegister() {
    setState({ step: "pending" });
    try {
      const res = await fetch("/api/register-voter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address }),
      });
      const data = await res.json();

      if (data.status === "already_registered") {
        setState({ step: "already" });
        onRegistered();
        return;
      }
      if (data.status === "registered") {
        setState({
          step: "done",
          txHash: data.txHash,
          explorerUrl: data.explorerUrl,
        });
        onRegistered();
        return;
      }
      setState({
        step: "error",
        message: data.error ?? "Registration failed",
      });
    } catch (err) {
      setState({
        step: "error",
        message: err instanceof Error ? err.message : "Network error",
      });
    }
  }

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6">
      <div className="mb-3 flex items-center gap-2">
        <ShieldCheck size={20} className="text-btc" />
        <h3 className="text-sm font-semibold">Voter Registration</h3>
      </div>

      <p className="mb-4 text-sm leading-relaxed text-white/45">
        Your wallet is not yet a verified voter. Borealis uses an on-chain voter
        registry as a Sybil gate — only registered addresses can cast gauge
        votes. Click below to register in real-time; the transaction will be
        signed by the allocator admin and verified on Mezo testnet.
      </p>

      {state.step === "idle" && (
        <button
          onClick={handleRegister}
          className="w-full rounded-xl bg-btc px-4 py-3 text-sm font-semibold text-black transition-colors hover:bg-btc/90"
        >
          Register My Wallet as Voter
        </button>
      )}

      {state.step === "pending" && (
        <div className="flex items-center justify-center gap-2 rounded-xl bg-white/[0.04] py-3 text-sm text-white/60">
          <Loader2 size={16} className="animate-spin" />
          Registering on Mezo testnet…
        </div>
      )}

      {state.step === "done" && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-musd">
            <CheckCircle size={16} />
            Registered on-chain
          </div>
          <a
            href={state.explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-lg bg-musd/10 px-3 py-2 text-xs font-medium text-musd transition-colors hover:bg-musd/20"
          >
            View registration tx on Mezo Explorer
            <ExternalLink size={13} />
          </a>
          <p className="font-mono text-[10px] text-white/25 break-all">
            {state.txHash}
          </p>
        </div>
      )}

      {state.step === "already" && (
        <div className="flex items-center gap-2 text-sm text-musd">
          <CheckCircle size={16} />
          Already registered — you can vote now.
        </div>
      )}

      {state.step === "error" && (
        <div className="space-y-2">
          <p className="text-sm text-red-400">{state.message}</p>
          <button
            onClick={handleRegister}
            className="rounded-lg bg-white/[0.06] px-3 py-2 text-xs text-white/60 transition-colors hover:bg-white/[0.1]"
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );
}
