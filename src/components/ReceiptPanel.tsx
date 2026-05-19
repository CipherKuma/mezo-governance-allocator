import { ExternalLink, FileCheck2 } from "lucide-react";
import type { VoteReceipt } from "../lib/allocator";

type Props = {
  receipt: VoteReceipt;
  explorerUrl?: string;
  allocatorAddress?: string;
};

const modeLabel = {
  fixture: "Fixture receipt",
  "live-testnet": "Mezo testnet receipt"
};

export function ReceiptPanel({ receipt, explorerUrl, allocatorAddress }: Props) {
  return (
    <aside className="rounded-lg border border-white/10 bg-black/55 p-4">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-white">
          <FileCheck2 size={17} className="text-btc" />
          Allocation receipt
        </div>
        <span className="rounded-full border border-btc/30 bg-btc/10 px-3 py-1 text-xs text-btc">
          {modeLabel[receipt.mode]}
        </span>
      </div>

      <div className="space-y-2 text-sm">
        <Row label="Event" value="AllocationUpdated" />
        <Row label="Position" value={`#${receipt.positionId}`} />
        <Row label="Leading gauge" value={receipt.leadingGauge} />
        <Row label="Weight" value={`${receipt.leadingWeightBps} bps`} />
        <Row label="Chain" value={String(receipt.chainId)} />
        <Row label="Contract" value={receipt.contractAddress} mono />
        {allocatorAddress ? <Row label="Configured allocator" value={allocatorAddress} mono /> : null}
        <Row label="Tx" value={receipt.txHash} mono />
      </div>

      <div className="mt-4 rounded-lg border border-white/10 bg-white/[0.035] p-3 text-xs leading-5 text-white/55">
        {receipt.mode === "live-testnet"
          ? "This receipt is backed by a Mezo testnet transaction."
          : "This is fixture demo data, not a contract transaction. It keeps the demo honest while the funded deployer/profile lane is blocked."}
      </div>

      {explorerUrl ? (
        <a href={explorerUrl} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-musd">
          View on explorer <ExternalLink size={15} />
        </a>
      ) : null}
    </aside>
  );
}

function Row({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="grid grid-cols-[0.35fr_0.65fr] gap-3 rounded-md bg-white/[0.03] px-3 py-2">
      <span className="text-white/42">{label}</span>
      <span className={mono ? "truncate font-mono text-xs text-white" : "truncate text-white"}>{value}</span>
    </div>
  );
}
