# Borealis Demo Recording Guide

Use this once the expanded app is working. Record real app footage only. Do not
record mock screens, fixture-only flows, or generated UI.

Recommended capture: Screen Studio or equivalent, 1920x1080, 24fps or 30fps,
cursor visible, no browser bookmarks bar, no private keys, no wallet seed phrase,
no dashboard secrets.

## Recording 1 - Product Entry And Router Overview

File: `public/assets/recordings/01-live-demo-route.mp4`
Target duration: 12 seconds

Actions:

1. Open the public app.
2. Show landing headline: MEZO-powered MUSD capital router.
3. Enter the capital router from the primary CTA.
4. Show the active allocation cycle, available MUSD budget, gauge list, and Mezo
   testnet status.

Narration matched to recording:

> Start in the product: choose an allocation cycle, review the active gauges,
> and understand the MUSD budget before connecting a wallet.

Must show:

- No-wallet product overview works.
- The user can understand what job Borealis performs before wallet connect.
- The screen should feel like running an allocation cycle, not creating a DAO
  proposal.
- No fake proof labels.

## Recording 2 - Passport And Chain Readiness

File: `public/assets/recordings/02-passport-chain-ready.mp4`
Target duration: 12 seconds

Actions:

1. Click `Connect with Mezo Passport`.
2. Show Passport or fallback wallet state.
3. Show Mezo testnet chain readiness.
4. Show read-only mode or disabled write state if wallet or BTC gas is missing.

Narration matched to recording:

> Connect with Mezo Passport when you are ready to write; until then, Borealis
> stays usable in read-only mode.

Must show:

- Passport is primary, fallback is labeled if used.
- Wrong-chain or no-gas state fails closed.

## Recording 3 - MUSD Allocation Workbench

File: `public/assets/recordings/03-musd-allocation-workbench.mp4`
Target duration: 18 seconds

Actions:

1. Open Allocation Workbench.
2. Compare four gauges.
3. Adjust MUSD allocation weights.
4. Show capital impact preview updating immediately.
5. Review the final proposed allocation before any wallet-required transaction.

Narration matched to recording:

> Build the allocation by comparing gauges, moving MUSD weights, and reviewing
> the impact before committing anything onchain.

Must show:

- MUSD allocation, not abstract points only.
- Gauge categories tied to Mezo outcomes.
- Transaction button disabled or enabled honestly.

## Recording 4 - Execute And Verify

File: `public/assets/recordings/04-live-proof-and-explorer.mp4`
Target duration: 18 seconds

Actions:

1. Move from the proposed allocation to the write or proof step.
2. Show chain id `31611`.
3. Show contract address.
4. Show successful vote receipt or labeled pending state.
5. Show decoded allocation event.
6. Open explorer link in a new tab or side panel.
7. Stop on explorer proof.

Narration matched to recording:

> Finish the workflow by verifying the allocation: chain, contract, transaction,
> event, and explorer proof.

Must show:

- Real Mezo testnet RPC status.
- Real tx status.
- Real explorer URL.

## Recording Hygiene

- Hide private keys and token-bearing URLs.
- Do not use devtools unless the point is proof.
- Keep zooms minimal.
- Keep each clip focused on one action.
- Save raw captures separately before trimming.
- After each recording, update `outputs/pitch-video/ASSET_MANIFEST.json`.
