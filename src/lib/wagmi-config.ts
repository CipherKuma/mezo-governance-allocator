import {
  getConfig,
  mezoTestnet,
  okxWalletMezoTestnet,
} from "@mezo-org/passport";

export { mezoTestnet };

export const wagmiConfig = getConfig({
  appName: "Borealis",
  mezoNetwork: "testnet",
  walletConnectProjectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID ?? "",
  wallets: [
    {
      groupName: "Mezo Wallets",
      wallets: [okxWalletMezoTestnet as unknown as () => never],
    },
  ],
});
