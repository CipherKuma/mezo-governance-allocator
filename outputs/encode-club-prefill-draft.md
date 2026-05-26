# Encode Club Submission — Pre-fill Draft

**Portal:** https://www.encodeclub.com/programmes/mezo-hackathon-building-bitcoins-future
**Account needed:** `jedionchain@gmail.com` (Cipher Kuma)
**Status:** NOT YET SUBMITTED — all field values ready below.

---

## Field Values

### Project Name
Borealis — Sybil-resistant MUSD treasury via veMEZO gauge votes

### Short Description
Epoch-based governance allocator that distributes MUSD treasury grants across community gauges, weighted by veMEZO voting power (time-locked MEZO). Deployed on Mezo testnet with mock tokens and a full demo flow.

### Long Description
Borealis is a governance allocator for the Mezo ecosystem that distributes MUSD treasury funds across community gauges via epoch-based voting. Users lock MEZO tokens to receive veMEZO voting power (time-weighted, mirroring the Mezo whitepaper's lock-boost formula), then cast votes to direct MUSD grants toward ecosystem initiatives.

The system includes three deployed Solidity contracts on Mezo testnet: MUSDGovernanceAllocator (treasury, locking, voting, epoch settlement), MockMEZO, and MockMUSD (with faucet functions for demo flow). The React frontend connects via RainbowKit and provides panels for: minting test tokens, locking MEZO into veMEZO, voting on four gauges, viewing epoch results, and settling distributions.

Key features:
- veMEZO lock with configurable duration (7–365 days), whitepaper-accurate boost formula
- MUSD treasury with epoch-based gauge voting and settlement
- Voter registry with on-chain Sybil gating
- Four gauges: BTC/MUSD Pool, MUSD Savings, Validator Yield, Ecosystem Grants
- Mock token faucets for complete demo without real funds
- Before/after allocation comparison with impact metrics

This is a governance workbench Mezo could give to grant committees, validators, and ecosystem teams.

### Track
MEZO Utilization

### GitHub Repository URL
https://github.com/CipherKuma/borealis

### Demo URL
https://mezo-governance-allocator.vercel.app

### Video URL
(pending — Cipher Kuma will record)

### Smart Contract Addresses
- MUSDGovernanceAllocator: `0xbce0f5d8403434b5599726e5081c64588252a158`
- MockMEZO: `0x33376889c838f7c7617ae6880ba1fe17d5aa61c3`
- MockMUSD: `0xe9017c201ebad528486b3e79fd4e07c8aa627577`

### Smart Contract Explorer Link
https://explorer.test.mezo.org/address/0xbce0f5d8403434b5599726e5081c64588252a158

### Sample Transaction (vote cast)
https://explorer.test.mezo.org/tx/0x9d052bea76d4c77b73bd2b830778ca18dc2eebf3f695dba457536adfd0d68a40

### Team Members
- **Cipher Kuma** (jedionchain@gmail.com) — Primary submitter, smart contracts
- **Ratna** (ratnasarryputri@gmail.com) — Frontend
- **Spinola** (mocatproject10@gmail.com) — Backend/infra

### Tech Stack
- Frontend: React + TypeScript + Vite + Tailwind CSS + shadcn/ui + RainbowKit + wagmi
- Smart Contracts: Solidity 0.8.28 (MUSDGovernanceAllocator + MockMEZO + MockMUSD)
- Chain: Mezo Testnet (Chain ID 31611)
- Libraries: viem, recharts, lucide-react, @tanstack/react-query

### How does your project use MEZO?
Borealis uses the MEZO token as the governance staking asset. Users lock MEZO for a chosen duration (7–365 days) to receive veMEZO voting power — the longer the lock, the higher the weight, mirroring the Mezo whitepaper's lock-boost formula. This veMEZO power is then used to vote on gauges that direct MUSD treasury distributions across ecosystem initiatives (BTC/MUSD Pool, MUSD Savings, Validator Yield, Ecosystem Grants). The MUSDGovernanceAllocator contract manages the full lifecycle: MUSD treasury deposits, MEZO locking, voter registration, epoch-based gauge voting, and automated settlement that distributes MUSD proportional to vote weight. Three contracts are deployed on Mezo testnet (chain 31611) with mock tokens for a complete demo flow.

---

## Submission Checklist

1. [ ] Create Encode Club account with `jedionchain@gmail.com` (Cipher Kuma)
2. [ ] Navigate to https://www.encodeclub.com/programmes/mezo-hackathon-building-bitcoins-future
3. [ ] Click "Apply Now" → fill fields with values above
4. [ ] Record demo video showing: mint tokens → lock MEZO → vote on gauges → settle epoch → MUSD distributed
5. [ ] Upload video URL
6. [ ] **STOP before final Submit** — review all fields
