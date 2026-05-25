import { http, createConfig, type Config } from "wagmi";
import { injected } from "wagmi/connectors";
import { defineChain } from "viem";

export const mezoTestnet = defineChain({
  id: 31611,
  name: "Mezo Testnet",
  nativeCurrency: { name: "Bitcoin", symbol: "BTC", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.test.mezo.org"] },
  },
  blockExplorers: {
    default: {
      name: "Mezo Explorer",
      url: "https://explorer.test.mezo.org",
    },
  },
});

// NOTE on Mezo Passport: @mezo-org/passport@0.17.2 provides the canonical Mezo
// Bitcoin-wallet connectors (Unisat / OKX / Xverse via OrangeKit). They are wired
// through RainbowKit's connectorsForWallets / getDefaultConfig, which import
// `walletConnectWallet` from "@rainbow-me/rainbowkit/wallets". That module pulls
// in the `gemini` connector from "wagmi/connectors" — an export REMOVED in
// wagmi 3. This project runs wagmi 3.6.15 + React 19 (Passport peer-deps wagmi 2
// + React 18), so importing any Passport/RainbowKit wallet connector fails the
// build. Until Passport ships a wagmi-3-compatible release, we connect through
// wagmi's built-in EIP-6963 multi-injected discovery (which surfaces Mezo-
// compatible wallets like OKX/Xverse/MetaMask). See TRUTH_AUDIT.md.
//
// OKX-only: we target OKX Wallet as the sole connector. Disable
// multiInjectedProviderDiscovery so MetaMask/etc don't appear.
export const wagmiConfig: Config = createConfig({
  chains: [mezoTestnet],
  connectors: [
    injected({
      target: {
        id: "com.okex.wallet",
        name: "OKX Wallet",
        provider() {
          if (typeof window !== "undefined") {
            return (window as unknown as Record<string, unknown>)
              .okxwallet as never;
          }
        },
      },
    }),
  ],
  multiInjectedProviderDiscovery: false,
  transports: {
    [mezoTestnet.id]: http("https://rpc.test.mezo.org"),
  },
});
