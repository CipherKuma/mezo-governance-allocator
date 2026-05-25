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

- Repo: `https://github.com/CipherKuma/borealis` (live, pushed 2026-05-25)
- Demo: `https://mezo-governance-allocator.vercel.app` (live, Vercel production 2026-05-24)
- Video: pending (Gabriel must record).
- Contract: `contracts/GovernanceAllocator.sol` (deployed to Mezo testnet at `0x6758965df82863e05583fc975a95dfd0b391f446`)
- Mezo docs: `https://mezo.org/docs/developers/getting-started`
- Mezo Earn docs: `https://mezo.org/docs/users/mezo-earn/overview/`

## Testnet Deployment (COMPLETE)

- Contract: `0x6758965df82863e05583fc975a95dfd0b391f446`
- Deploy tx: `0x6a9fe51b0e10712867624495a523f64244cf228d082e80a19ffcc5aeae4920b8`
- Vote tx: `0x57640d16ec5c7ae8b6d51dfcad3bf6d5e785bf28ba45f3c96df1c65a7398de40`
- Explorer: https://explorer.test.mezo.org/tx/0x57640d16ec5c7ae8b6d51dfcad3bf6d5e785bf28ba45f3c96df1c65a7398de40
- Deployer: `0x86CA136dc8B2Ac6B10143Ed23AC361FCBbd6bFCa`
- 4 gauges registered, sample vote cast at block 13257687.

## Final Checklist

- [x] Council artifacts read.
- [x] Browser runbook and profile registry read.
- [x] Sponsor/API/UI/repo/submission plans written.
- [x] Frontend implemented.
- [x] Contract implemented.
- [x] Tests passing (8 unit + 4 E2E).
- [x] Local visual QA at 375/768/1440 (outputs/visual-qa/).
- [x] Public repo created: `gabrielantonyxaviour/mezo-governance-allocator`.
- [x] Vercel demo deployed: `https://mezo-governance-allocator.vercel.app`.
- [x] Mezo testnet deploy: `0x6758965df82863e05583fc975a95dfd0b391f446` (2026-05-25).
- [ ] Video recording (Gabriel must record screen demo).
- [ ] Submission portal final submit (Gabriel must do this — never auto-submit).
