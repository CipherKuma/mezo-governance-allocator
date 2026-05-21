# Mezo Allocator

MEZO Governance Allocator and Gauge Simulator for the Mezo Hackathon.

This build targets the MEZO Utilization track. It models how veBTC base voting power, MEZO boost, and gauge votes can redirect Bitcoin-backed capital across Mezo gauges, then produces an `AllocationUpdated` receipt instead of stopping at a static calculator.

## What It Ships

- Template-informed React control room using Gabriel's Portal/SaaS visual language.
- Deterministic allocator math for veBTC decay, MEZO boost, gauge normalization, and MUSD/BTC impact.
- Solidity `GovernanceAllocator` contract with `GaugeRegistered` and `AllocationUpdated` events.
- Mezo testnet RPC check and deployment script.
- Explicit receipt modes: fixture/demo receipt now, Mezo testnet receipt only after a funded deployment and vote transaction.

## Demo State Transition

1. Start from a veBTC position.
2. Adjust locked BTC, remaining lock days, and MEZO boost.
3. Change proposed gauge weights.
4. Simulate allocation.
5. Show before/after impact and an explicitly labeled fixture `AllocationUpdated` receipt.
6. With a funded deployer, run the same path on Mezo testnet and show the explorer link.

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
