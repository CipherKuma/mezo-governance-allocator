import { http, createConfig, type Config } from "wagmi";
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

export const wagmiConfig: Config = createConfig({
  chains: [mezoTestnet],
  transports: {
    [mezoTestnet.id]: http("https://rpc.test.mezo.org"),
  },
});
