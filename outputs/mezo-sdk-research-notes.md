# Mezo SDK Research Notes

Date: 2026-05-25
Source: Mezo docs, whitepaper (Dec 2025), npm packages, GitHub org, Mezo testnet RPC

---

## Confirmed Contract Addresses

### Mezo Testnet (Chain 31611)

| Token | Address | Verified |
|---|---|---|
| MUSD | `0x118917a40FAF1CD7a13dB0Ef56C86De7973Ac503` | name()="Mezo USD", decimals=18 |
| MEZO | `0x7B7c000000000000000000000000000000000001` | name()="MEZO", decimals=18 |
| BTC (native) | `0x7b7C000000000000000000000000000000000000` | system precompile |

### Mezo Mainnet (Chain 31612)

| Token | Address |
|---|---|
| MUSD | `0xdD468A1DDc392dcdbEf6db6e34E89AA338F9F186` |
| MEZO | `0x7B7c000000000000000000000000000000000001` |
| MUSD/BTC Pool | `0x52e604c44417233b6CcEDDDc0d640A405Caacefb` |
| PoolFactory | `0x83FE469C636C4081b87bA5b3Ae9991c6Ed104248` |

### NOT Found (Not Publicly Available)

| Contract | Status |
|---|---|
| veMEZO (VotingEscrow) | Not in docs, not in GitHub repos. Likely proprietary or not yet deployed on testnet. |
| veBTC (VotingEscrow) | Same — not publicly available. |
| GaugeController | Not in docs. |
| Splitter contracts | Not in docs. |
| Mezo Earn vault | Not in docs. |
| Mezo Passport on-chain contract | **Does not exist** — Passport is a frontend SDK, not an on-chain identity system. |

---

## SDK Packages

| Package | Version | What It Is |
|---|---|---|
| `@mezo-org/passport` | 0.17.2 | Wallet connection library (RainbowKit extension). Supports BTC wallets (Xverse, Unisat) + EVM wallets (MetaMask). **NOT Sybil resistance.** |
| `@mezo-org/contracts` | 0.4.0-dev.4 | Bridge/portal contracts only. Not governance/Earn. |
| `@mezo-org/musd-contracts` | — | MUSD lending protocol contracts (TroveManager, BorrowerOperations, StabilityPool, etc.) |

---

## Key Technical Findings

### Mezo Passport ≠ Sybil Resistance

The `@mezo-org/passport` package is a **wallet connection library**, not an identity/verification system. It extends RainbowKit to add Bitcoin wallet support. There is NO on-chain "Passport verification" contract. The name "Passport" refers to the wallet-connect experience, not identity attestation.

**Integration approach:** Use `@mezo-org/passport` for wallet connection (replacing our current direct EIP-1193 approach), and implement our own voter-registry for Sybil gating.

### veMEZO — Key Formulas (from Whitepaper)

The system is an Aerodrome ve(3,3) fork with dual-token modifications:

```
|veBTC| = BTC_locked × remaining_lock_duration / max_lock_duration
  max_lock_duration = 28 days
  min_lock = 1 day
  decay: linear

|veMEZO| = MEZO_locked × remaining_lock_duration / max_lock_duration  
  max_lock_duration = 4 years (1,456 days)
  min_lock = 1 week
  decay: linear

Boost_veMEZO = 4 × (|veBTC|_total / |veBTC|) × (|veMEZO| / |veMEZO|_total)

|veBTC·veMEZO| = |veBTC| × min(5, 1 + Boost_veMEZO)
  Max multiplier = 5× (hard cap)
```

**Critical:** veMEZO has NO independent voting power. It only boosts veBTC positions. For our governance use case, we model veMEZO as the primary voting token (since we're building a grant committee tool, not the core Earn system).

### Epoch System

- 7-day epochs, Thursday to Thursday 00:00 UTC
- Votes in epoch N → emissions for N+1, fees for N
- Splitter hierarchy: chain (20% validators / 80% ecosystem) → ecosystem (90% staking / 10% non-staking)
- Max 1% movement per epoch per splitter

### Emissions

Piecewise linear decay:
| Phase | Years | Rate |
|---|---|---|
| Bootstrap | 0–2 | 25% |
| Growth | 2–4 | 12.5% |
| Maturity | 4–8 | 6.25% |
| Perpetuity | 8+ | 2% |

### Rebase Formula

```
R_liquid = (S_total - S_ve) / S_total
E_rebase = E_t × R_liquid² × 0.5
E_reward = E_t - E_rebase
```

---

## Integration Architecture Decision

Since veMEZO/Earn contracts are NOT publicly available, we build our own simplified versions that faithfully implement the whitepaper formulas:

1. **Deploy mock MEZO + MUSD ERC-20 tokens** (with faucet functions for demo) alongside our contracts — allows full demo flow
2. **Read real MUSD/MEZO balances** from Mezo testnet contracts — shows we understand the ecosystem
3. **Use `@mezo-org/passport`** for wallet connection — official SDK integration
4. **Implement whitepaper-accurate voting math** in our contracts and frontend
5. **MUSD as the governed asset** — treasury holds MUSD, distributes to gauges per votes

---

## Deployer Token Balances (Checked)

- BTC: 0.05 (funded)
- MUSD: 0 (would need to borrow via TroveManager — collateralize BTC)
- MEZO: 0 (no testnet faucet found)
