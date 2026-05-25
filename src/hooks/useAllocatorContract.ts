import {
  useReadContract,
  useReadContracts,
  useWriteContract,
  useAccount,
  useBalance,
} from "wagmi";
import { parseEther, formatEther, type Address } from "viem";
import { erc20Abi, musdAllocatorAbi } from "../lib/abis";

export const MIN_GAS_BTC = 0.0001;
export const BTC_FAUCET_URL = "https://faucet.test.mezo.org/";

function cleanAddress(raw: unknown): Address | undefined {
  if (typeof raw !== "string") return undefined;
  const trimmed = raw.trim();
  return /^0x[0-9a-fA-F]{40}$/.test(trimmed) ? (trimmed as Address) : undefined;
}

const allocatorAddress = cleanAddress(
  import.meta.env.VITE_MUSD_ALLOCATOR_ADDRESS,
);
const mockMezoAddress = cleanAddress(import.meta.env.VITE_MOCK_MEZO_ADDRESS);
const mockMusdAddress = cleanAddress(import.meta.env.VITE_MOCK_MUSD_ADDRESS);

export function useIsLiveMode() {
  return Boolean(allocatorAddress && mockMezoAddress && mockMusdAddress);
}

export function useHasGas() {
  const { address } = useAccount();
  const { data, isLoading } = useBalance({
    address,
    query: { enabled: Boolean(address), refetchInterval: 10_000 },
  });
  const btc = data ? Number(data.value) / 10 ** data.decimals : 0;
  return {
    hasGas: btc >= MIN_GAS_BTC,
    btcBalance: btc,
    isLoading,
  };
}

export function useContractAddresses() {
  return { allocatorAddress, mockMezoAddress, mockMusdAddress };
}

export function useTreasuryBalance() {
  return useReadContract({
    address: allocatorAddress,
    abi: musdAllocatorAbi,
    functionName: "treasuryBalance",
    query: { enabled: Boolean(allocatorAddress) },
  });
}

export function useCurrentEpoch() {
  return useReadContract({
    address: allocatorAddress,
    abi: musdAllocatorAbi,
    functionName: "currentEpoch",
    query: { enabled: Boolean(allocatorAddress) },
  });
}

export function useEpochTimeRemaining() {
  return useReadContract({
    address: allocatorAddress,
    abi: musdAllocatorAbi,
    functionName: "epochTimeRemaining",
    query: { enabled: Boolean(allocatorAddress), refetchInterval: 10_000 },
  });
}

export function useEpochDuration() {
  return useReadContract({
    address: allocatorAddress,
    abi: musdAllocatorAbi,
    functionName: "epochDuration",
    query: { enabled: Boolean(allocatorAddress) },
  });
}

// Total MEZO locked across all voters = the allocator's MEZO token balance.
export function useTotalLocked() {
  return useReadContract({
    address: mockMezoAddress,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: allocatorAddress ? [allocatorAddress] : undefined,
    query: {
      enabled: Boolean(mockMezoAddress && allocatorAddress),
      refetchInterval: 15_000,
    },
  });
}

export { allocatorAddress, mockMezoAddress, mockMusdAddress };

export function useVotingPower(userAddress: Address | undefined) {
  return useReadContract({
    address: allocatorAddress,
    abi: musdAllocatorAbi,
    functionName: "getVotingPower",
    args: userAddress ? [userAddress] : undefined,
    query: { enabled: Boolean(allocatorAddress && userAddress) },
  });
}

export function useUserLock(userAddress: Address | undefined) {
  return useReadContract({
    address: allocatorAddress,
    abi: musdAllocatorAbi,
    functionName: "getUserLock",
    args: userAddress ? [userAddress] : undefined,
    query: { enabled: Boolean(allocatorAddress && userAddress) },
  });
}

export function useIsVerifiedVoter(userAddress: Address | undefined) {
  return useReadContract({
    address: allocatorAddress,
    abi: musdAllocatorAbi,
    functionName: "verifiedVoters",
    args: userAddress ? [userAddress] : undefined,
    query: { enabled: Boolean(allocatorAddress && userAddress) },
  });
}

// Reads each gauge's on-chain totalVotes (gauge ids 1..count) so the UI can
// show how the treasury is being routed by live votes. Returns the share each
// gauge holds of total cast voting weight.
export function useGaugeTotals(gaugeIds: bigint[]) {
  const query = useReadContracts({
    contracts: gaugeIds.map((id) => ({
      address: allocatorAddress,
      abi: musdAllocatorAbi,
      functionName: "gauges" as const,
      args: [id] as const,
    })),
    query: { enabled: Boolean(allocatorAddress), refetchInterval: 15_000 },
  });

  const totals = (query.data ?? []).map((r) => {
    // gauges() returns [label, recipient, totalVotes, exists]
    const result = r.result as
      | readonly [string, Address, bigint, boolean]
      | undefined;
    return result ? result[2] : 0n;
  });
  const sum = totals.reduce((a, b) => a + b, 0n);
  const shares = totals.map((v) =>
    sum > 0n ? Number((v * 10000n) / sum) / 100 : 0,
  );

  return { totals, sum, shares, isLoading: query.isLoading };
}

export function useTokenBalance(
  tokenAddress: Address | undefined,
  userAddress: Address | undefined,
) {
  return useReadContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: userAddress ? [userAddress] : undefined,
    query: { enabled: Boolean(tokenAddress && userAddress) },
  });
}

export function useWriteAllocator() {
  const { writeContractAsync, isPending, isSuccess, isError, error } =
    useWriteContract();

  async function lockMezo(amount: bigint, durationDays: bigint) {
    if (!allocatorAddress || !mockMezoAddress) return;
    await writeContractAsync({
      address: mockMezoAddress,
      abi: erc20Abi,
      functionName: "approve",
      args: [allocatorAddress, amount],
    });
    return writeContractAsync({
      address: allocatorAddress,
      abi: musdAllocatorAbi,
      functionName: "lockMezo",
      args: [amount, durationDays],
    });
  }

  async function castVote(gaugeIds: bigint[], weightsBps: bigint[]) {
    if (!allocatorAddress) return;
    return writeContractAsync({
      address: allocatorAddress,
      abi: musdAllocatorAbi,
      functionName: "vote",
      args: [gaugeIds, weightsBps],
    });
  }

  async function settleEpoch() {
    if (!allocatorAddress) return;
    return writeContractAsync({
      address: allocatorAddress,
      abi: musdAllocatorAbi,
      functionName: "settleEpoch",
    });
  }

  async function depositTreasury(amount: bigint) {
    if (!allocatorAddress || !mockMusdAddress) return;
    await writeContractAsync({
      address: mockMusdAddress,
      abi: erc20Abi,
      functionName: "approve",
      args: [allocatorAddress, amount],
    });
    return writeContractAsync({
      address: allocatorAddress,
      abi: musdAllocatorAbi,
      functionName: "depositTreasury",
      args: [amount],
    });
  }

  async function faucetMezo(amount: bigint) {
    if (!mockMezoAddress) return;
    return writeContractAsync({
      address: mockMezoAddress,
      abi: erc20Abi,
      functionName: "faucet",
      args: [amount],
    });
  }

  async function faucetMusd(amount: bigint) {
    if (!mockMusdAddress) return;
    return writeContractAsync({
      address: mockMusdAddress,
      abi: erc20Abi,
      functionName: "faucet",
      args: [amount],
    });
  }

  return {
    lockMezo,
    castVote,
    settleEpoch,
    depositTreasury,
    faucetMezo,
    faucetMusd,
    isPending,
    isSuccess,
    isError,
    error,
  };
}

export { parseEther, formatEther };
