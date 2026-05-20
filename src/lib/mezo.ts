export const MEZO_NETWORK = {
  id: 31611,
  name: "Mezo Testnet",
  nativeCurrency: {
    name: "Bitcoin",
    symbol: "BTC",
    decimals: 18,
  },
  rpcUrl: "https://rpc.test.mezo.org",
  explorerUrl: "https://explorer.test.mezo.org",
  faucetUrl: "https://faucet.test.mezo.org/",
};

export const allocatorAddress = import.meta.env.VITE_ALLOCATOR_ADDRESS as
  | string
  | undefined;

export function getReceiptExplorerUrl(txHash: string) {
  if (!txHash || txHash.startsWith("fixture")) {
    return undefined;
  }

  return `${MEZO_NETWORK.explorerUrl}/tx/${txHash}`;
}
