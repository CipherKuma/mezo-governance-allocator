# Build Plan

Date: 2026-05-21

## Stack

- React + TypeScript + Vite
- Tailwind CSS
- framer-motion
- lucide-react
- viem + wagmi + `@mezo-org/passport`
- Vitest for TypeScript allocation logic
- Solidity contract plus compile/deploy scripts

## Product Scope

Build `Mezo Allocator`, a governance allocator and gauge simulator for the MEZO Utilization track.

Core surfaces:

- Landing/control-room first screen.
- Gauge allocation workbench.
- MEZO boost and veBTC lock simulation.
- Before/after emissions and MUSD impact.
- Receipt panel that distinguishes fixture/demo receipts from Mezo testnet receipts.
- Contract/deploy docs and scripts.

## Demo Path

1. Start at the first-screen allocator.
2. Show current weights across BTC/MUSD, MUSD Savings, Validator Yield, and Ecosystem Grants.
3. Adjust MEZO boost and allocation weights.
4. Click "Simulate Allocation" to update calculated state.
5. If a deployed allocator address exists, submit transaction and show Mezo testnet receipt.
6. Otherwise show explicit fixture/demo proof and state the deploy blocker.

## Backend/API Choices

- No centralized backend for the hackathon build.
- The authoritative write surface is the Solidity allocator contract.
- Static fixture data lives in frontend code and is visibly labeled.
- Deployment and transaction scripts live in `scripts/`.

## Milestones

1. Planning artifacts and spec.
2. Contract + deploy/check scripts.
3. Allocation math + tests.
4. Template-informed UI.
5. README and execution packet.
6. Build/test/browser verification.
7. Builder report.

## Cut Rules

- Cut real testnet deployment if no funded `MEZO_DEPLOYER_PRIVATE_KEY`.
- Cut submission portal and public repo creation until primary submitter is assigned.
- Cut any claim of live veMEZO if only fixture/demo proof exists.
