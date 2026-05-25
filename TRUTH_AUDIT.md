# Truth Audit

Hackathon: Mezo Hackathon
Idea: MEZO Governance Allocator and Gauge Simulator
Updated: 2026-05-25 IST

| Claim | Reality: real / fixture / mock / blocked / not attempted / removed | Evidence | User-facing label needed? | Action |
|---|---|---|---|---|
| Product is working | real, live on-chain reads | `npm run build`; `npm test` (14 pass); `npm run verify:proof` (ALL CHECKS PASSED) against Mezo testnet | No fixture label needed; product shows live on-chain data | Keep at testing-ready. |
| Gauge weights can be changed and simulated | real UI + deterministic math | `npm test`; allocator math tests | Yes: simulation is modeled impact, not live re-accounting | Done. |
| Emission delta updates after vote | real deterministic model | `src/lib/allocator.ts`; `npm test` | Yes: modeled impact | Done. |
| Web3 auth is implemented | real path | `src/lib/wallet-auth.ts`; `src/components/WalletAuthPanel.tsx`; wagmi EIP-6963 multi-injected discovery on chain 31611 | Yes: wallet required only for write actions | Done. |
| Wallet is connected / signed for a real vote | real | Vote tx `0xabf4bd58b6b5a2fd39b932f9b2e0aa12e47550612c1457cdfe4baf672d919b16` — SUCCESS, block 13259078, on canonical contract `0x1cdba6eec37d77d8994296a29fdc2c230cc0596a` | No | Done. |
| UI receipt is a real Mezo testnet receipt | real | Canonical vote tx above is verifiable on explorer | Yes: link to real explorer tx | Done. |
| UI receipt is local contract proof | removed | Static `localProofReceipt` was removed during hardening | No, because claim is removed | Done. |
| Contract can emit `AllocationUpdated` | real, deployed | `contracts/MUSDGovernanceAllocator.sol`; `npm run contracts:compile`; deployed at `0x1cdba6eec37d77d8994296a29fdc2c230cc0596a` (5757 bytes on-chain) | Say deployed | Done. |
| Mezo RPC is reachable | real | `npm run check:rpc` returns `0x7b7b` | No | Done. |
| Mezo testnet deployment completed | real | `npm run verify:proof` confirms canonical allocator + 2 mock tokens; matches `outputs/full-deployment.json` and Vercel env | Yes: link canonical address | Done. |
| Mezo Passport is production-integrated | blocked | `@mezo-org/passport@0.17.2` installed and genuinely attempted as primary connector. Passport's Bitcoin connectors (Unisat/OKX/Xverse via OrangeKit) route through RainbowKit `connectorsForWallets`/`getDefaultConfig`, which import `gemini` from `wagmi/connectors`. wagmi 3 (project runs 3.6.15 + React 19; Passport peer-deps wagmi 2 + React 18) removed the `gemini` export, so importing any Passport/RainbowKit connector fails the Vite build. | Yes: document as compatibility blocker | App uses wagmi built-in EIP-6963 multi-injected discovery (OKX / Xverse-EVM / MetaMask on 31611) instead. |
| No-wallet judge demo works | real | Public `#demo` route renders Dashboard read-only with live on-chain data (50,000 MUSD treasury, 4 gauges, epoch 1); write buttons disabled with precise reasons | No | Done. |
| Live Proof in-browser verification | real | "Live Proof" tab runs `verifyLiveProof()` live against RPC in-browser; all 4 checks green | No | Done. |
| Faucet tokens are real MUSD/MEZO | mock (honestly labeled) | Faucet panel explicitly labels tokens as testnet bootstrap ERC-20 mocks (MockMEZO `0x08b9...0778`, MockMUSD `0xd6f4...755a`), NOT real MUSD/MEZO | Yes: testnet bootstrap label present | Done. |
| Dependency security is clean | NOT clean (transitive, web3 dep tree) | `npm audit --omit=dev` reports 69 transitive advisories (elliptic/ws/axios via wagmi/viem/walletconnect). Not directly exploitable in a static client-side dApp; `audit fix --force` would break the wallet stack | Yes: do not claim clean audit | Do not force-fix; document honestly. |
| Formal `/polish` passed | blocked | `PLAYWRIGHT_CLI_REMOTE=m2worker`; `browser start` failed with SSH timeout; report saved at `/Users/gabrielantonyxaviour/.playwright-sessions/.reports/2026-05-22T01-42-23-407-attempted-formal-m2-polish-browser-start-for-mez.md` | Yes: formal-polish-blocked-by-m2 | Use local visual QA label only. |
| Local visual QA passed | real local proof | 375/768/1440 screenshots plus summary at `outputs/visual-qa/2026-05-22T01-46-51-627Z/` | Yes: local visual QA, not formal polish | Done. |
| Every visible action is real/disabled/removed | real local proof | `npm run test:e2e` action audit passed | No | Done for local app surface. |
| Public repo exists | blocked | `git remote -v` has no remote; `TEAM.md` has no primary submitter | Yes | Assign submitter before repo creation. |
| Submission portal is prepared/submitted | blocked / not attempted | `SUBMISSION_PORTAL_PLAN.md` says no logged-in portal action; no final submit | Yes | Needs submitter, public repo/demo/video URLs, explicit final-submit approval. |
