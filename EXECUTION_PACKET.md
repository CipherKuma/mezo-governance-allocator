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

- Repo: `https://github.com/gabrielantonyxaviour/mezo-governance-allocator` (live, pushed 2026-05-24)
- Demo: `https://mezo-governance-allocator.vercel.app` (live, Vercel production 2026-05-24)
- Video: pending (Gabriel must record).
- Contract: `contracts/GovernanceAllocator.sol` (deployed to Mezo testnet: BLOCKED — deployer wallet has 0 balance; see testnet deploy blocker below)
- Mezo docs: `https://mezo.org/docs/developers/getting-started`
- Mezo Earn docs: `https://mezo.org/docs/users/mezo-earn/overview/`

## Testnet Deploy Blocker

Deployer address: `0x86CA136dc8B2Ac6B10143Ed23AC361FCBbd6bFCa` (from vault `DEPLOYER_PRIVATE_KEY`)
Mezo testnet balance: **0 BTC** (checked 2026-05-24)
Faucet: `https://faucet.test.mezo.org` — requires Cloudflare Turnstile CAPTCHA (agent-browser session rendered blank; automated bypass not possible)

**Gabriel next step:** Fund `0x86CA136dc8B2Ac6B10143Ed23AC361FCBbd6bFCa` from faucet, then run:
```bash
export MEZO_DEPLOYER_PRIVATE_KEY=$(grep 'DEPLOYER_PRIVATE_KEY=' ~/.claude/vault/.env.master | cut -d= -f2-)
npm run contracts:compile && npm run deploy:mezo
```
Output will write to `outputs/mezo-deployment.json` with contract address + vote tx hash.

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
- [ ] Mezo testnet deploy: blocked on 0 wallet balance — fund faucet then `npm run deploy:mezo`.
- [ ] Video recording (Gabriel must record screen demo).
- [ ] Submission portal final submit (Gabriel must do this — never auto-submit).
