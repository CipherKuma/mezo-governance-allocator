import { describe, expect, it } from "vitest";
import type { PublicClient } from "viem";
import {
  verifyLiveProof,
  CANONICAL,
  MEZO_CHAIN_ID,
} from "../src/lib/live-proof";

// Build a fake PublicClient with controllable responses. No network calls —
// this exercises the parser/normalizer in verifyLiveProof deterministically.
function makeClient(overrides: Partial<Record<string, unknown>> = {}) {
  const reads: Record<string, bigint> = {
    treasuryBalance: 50000n * 10n ** 18n,
    currentEpoch: 1n,
    epochTimeRemaining: 0n,
    gaugeCount: 4n,
  };
  return {
    getChainId: async () => overrides.chainId ?? MEZO_CHAIN_ID,
    getBytecode: async () =>
      overrides.bytecode === undefined ? "0xabcdef" : overrides.bytecode,
    readContract: async ({ functionName }: { functionName: string }) => {
      if (overrides.readThrows) throw new Error("read reverted");
      return reads[functionName];
    },
    getTransactionReceipt: async () => {
      if (overrides.receiptThrows) throw new Error("tx not found");
      return {
        status: overrides.receiptStatus ?? "success",
        blockNumber: 13259078n,
        logs: [{}],
      };
    },
  } as unknown as PublicClient;
}

describe("verifyLiveProof", () => {
  it("reports verified=true when every check passes", async () => {
    const proof = await verifyLiveProof(makeClient());
    expect(proof.verified).toBe(true);
    expect(proof.chainId).toBe(MEZO_CHAIN_ID);
    expect(proof.hasCode).toBe(true);
    expect(proof.treasuryBalance).toBe(50000n * 10n ** 18n);
    expect(proof.gaugeCount).toBe(4n);
    expect(proof.voteTx?.status).toBe("success");
    expect(proof.checks.every((c) => c.ok)).toBe(true);
  });

  it("fails the RPC check on a wrong chain id", async () => {
    const proof = await verifyLiveProof(makeClient({ chainId: 1 }));
    expect(proof.verified).toBe(false);
    const rpcCheck = proof.checks.find((c) => c.name === "Mezo testnet RPC");
    expect(rpcCheck?.ok).toBe(false);
  });

  it("fails the deploy check when no bytecode exists", async () => {
    const proof = await verifyLiveProof(makeClient({ bytecode: "0x" }));
    expect(proof.hasCode).toBe(false);
    expect(proof.verified).toBe(false);
  });

  it("does not throw when contract reads revert — fails closed", async () => {
    const proof = await verifyLiveProof(makeClient({ readThrows: true }));
    expect(proof.verified).toBe(false);
    expect(proof.treasuryBalance).toBeNull();
    const stateCheck = proof.checks.find((c) => c.name === "On-chain state");
    expect(stateCheck?.ok).toBe(false);
  });

  it("marks the vote tx unknown when the receipt is missing", async () => {
    const proof = await verifyLiveProof(makeClient({ receiptThrows: true }));
    expect(proof.voteTx?.status).toBe("unknown");
    expect(proof.verified).toBe(false);
  });

  it("exposes the canonical vote tx hash", () => {
    expect(CANONICAL.voteTxHash).toMatch(/^0x[0-9a-f]{64}$/i);
    expect(CANONICAL.allocator).toMatch(/^0x[0-9a-f]{40}$/i);
  });
});
