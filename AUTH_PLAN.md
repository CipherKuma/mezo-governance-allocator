# Auth Plan

Hackathon: Mezo Hackathon
Idea: MEZO Governance Allocator and Gauge Simulator
Updated: 2026-05-22 IST

Auth classification: **web3-auth**.

Evidence:

- The product's primary real action is a Mezo testnet gauge allocation/vote transaction.
- The demo needs wallet control, chain/network verification, and a transaction receipt before any live allocation claim is valid.
- Regular email/password or OAuth accounts are not part of the product's core workflow.
- The current browser automation environment has no injected wallet, so the app must fail closed instead of showing fake connected state.

| Actor / role | Required auth | Implementation path | Real credential/profile/wallet | Test proof | Status | Blocker |
|---|---|---|---|---|---|---|
| Primary user / judge | Injected EIP-1193 wallet, Mezo testnet chain, signed readiness message | `src/lib/wallet-auth.ts`; `src/components/WalletAuthPanel.tsx` | None available in current automation browser | `npm run test:e2e` verifies `Wallet unavailable`, disabled connect action, and no `Wallet verified`; `npm test` verifies provider account/chain/signature helper | auth-blocked-safe | Needs unlocked browser wallet on Mezo testnet for live signature proof. |
| Live allocation submitter | Funded Mezo testnet deployer/wallet | `scripts/deploy-mezo.mjs`; `contracts/GovernanceAllocator.sol` | `MEZO_DEPLOYER_PRIVATE_KEY` missing | `npm run deploy:mezo` fails closed with required-key error | blocked-safe | Needs funded testnet private key; faucet may require CAPTCHA/user approval. |
| Submission operator | Assigned hackathon Chrome persona/profile | Browser execution runbook + `submission-profile-registry.json` | Not assigned in `TEAM.md` | Not attempted to avoid wrong identity mutation | blocked | Gabriel must assign primary submitter/profile before GitHub/submission portal work. |

## Implemented Auth Behavior

- If `window.ethereum` is missing, the UI shows `Wallet unavailable`, explains the blocker, and disables `Connect and sign`.
- If a provider exists, the app requests `eth_requestAccounts`, checks `eth_chainId`, attempts Mezo testnet switch/add, then requests `personal_sign` for a scoped readiness message.
- The UI records account, chain id, and a signature preview only after the provider returns a signature.
- There is no dummy connect button and no fake connected wallet state.

## Remaining Auth Proof Needed

1. Open the app in a browser/profile with an unlocked injected wallet.
2. Switch/add Mezo testnet chain `31611`.
3. Sign the readiness message.
4. Record the connected account and signature proof in this file.
5. Use a funded deployer/wallet to deploy and call `castVote`, then replace fixture receipt claims with Mezo explorer evidence.

---

## Kimi Readiness Inventory — Auth Findings (2026-05-22)

- **localStorage/sessionStorage**: None. Wallet state is not persisted across reloads (`grep -rn 'localStorage\|sessionStorage' src/ e2e/ test/ scripts/` returned `NO_STORAGE_FOUND`).
- **Env vars**: No `.env` file exists. `MEZO_DEPLOYER_PRIVATE_KEY` is the only auth-relevant secret and it is absent (script fails closed immediately).
- **Removed stack verification**: `@mezo-org/passport`, RainbowKit, Wagmi, TanStack Query references are fully removed from `package.json` and source (`NO_LEGACY_WALLET_STACK`).
- **Exact disabled reason**: E2E asserts `disabledButtons` equals `["Connect and sign"]` and body contains "No injected browser wallet detected".
- **Live gap**: No browser wallet was available in the Playwright Chromium project; therefore no real `personal_sign` signature or account exists to record.
