# Execution Packet

Date: 2026-05-21

## Project

Name: Mezo Allocator

One-line: MEZO becomes the dial that steers Bitcoin-backed capital.

Track: MEZO Utilization

Secondary angle: Bank on Bitcoin

## README Source Of Truth

Mezo Allocator is a governance allocator and gauge simulator for the Mezo ecosystem. It models how veBTC base power, MEZO boost, and gauge votes change weekly emissions, MUSD flow, and BTC-backed liquidity outcomes. The build includes a deployable Solidity allocator contract that can emit `AllocationUpdated`, a template-informed React control room, and a clear fixture-vs-live receipt boundary.

## Demo Script

1. Open the app and point to the mode badge: `Fixture demo mode` unless a real allocator address and transaction proof have been configured.
2. Show the current gauges: BTC/MUSD pool, MUSD Savings, Validator Yield, Ecosystem Grants.
3. Explain the voting model: locked BTC gives base voting power; MEZO boost amplifies it up to a capped multiplier.
4. Drag or click a proposed allocation that moves weight toward Ecosystem Grants.
5. Click "Simulate Allocation".
6. Show the before/after allocation chart and the fixture receipt label.
7. If testnet is funded, submit `castVote` and show the Mezo explorer transaction.
8. Close with the continuation: this becomes a grant committee workbench for proposals, delegated voting, and epoch simulations.

## Video Script

"Most hackathon teams will build another payment demo. Mezo Allocator goes to the underbuilt part of the protocol: governance utility. We show how MEZO changes the direction of Bitcoin-backed capital. A veBTC position starts with base voting power. MEZO boost changes the multiplier. Then a gauge vote changes where emissions and MUSD-linked activity flow. The important part is the receipt: this is not a static calculator. The contract emits AllocationUpdated, and when a funded Mezo testnet wallet is available the same path posts to chain. This is the first version of a governance workbench Mezo could give to grant committees, validators, and ecosystem teams."

## Judging Criteria Mapping

- Technical novelty: deployable allocator/gauge contract plus event receipt.
- Sponsor fit: MEZO Utilization, Mezo Earn gauge model, MUSD/BTC impact display.
- Demo clarity: one vote, one visible allocation update, one receipt.
- Continuation potential: grant committee and ecosystem allocation workbench.
- Honesty: fixture state is labeled directly in the UI; Mezo testnet state is reserved for a funded deployment and vote transaction.

## Links

- Repo: BLOCKED until primary submitter assigned.
- Demo: `http://localhost:5180/` during this execution run.
- Video: pending.
- Contract: `contracts/GovernanceAllocator.sol`
- Mezo docs: `https://mezo.org/docs/developers/getting-started`
- Mezo Earn docs: `https://mezo.org/docs/users/mezo-earn/overview/`

## Final Checklist

- [x] Council artifacts read.
- [x] Browser runbook and profile registry read.
- [x] Sponsor/API/UI/repo/submission plans written.
- [x] Frontend implemented.
- [x] Contract implemented.
- [x] Tests passing.
- [ ] Browser/UI proof captured. Blocked: M2 Playwright route unavailable because Tailscale is stopped and `ssh m2worker` timed out.
- [ ] Public repo created after owner assignment.
- [ ] Submission portal prepared after owner assignment.
