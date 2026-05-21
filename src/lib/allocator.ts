export type GaugeKind = "staking" | "validator" | "ecosystem" | "boost";

export type Gauge = {
  id: string;
  label: string;
  kind: GaugeKind;
  currentWeightBps: number;
  proposedWeightBps: number;
  feeApr: number;
  musdFlow: number;
  btcDepth: number;
};

export type Position = {
  tokenId: number;
  lockedBtc: number;
  daysRemaining: number;
  mezoBoost: number;
};

export type AllocationImpact = {
  baseVotingPower: number;
  boostMultiplier: number;
  effectiveVotingPower: number;
  leadingGaugeId: string;
  leadingWeightBps: number;
  totalEmissionShare: number;
  musdFlowDelta: number;
  btcDepthDelta: number;
};

export type VoteReceipt = {
  mode: "fixture" | "live-testnet";
  chainId: number;
  contractAddress: string;
  txHash: string;
  positionId: number;
  leadingGauge: string;
  leadingWeightBps: number;
  emissionsDelta: number;
  musdImpact: number;
  timestamp: string;
};

const MAX_LOCK_DAYS = 28;
const MAX_BOOST_MULTIPLIER = 5;
const BASE_EMISSIONS = 120_000;

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function calculateBaseVotingPower(
  lockedBtc: number,
  daysRemaining: number,
) {
  const timeWeight = clamp(daysRemaining / MAX_LOCK_DAYS, 0, 1);
  return round(lockedBtc * timeWeight, 4);
}

export function calculateBoostMultiplier(mezoBoost: number, lockedBtc: number) {
  if (lockedBtc <= 0) {
    return 1;
  }

  const mezoPerBtc = mezoBoost / lockedBtc;
  const multiplier =
    1 + clamp(mezoPerBtc / 5_000, 0, 1) * (MAX_BOOST_MULTIPLIER - 1);
  return round(multiplier, 2);
}

export function calculateEffectivePower(position: Position) {
  const baseVotingPower = calculateBaseVotingPower(
    position.lockedBtc,
    position.daysRemaining,
  );
  const boostMultiplier = calculateBoostMultiplier(
    position.mezoBoost,
    position.lockedBtc,
  );
  return {
    baseVotingPower,
    boostMultiplier,
    effectiveVotingPower: round(baseVotingPower * boostMultiplier, 4),
  };
}

export function normalizeWeights(gauges: Gauge[]) {
  if (gauges.length === 0) {
    return gauges;
  }

  const total = gauges.reduce((sum, gauge) => sum + gauge.proposedWeightBps, 0);
  if (total === 10_000) {
    return gauges;
  }

  if (total <= 0) {
    const baseWeight = Math.floor(10_000 / gauges.length);
    const diff = 10_000 - baseWeight * gauges.length;
    return gauges.map((gauge, index) => ({
      ...gauge,
      proposedWeightBps: index === 0 ? baseWeight + diff : baseWeight,
    }));
  }

  const scaled = gauges.map((gauge) => ({
    ...gauge,
    proposedWeightBps: Math.round((gauge.proposedWeightBps / total) * 10_000),
  }));

  const diff =
    10_000 - scaled.reduce((sum, gauge) => sum + gauge.proposedWeightBps, 0);
  return scaled.map((gauge, index) =>
    index === 0
      ? { ...gauge, proposedWeightBps: gauge.proposedWeightBps + diff }
      : gauge,
  );
}

export function updateGaugeWeight(
  gauges: Gauge[],
  gaugeId: string,
  nextWeightBps: number,
) {
  const clamped = clamp(Math.round(nextWeightBps), 0, 10_000);
  const target = gauges.find((gauge) => gauge.id === gaugeId);
  if (!target) {
    return gauges;
  }

  const otherTotal = gauges
    .filter((gauge) => gauge.id !== gaugeId)
    .reduce((sum, gauge) => sum + gauge.proposedWeightBps, 0);
  const remaining = 10_000 - clamped;

  const next = gauges.map((gauge) => {
    if (gauge.id === gaugeId) {
      return { ...gauge, proposedWeightBps: clamped };
    }

    const share =
      otherTotal > 0
        ? gauge.proposedWeightBps / otherTotal
        : 1 / (gauges.length - 1);
    return { ...gauge, proposedWeightBps: Math.round(remaining * share) };
  });

  return normalizeWeights(next);
}

export function calculateImpact(
  gauges: Gauge[],
  position: Position,
): AllocationImpact {
  const normalized = normalizeWeights(gauges);
  const power = calculateEffectivePower(position);
  const leading = [...normalized].sort(
    (a, b) => b.proposedWeightBps - a.proposedWeightBps,
  )[0];
  const leadingEmissionDelta =
    ((leading.proposedWeightBps - leading.currentWeightBps) / 10_000) *
    BASE_EMISSIONS;
  const musdFlowDelta = normalized.reduce(
    (sum, gauge) =>
      sum +
      ((gauge.proposedWeightBps - gauge.currentWeightBps) / 10_000) *
        gauge.musdFlow,
    0,
  );
  const btcDepthDelta = normalized.reduce(
    (sum, gauge) =>
      sum +
      ((gauge.proposedWeightBps - gauge.currentWeightBps) / 10_000) *
        gauge.btcDepth,
    0,
  );

  return {
    ...power,
    leadingGaugeId: leading.id,
    leadingWeightBps: leading.proposedWeightBps,
    totalEmissionShare: round(leadingEmissionDelta * power.boostMultiplier, 2),
    musdFlowDelta: round(musdFlowDelta * power.boostMultiplier, 2),
    btcDepthDelta: round(btcDepthDelta * power.boostMultiplier, 4),
  };
}

export function buildFixtureReceipt(
  gauges: Gauge[],
  position: Position,
): VoteReceipt {
  const impact = calculateImpact(gauges, position);
  const hashSeed = `${position.tokenId}:${impact.leadingGaugeId}:${impact.leadingWeightBps}:${position.mezoBoost}`;
  return {
    mode: "fixture",
    chainId: 31611,
    contractAddress: "fixture-only-not-deployed",
    txHash: `fixture-${stableHash(hashSeed)}`,
    positionId: position.tokenId,
    leadingGauge: impact.leadingGaugeId,
    leadingWeightBps: impact.leadingWeightBps,
    emissionsDelta: impact.totalEmissionShare,
    musdImpact: impact.musdFlowDelta,
    timestamp: new Date().toISOString(),
  };
}

export const VEMEZO_MAX_LOCK_DAYS = 1456;

export function calculateVeMezoWeight(
  lockedMezo: number,
  daysRemaining: number,
): number {
  if (lockedMezo <= 0 || daysRemaining <= 0) return 0;
  const clamped = Math.min(daysRemaining, VEMEZO_MAX_LOCK_DAYS);
  return lockedMezo * (clamped / VEMEZO_MAX_LOCK_DAYS);
}

export function calculateMusdDistribution(
  treasuryBalance: number,
  gaugeVotes: { gaugeId: string; totalVotes: number }[],
): { gaugeId: string; musdAmount: number }[] {
  const totalVotes = gaugeVotes.reduce((sum, g) => sum + g.totalVotes, 0);
  if (totalVotes === 0 || treasuryBalance <= 0) {
    return gaugeVotes.map((g) => ({ gaugeId: g.gaugeId, musdAmount: 0 }));
  }
  return gaugeVotes.map((g) => ({
    gaugeId: g.gaugeId,
    musdAmount: (treasuryBalance * g.totalVotes) / totalVotes,
  }));
}

export function round(value: number, precision = 2) {
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
}

function stableHash(input: string) {
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}
