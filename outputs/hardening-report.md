# Hardening Report

Date: 2026-05-22 IST
Final status: demo-ready

Workspace: `/Users/gabrielantonyxaviour/Documents/hackathons/mezo-hackathon/execution/2026-05-21T00-46-20Z-mezo-governance-allocator-and-gauge-simulator`

## Summary

Hardened the existing Mezo Allocator run into an honest local demo. The app now avoids unsupported local-contract/live-testnet claims, the primary fixture demo has browser proof at 375/768/1440, and the allocator math no longer reports a zero emission delta after a gauge rebalance.

This is not `submit-ready`: Mezo testnet deployment, public repo, public demo URL, submission portal, formal M2 `/polish`, and dependency security are still blocked.

## Changes Made

- Removed the static `localProofReceipt` from the active UI and defaulted receipts to generated fixture receipts.
- Removed the inactive `local-contract` receipt mode from the current TypeScript receipt model.
- Replaced the fake-looking fixture contract address with `fixture-only-not-deployed`.
- Relabeled UI copy, README copy, and demo script copy so fixture mode cannot be mistaken for local-chain or live-testnet proof.
- Fixed `calculateImpact` so the emission delta uses the leading gauge delta instead of total normalized emissions.
- Added a zero-weight normalization test to prevent `NaN` allocation states.
- Fixed desktop visual stretching in the impact strip.
- Added `scripts/local-visual-qa.mjs` to capture fallback screenshots and verify the primary demo path.
- Updated `FEATURE_MATRIX.md`, `INTEGRATION_MATRIX.md`, `TRUTH_AUDIT.md`, and `QUALITY_GATE.md`.

## Checks Run

| Check | Result |
|---|---|
| `npm run check:rpc` | Passed: Mezo RPC returned `0x7b7b`. |
| `npm run contracts:compile` | Passed: artifact regenerated at `artifacts/GovernanceAllocator.json`. |
| `npm test` | Passed: 1 file, 6 tests. |
| `npm run build` | Passed: TypeScript + Vite build, JS `338.34 kB` / gzip `107.71 kB`. |
| `git diff --check` | Passed. |
| `npm run deploy:mezo` | Blocked-safe: fails with missing `MEZO_DEPLOYER_PRIVATE_KEY`. |
| `npm audit --omit=dev` | Failed: 88 vulnerabilities, including 2 critical. |
| `npm audit fix` | No safe fix; force would install breaking wallet-stack versions. |

## Visual Proof

Formal M2 `/polish` is blocked. `PLAYWRIGHT_CLI_REMOTE=m2worker` is set, but the worker is unreachable: `browser start` timed out on SSH to `100.115.214.82:22`. CLI report:
`/Users/gabrielantonyxaviour/.playwright-sessions/.reports/2026-05-21T23-52-13-076-attempted-formal-m2-polish-browser-start-for-mez.md`

Local fallback passed:

- Summary: `outputs/visual-qa/2026-05-21T23-57-16-271Z/summary.json`
- Mobile 375: `outputs/visual-qa/2026-05-21T23-57-16-271Z/mobile-375.png`
- Tablet 768: `outputs/visual-qa/2026-05-21T23-57-16-271Z/tablet-768.png`
- Desktop 1440: `outputs/visual-qa/2026-05-21T23-57-16-271Z/desktop-1440.png`
- Primary flow: `outputs/visual-qa/2026-05-21T23-57-16-271Z/primary-flow-after-simulate.png`

The summary recorded no horizontal overflow at all three widths, fixture receipt visible, fake local proof absent, live receipt absent, fixture-only contract label visible, and leading gauge changed to `ecosystem-grants`.

## Real Integrations Proven

- Mezo testnet RPC access: proven by `eth_chainId = 0x7b7b`.
- Solidity contract compilation: proven locally by `npm run contracts:compile`.
- Local frontend demo: proven in browser through the primary flow.

## Fixtures / Mocks

- The UI receipt is fixture demo data. It is labeled `Fixture receipt` and uses `fixture-only-not-deployed`.
- The veBTC/MEZO/gauge values are deterministic demo fixtures, not live protocol reads.
- No local-chain proof is claimed. The earlier static local proof was removed from the active UI.

## Blockers

1. Funded Mezo testnet deployer key is missing: `MEZO_DEPLOYER_PRIVATE_KEY`.
2. Primary submitter/persona is not assigned, so GitHub repo and submission portal work remain blocked.
3. Formal M2 `/polish` is blocked by worker/Tailscale/SSH availability.
4. `npm audit --omit=dev` reports unresolved wallet-stack vulnerabilities, including 2 critical.
5. Public repo URL, public demo URL, and demo video URL do not exist yet.

## Exact Next Actions

1. Assign one primary submitter/profile in `TEAM.md`.
2. Use `agent-browser` with that profile to create/verify the public GitHub repo and inspect the Encode submission portal.
3. Provide a funded Mezo testnet deployer key as `MEZO_DEPLOYER_PRIVATE_KEY`.
4. Run `npm run deploy:mezo`, then record contract address, vote tx, and explorer link.
5. Decide whether to keep `@mezo-org/passport` despite audit findings, pin patched wallet-stack versions, or remove Passport from the demo build until the official stack is clean.
6. Restore M2/Tailscale and run formal `/polish`.
