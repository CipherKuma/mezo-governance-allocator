# Truth Audit

Hackathon: Mezo Hackathon
Idea: MEZO Governance Allocator and Gauge Simulator
Updated: 2026-05-22 IST

| Claim | Reality: real / fixture / mock / blocked / not attempted / removed | Evidence | User-facing label needed? | Action |
|---|---|---|---|---|
| Product is working | real local demo, fixture-backed | `npm run build`, `npm run test:e2e`, local visual QA under `outputs/visual-qa/2026-05-22T01-46-51-627Z/` | Yes: fixture mode, auth-blocked for live wallet | Keep readiness at `auth-blocked`, not testing-ready. |
| Gauge weights can be changed and simulated | real local UI + deterministic math | `npm run test:e2e`; `outputs/visual-qa/2026-05-22T01-46-51-627Z/primary-flow-after-simulate.png` | Yes: fixture/demo | Done. |
| Emission delta updates after vote | real deterministic model | `src/lib/allocator.ts`; `npm test` | Yes: modeled impact | Done. |
| Web3 auth is implemented | real path plus blocked state | `src/lib/wallet-auth.ts`; `src/components/WalletAuthPanel.tsx`; `npm test`; `npm run test:e2e` | Yes: wallet unavailable until a real wallet signs | Live signature proof remains blocked. |
| Wallet is connected / signed | blocked | E2E browser had no injected wallet and correctly showed `Wallet unavailable`; no account/signature from a real wallet exists | Yes | Do not claim wallet verified until browser wallet signs on Mezo testnet. |
| UI receipt is a real Mezo testnet receipt | blocked | No deployed contract address or tx hash; `npm run deploy:mezo` requires missing key | Yes: must say fixture until tx exists | UI shows `Fixture receipt` and no explorer link. |
| UI receipt is local contract proof | removed | Static `localProofReceipt` was removed during hardening; E2E/local visual QA confirm `Local contract proof` absent | No, because claim is removed | Done. |
| Contract can emit `AllocationUpdated` | real source/artifact, not deployed | `contracts/GovernanceAllocator.sol`; `npm run contracts:compile` passed | Say deployable/compiled, not deployed | Keep as compiled contract claim only. |
| Mezo RPC is reachable | real | `npm run check:rpc` and `npm run test:e2e` both returned `0x7b7b` | No | Done. |
| Mezo testnet deployment completed | blocked | `npm run deploy:mezo` fails closed: `MEZO_DEPLOYER_PRIVATE_KEY is required` | Yes: deployment blocked | Needs funded deployer key. |
| Mezo Passport is production-integrated | removed from runnable demo | Removed unused `@mezo-org/passport`, RainbowKit, Wagmi, and TanStack Query dependencies and deleted `src/lib/passport-adapter.ts` | Yes if mentioned historically | Do not claim Passport integration in current demo. Active path is EIP-1193 injected wallet. |
| Dependency security is clean | real for production, blocked for full dev audit | `npm audit --omit=dev` clean; full `npm audit` has 2 low dev-only `solc -> tmp` issues; force fix would downgrade `solc` to 0.5.0 | Yes: production audit clean, dev audit residual | Do not force downgrade compiler. |
| Formal `/polish` passed | blocked | `PLAYWRIGHT_CLI_REMOTE=m2worker`; `browser start` failed with SSH timeout; report saved at `/Users/gabrielantonyxaviour/.playwright-sessions/.reports/2026-05-22T01-42-23-407-attempted-formal-m2-polish-browser-start-for-mez.md` | Yes: formal-polish-blocked-by-m2 | Use local visual QA label only. |
| Local visual QA passed | real local proof | 375/768/1440 screenshots plus summary at `outputs/visual-qa/2026-05-22T01-46-51-627Z/` | Yes: local visual QA, not formal polish | Done. |
| Every visible action is real/disabled/removed | real local proof | `npm run test:e2e` action audit passed | No | Done for local app surface. |
| Public repo exists | blocked | `git remote -v` has no remote; `TEAM.md` has no primary submitter | Yes | Assign submitter before repo creation. |
| Submission portal is prepared/submitted | blocked / not attempted | `SUBMISSION_PORTAL_PLAN.md` says no logged-in portal action; no final submit | Yes | Needs submitter, public repo/demo/video URLs, explicit final-submit approval. |
