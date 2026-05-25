// On-chain gauge IDs (1-4) mapped to capital-router metadata. Labels match the
// `gauges(id).label` registered on-chain; categories frame each gauge as a
// destination for MUSD treasury capital.
export interface GaugeMeta {
  id: bigint;
  label: string;
  category: string;
  funds: string;
}

export const GAUGES: GaugeMeta[] = [
  {
    id: 1n,
    label: "BTC/MUSD Pool",
    category: "Liquidity",
    funds:
      "Depth for the core BTC↔MUSD pair — tighter spreads, more MUSD velocity.",
  },
  {
    id: 2n,
    label: "MUSD Savings",
    category: "MUSD velocity",
    funds: "Yield on idle MUSD, pulling stablecoin supply into productive use.",
  },
  {
    id: 3n,
    label: "Validator Yield",
    category: "Validator incentives",
    funds: "Rewards that keep Mezo validators online and the chain secure.",
  },
  {
    id: 4n,
    label: "Ecosystem Grants",
    category: "Ecosystem grants",
    funds: "Direct MUSD grants to teams building on Mezo.",
  },
];

export const CATEGORY_COLORS: Record<string, string> = {
  Liquidity: "text-btc border-btc/20 bg-btc/5",
  "MUSD velocity": "text-musd border-musd/20 bg-musd/5",
  "Validator incentives": "text-sky-400 border-sky-400/20 bg-sky-400/5",
  "Ecosystem grants": "text-violet-400 border-violet-400/20 bg-violet-400/5",
};
