# Deployments

## Mezo Testnet (Chain ID: 31611 / 0x7b7b)

RPC: `https://rpc.test.mezo.org` · Explorer: `https://explorer.test.mezo.org`

Verified on-chain 2026-05-25 via `scripts/verify-live-proof.mjs` (`npm run verify:proof` — ALL CHECKS PASSED). These addresses match the Vercel production env vars and `outputs/full-deployment.json`.

### Canonical / Live Deployment

| Contract | Address | Explorer |
|----------|---------|----------|
| MUSDGovernanceAllocator | `0x1cdba6eec37d77d8994296a29fdc2c230cc0596a` | [View](https://explorer.test.mezo.org/address/0x1cdba6eec37d77d8994296a29fdc2c230cc0596a) |
| MockMEZO (testnet bootstrap ERC-20) | `0x08b9caca9c9885d86d97d6928a3f44903a030778` | [View](https://explorer.test.mezo.org/address/0x08b9caca9c9885d86d97d6928a3f44903a030778) |
| MockMUSD (testnet bootstrap ERC-20) | `0xd6f43325a1103a16fccf268e28da053daadb755a` | [View](https://explorer.test.mezo.org/address/0xd6f43325a1103a16fccf268e28da053daadb755a) |

**Allocator code on-chain:** 5757 bytes.

**On-chain state:** 50,000 MUSD treasury deposited · 4 gauges registered (BTC/MUSD Pool, MUSD Savings, Validator Yield, Ecosystem Grants) · `currentEpoch` = 1 · `epochDuration` = 300s (5 minutes, testnet demo).

**Sample vote transaction:** `0xabf4bd58b6b5a2fd39b932f9b2e0aa12e47550612c1457cdfe4baf672d919b16` — status SUCCESS, block 13259078. [View tx](https://explorer.test.mezo.org/tx/0xabf4bd58b6b5a2fd39b932f9b2e0aa12e47550612c1457cdfe4baf672d919b16)

**Note:** MockMEZO and MockMUSD are testnet bootstrap ERC-20 mocks used to fund the demo. They are NOT the real Mezo MUSD/MEZO tokens.

### Historical / Superseded Deployments

These exist on-chain but are NOT the current product contract. Kept for an honest record only.

| Contract | Address | Status |
|----------|---------|--------|
| MUSDGovernanceAllocator (v2 draft) | `0xbce0f5d8403434b5599726e5081c64588252a158` | Superseded by the canonical deployment above. |
| GovernanceAllocator (v1 original) | `0x6758965df82863e05583fc975a95dfd0b391f446` | Superseded. Its vote tx `0x57640d16ec5c7ae8b6d51dfcad3bf6d5e785bf28ba45f3c96df1c65a7398de40` belongs to this old v1 deploy, not the current product. |

### Real Mezo Token Addresses (Read-Only Reference)

| Token | Testnet Address |
|-------|----------------|
| MUSD | `0x118917a40FAF1CD7a13dB0Ef56C86De7973Ac503` |
| MEZO | `0x7B7c000000000000000000000000000000000001` |

### Deployer
- Address: `0x86CA136dc8B2Ac6B10143Ed23AC361FCBbd6bFCa`

## Vercel (Frontend)

- URL: https://mezo-governance-allocator.vercel.app
- Scope: rax-tech
