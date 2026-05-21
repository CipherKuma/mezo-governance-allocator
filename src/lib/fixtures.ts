import type { Gauge, Position } from "./allocator";

export const initialPosition: Position = {
  tokenId: 1042,
  lockedBtc: 1.8,
  daysRemaining: 23,
  mezoBoost: 4_200,
};

export const initialGauges: Gauge[] = [
  {
    id: "btc-musd",
    label: "BTC/MUSD Pool",
    kind: "staking",
    currentWeightBps: 3_500,
    proposedWeightBps: 3_500,
    feeApr: 18.4,
    musdFlow: 860_000,
    btcDepth: 42,
  },
  {
    id: "musd-savings",
    label: "MUSD Savings",
    kind: "staking",
    currentWeightBps: 2_300,
    proposedWeightBps: 2_300,
    feeApr: 12.1,
    musdFlow: 610_000,
    btcDepth: 16,
  },
  {
    id: "validator-yield",
    label: "Validator Yield",
    kind: "validator",
    currentWeightBps: 1_900,
    proposedWeightBps: 1_900,
    feeApr: 9.8,
    musdFlow: 280_000,
    btcDepth: 29,
  },
  {
    id: "ecosystem-grants",
    label: "Ecosystem Grants",
    kind: "ecosystem",
    currentWeightBps: 2_300,
    proposedWeightBps: 2_300,
    feeApr: 15.7,
    musdFlow: 470_000,
    btcDepth: 11,
  },
];
