import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, KeyRound, Loader2, Wallet } from "lucide-react";
import { MEZO_NETWORK } from "../lib/mezo";
import { getInitialWalletAuthState, requestMezoWalletAuth, type WalletAuthState } from "../lib/wallet-auth";

const statusLabel: Record<WalletAuthState["status"], string> = {
  "wallet-unavailable": "Wallet unavailable",
  ready: "Wallet ready",
  connecting: "Connecting wallet",
  "wrong-chain": "Wrong chain",
  signing: "Signature required",
  connected: "Wallet verified",
  failed: "Wallet auth failed"
};

export function WalletAuthPanel() {
  const initialState = useMemo(() => getInitialWalletAuthState(), []);
  const [auth, setAuth] = useState<WalletAuthState>(initialState);
  const canConnect = auth.status !== "wallet-unavailable" && auth.status !== "connecting" && auth.status !== "signing";

  async function onConnect() {
    setAuth((current) => ({ ...current, status: "connecting", error: undefined }));
    try {
      const nextAuth = await requestMezoWalletAuth();
      setAuth(nextAuth);
    } catch (error) {
      setAuth({
        status: "failed",
        error: error instanceof Error ? error.message : "Wallet auth failed."
      });
    }
  }

  const connected = auth.status === "connected";

  return (
    <section className="rounded-lg border border-white/10 bg-black/55 p-4" aria-labelledby="wallet-auth-heading">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div id="wallet-auth-heading" className="flex items-center gap-2 text-sm font-semibold text-white">
            <Wallet size={17} className={connected ? "text-musd" : "text-btc"} />
            Web3 auth and network gate
          </div>
          <p className="mt-1 max-w-xl text-xs leading-5 text-white/52">
            Live allocation testing requires wallet control, Mezo testnet chain verification, and a signed readiness
            message before any transaction path is treated as real.
          </p>
        </div>
        <span
          className={
            connected
              ? "inline-flex items-center gap-2 rounded-full border border-musd/30 bg-musd/10 px-3 py-1 text-xs text-musd"
              : "inline-flex items-center gap-2 rounded-full border border-btc/30 bg-btc/10 px-3 py-1 text-xs text-btc"
          }
        >
          {connected ? <CheckCircle2 size={13} /> : <AlertTriangle size={13} />}
          {statusLabel[auth.status]}
        </span>
      </div>

      <div className="grid gap-2 text-sm sm:grid-cols-3">
        <Fact label="Required chain" value={`${MEZO_NETWORK.name} (${MEZO_NETWORK.id})`} />
        <Fact label="Account" value={auth.account ? shorten(auth.account) : "Not connected"} mono={Boolean(auth.account)} />
        <Fact label="Signature" value={auth.signature ? `${auth.signature.slice(0, 14)}...` : "Not signed"} mono={Boolean(auth.signature)} />
      </div>

      {auth.error ? (
        <div className="mt-4 rounded-lg border border-btc/20 bg-btc/10 p-3 text-xs leading-5 text-white/66" role="status">
          {auth.error}
        </div>
      ) : null}

      {auth.message ? (
        <div className="mt-4 rounded-lg border border-musd/20 bg-musd/10 p-3 text-xs leading-5 text-white/66">
          Signed message recorded for this browser session. Use contract/RPC proof before calling the receipt live.
        </div>
      ) : null}

      <button
        type="button"
        onClick={onConnect}
        disabled={!canConnect}
        className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-ivory px-5 py-3 text-sm font-semibold text-black transition enabled:hover:bg-white disabled:cursor-not-allowed disabled:bg-white/12 disabled:text-white/38"
      >
        {auth.status === "connecting" || auth.status === "signing" ? <Loader2 size={16} className="animate-spin" /> : <KeyRound size={16} />}
        Connect and sign
      </button>
    </section>
  );
}

function Fact({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-md bg-white/[0.03] px-3 py-2">
      <div className="text-xs text-white/42">{label}</div>
      <div className={mono ? "mt-1 truncate font-mono text-xs text-white" : "mt-1 truncate text-white"}>{value}</div>
    </div>
  );
}

function shorten(value: string) {
  return `${value.slice(0, 6)}...${value.slice(-4)}`;
}
