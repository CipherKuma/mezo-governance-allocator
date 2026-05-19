# Integration Matrix

Hackathon: Mezo Hackathon
Idea: MEZO Governance Allocator and Gauge Simulator
Updated: 2026-05-22 IST

| Dependency | Real access path | Env / credential | Proof command or browser proof | Fixture policy | Status | Blocker |
|---|---|---|---|---|---|---|
| Mezo testnet RPC | `https://rpc.test.mezo.org` JSON-RPC | None for `eth_chainId` | `npm run check:rpc` -> `0x7b7b`; `npm run test:e2e` RPC test -> `0x7b7b` | No fixture needed | proven-real | None. |
| Mezo chain metadata | `src/lib/mezo.ts` | None | Build/type check via `npm run build` | Static chain metadata only | implemented | Must re-check if Mezo changes testnet chain config. |
| Injected browser wallet | EIP-1193 `window.ethereum` | Unlocked browser wallet; Mezo testnet network; user approval for signature | `npm run test:e2e` verifies no-wallet fail-closed state; `npm test` verifies provider request/sign helper with injected provider | No fake connected wallet state allowed | auth-blocked-safe | No injected wallet was available in the automation browser for live signature proof. |
| Mezo testnet contract deployment | `scripts/deploy-mezo.mjs` using viem wallet client | `MEZO_DEPLOYER_PRIVATE_KEY`; optional `MEZO_RPC_URL` | `npm run deploy:mezo` failed closed with missing key | UI may use fixture receipt while blocked | blocked-safe | Needs funded Mezo testnet deployer key; faucet may require CAPTCHA. |
| Contract vote transaction | `castVote(positionId, gaugeIds, weightsBps, mezoBoostAmount)` | Funded deployer/wallet and deployed contract address | Not run; no tx hash exists | Fixture receipt must stay labeled `Fixture receipt` | blocked | Same deployer/funding blocker. |
| Solidity compiler/artifact | Local `solc`, contract source | None | `npm run contracts:compile` -> `artifacts/GovernanceAllocator.json` | No fixture needed | proven-local | Full dev audit has 2 low `solc -> tmp` findings; force fix would break compiler version. |
| Fixture/demo data | `src/lib/fixtures.ts`; deterministic receipt builder | None | `npm test`; `npm run test:e2e`; local visual QA summary | Allowed only with visible labels in UI/docs/gates | implemented | Must not be described as live or local-chain proof. |
| Public GitHub repo | Persona-owned GitHub through `agent-browser` per browser runbook | Assigned primary submitter Chrome profile | Not attempted because `TEAM.md` blocks persona-owned mutations | Not applicable | blocked | Gabriel must assign primary submitter/profile. |
| Submission portal | Encode/Mezo register surface through assigned profile | Assigned primary submitter; portal login; submission assets | Not attempted; no final submit/legal mutation | Not applicable | blocked | Primary submitter, repo URL, demo URL, video URL missing. |
| Formal `/polish` / M2 browser | `PLAYWRIGHT_CLI_REMOTE=m2worker`, `playwright-cli-sessions` | Reachable M2 worker over Tailscale/SSH | `browser start` failed on 2026-05-22 with SSH timeout to `100.115.214.82:22`; report saved at `/Users/gabrielantonyxaviour/.playwright-sessions/.reports/2026-05-22T01-42-23-407-attempted-formal-m2-polish-browser-start-for-mez.md` | Local fallback allowed by hackathon quality runbook | blocked | M2/Tailscale unavailable. |
| Local visual QA fallback | Local headless Chrome through `playwright-cli-sessions exec scripts/local-visual-qa.mjs` with `PLAYWRIGHT_CLI_REMOTE=` | None | `outputs/visual-qa/2026-05-22T01-46-51-627Z/summary.json` and screenshots | Honest label: local visual QA, not formal polish | passed | Formal polish still blocked. |
| E2E automation | `@playwright/test` with Vite webServer | None | `npm run test:e2e` passed: 4 tests | External RPC is real; wallet success is unit-level provider harness only | passed-local | Live wallet signature blocked without wallet. |
| Production dependency security | `npm audit --omit=dev` | None | `npm audit --omit=dev` -> `found 0 vulnerabilities` | No security claim for dev-only full audit | passed-production | Full `npm audit` still exits 1 for 2 low `solc -> tmp` dev vulnerabilities. |
