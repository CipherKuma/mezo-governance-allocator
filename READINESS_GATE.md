# Readiness Gate

Hackathon: Mezo Hackathon
Idea: MEZO Governance Allocator and Gauge Simulator
Updated: 2026-05-22 IST

Final readiness status: **auth-blocked**

| Gate | Evidence | Status |
|---|---|---|
| Auth implemented and verified | Web3-auth classified in `AUTH_PLAN.md`; EIP-1193 account/chain/signing path implemented; `npm test` provider helper passes; `npm run test:e2e` verifies real no-wallet blocked state and no fake connected wallet | auth-blocked-safe |
| Primary E2E test | `npm run test:e2e` primary allocator happy path passed | passed |
| Integration E2E test | `npm run test:e2e` Mezo RPC test passed; `npm run check:rpc` passed; `npm run contracts:compile` passed | passed-rpc-and-compile |
| Live transaction proof | `npm run deploy:mezo` fails closed with missing `MEZO_DEPLOYER_PRIVATE_KEY`; no tx hash exists | blocked |
| No dummy buttons / fake actions | `npm run test:e2e` action audit passed; connect/sign is disabled with visible no-wallet reason; faucet link has real URL | passed |
| No unlabeled mocks/simulations | E2E and visual QA verify `Fixture receipt`, `fixture-only-not-deployed`, no `Mezo testnet receipt`, no `Local contract proof` | passed |
| Public repo/deploy or explicit blocker | No remote/public demo; blocked by unassigned primary submitter/profile in `TEAM.md` | blocked |
| Security/dependency/auth audit | `npm audit --omit=dev` clean; full `npm audit` only has 2 low dev-only `solc -> tmp` findings; no safe force downgrade | passed-production |
| Manual/browser proof | Local visual QA fallback passed at 375/768/1440 with summary `outputs/visual-qa/2026-05-22T01-46-51-627Z/summary.json`; formal M2 polish blocked and reported | passed-local; formal-blocked |

## Status Decision

Use `auth-blocked`, not `testing-ready`.

Reason: the local product is ready for serious local E2E testing and has passing E2E/RPC/build/security proof, but the web3 auth contract is not fully live-proven because the automation browser has no injected wallet and the project has no funded Mezo testnet deployer key. Without a real wallet signature and transaction, the product must not claim live wallet/auth or onchain readiness.

---

## Kimi Readiness Inventory — Gate Verification (2026-05-22)

- **No-dummy-action audit**: 10 visible elements inventoried across `src/App.tsx`, `src/components/AllocatorWorkbench.tsx`, `src/components/GaugeCard.tsx`, `src/components/WalletAuthPanel.tsx`, `src/components/ReceiptPanel.tsx`. Verdicts: 7 working, 1 disabled-with-reason, 1 conditionally absent (explorer link hides correctly), 1 honest static label. No `#` or `javascript:` links remain.
- **Storage audit**: No `localStorage` or `sessionStorage` usage found in source, tests, or scripts.
- **Env audit**: No `.env` file present. `VITE_ALLOCATOR_ADDRESS` optional; `MEZO_DEPLOYER_PRIVATE_KEY` required for deploy and absent.
- **Security re-verification**: `npm audit --omit=dev` returned 0 vulnerabilities (prod: 24 deps, dev: 228 deps). Full audit has 2 low dev-only `solc -> tmp` findings; force fix would downgrade `solc` to 0.5.0.
- **Legacy stack removal verified**: `@mezo-org/passport`, RainbowKit, Wagmi, TanStack Query fully removed from codebase and `package.json`.
- **Formal M2 polish report location**: `/Users/gabrielantonyxaviour/.playwright-sessions/.reports/2026-05-22T01-42-23-407-attempted-formal-m2-polish-browser-start-for-mez.md`
