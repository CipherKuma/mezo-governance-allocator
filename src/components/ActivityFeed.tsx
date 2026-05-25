import { useEffect, useState } from "react";
import { usePublicClient } from "wagmi";
import { formatEther, parseEventLogs, type Address } from "viem";
import {
  Lock,
  Vote,
  Landmark,
  CheckCircle2,
  PlusCircle,
  UserCheck,
  Unlock,
  Radio,
  ExternalLink,
} from "lucide-react";
import { ALLOCATOR_ADDRESS, explorerTx } from "../lib/live-proof";

const EVENTS_ABI = [
  {
    type: "event",
    name: "MezoLocked",
    inputs: [
      { indexed: true, name: "user", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "unlockTime", type: "uint256" },
      { name: "votingPower", type: "uint256" },
    ],
  },
  {
    type: "event",
    name: "MezoUnlocked",
    inputs: [
      { indexed: true, name: "user", type: "address" },
      { name: "amount", type: "uint256" },
    ],
  },
  {
    type: "event",
    name: "VoterRegistered",
    inputs: [{ indexed: true, name: "voter", type: "address" }],
  },
  {
    type: "event",
    name: "GaugeRegistered",
    inputs: [
      { indexed: true, name: "gaugeId", type: "uint256" },
      { name: "label", type: "string" },
      { name: "recipient", type: "address" },
    ],
  },
  {
    type: "event",
    name: "VoteCast",
    inputs: [
      { indexed: true, name: "voter", type: "address" },
      { indexed: true, name: "epoch", type: "uint256" },
      { name: "votingPower", type: "uint256" },
    ],
  },
  {
    type: "event",
    name: "TreasuryDeposited",
    inputs: [
      { indexed: true, name: "depositor", type: "address" },
      { name: "amount", type: "uint256" },
    ],
  },
  {
    type: "event",
    name: "EpochSettled",
    inputs: [
      { indexed: true, name: "epoch", type: "uint256" },
      { name: "totalDistributed", type: "uint256" },
      { name: "gaugeCount", type: "uint256" },
    ],
  },
] as const;

type Row = {
  key: string;
  icon: typeof Lock;
  text: string;
  actor: string;
  tx: string;
  block: bigint;
  color: string;
};

const short = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`;
const amt = (v: bigint) =>
  Number(formatEther(v)).toLocaleString(undefined, {
    maximumFractionDigits: 0,
  });

function describe(log: {
  eventName: string;
  args: Record<string, unknown>;
  transactionHash: string;
  blockNumber: bigint;
}): Row {
  const a = log.args;
  const base = {
    key: `${log.transactionHash}-${log.eventName}`,
    tx: log.transactionHash,
    block: log.blockNumber,
  };
  switch (log.eventName) {
    case "MezoLocked":
      return {
        ...base,
        icon: Lock,
        color: "text-btc",
        actor: short(a.user as string),
        text: `locked ${amt(a.amount as bigint)} MEZO → veMEZO`,
      };
    case "MezoUnlocked":
      return {
        ...base,
        icon: Unlock,
        color: "text-white/60",
        actor: short(a.user as string),
        text: `unlocked ${amt(a.amount as bigint)} MEZO`,
      };
    case "VoterRegistered":
      return {
        ...base,
        icon: UserCheck,
        color: "text-sky-400",
        actor: short(a.voter as string),
        text: "registered as verified voter",
      };
    case "GaugeRegistered":
      return {
        ...base,
        icon: PlusCircle,
        color: "text-violet-400",
        actor: "owner",
        text: `registered gauge “${a.label as string}”`,
      };
    case "VoteCast":
      return {
        ...base,
        icon: Vote,
        color: "text-musd",
        actor: short(a.voter as string),
        text: `cast a vote (power ${amt(a.votingPower as bigint)})`,
      };
    case "TreasuryDeposited":
      return {
        ...base,
        icon: Landmark,
        color: "text-musd",
        actor: short(a.depositor as string),
        text: `deposited ${amt(a.amount as bigint)} MUSD to treasury`,
      };
    case "EpochSettled":
      return {
        ...base,
        icon: CheckCircle2,
        color: "text-emerald-400",
        actor: "epoch",
        text: `settled epoch #${a.epoch} — ${amt(a.totalDistributed as bigint)} MUSD distributed`,
      };
    default:
      return {
        ...base,
        icon: Radio,
        color: "text-white/50",
        actor: "—",
        text: log.eventName,
      };
  }
}

export function ActivityFeed() {
  const client = usePublicClient();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!client) return;
      try {
        const latest = await client.getBlockNumber();
        // Mezo RPC caps getLogs at a 10,000-block range; stay safely under it.
        const from = latest > 9000n ? latest - 9000n : 0n;
        const logs = await client.getLogs({
          address: ALLOCATOR_ADDRESS as Address,
          fromBlock: from,
          toBlock: "latest",
        });
        const parsed = parseEventLogs({
          abi: EVENTS_ABI,
          logs,
        }) as unknown as Array<{
          eventName: string;
          args: Record<string, unknown>;
          transactionHash: string;
          blockNumber: bigint;
        }>;
        const mapped = parsed
          .map(describe)
          .sort((a, b) => Number(b.block - a.block))
          .slice(0, 12);
        if (!cancelled) setRows(mapped);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [client]);

  return (
    <section className="rounded-xl border border-white/10 bg-graphite/80 p-5 shadow-glass">
      <div className="mb-4 flex items-center gap-2 text-white/70">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
        </span>
        <h3 className="text-sm font-semibold uppercase tracking-wider">
          Live on-chain activity
        </h3>
      </div>
      {loading ? (
        <p className="py-6 text-center text-sm text-white/30">
          Reading contract events…
        </p>
      ) : rows.length === 0 ? (
        <p className="py-6 text-center text-sm text-white/30">
          No recent events in range.
        </p>
      ) : (
        <ul className="space-y-1">
          {rows.map((r) => {
            const Icon = r.icon;
            return (
              <li key={r.key}>
                <a
                  href={explorerTx(r.tx)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-white/[0.03]"
                >
                  <Icon size={15} className={r.color} />
                  <span className="text-sm text-white/70">
                    <span className="font-mono text-white/90">{r.actor}</span>{" "}
                    {r.text}
                  </span>
                  <span className="ml-auto flex items-center gap-1 font-mono text-[11px] text-white/30 group-hover:text-btc">
                    #{r.block.toString()}
                    <ExternalLink size={11} />
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
