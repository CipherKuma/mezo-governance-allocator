# Kimi Readiness Inventory

Hackathon: Mezo Hackathon  
Project: MEZO Governance Allocator and Gauge Simulator  
Workspace: `/Users/gabrielantonyxaviour/Documents/hackathons/mezo-hackathon/execution/2026-05-21T00-46-20Z-mezo-governance-allocator-and-gauge-simulator`  
Audited: 2026-05-22 IST  
Auditor: Kimi (read-only verification, no architectural authority)  

---

## 1. Executive Summary

This inventory verifies every visible action, auth path, integration edge, env var, fixture label, and test script in the codebase. All findings are backed by exact file references or command output. No claims are invented.

Current aggregate status:
- **Local fixture demo**: working, tested, built, visually verified.
- **Web3 auth**: implemented, fails closed safely, not live-proven (no injected wallet in test browser).
- **Live contract deployment / transaction**: blocked-safe (missing `MEZO_DEPLOYER_PRIVATE_KEY`).
- **Public repo / submission portal**: blocked (no git remote, no assigned submitter in `TEAM.md`).
- **Formal M2 polish**: blocked (SSH timeout to `m2worker`).

---

## 2. No-Dummy-Action Audit

Rule: every button, link, form, or handler must be **working**, **disabled-with-reason**, **removed-needed**, or **blocker**.

| # | Element | File:Line | Type | Verdict | Evidence |
|---|---|---|---|---|---|
| 1 | `Simulate Allocation` button (hero) | `src/App.tsx:84` | `<button onClick={onSimulate}>` | **working** | Triggers `buildFixtureReceipt(gauges, position)`; updates receipt state. E2E clicks it and asserts `Fixture receipt` appears. |
| 2 | `Simulate Allocation` button (workbench) | `src/components/AllocatorWorkbench.tsx:36` | `<button onClick={onSimulate}>` | **working** | Same handler as #1. E2E clicks last button and asserts `ecosystem-grants` receipt. |
| 3 | `Testnet faucet` link | `src/App.tsx:87-92` | `<a href={MEZO_NETWORK.faucetUrl}>` | **working** | Target is `https://faucet.test.mezo.org/`. E2E asserts exact href regex match. |
| 4 | Gauge weight sliders | `src/components/GaugeCard.tsx:43-52` | `<input type="range">` | **working** | Calls `onWeightChange(gauge.id, value)` -> `updateGaugeWeight` in `src/lib/allocator.ts:108`. E2E programmatically sets Ecosystem Grants to 3800 bps and asserts normalization. |
| 5 | Position controls (Locked BTC) | `src/components/AllocatorWorkbench.tsx:51-59` | `<input type="range">` | **working** | Calls `onPositionChange` with updated `lockedBtc`. Impact metrics recalculate via `calculateImpact`. |
| 6 | Position controls (Days remaining) | `src/components/AllocatorWorkbench.tsx:60-68` | `<input type="range">` | **working** | Same pattern as #5. |
| 7 | Position controls (MEZO boost) | `src/components/AllocatorWorkbench.tsx:69-77` | `<input type="range">` | **working** | Same pattern as #5. |
| 8 | `Connect and sign` button | `src/components/WalletAuthPanel.tsx:79-87` | `<button disabled={!canConnect}>` | **disabled-with-reason** when no wallet; **working** when wallet present | `canConnect` excludes `wallet-unavailable`/`connecting`/`signing`. E2E verifies disabled text and visible reason "No injected browser wallet detected". Unit test verifies full `eth_requestAccounts` -> `eth_chainId` -> `personal_sign` flow with mock provider. |
| 9 | Explorer link on receipt | `src/components/ReceiptPanel.tsx:45-49` | conditional `<a>` | **conditionally absent / blocker** | Only renders if `explorerUrl` is truthy. `getReceiptExplorerUrl` returns `undefined` when `txHash.startsWith("fixture")`. Therefore link is correctly hidden in fixture mode. Will become working only after live tx hash exists. |
| 10 | Status pill "Allocator address configured" / "Fixture demo mode" | `src/App.tsx:60` | static label | **working (honest label)** | Driven by `allocatorAddress` import from `src/lib/mezo.ts:14`. When env var `VITE_ALLOCATOR_ADDRESS` is absent, label reads "Fixture demo mode". |

### Dummy-link scan

Command:
```bash
grep -rn 'href="#'\|'href="javascript:'\|href='#'\|href='javascript:' src/
```
Result: `NO_DUMMY_HREFS` — no placeholder or unsafe hrefs remain in `src/`.

---

## 3. Auth-Readiness Audit

### 3.1 Classification
**web3-auth** (EIP-1193 injected wallet). No email/password or OAuth path exists.

### 3.2 Implementation Paths

| Path | File | Lines | Description |
|---|---|---|---|
| Provider detection | `src/lib/wallet-auth.ts` | 25-31 | `getInjectedEthereumProvider()` reads `window.ethereum` with SSR guard. |
| Initial state | `src/lib/wallet-auth.ts` | 33-43 | Returns `wallet-unavailable` if provider missing; `ready` if present. |
| Auth request | `src/lib/wallet-auth.ts` | 54-104 | `requestMezoWalletAuth`: `eth_requestAccounts` -> chain check -> `wallet_switchEthereumChain`/`wallet_addEthereumChain` for Mezo testnet `31611` -> `personal_sign` with scoped message. |
| UI panel | `src/components/WalletAuthPanel.tsx` | 16-89 | Displays status pill, account/signature facts, error box, and disabled/enabled connect button. |

### 3.3 Test Evidence

| Test | Command | Result |
|---|---|---|
| Missing provider helper | `npm test` | `requestMezoWalletAuth(undefined)` resolves to `status: "wallet-unavailable"`. |
| Injected provider helper | `npm test` | Mock provider returns account, chain `0x7b7b`, signature; asserts `status: "connected"` and correct call sequence. |
| E2E no-wallet fail-closed | `npm run test:e2e` | Page init script removes `window.ethereum`. Asserts "Wallet unavailable", disabled "Connect and sign", absence of "Wallet verified". |

### 3.4 Exact Gap / Blocker

- **Live wallet signature**: No injected browser wallet was available in the Playwright test browser. The app correctly fails closed. To unblock, open the app in a browser/profile with an unlocked EIP-1193 wallet, switch/add chain `31611`, sign the readiness message, and record the account/signature.
- **Live deployer key**: `MEZO_DEPLOYER_PRIVATE_KEY` is unset. `npm run deploy:mezo` throws immediately. No tx hash or contract address exists.

---

## 4. Integration-Readiness Audit

| Integration | Real Access Path | Env / Credential | Proof Command or Browser Proof | Fixture Policy | Status | Blocker |
|---|---|---|---|---|---|---|
| Mezo testnet RPC | `https://rpc.test.mezo.org` JSON-RPC | None for `eth_chainId` | `npm run check:rpc` -> `Mezo RPC OK: https://rpc.test.mezo.org -> 0x7b7b`; E2E RPC test -> `0x7b7b` | No fixture | **proven-real** | None |
| Mezo chain metadata | `src/lib/mezo.ts` | None | Build passes (`npm run build`) | Static config only | **implemented** | Must re-check if Mezo changes testnet config |
| Injected browser wallet | EIP-1193 `window.ethereum` | Unlocked browser wallet; Mezo testnet; user approval | E2E verifies no-wallet fail-closed; unit test verifies provider helper | No fake connected state | **auth-blocked-safe** | No injected wallet in automation browser |
| Mezo testnet contract deployment | `scripts/deploy-mezo.mjs` via viem | `MEZO_DEPLOYER_PRIVATE_KEY`; optional `MEZO_RPC_URL` | `npm run deploy:mezo` fails closed with required-key error | Fixture receipt used while blocked | **blocked-safe** | Needs funded testnet deployer key |
| Contract vote transaction | `castVote(...)` | Funded wallet + deployed contract address | Not run; no tx hash | Fixture receipt must stay labeled | **blocked** | Same deployer/funding blocker |
| Solidity compiler / artifact | Local `solc` dev dependency | None | `npm run contracts:compile` -> `artifacts/GovernanceAllocator.json` | No fixture | **proven-local** | 2 low dev-only `solc -> tmp` audit findings; force fix would downgrade to 0.5.0 |
| Fixture/demo data | `src/lib/fixtures.ts`; `buildFixtureReceipt` | None | `npm test`; `npm run test:e2e`; visual QA summary | Allowed only with visible labels | **implemented** | Must not be described as live or local-chain proof |
| Public GitHub repo | Persona-owned GitHub | Assigned primary submitter Chrome profile | Not attempted (`TEAM.md` blocks) | N/A | **blocked** | Gabriel must assign primary submitter/profile |
| Submission portal | Encode/Mezo register surface | Assigned submitter; portal login | Not attempted; no final submit | N/A | **blocked** | Needs submitter, repo URL, demo URL, video URL |
| Formal M2 `/polish` | `PLAYWRIGHT_CLI_REMOTE=m2worker` | Reachable M2 worker over Tailscale/SSH | `browser start` failed SSH timeout to `100.115.214.82:22`; report saved at `~/.playwright-sessions/.reports/2026-05-22T01-42-23-407-attempted-formal-m2-polish-browser-start-for-mez.md` | Local fallback allowed | **blocked** | M2/Tailscale unavailable |
| Local visual QA fallback | Local headless Chrome | None | `outputs/visual-qa/2026-05-22T01-46-51-627Z/summary.json` + screenshots | Honest label: local visual QA | **passed** | Formal polish still blocked |
| E2E automation | `@playwright/test` + Vite webServer | None | `npm run test:e2e` passed 4 tests | External RPC is real; wallet success is unit-level only | **passed-local** | Live wallet signature blocked |
| Production dependency security | `npm audit --omit=dev` | None | `found 0 vulnerabilities` (verified 2026-05-22) | No security claim for dev audit | **passed-production** | Full `npm audit` exits 1 with 2 low dev-only findings |

### Removed Integrations (evidence of deletion)

Command:
```bash
grep -rni 'passport\|rainbow\|wagmi\|tanstack.*query' src/ test/ e2e/ scripts/ package.json
```
Result: `NO_LEGACY_WALLET_STACK` — `@mezo-org/passport`, RainbowKit, Wagmi, and TanStack Query were removed during hardening. No references remain.

---

## 5. Environment Variable Inventory

| Var | Required? | Default | Used In | Purpose |
|---|---|---|---|---|
| `VITE_ALLOCATOR_ADDRESS` | No | `undefined` | `src/lib/mezo.ts:14` | Optional live allocator contract address. When absent, UI shows "Fixture demo mode". |
| `MEZO_RPC_URL` | No | `https://rpc.test.mezo.org` | `scripts/check-rpc.mjs:1`, `scripts/deploy-mezo.mjs:11` | Override Mezo testnet RPC endpoint. |
| `MEZO_CHAIN_ID_HEX` | No | `0x7b7b` | `scripts/check-rpc.mjs:2` | Override expected chain id hex for RPC smoke check. |
| `MEZO_DEPLOYER_PRIVATE_KEY` | Yes (for deploy only) | `undefined` | `scripts/deploy-mezo.mjs:6` | Deployer wallet private key for testnet contract deployment. Script throws if missing. |
| `LOCAL_VISUAL_QA_URL` | No | `http://localhost:5180/` | `scripts/local-visual-qa.mjs:11` | Override base URL for local visual QA. |
| `LOCAL_VISUAL_QA_DIR` | No | `outputs/visual-qa/<stamp>` | `scripts/local-visual-qa.mjs:13` | Override output directory for visual QA screenshots. |

**No `.env` file exists** in the workspace. No secrets are committed.

---

## 6. Test Script Inventory

| Script | Command | Type | Evidence | Status |
|---|---|---|---|---|
| Unit / helper tests | `npm test` | Vitest | 1 file, 8 tests passed. Covers allocator math (5 tests) + wallet auth helper (2 tests) + fixture receipt honesty (1 test). | passed |
| E2E readiness | `npm run test:e2e` | Playwright | 4 tests passed. Primary happy path, auth fail-closed, no-dummy action audit, real RPC check. | passed-local |
| RPC smoke | `npm run check:rpc` | Node script | Returns `0x7b7b` from `https://rpc.test.mezo.org`. | passed |
| Contract compile | `npm run contracts:compile` | Node script + solc | Regenerates `artifacts/GovernanceAllocator.json`. | passed |
| Mezo deploy | `npm run deploy:mezo` | Node script + viem | Fails closed with `MEZO_DEPLOYER_PRIVATE_KEY is required`. | blocked-safe |
| Build | `npm run build` | tsc + Vite | JS `344.13 kB` / gzip `109.45 kB`. | passed |
| Dev server | `npm run dev` | Vite | Serves on `0.0.0.0`. Not a test. | working |

---

## 7. Fixture / Mock / Simulation Label Inventory

| Label / Claim | File | Line | Context | Verdict |
|---|---|---|---|---|
| `Fixture receipt` | `src/components/ReceiptPanel.tsx` | 24 | Mode badge on receipt panel. Always shown when `receipt.mode === "fixture"`. | **honest label present** |
| `Mezo testnet receipt` | `src/components/ReceiptPanel.tsx` | 12 | Defined in `modeLabel` map, but only rendered if `receipt.mode === "live-testnet"`. | **not shown without live tx** |
| `fixture-only-not-deployed` | `src/lib/allocator.ts` | 162 | Hard-coded contract address in `buildFixtureReceipt`. | **honest label present** |
| `Fixture demo mode` | `src/App.tsx` | 32 | Status pill when `allocatorAddress` is falsy. | **honest label present** |
| `Allocator address configured` | `src/App.tsx` | 32 | Status pill when `VITE_ALLOCATOR_ADDRESS` is set. | **conditional honest label** |
| `Local contract proof` | — | — | **Removed** during hardening. E2E and visual QA assert count = 0. | **removed-needed** |
| `fixture-<hash>` | `src/lib/allocator.ts` | 163 | Deterministic fake hash prefix in fixture receipt. | **honest prefix present** |

### Visual QA Evidence (latest run: `2026-05-22T01-46-51-627Z`)

```json
{
  "hasFixtureReceipt": true,
  "hasFakeLocalProof": false,
  "hasLiveReceipt": false,
  "hasFixtureContractLabel": true,
  "hasWalletUnavailableState": true,
  "hasWalletVerifiedState": false
}
```

All three viewports (375, 768, 1440) confirm the same label state.

---

## 8. Storage Audit (localStorage / sessionStorage)

Command:
```bash
grep -rn 'localStorage\|sessionStorage' src/ e2e/ test/ scripts/
```
Result: `NO_STORAGE_FOUND`

**Verdict**: The app does not persist wallet state, receipts, or gauges in browser storage. All state is in React component memory. This is safe for the demo but means wallet auth must be re-done on every reload.

---

## 9. Security / Dependency Audit

Command:
```bash
npm audit --omit=dev --json
```
Result (verified 2026-05-22):
```json
{
  "vulnerabilities": 0,
  "metadata": {
    "vulnerabilities": { "info": 0, "low": 0, "moderate": 0, "high": 0, "critical": 0, "total": 0 },
    "dependencies": { "prod": 24, "dev": 228, "optional": 53, "peer": 0, "peerOptional": 0, "total": 251 }
  }
}
```

Full `npm audit` (including dev):
- 2 low severity findings via `solc -> tmp` transitive dependency.
- Force fix would downgrade `solc` to `0.5.0`, breaking Solidity `^0.8.28` intent.
- Decision: **do not force-fix dev-only low findings**.

---

## 10. Exact Blockers

| Blocker | Impact | Unblock Condition | Risk if Bypassed |
|---|---|---|---|
| No injected browser wallet in test browser | Cannot obtain live `personal_sign` proof; cannot claim "Wallet verified" | Open app in browser with unlocked EIP-1193 wallet on Mezo testnet `31611`, sign message, record account/signature | Fake connected state / dummy signature |
| Missing `MEZO_DEPLOYER_PRIVATE_KEY` | Cannot deploy contract or produce live tx hash; receipt stays fixture | Provide funded testnet private key; run `npm run deploy:mezo`; capture `outputs/mezo-deployment.json` | Invented tx hash / fake explorer link |
| No assigned primary submitter (`TEAM.md`) | Cannot create public repo or perform logged-in portal actions without wrong identity | Gabriel assigns submitter/profile in `TEAM.md` | Wrong persona mutation on GitHub / submission portal |
| M2 worker SSH timeout (`100.115.214.82:22`) | Cannot run formal `/polish` via remote Playwright browser | Restore Tailscale / M2 worker reachability | None — local visual QA fallback exists and is honest |
| No `.env` file with `VITE_ALLOCATOR_ADDRESS` | UI stays in "Fixture demo mode" | Set env var after contract deployment | None — honest label is correct |

---

## 11. File Reference Index

Key files inventoried (all in workspace):

- `src/App.tsx` — root layout, hero simulate button, faucet link, mode status pill.
- `src/components/AllocatorWorkbench.tsx` — workbench simulate button, position range inputs, gauge weight callback.
- `src/components/GaugeCard.tsx` — gauge cards, weight sliders.
- `src/components/GaugeConstellation.tsx` — SVG gauge routing map (visual only, no interactive actions).
- `src/components/ImpactStrip.tsx` — impact metric cards (display only).
- `src/components/ReceiptPanel.tsx` — receipt panel with mode badge, conditional explorer link.
- `src/components/WalletAuthPanel.tsx` — wallet auth UI, connect button with disabled states.
- `src/lib/allocator.ts` — math, normalization, fixture receipt builder.
- `src/lib/fixtures.ts` — initial gauge and position fixture data.
- `src/lib/mezo.ts` — chain metadata, optional allocator address, explorer URL helper.
- `src/lib/wallet-auth.ts` — EIP-1193 provider detection, chain switch, signing helper.
- `src/lib/contract.ts` — allocator ABI and event definition.
- `contracts/GovernanceAllocator.sol` — Solidity source.
- `scripts/check-rpc.mjs` — RPC smoke check.
- `scripts/compile-contract.mjs` — solc compile to artifacts.
- `scripts/deploy-mezo.mjs` — viem deployment script (fails closed without key).
- `scripts/local-visual-qa.mjs` — local headless screenshot runner.
- `e2e/readiness.spec.ts` — 4 Playwright E2E tests.
- `test/allocator.test.ts` — 8 Vitest unit/helper tests.
- `playwright.config.ts` — E2E config with Vite webServer on port 5180.
- `package.json` — scripts and dependencies.

---

*End of inventory. Ready for Claude/GPT build review.*
