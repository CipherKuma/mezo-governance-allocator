import type { PublicClient, Address, Hash } from "viem";
import { musdAllocatorAbi } from "./abis";

// Canonical Borealis deployment on Mezo testnet — verified on-chain 2026-05-25
// via scripts/verify-live-proof.mjs. Matches Vercel prod env + full-deployment.json.
// Env vars override at build time; these constants are the verified fallback.
export const MEZO_CHAIN_ID = 31611;
export const MEZO_EXPLORER = "https://explorer.test.mezo.org";

export const CANONICAL = {
  allocator: "0x1cdba6eec37d77d8994296a29fdc2c230cc0596a" as Address,
  mockMezo: "0x08b9caca9c9885d86d97d6928a3f44903a030778" as Address,
  mockMusd: "0xd6f43325a1103a16fccf268e28da053daadb755a" as Address,
  deployer: "0x86CA136dc8B2Ac6B10143Ed23AC361FCBbd6bFCa" as Address,
  voteTxHash:
    "0xabf4bd58b6b5a2fd39b932f9b2e0aa12e47550612c1457cdfe4baf672d919b16" as Hash,
};

function envAddr(raw: unknown, fallback: Address): Address {
  return typeof raw === "string" && /^0x[0-9a-fA-F]{40}$/.test(raw.trim())
    ? (raw.trim() as Address)
    : fallback;
}

export const ALLOCATOR_ADDRESS = envAddr(
  import.meta.env?.VITE_MUSD_ALLOCATOR_ADDRESS,
  CANONICAL.allocator,
);

export function explorerAddress(addr: string) {
  return `${MEZO_EXPLORER}/address/${addr}`;
}
export function explorerTx(hash: string) {
  return `${MEZO_EXPLORER}/tx/${hash}`;
}

export interface ProofCheck {
  name: string;
  ok: boolean;
  detail: string;
}

export interface LiveProof {
  verified: boolean;
  chainId: number | null;
  allocator: Address;
  hasCode: boolean;
  treasuryBalance: bigint | null;
  currentEpoch: bigint | null;
  epochTimeRemaining: bigint | null;
  gaugeCount: bigint | null;
  voteTx: {
    hash: Hash;
    status: "success" | "reverted" | "unknown";
    blockNumber: bigint | null;
    logs: number | null;
  } | null;
  checks: ProofCheck[];
}

// Validate the canonical deployment against the live Mezo RPC.
// Read-only; never throws — returns structured failure states instead.
export async function verifyLiveProof(
  client: PublicClient,
  allocator: Address = ALLOCATOR_ADDRESS,
): Promise<LiveProof> {
  const checks: ProofCheck[] = [];
  const result: LiveProof = {
    verified: false,
    chainId: null,
    allocator,
    hasCode: false,
    treasuryBalance: null,
    currentEpoch: null,
    epochTimeRemaining: null,
    gaugeCount: null,
    voteTx: null,
    checks,
  };

  try {
    result.chainId = await client.getChainId();
    const ok = result.chainId === MEZO_CHAIN_ID;
    checks.push({
      name: "Mezo testnet RPC",
      ok,
      detail: `chain id ${result.chainId}`,
    });
  } catch (e) {
    checks.push({ name: "Mezo testnet RPC", ok: false, detail: errMsg(e) });
  }

  try {
    const code = await client.getBytecode({ address: allocator });
    result.hasCode = Boolean(code && code.length > 2);
    checks.push({
      name: "Contract deployed",
      ok: result.hasCode,
      detail: result.hasCode ? "bytecode present" : "no code at address",
    });
  } catch (e) {
    checks.push({ name: "Contract deployed", ok: false, detail: errMsg(e) });
  }

  try {
    const [treasury, epoch, remaining, gauges] = await Promise.all([
      client.readContract({
        address: allocator,
        abi: musdAllocatorAbi,
        functionName: "treasuryBalance",
      }),
      client.readContract({
        address: allocator,
        abi: musdAllocatorAbi,
        functionName: "currentEpoch",
      }),
      client.readContract({
        address: allocator,
        abi: musdAllocatorAbi,
        functionName: "epochTimeRemaining",
      }),
      client.readContract({
        address: allocator,
        abi: musdAllocatorAbi,
        functionName: "gaugeCount",
      }),
    ]);
    result.treasuryBalance = treasury as bigint;
    result.currentEpoch = epoch as bigint;
    result.epochTimeRemaining = remaining as bigint;
    result.gaugeCount = gauges as bigint;
    checks.push({
      name: "On-chain state",
      ok: true,
      detail: `epoch ${epoch}, ${gauges} gauges`,
    });
  } catch (e) {
    checks.push({ name: "On-chain state", ok: false, detail: errMsg(e) });
  }

  try {
    const receipt = await client.getTransactionReceipt({
      hash: CANONICAL.voteTxHash,
    });
    result.voteTx = {
      hash: CANONICAL.voteTxHash,
      status: receipt.status,
      blockNumber: receipt.blockNumber,
      logs: receipt.logs.length,
    };
    checks.push({
      name: "Vote transaction",
      ok: receipt.status === "success",
      detail: `${receipt.status} @ block ${receipt.blockNumber}`,
    });
  } catch (e) {
    result.voteTx = {
      hash: CANONICAL.voteTxHash,
      status: "unknown",
      blockNumber: null,
      logs: null,
    };
    checks.push({ name: "Vote transaction", ok: false, detail: errMsg(e) });
  }

  result.verified = checks.every((c) => c.ok);
  return result;
}

function errMsg(e: unknown): string {
  if (e && typeof e === "object" && "shortMessage" in e) {
    return String((e as { shortMessage: unknown }).shortMessage);
  }
  return e instanceof Error ? e.message : String(e);
}
