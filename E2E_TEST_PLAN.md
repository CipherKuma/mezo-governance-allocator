# E2E Test Plan

Hackathon: Mezo Hackathon
Idea: MEZO Governance Allocator and Gauge Simulator
Updated: 2026-05-22 IST

| Flow | Preconditions | Test command/browser proof | Expected result | Status | Blocker |
|---|---|---|---|---|---|
| Primary happy path | Local Vite server, fixture data | `npm run test:e2e` test `primary allocator happy path produces an honest fixture receipt`; local visual screenshot `outputs/visual-qa/2026-05-22T01-46-51-627Z/primary-flow-after-simulate.png` | Ecosystem Grants weight changes to 3,800 bps, receipt stays fixture-labeled, event `AllocationUpdated` visible, no live/local proof labels | passed | None for local fixture path. |
| Auth failure path | No injected wallet in browser | `npm run test:e2e` test `web3 auth fails closed when no injected wallet exists` | `Wallet unavailable` visible, reason visible, `Connect and sign` disabled, `Wallet verified` absent | passed | Live wallet signature requires unlocked browser wallet. |
| Auth helper path | Injected provider harness in unit test | `npm test` wallet auth helper test | Requests account, verifies Mezo chain `31611`, obtains `personal_sign`, returns connected state | passed-unit | This is not live wallet proof; it is a helper contract test. |
| No-dummy action audit | Local page loaded with no wallet | `npm run test:e2e` test `visible actions either work, navigate to a real target, or expose a disabled reason` | Simulate works, faucet link has real Mezo URL, disabled wallet action has reason, no unsafe links | passed | None for local surface. |
| Real integration proof | Network access to Mezo RPC | `npm run check:rpc`; `npm run test:e2e` RPC test | `eth_chainId` returns `0x7b7b` | passed | None for RPC. |
| Contract compile proof | Local `solc` dev dependency | `npm run contracts:compile` | `artifacts/GovernanceAllocator.json` regenerated | passed | None. |
| Live contract transaction | Funded wallet and deployed allocator | `npm run deploy:mezo` | Deploy contract, register gauges, call `castVote`, write `outputs/mezo-deployment.json` | blocked-safe | Missing `MEZO_DEPLOYER_PRIVATE_KEY`. |
| Local visual fallback | M2 formal polish unavailable | `PLAYWRIGHT_CLI_REMOTE= npx playwright-cli-sessions@latest exec scripts/local-visual-qa.mjs` | 375/768/1440 screenshots, no overflow, fixture labels present, wallet unavailable present, no fake live/local proof | passed-local | Formal polish remains blocked by M2 SSH timeout. |

Every button and form in the primary experience now either works, navigates to a real target, or is deliberately disabled with a reason. This is covered by `e2e/readiness.spec.ts`.

---

## Kimi Readiness Inventory — E2E Findings (2026-05-22)

- **Script inventory**: `playwright.config.ts` defines 1 project (`chromium`), `webServer` command `npm run dev -- --port 5180`, baseURL `http://127.0.0.1:5180`, `fullyParallel: false`, trace `retain-on-failure`, screenshot `only-on-failure`.
- **Test count**: 4 tests in `e2e/readiness.spec.ts`.
- **No-dummy action audit detail**:
  - Simulate buttons (hero + workbench) are clicked and assert `Fixture receipt`.
  - Faucet link href is asserted against exact regex `^https://faucet\.test\.mezo\.org/?$`.
  - Disabled buttons list is asserted to equal exactly `["Connect and sign"]`.
  - Unsafe link scan (`a[href="#"]`, `a[href^="javascript:"]`, `a:not([href])`) asserts count `0`.
- **RPC test detail**: Direct `request.post` to `https://rpc.test.mezo.org` with JSON-RPC `eth_chainId`; asserts exact body `{jsonrpc:"2.0",id:1,result:"0x7b7b"}`.
- **Visual QA evidence**: Local visual QA summary `outputs/visual-qa/2026-05-22T01-46-51-627Z/summary.json` confirms `hasFixtureReceipt:true`, `hasFakeLocalProof:false`, `hasLiveReceipt:false`, `hasWalletUnavailableState:true`, `hasWalletVerifiedState:false` across all 3 viewports.
