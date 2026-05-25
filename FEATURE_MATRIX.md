# Feature Matrix

Hackathon: Mezo Hackathon
Idea: MEZO Governance Allocator and Gauge Simulator
Updated: 2026-05-25 IST

| Feature / claim | Source evidence | Implementation path | Test / proof | Status | Gap / blocker |
|---|---|---|---|---|---|
| Primary allocation workbench lets a judge change gauge weights and simulate allocation | `BUILD_PLAN.md` demo path; `EXECUTION_PACKET.md` demo script | `src/App.tsx`, `src/components/AllocatorWorkbench.tsx`, `src/components/GaugeCard.tsx` | `npm test` (14 pass); live in browser against canonical contract | live | Simulation impact is modeled math; reads are live on-chain. |
| No-wallet judge demo with live on-chain reads | Judge demo requirement | `#demo` route Dashboard | Renders read-only with live data (50,000 MUSD treasury, 4 gauges, epoch 1); write buttons disabled with precise reasons; `npm run verify:proof` ALL CHECKS PASSED | live | None. Write actions require a connected wallet. |
| Live Proof tab verifies deployment in-browser | Integrity requirement | "Live Proof" tab calls `verifyLiveProof()` | Runs live against RPC in-browser; all 4 checks green; `npm test` covers the live-proof module | live | None. |
| Capital routing (live votes) view | Treasury view requirement | Treasury tab "Capital routing (live votes)" table | Computes each gauge's MUSD share from on-chain vote weight (live read) | live | None. |
| veBTC base power and MEZO boost math | `API_PLAN.md` position model | `src/lib/allocator.ts` | `npm test` | implemented | Model is deterministic demo math, not live veBTC position reads. |
| Gauge weights remain normalized to 10,000 bps | `BUILD_PLAN.md` allocation console requirement | `normalizeWeights`, `updateGaugeWeight` in `src/lib/allocator.ts` | `npm test` covers normal, arbitrary, and zeroed-weight normalization | implemented | None. |
| Leading gauge emission delta, MUSD flow shift, and BTC depth shift update after simulation | `EXECUTION_PACKET.md` receipt/impact demo script | `calculateImpact` in `src/lib/allocator.ts`; `src/components/ImpactStrip.tsx` | `npm test` asserts positive leading-gauge emission delta | implemented | Values are modeled outputs, not live protocol re-accounting. |
| Receipt panel shows a real Mezo testnet receipt | Integrity requirement | `src/components/ReceiptPanel.tsx` | Real vote tx `0xabf4bd58b6b5a2fd39b932f9b2e0aa12e47550612c1457cdfe4baf672d919b16` (SUCCESS, block 13259078) links to explorer | live | None. |
| Web3 auth path | Readiness contract web3-auth requirement | `src/lib/wallet-auth.ts`; wagmi EIP-6963 multi-injected discovery on chain 31611 (OKX / Xverse-EVM / MetaMask) | `npm test`; real vote tx cast on-chain | live | None. |
| Mezo Passport as primary connector | Sponsor integration attempt | `@mezo-org/passport@0.17.2` installed and attempted | Blocked: Passport's Bitcoin connectors route through RainbowKit `connectorsForWallets`/`getDefaultConfig`, importing `gemini` from `wagmi/connectors`; wagmi 3 (project runs 3.6.15 + React 19) removed that export, failing the Vite build | blocked | wagmi 3 / React 19 vs Passport peer-deps (wagmi 2 / React 18); fell back to EIP-6963 injected discovery. |
| Solidity allocator contract deployed and emits `AllocationUpdated` | `API_PLAN.md` contract function/event list | `contracts/MUSDGovernanceAllocator.sol`; `scripts/compile-contract.mjs` | `npm run contracts:compile`; deployed at `0x1cdba6eec37d77d8994296a29fdc2c230cc0596a` (5757 bytes on-chain) | live | None. |
| Mezo RPC smoke check | `SPONSOR_ACCESS_PLAN.md` testnet path | `scripts/check-rpc.mjs` | `npm run check:rpc` returns `0x7b7b` | proven-real | None. |
| Mezo testnet deployment | `BUILD_PLAN.md` | `scripts/deploy-full.mjs`; `outputs/full-deployment.json` | `npm run verify:proof` ALL CHECKS PASSED; matches Vercel env | live | None. |
| Faucet panel honest token labeling | Integrity requirement | `src/components/FaucetPanel.tsx` | Explicitly labels tokens as testnet bootstrap ERC-20 mocks (MockMEZO / MockMUSD), NOT real MUSD/MEZO | live (honest label) | None. |
| No dummy / mock-as-proof visible actions | Readiness contract no dummy buttons/links | UI buttons, faucet link, receipt explorer link | Old fixture-mode components deleted; disabled write buttons show visible reasons; no mock data shown as product proof | passed | None. |
| Production dependency audit | Quality runbook security check | wagmi/viem/walletconnect wallet stack | `npm audit --omit=dev` reports 69 transitive advisories (elliptic/ws/axios) | not-clean | Transitive, not directly exploitable in a static client dApp; `audit fix --force` would break the wallet stack. |
| Public repo and submission portal readiness | `REPO_PLAN.md`, `SUBMISSION_PORTAL_PLAN.md`, browser runbook | Planning docs | See `TEAM.md` / submission docs | tracked | Submitter assignment tracked separately. |
