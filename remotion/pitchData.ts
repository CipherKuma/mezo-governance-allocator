export type DemoSlot = {
  id: string;
  title: string;
  start: string;
  duration: string;
  recordingFile: string;
  operatorAction: string;
  narrationCue: string;
};

export type Scene = {
  id: string;
  beat: string;
  from: number;
  duration: number;
  title: string;
  kicker: string;
  narration: string;
  visual: string;
  accent?: "btc" | "musd" | "mezo" | "proof";
};

export const demoSlots: DemoSlot[] = [
  {
    id: "demo-route",
    title: "Product entry",
    start: "00:45",
    duration: "12s",
    recordingFile: "assets/recordings/01-live-demo-route.mp4",
    operatorAction:
      "Open Borealis, enter the capital router, and show the active allocation cycle, MUSD budget, gauges, and Mezo testnet state.",
    narrationCue:
      "Start in the product: choose an allocation cycle, review active gauges, and understand the MUSD budget before connecting a wallet.",
  },
  {
    id: "passport",
    title: "Passport write path",
    start: "00:57",
    duration: "12s",
    recordingFile: "assets/recordings/02-passport-chain-ready.mp4",
    operatorAction:
      "Connect with Mezo Passport when ready to write, then show Mezo testnet readiness and the honest read-only fallback.",
    narrationCue:
      "Connect when ready to write; until then, Borealis remains usable in read-only mode.",
  },
  {
    id: "allocation",
    title: "MUSD allocation workbench",
    start: "01:09",
    duration: "18s",
    recordingFile: "assets/recordings/03-musd-allocation-workbench.mp4",
    operatorAction:
      "Compare gauges, move MUSD weights, and review the impact preview before committing onchain.",
    narrationCue:
      "Build the allocation by comparing gauges, moving MUSD weights, and reviewing capital impact.",
  },
  {
    id: "proof",
    title: "Execute and verify",
    start: "01:27",
    duration: "18s",
    recordingFile: "assets/recordings/04-live-proof-and-explorer.mp4",
    operatorAction:
      "Move from proposed allocation to proof, then show chain id 31611, tx status, decoded event, and explorer link.",
    narrationCue:
      "Finish the workflow by verifying chain, contract, transaction, event, and explorer proof.",
  },
];

export const scenes: Scene[] = [
  {
    id: "hook",
    beat: "01 / MEZO UTILIZATION",
    from: 0,
    duration: 360,
    title: "Borealis routes MUSD to the builders Mezo wants to grow.",
    kicker: "MEZO Utilization Track",
    narration:
      "Mezo's capital operations layer: governance signals come in, operators route MUSD across gauges, and every allocation is verified onchain.",
    visual:
      "Dark control room. MUSD, MEZO, and BTC rails converge into one allocator.",
    accent: "mezo",
  },
  {
    id: "tension",
    beat: "02 / PROBLEM",
    from: 360,
    duration: 408,
    title: "Governance stops at the vote. Capital work starts after it.",
    kicker: "The operations gap",
    narration:
      "Projects ask for support, MEZO holders signal priorities, and operators still need a clear way to route MUSD and prove the result.",
    visual:
      "Four gauge cards compete for capital while an audit trail stays empty.",
    accent: "musd",
  },
  {
    id: "promise",
    beat: "03 / PRODUCT",
    from: 768,
    duration: 312,
    title: "Borealis is the operations layer after governance.",
    kicker: "The product",
    narration:
      "Projects create gauges, MEZO-weighted signals rank priorities, and operators preview MUSD impact before executing a verifiable allocation.",
    visual: "Gauge orbit snaps into a capital router.",
    accent: "btc",
  },
  {
    id: "demo",
    beat: "04 / DEMO",
    from: 1080,
    duration: 1440,
    title: "Run an allocation cycle, not a proposal thread.",
    kicker: "Product flow",
    narration:
      "The demo walks through the actual operator workflow: enter the router, choose the cycle, update MUSD weights, execute when ready, and verify the result on Mezo testnet.",
    visual: "Four recording placeholders with operator instructions.",
    accent: "proof",
  },
  {
    id: "proof",
    beat: "05 / VERIFICATION",
    from: 2520,
    duration: 720,
    title: "A DAO records the vote. Borealis records the capital route.",
    kicker: "Mezo testnet verification",
    narration:
      "Borealis exposes chain 31611, contract state, vote receipts, decoded allocation events, and explorer links inside the product flow.",
    visual: "Metrics and tx cards animate in.",
    accent: "proof",
  },
  {
    id: "business",
    beat: "06 / ECOSYSTEM FIT",
    from: 3240,
    duration: 408,
    title: "Borealis makes MEZO useful and MUSD measurable.",
    kicker: "Why Mezo should care",
    narration:
      "The same primitive supports liquidity campaigns, builder grants, validator incentives, and ecosystem budgets without a one-off spreadsheet process.",
    visual: "Ecosystem operating model maps to allocation proof.",
    accent: "mezo",
  },
  {
    id: "team",
    beat: "07 / ASK",
    from: 3648,
    duration: 360,
    title: "The ask: help turn Borealis into Mezo's allocation primitive.",
    kicker: "Continuation path",
    narration:
      "We are asking for the MEZO Utilization prize, protocol feedback, and a path to pilot Borealis with real ecosystem allocation campaigns.",
    visual: "Team credibility and ask slide.",
    accent: "btc",
  },
  {
    id: "sting",
    beat: "08 / BOREALIS",
    from: 4008,
    duration: 312,
    title: "Borealis",
    kicker: "MEZO-powered MUSD capital router",
    narration:
      "Borealis: a MEZO-powered MUSD capital router for the Mezo ecosystem.",
    visual: "Logo lockup and final URL.",
    accent: "mezo",
  },
];

export const pitchDefaults = {
  publicUrl: "https://mezo-governance-allocator.vercel.app",
  githubUrl: "https://github.com/CipherKuma/borealis",
  chainId: "31611",
  compositionDate: "2026-05-25",
  demoSlots,
  scenes,
};
