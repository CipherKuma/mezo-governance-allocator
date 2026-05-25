import { useEffect, useState } from "react";
import { usePublicClient } from "wagmi";
import {
  ShieldCheck,
  ShieldAlert,
  ExternalLink,
  Check,
  X,
  Loader2,
  RefreshCw,
} from "lucide-react";
import {
  verifyLiveProof,
  explorerAddress,
  explorerTx,
  ALLOCATOR_ADDRESS,
  CANONICAL,
  type LiveProof,
} from "../lib/live-proof";
import { formatEther } from "viem";

export function LiveProofPanel() {
  const client = usePublicClient();
  const [proof, setProof] = useState<LiveProof | null>(null);
  const [loading, setLoading] = useState(true);

  async function run() {
    if (!client) return;
    setLoading(true);
    const result = await verifyLiveProof(client);
    setProof(result);
    setLoading(false);
  }

  useEffect(() => {
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client]);

  const treasury = proof?.treasuryBalance
    ? Number(formatEther(proof.treasuryBalance)).toLocaleString(undefined, {
        maximumFractionDigits: 0,
      })
    : "—";

  return (
    <section className="space-y-4">
      <div className="rounded-xl border border-white/10 bg-graphite/80 p-5 shadow-glass">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {loading ? (
              <Loader2 size={18} className="animate-spin text-white/50" />
            ) : proof?.verified ? (
              <ShieldCheck size={18} className="text-emerald-400" />
            ) : (
              <ShieldAlert size={18} className="text-amber-400" />
            )}
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              {loading
                ? "Verifying against Mezo RPC…"
                : proof?.verified
                  ? "Mezo testnet verified"
                  : "Verification incomplete"}
            </h3>
          </div>
          <button
            onClick={run}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 px-2.5 py-1.5 text-xs text-white/50 transition-colors hover:text-white/80 disabled:opacity-40"
          >
            <RefreshCw size={12} />
            Re-verify
          </button>
        </div>

        <p className="mb-4 text-sm leading-relaxed text-white/50">
          Every check below runs live against{" "}
          <span className="text-white/70">rpc.test.mezo.org</span> in your
          browser. Nothing here is cached or mocked.
        </p>

        <div className="space-y-1.5">
          {proof?.checks.map((c) => (
            <div
              key={c.name}
              className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-black/30 px-3 py-2"
            >
              <span className="flex items-center gap-2 text-sm text-white/70">
                {c.ok ? (
                  <Check size={14} className="text-emerald-400" />
                ) : (
                  <X size={14} className="text-rose-400" />
                )}
                {c.name}
              </span>
              <span className="font-mono text-xs text-white/40">
                {c.detail}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Metric label="MUSD treasury (on-chain)" value={`${treasury} MUSD`} />
        <Metric
          label="Current epoch"
          value={proof?.currentEpoch != null ? `#${proof.currentEpoch}` : "—"}
        />
        <Metric
          label="Gauges registered"
          value={proof?.gaugeCount != null ? String(proof.gaugeCount) : "—"}
        />
        <Metric
          label="Vote tx status"
          value={proof?.voteTx?.status ?? "—"}
          accent={proof?.voteTx?.status === "success"}
        />
      </div>

      <div className="rounded-xl border border-white/10 bg-graphite/80 p-5 shadow-glass">
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/40">
          On-chain references
        </h4>
        <ProofLink
          label="Allocator contract"
          value={ALLOCATOR_ADDRESS}
          href={explorerAddress(ALLOCATOR_ADDRESS)}
        />
        <ProofLink
          label="Last vote transaction"
          value={CANONICAL.voteTxHash}
          href={explorerTx(CANONICAL.voteTxHash)}
        />
        {proof?.voteTx?.blockNumber != null && (
          <ProofLink
            label="Settled in block"
            value={String(proof.voteTx.blockNumber)}
            href={`${explorerTx(CANONICAL.voteTxHash)}`}
          />
        )}
      </div>
    </section>
  );
}

function Metric({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-graphite/80 p-4 shadow-glass">
      <div className="mb-1 text-[11px] uppercase tracking-wider text-white/35">
        {label}
      </div>
      <div
        className={`text-xl font-bold capitalize ${accent ? "text-emerald-400" : "text-ivory"}`}
      >
        {value}
      </div>
    </div>
  );
}

function ProofLink({
  label,
  value,
  href,
}: {
  label: string;
  value: string;
  href: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group mb-1.5 flex items-center justify-between rounded-lg border border-white/[0.06] bg-black/30 px-3 py-2.5 transition-colors hover:border-btc/30"
    >
      <span className="text-xs text-white/50">{label}</span>
      <span className="flex items-center gap-1.5 font-mono text-xs text-white/70 group-hover:text-btc">
        {value.length > 22 ? `${value.slice(0, 10)}…${value.slice(-8)}` : value}
        <ExternalLink size={12} />
      </span>
    </a>
  );
}
