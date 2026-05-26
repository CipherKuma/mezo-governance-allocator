# Borealis — Winner-Scope Expansion Report

**Date:** 2026-05-25
**Positioning:** Borealis — MEZO-powered MUSD Capital Router for the Mezo ecosystem
**Track:** MEZO Utilization
**Status: DEMO-READY + SUBMIT-READY** (pending human: Encode Club account, demo video, final submit)

---

## What shipped this session

### 1. No-wallet judge demo (the critical fix)
Previously `App.tsx` was `isConnected ? Dashboard : Landing` — judges with no wallet
were stuck on the landing page and never saw the product. Now:
- Landing has two CTAs: **View Live Demo** (no wallet) and **Connect Mezo Wallet**.
- `#demo` route renders the full dashboard read-only with **live on-chain data**.
- Write actions are disabled with precise reasons ("Connect a Mezo wallet to vote",
  "Need testnet BTC for gas", "Awaiting voter registration", etc.).
- Shareable URL: `https://mezo-governance-allocator.vercel.app/#demo`.

### 2. Live RPC proof (Mezo Integration, 30%)
- `src/lib/live-proof.ts` validates the canonical deployment against Mezo RPC.
- `scripts/verify-live-proof.mjs` (`npm run verify:proof`) → writes `outputs/live-proof.json`.
- **Live Proof** tab re-runs every check in-browser against `rpc.test.mezo.org`:
  chain id 31611, contract bytecode present, on-chain state (epoch 1, 4 gauges),
  vote tx `0xabf4bd58…` success @ block 13259078. All green.

### 3. Capital-router UI (Business Viability, 30%)
- Treasury tab shows a **Capital Routing (live votes)** table: each gauge's MUSD
  share computed from live on-chain vote weight (BTC/MUSD Pool 30% · 15,000 MUSD,
  Ecosystem Grants 35% · 17,495 MUSD, …) with category tags.
- Vote tab reframed as an **Allocation Workbench** with live MUSD distribution preview.

### 4. Mock honesty
- Faucet panel explicitly labeled: testnet bootstrap ERC-20s, not real MUSD/MEZO.
- Deleted the orphaned fixture-mode component cluster (AllocatorWorkbench, ImpactStrip,
  GaugeConstellation, GaugeCard, ReceiptPanel). No mock/fixture data shown as product proof.

### 5. Responsive + verified
- Mobile dashboard: sidebar collapses to a top bar + horizontal nav chips.
- No horizontal overflow at 375 / 768 / 1440. Verified in-browser on production.

---

## Canonical deployment (verified on-chain)

| Contract | Address |
|----------|---------|
| MUSDGovernanceAllocator | `0x1cdba6eec37d77d8994296a29fdc2c230cc0596a` |
| MockMEZO (bootstrap) | `0x08b9caca9c9885d86d97d6928a3f44903a030778` |
| MockMUSD (bootstrap) | `0xd6f43325a1103a16fccf268e28da053daadb755a` |

50,000 MUSD treasury · 4 gauges · vote tx `0xabf4bd58…` (block 13259078, success).
Matches Vercel prod env. Stale addresses (`0xbce0f5d8…`, `0x6758965d…`) reclassified
as historical in DEPLOYMENTS.md.

---

## Verification (all pass)

| Command | Result |
|---------|--------|
| `npm test` | 14 passed (allocator math + live-proof) |
| `npm run check:rpc` | Mezo RPC OK → 0x7b7b |
| `npm run contracts:compile` | 4 contracts compiled |
| `npm run verify:proof` | ALL CHECKS PASSED |
| `npm run build` | passes |
| `npm audit --omit=dev` | 69 transitive web3 advisories (elliptic/ws/axios via wagmi/viem/walletconnect); not reachable in a static client dApp; `fix --force` would break the wallet stack |

---

## Known blocker (documented, not faked)

**Mezo Passport** (`@mezo-org/passport@0.17.2`) was genuinely attempted as the primary
connector. Its Bitcoin wallet connectors are wired through RainbowKit's
`connectorsForWallets`/`getDefaultConfig`, which import the `gemini` connector from
`wagmi/connectors`. **wagmi 3 removed `gemini`** (this project: wagmi 3.6.15 + React 19;
Passport peer-deps wagmi 2 + React 18), so importing any Passport wallet connector fails
the Vite build (`"gemini" is not exported by wagmi`). The app connects via wagmi's
EIP-6963 multi-injected discovery instead (surfaces OKX / Xverse-EVM / MetaMask on chain
31611). Resolving Passport requires either a wagmi-3-compatible Passport release or
downgrading the whole app to wagmi 2 — not done, to avoid breaking the verified working app.

---

## Live URLs

- App: https://mezo-governance-allocator.vercel.app
- Judge demo: https://mezo-governance-allocator.vercel.app/#demo
- Repo: https://github.com/CipherKuma/borealis
- Allocator: https://explorer.test.mezo.org/address/0x1cdba6eec37d77d8994296a29fdc2c230cc0596a

---

## End-to-end write verification (2026-05-25, real on-chain proof)

Reads were already proven; this confirms **every contract write works end-to-end, in CLI and in the deployed browser app**.

### CLI — every write function (`npm run e2e:verify`, 23/23 checks)
Deploys a fresh throwaway instance and exercises the full lifecycle with on-chain receipts +
state assertions: faucet MEZO/MUSD → depositTreasury (50k) → registerGauge×4 → registerVoter →
lockMezo (voting power 1236) → vote → **settleEpoch distributed 49,999.99 MUSD to recipients,
treasury→0, epoch→2** → unlock guard reverts before expiry. Output: `outputs/e2e-verify.json`.
(Note: Mezo testnet RPC lags on `eth_getTransactionCount` under rapid sends; the script uses
explicit local nonce management — real wallets do this natively.)

### Browser — writes on the DEPLOYED app (https://mezo-governance-allocator.vercel.app)
Connected a real signing wallet through the app's own RainbowKit/EIP-6963 flow and executed
real transactions by clicking the app's buttons:
- **Token write (Faucet):** tx `0xd4c8119…` success @ block 13263056 — throwaway MEZO balance 0 → 10,000.
- **Allocator write (Lock MEZO, approve+lock 2-tx):** approve `0x93b7ae4…` + lockMezo `0x95a0b2c7…`
  success @ block 13263095 — on-chain `getUserLock` = 1000 MEZO, `getVotingPower` = 123.63 on the
  live allocator `0x1cdba6…`.
- `vote` from a fresh address is correctly **gated** (NotVerifiedVoter) and shown disabled with a
  precise reason; its success is proven in the CLI e2e above.
- Demo state verified **untouched** afterward (treasury 50,000 MUSD, epoch 1, 4 gauges) — the
  browser write tests were non-destructive (faucet/lock to a throwaway address).

**Conclusion: reads + writes verified live in both CLI and the deployed browser app.**

## Remaining for the team (human-only)

1. Create Encode Club account (`jedionchain@gmail.com`) and fill the submission
   (values in `outputs/encode-club-prefill-draft.md`).
2. Record demo video (mint → lock → vote → settle, plus the no-wallet demo + Live Proof).
3. Final submit on the Encode Club portal (never auto-submitted).
4. Optional: post from Cipher Kuma's X (`outputs/x-post-draft.md`).
