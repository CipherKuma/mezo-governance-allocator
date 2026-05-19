# Quality Gate

Hackathon: Mezo Hackathon
Idea: MEZO Governance Allocator and Gauge Simulator
Updated: 2026-05-22 IST

Final status: demo-ready; readiness status: auth-blocked

| Gate | Evidence | Status |
|---|---|---|
| Unit/type/build checks | `npm test` passed: 1 file, 8 tests. `npm run build` passed: TypeScript build + Vite production bundle `344.13 kB` JS / `109.45 kB` gzip. `git diff --check` passed. | passed |
| E2E/browser readiness checks | `npm run test:e2e` passed 4 Playwright tests: primary allocator happy path, no-wallet auth failure, no-dummy action audit, and real Mezo RPC API check. | passed-local |
| Integration/API/RPC/contract smoke checks | `npm run check:rpc` passed against `https://rpc.test.mezo.org -> 0x7b7b`. `npm run contracts:compile` passed and regenerated `artifacts/GovernanceAllocator.json`. | passed |
| Web3 auth gate | Direct injected-wallet EIP-1193 path implemented in `src/lib/wallet-auth.ts` and UI in `src/components/WalletAuthPanel.tsx`. Unit test proves account/chain/signature helper with injected provider; E2E proves no-wallet fail-closed state. | auth-blocked-safe |
| Mezo deploy safety check | `npm run deploy:mezo` failed closed with `MEZO_DEPLOYER_PRIVATE_KEY is required for Mezo testnet deployment`. | blocked-safe |
| Browser proof for primary flow | `PLAYWRIGHT_CLI_REMOTE=` local fallback ran `npx playwright-cli-sessions@latest exec scripts/local-visual-qa.mjs`; primary flow changed leading gauge to `ecosystem-grants`, showed fixture hash, fixture contract label, `AllocationUpdated`, wallet unavailable, and no wallet verified state. Screenshot: `outputs/visual-qa/2026-05-22T01-46-51-627Z/primary-flow-after-simulate.png`. | passed-local |
| Local visual QA at 375 / 768 / 1440 | Screenshots: `outputs/visual-qa/2026-05-22T01-46-51-627Z/mobile-375.png`, `tablet-768.png`, `desktop-1440.png`. Summary shows `horizontalOverflow: false` for all three, hero and receipt visible, fixture label present, wallet unavailable present, fake local/live labels absent. | local-visual-qa-passed |
| Formal `/polish` | `PLAYWRIGHT_CLI_REMOTE=m2worker`; `browser start` failed with SSH timeout to `100.115.214.82:22`; report saved to `/Users/gabrielantonyxaviour/.playwright-sessions/.reports/2026-05-22T01-42-23-407-attempted-formal-m2-polish-browser-start-for-mez.md`. | formal-polish-blocked-by-m2 |
| Hidden mock/fake claim audit | Removed static local proof during hardening; current readiness removed unused Passport/RainbowKit/Wagmi stack; E2E verifies fixture receipt, no live receipt, no local proof, real faucet href, disabled wallet action with reason, and no unsafe links. | passed |
| Security/dependency audit | Removed unused vulnerable wallet-stack packages. `npm audit --omit=dev` exits 0 with 0 vulnerabilities. Full `npm audit` exits 1 with 2 low dev-only `solc -> tmp` findings; force fix would downgrade `solc` to 0.5.0 and break Solidity 0.8 compiler intent. | passed-production; dev-low-blocked-safe |
| Repo/deploy/submission readiness | No git remote; no public deployment; no assigned primary submitter; no logged-in portal action; no legal/final submit mutation. | blocked-for-submit |

## Visual QA Findings

- Mobile 375: no horizontal overflow; core workbench, wallet unavailable state, fixture receipt, and fixture-only contract label visible.
- Tablet 768: no horizontal overflow; hero/control flow, wallet gate, and receipt stack correctly.
- Desktop 1440: first screen remains stable; lower proof section shows wallet gate, impact strip, and receipt without overlap.
- Primary flow: setting Ecosystem Grants to 3,800 bps updates leading gauge, leading emission delta, receipt hash, and receipt fields while keeping wallet verified absent.

## Status Rationale

This run is `demo-ready` as a local fixture demo and `auth-blocked` for the readiness contract. The local app builds, tests pass, E2E passes, production audit is clean, RPC/contract compile checks pass, and the primary fixture demo has browser proof. It is not `testing-ready` because no real wallet signature, funded Mezo deployer, contract transaction, public repo, public demo URL, submission portal proof, or formal M2 polish exists yet.
