# Borealis

Sybil-resistant MUSD treasury allocation via veMEZO gauge votes — built for the Mezo Hackathon (MEZO Utilization track).

Borealis lets MEZO holders lock their tokens for veMEZO voting power, then vote on gauges that direct MUSD treasury grants across ecosystem initiatives. Epoch settlement distributes MUSD proportional to each gauge's vote weight. Three contracts are deployed on Mezo testnet with mock tokens for a complete demo flow.

## What It Ships

- React control room (RainbowKit + wagmi) for the full lock → vote → settle → distribute flow.
- `MUSDGovernanceAllocator` contract: MUSD treasury, veMEZO locking, voter registry (Sybil gating), gauge voting, epoch settlement.
- `MockMEZO` + `MockMUSD` ERC-20s with faucet functions for demo without real funds.
- Whitepaper-accurate veMEZO lock-boost formula (longer lock = higher weight).
- Cloudflare D1 backend for off-chain metadata (profiles, gauge applications, comments, leaderboards).

## Demo State Transition

1. Mint test MEZO + MUSD from the in-app faucet.
2. Lock MEZO for a chosen duration (7–365 days) to receive veMEZO voting power.
3. Vote on the four gauges (BTC/MUSD Pool, MUSD Savings, Validator Yield, Ecosystem Grants).
4. Wait for the epoch to close (5-minute epochs on testnet).
5. Settle the epoch — MUSD is distributed proportional to vote weight.
6. View the on-chain settlement transaction on the Mezo explorer.

## Commands

```bash
npm install
npm run check:rpc
npm run contracts:compile
npm test
npm run test:e2e
npm run build
npm run dev -- --port 5180 --strictPort
```

Local app URL in this run: `http://localhost:5180/`

## Mezo Testnet Deploy

Required environment:

```bash
export MEZO_DEPLOYER_PRIVATE_KEY=0x...
export MEZO_RPC_URL=https://rpc.test.mezo.org
```

Then:

```bash
npm run contracts:compile
npm run deploy:mezo
```

The script writes deployment proof to `outputs/mezo-deployment.json`.

## Current Integration Status

- Mezo testnet RPC verified: chain id `31611` / `0x7b7b`.
- Web3 auth gate implemented through an injected EIP-1193 browser wallet: account request, Mezo chain check/switch attempt, and signed readiness message.
- Current browser proof shows the no-wallet blocked state, not a verified wallet signature.
- GovernanceAllocator deployed to Mezo testnet at `0x6758965df82863e05583fc975a95dfd0b391f446`.
- Sample vote cast on-chain: [explorer](https://explorer.test.mezo.org/tx/0x57640d16ec5c7ae8b6d51dfcad3bf6d5e785bf28ba45f3c96df1c65a7398de40).
- Removed unused Passport/RainbowKit/Wagmi packages from the runnable demo because they were not active in the UI and carried production audit findings. The active wallet path is direct injected-wallet EIP-1193 plus `viem` for deployment/RPC scripting.
- `npm audit --omit=dev` is clean. Full `npm audit` still reports 2 low dev-only vulnerabilities through `solc -> tmp`; the available fix would force `solc@0.5.0`, which is not safe for this Solidity 0.8 contract.

## Source Docs

- Mezo docs: https://mezo.org/docs/developers/getting-started
- Mezo Earn overview: https://mezo.org/docs/users/mezo-earn/overview/
- Mezo voting docs: https://mezo.org/docs/users/mezo-earn/vote/
- Hackathon announcement: https://mezo.org/blog/the-mezo-hackathon-is-back/
