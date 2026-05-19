import { describe, expect, it } from "vitest";
import {
  buildFixtureReceipt,
  calculateBaseVotingPower,
  calculateBoostMultiplier,
  calculateImpact,
  normalizeWeights,
  updateGaugeWeight
} from "../src/lib/allocator";
import { initialGauges, initialPosition } from "../src/lib/fixtures";
import { buildWalletAuthMessage, requestMezoWalletAuth, type EthereumProvider } from "../src/lib/wallet-auth";

describe("allocator math", () => {
  it("linearly decays veBTC base power by remaining lock days", () => {
    expect(calculateBaseVotingPower(1, 28)).toBe(1);
    expect(calculateBaseVotingPower(1, 14)).toBe(0.5);
    expect(calculateBaseVotingPower(1, 0)).toBe(0);
  });

  it("caps MEZO boost multiplier at 5x", () => {
    expect(calculateBoostMultiplier(0, 1)).toBe(1);
    expect(calculateBoostMultiplier(5_000, 1)).toBe(5);
    expect(calculateBoostMultiplier(50_000, 1)).toBe(5);
  });

  it("keeps proposed weights normalized to 10000 bps", () => {
    const updated = updateGaugeWeight(initialGauges, "ecosystem-grants", 3_800);
    const total = updated.reduce((sum, gauge) => sum + gauge.proposedWeightBps, 0);
    expect(total).toBe(10_000);
    expect(updated.find((gauge) => gauge.id === "ecosystem-grants")?.proposedWeightBps).toBe(3_800);
  });

  it("normalizes arbitrary bps values with rounding correction", () => {
    const normalized = normalizeWeights(initialGauges.map((gauge) => ({ ...gauge, proposedWeightBps: 1 })));
    expect(normalized.reduce((sum, gauge) => sum + gauge.proposedWeightBps, 0)).toBe(10_000);
  });

  it("recovers zeroed weights without producing NaN allocations", () => {
    const normalized = normalizeWeights(initialGauges.map((gauge) => ({ ...gauge, proposedWeightBps: 0 })));
    expect(normalized.reduce((sum, gauge) => sum + gauge.proposedWeightBps, 0)).toBe(10_000);
    expect(normalized.every((gauge) => Number.isFinite(gauge.proposedWeightBps))).toBe(true);
  });

  it("builds an honest fixture receipt from calculated leading gauge", () => {
    const gauges = updateGaugeWeight(initialGauges, "ecosystem-grants", 3_800);
    const impact = calculateImpact(gauges, initialPosition);
    const receipt = buildFixtureReceipt(gauges, initialPosition);

    expect(impact.leadingGaugeId).toBe("ecosystem-grants");
    expect(impact.totalEmissionShare).toBeGreaterThan(0);
    expect(receipt.mode).toBe("fixture");
    expect(receipt.contractAddress).toBe("fixture-only-not-deployed");
    expect(receipt.leadingGauge).toBe("ecosystem-grants");
    expect(receipt.emissionsDelta).toBe(impact.totalEmissionShare);
    expect(receipt.txHash).toMatch(/^fixture-/);
  });
});

describe("wallet auth helper", () => {
  it("returns a blocked state when no injected wallet is available", async () => {
    await expect(requestMezoWalletAuth(undefined)).resolves.toMatchObject({
      status: "wallet-unavailable"
    });
  });

  it("verifies account, Mezo chain, and signed message through an injected provider", async () => {
    const calls: string[] = [];
    const provider: EthereumProvider = {
      async request({ method }) {
        calls.push(method);
        if (method === "eth_requestAccounts") {
          return ["0x1111111111111111111111111111111111111111"];
        }
        if (method === "eth_chainId") {
          return "0x7b7b";
        }
        if (method === "personal_sign") {
          return "0xsigned-readiness-proof";
        }
        throw new Error(`Unexpected method ${method}`);
      }
    };

    const auth = await requestMezoWalletAuth(provider);
    expect(auth.status).toBe("connected");
    expect(auth.account).toBe("0x1111111111111111111111111111111111111111");
    expect(auth.chainId).toBe(31_611);
    expect(auth.signature).toBe("0xsigned-readiness-proof");
    expect(auth.message).toBe(buildWalletAuthMessage("0x1111111111111111111111111111111111111111"));
    expect(calls).toEqual(["eth_requestAccounts", "eth_chainId", "eth_chainId", "personal_sign"]);
  });
});
