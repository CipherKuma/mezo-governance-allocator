# API Plan

Date: 2026-05-21

## App Scope

This is a frontend-first governance workbench backed by:

- Deterministic TypeScript allocation math.
- A Solidity `GovernanceAllocator` contract for the vote/allocation event.
- A deployment script for Mezo testnet when `MEZO_DEPLOYER_PRIVATE_KEY` is provided.
- Static ABI and fixture receipts for demo mode.

## Data Model

### Gauge

- `id`: short stable id, for example `btc-musd`
- `label`: human-readable name
- `kind`: `staking`, `validator`, `ecosystem`, or `boost`
- `currentWeightBps`: current allocation in basis points
- `proposedWeightBps`: proposed allocation in basis points
- `feeApr`: modeled fee APR
- `musdFlow`: modeled MUSD flow affected by the vote
- `btcDepth`: modeled BTC-backed liquidity depth

### Position

- `tokenId`: veBTC or demo position id
- `lockedBtc`: BTC amount
- `daysRemaining`: lock duration remaining
- `baseVotingPower`: linearly decayed veBTC power
- `mezoBoost`: MEZO amount used for boost simulation
- `boostMultiplier`: capped at 5x
- `effectiveVotingPower`: base power times boost

### VoteReceipt

- `mode`: `live-testnet` or `fixture`; current UI uses `fixture` only until a real transaction proof exists.
- `chainId`: `31611` for Mezo testnet, local id for local tests
- `contractAddress`
- `txHash`
- `positionId`
- `weightsBps`
- `emissionsDelta`
- `musdImpact`
- `timestamp`

## Public Functions

Solidity contract:

- `registerGauge(bytes32 gaugeId, string label, uint16 weightBps)`
- `castVote(uint256 positionId, bytes32[] gaugeIds, uint16[] weightsBps, uint256 mezoBoostAmount)`
- `getGauge(bytes32 gaugeId)`

Events:

- `GaugeRegistered(bytes32 indexed gaugeId, string label, uint16 weightBps)`
- `AllocationUpdated(uint256 indexed positionId, bytes32 indexed leadingGauge, uint16 leadingWeightBps, uint256 mezoBoostAmount, uint256 epoch)`

Frontend helpers:

- `calculateBaseVotingPower`
- `calculateBoostMultiplier`
- `calculateEffectivePower`
- `rebalanceGauges`
- `buildFixtureReceipt`

## Secrets

- `MEZO_DEPLOYER_PRIVATE_KEY`: required only for deploy script. Never commit.
- `VITE_ALLOCATOR_ADDRESS`: deployed testnet allocator address for frontend live mode.
- `VITE_WALLETCONNECT_PROJECT_ID`: optional if Passport/RainbowKit WalletConnect needs it.

## Real Integration Proof Path

1. Verify RPC chain id with `scripts/check-rpc.mjs`.
2. Deploy the Solidity contract with `scripts/deploy-mezo.mjs`.
3. Register gauges.
4. Submit one allocation vote.
5. Store tx hash and contract address in `EXECUTION_PACKET.md`.
6. Update the frontend env with `VITE_ALLOCATOR_ADDRESS`.
7. Re-run app smoke tests and browser proof.

## Fallback Policy

If no funded deployer is available:

- Keep contract and scripts ready.
- Prove contract behavior with local tests.
- Render fixture receipt with strong visual labels.
- Mark backend/API status as blocked on funded Mezo testnet wallet, not complete.
