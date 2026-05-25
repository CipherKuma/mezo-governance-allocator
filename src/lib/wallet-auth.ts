import { MEZO_NETWORK } from "./mezo";

export type WalletAuthStatus =
  | "wallet-unavailable"
  | "ready"
  | "connecting"
  | "wrong-chain"
  | "signing"
  | "connected"
  | "failed";

export type WalletAuthState = {
  status: WalletAuthStatus;
  account?: string;
  chainId?: number;
  signature?: string;
  message?: string;
  error?: string;
};

export type EthereumProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
};

export function getInjectedEthereumProvider(): EthereumProvider | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }

  return (window as typeof window & { ethereum?: EthereumProvider }).ethereum;
}

export function getInitialWalletAuthState(
  provider = getInjectedEthereumProvider(),
): WalletAuthState {
  return provider
    ? {
        status: "ready",
        error:
          "Browser wallet detected. Connect, verify Mezo testnet, and sign to unlock live transaction proof.",
      }
    : {
        status: "wallet-unavailable",
        error:
          "No injected browser wallet detected. Install or unlock a wallet to run live web3 auth.",
      };
}

export function buildWalletAuthMessage(account: string) {
  return [
    "Borealis readiness auth",
    `Account: ${account}`,
    `Chain: ${MEZO_NETWORK.id}`,
    "Purpose: verify wallet control before live gauge allocation testing.",
  ].join("\n");
}

export async function requestMezoWalletAuth(
  provider = getInjectedEthereumProvider(),
): Promise<WalletAuthState> {
  if (!provider) {
    return getInitialWalletAuthState(undefined);
  }

  const accounts = await provider.request({ method: "eth_requestAccounts" });
  const account = parseFirstAccount(accounts);
  if (!account) {
    return {
      status: "failed",
      error: "Wallet returned no account.",
    };
  }

  const chainId = await getProviderChainId(provider);
  if (chainId !== MEZO_NETWORK.id) {
    const switched = await trySwitchToMezo(provider);
    if (!switched) {
      return {
        status: "wrong-chain",
        account,
        chainId,
        error: `Wallet is on chain ${chainId ?? "unknown"}; Mezo testnet ${MEZO_NETWORK.id} is required.`,
      };
    }
  }

  const verifiedChainId = await getProviderChainId(provider);
  const message = buildWalletAuthMessage(account);
  const signature = await provider.request({
    method: "personal_sign",
    params: [message, account],
  });

  if (typeof signature !== "string" || signature.length < 10) {
    return {
      status: "failed",
      account,
      chainId: verifiedChainId,
      error: "Wallet did not return a usable signature.",
    };
  }

  return {
    status: "connected",
    account,
    chainId: verifiedChainId,
    signature,
    message,
  };
}

function parseFirstAccount(value: unknown) {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const [first] = value;
  return typeof first === "string" && first.startsWith("0x")
    ? first
    : undefined;
}

async function getProviderChainId(provider: EthereumProvider) {
  const rawChainId = await provider.request({ method: "eth_chainId" });
  if (typeof rawChainId !== "string") {
    return undefined;
  }

  return Number.parseInt(rawChainId, 16);
}

async function trySwitchToMezo(provider: EthereumProvider) {
  const chainHex = `0x${MEZO_NETWORK.id.toString(16)}`;

  try {
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: chainHex }],
    });
    return true;
  } catch {
    try {
      await provider.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: chainHex,
            chainName: MEZO_NETWORK.name,
            nativeCurrency: MEZO_NETWORK.nativeCurrency,
            rpcUrls: [MEZO_NETWORK.rpcUrl],
            blockExplorerUrls: [MEZO_NETWORK.explorerUrl],
          },
        ],
      });
      return true;
    } catch {
      return false;
    }
  }
}
