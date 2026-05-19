# Sponsor Access Plan

Date: 2026-05-21

## Sponsor And Platform Surfaces

- Official hackathon announcement: `https://mezo.org/blog/the-mezo-hackathon-is-back/`
- Official docs: `https://mezo.org/docs/developers/getting-started`
- Mezo Earn voting docs: `https://mezo.org/docs/users/mezo-earn/vote/`
- Mezo Earn overview: `https://mezo.org/docs/users/mezo-earn/overview/`
- Submission/register surface from official announcement: Encode Club link from the Mezo blog.
- Public aggregator/reference page: `https://www.competehub.dev/en/competitions/encodeclub_mezo-hackathon-building-bitcoins-future`
- Testnet RPC: `https://rpc.test.mezo.org`
- Testnet chain id: `31611`
- Native gas asset: BTC
- Faucet: `https://faucet.test.mezo.org/`
- Testnet explorer: `https://explorer.test.mezo.org/`
- Wallet stack in runnable demo: injected EIP-1193 browser wallet plus `viem` scripts for RPC/deployment.
- Removed unused Mezo Passport/RainbowKit/Wagmi/TanStack Query packages during readiness because they were not active in the UI and kept production audit findings in the demo dependency tree.

## What Was Verified

- The Mezo testnet RPC returned `eth_chainId = 0x7b7b`, matching chain id `31611`.
- Browser auth gate now fails closed when no injected wallet is available and is ready to request accounts, verify/switch Mezo testnet, and sign a readiness message when a wallet exists.
- Official docs state Mezo is EVM-compatible and Hardhat/Foundry-compatible.
- Official docs state testnet gas requires BTC and the faucet is CAPTCHA-protected.
- Official Mezo Earn docs define the model this demo must reflect: veBTC is the base voting power, veMEZO amplifies/boosts, gauges receive votes, and weekly epochs direct emissions.

## Access Needed

- Primary submitter Chrome profile: blocked by `TEAM.md` ambiguity.
- GitHub profile verification for that submitter: blocked until persona assigned.
- Submission portal login/profile: blocked until persona assigned.
- Mezo testnet deployer wallet with funded testnet BTC: not available as `MEZO_DEPLOYER_PRIVATE_KEY`.
- Faucet: likely requires CAPTCHA, so it may require Gabriel only after an agent-browser attempt is made with the assigned profile.

## Real Demo State Transition

The demo must prove this transition:

1. A user chooses a veBTC position and MEZO boost amount.
2. A target gauge weight changes.
3. The allocator/gauge contract emits `AllocationUpdated`.
4. The UI renders before/after emissions, MUSD fee share, BTC-backed impact, and a receipt.

Live target:

- Deploy `GovernanceAllocator` to Mezo testnet.
- Call `castVote(positionId, gaugeIds, weightsBps, mezoBoostAmount)`.
- Show the transaction hash and event fields from Mezo testnet.

Fallback:

- Use deterministic TypeScript tests, compiled contract artifacts, and fixture data only when deployment is blocked.
- Label every fallback receipt as `Fixture demo`, not "live" or "local contract proof" unless a local chain transaction is actually captured.

## Blocker Policy

- Do not invent live veBTC/veMEZO state if live contract interaction is unavailable.
- Do not use unrelated private keys from the shell environment.
- Do not click final submit or legal attestations.
- Ask Gabriel only for the smallest missing item after self-service attempts: primary submitter assignment, CAPTCHA/faucet completion, or a funded `MEZO_DEPLOYER_PRIVATE_KEY`.
