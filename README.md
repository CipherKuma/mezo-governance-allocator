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

## Live deployment (Mezo testnet, chain 31611)

| Contract | Address |
|----------|---------|
| MUSDGovernanceAllocator | [`0x1cdba6eec37d77d8994296a29fdc2c230cc0596a`](https://explorer.test.mezo.org/address/0x1cdba6eec37d77d8994296a29fdc2c230cc0596a) |
| MockMEZO (testnet bootstrap) | [`0x08b9caca9c9885d86d97d6928a3f44903a030778`](https://explorer.test.mezo.org/address/0x08b9caca9c9885d86d97d6928a3f44903a030778) |
| MockMUSD (testnet bootstrap) | [`0xd6f43325a1103a16fccf268e28da053daadb755a`](https://explorer.test.mezo.org/address/0xd6f43325a1103a16fccf268e28da053daadb755a) |

- 50,000 MUSD treasury deposited · 4 gauges registered · sample vote cast:
  [tx `0xabf4bd58…`](https://explorer.test.mezo.org/tx/0xabf4bd58b6b5a2fd39b932f9b2e0aa12e47550612c1457cdfe4baf672d919b16).
- These addresses are verified live by `npm run verify:proof` (writes `outputs/live-proof.json`)
  and re-verified in-browser on the app's **Live Proof** tab.

## Verify the deployment yourself

```bash
npm run check:rpc       # Mezo RPC reachable, chain 0x7b7b / 31611
npm run verify:proof    # validates contract code, treasury, gauges, vote tx vs RPC
```

## Redeploy (optional)

```bash
export DEPLOYER_PRIVATE_KEY=0x...   # funded with testnet BTC for gas
npm run contracts:compile
npm run deploy:full                 # writes outputs/full-deployment.json
```

## Wallet connection

The app connects through wagmi's EIP-6963 multi-injected discovery, which surfaces
Mezo-compatible wallets (OKX, Xverse EVM, MetaMask) on chain 31611. **Mezo Passport**
(`@mezo-org/passport`) is the intended primary path, but its RainbowKit-based Bitcoin
connectors are currently incompatible with this project's wagmi 3 / React 19 stack
(RainbowKit's wallet connectors import the `gemini` connector that wagmi 3 removed).
See `TRUTH_AUDIT.md` for the precise blocker. The demo and all read paths work with
no wallet connected.

## Honest status

- No wallet needed to explore: the public `#demo` route reads live on-chain state.
- No mock/fixture data is shown as product proof. Faucet tokens are clearly labeled
  as testnet bootstrap ERC-20s, not real MUSD/MEZO.
- `npm audit --omit=dev` reports transitive advisories in the web3 wallet dependency
  tree (elliptic, ws, axios via wagmi/viem/walletconnect). None are reachable in a
  static client-side dApp; `audit fix --force` would downgrade and break the wallet stack.

## Source Docs

- Mezo docs: https://mezo.org/docs/developers/getting-started
- Mezo Earn overview: https://mezo.org/docs/users/mezo-earn/overview/
- Mezo voting docs: https://mezo.org/docs/users/mezo-earn/vote/
- Hackathon announcement: https://mezo.org/blog/the-mezo-hackathon-is-back/
