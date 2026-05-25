import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  createPublicClient,
  createWalletClient,
  http,
  defineChain,
  isAddress,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";

const mezoTestnet = defineChain({
  id: 31611,
  name: "Mezo Testnet",
  nativeCurrency: { name: "Bitcoin", symbol: "BTC", decimals: 18 },
  rpcUrls: { default: { http: ["https://rpc.test.mezo.org"] } },
  blockExplorers: {
    default: {
      name: "Mezo Explorer",
      url: "https://explorer.test.mezo.org",
    },
  },
});

const registerVoterAbi = [
  {
    inputs: [{ name: "voter", type: "address" }],
    name: "registerVoter",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "", type: "address" }],
    name: "verifiedVoters",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")
    return res.status(405).json({ error: "POST only" });

  const { address } = req.body ?? {};
  if (!address || !isAddress(address))
    return res.status(400).json({ error: "Invalid address" });

  const deployerKey = process.env.DEPLOYER_PRIVATE_KEY;
  const allocatorAddr = process.env.ALLOCATOR_ADDRESS;

  if (!deployerKey || !allocatorAddr)
    return res
      .status(500)
      .json({ error: "Server not configured for voter registration" });

  try {
    const publicClient = createPublicClient({
      chain: mezoTestnet,
      transport: http("https://rpc.test.mezo.org"),
    });

    const already = await publicClient.readContract({
      address: allocatorAddr as `0x${string}`,
      abi: registerVoterAbi,
      functionName: "verifiedVoters",
      args: [address as `0x${string}`],
    });

    if (already) {
      return res.status(200).json({
        status: "already_registered",
        address,
        message: "This address is already a verified voter.",
      });
    }

    const account = privateKeyToAccount(deployerKey as `0x${string}`);
    const walletClient = createWalletClient({
      account,
      chain: mezoTestnet,
      transport: http("https://rpc.test.mezo.org"),
    });

    const gas = await publicClient.estimateContractGas({
      address: allocatorAddr as `0x${string}`,
      abi: registerVoterAbi,
      functionName: "registerVoter",
      args: [address as `0x${string}`],
      account,
    });

    const hash = await walletClient.writeContract({
      address: allocatorAddr as `0x${string}`,
      abi: registerVoterAbi,
      functionName: "registerVoter",
      args: [address as `0x${string}`],
      gas: gas * 3n,
    });

    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    return res.status(200).json({
      status: receipt.status === "success" ? "registered" : "reverted",
      address,
      txHash: hash,
      explorerUrl: `https://explorer.test.mezo.org/tx/${hash}`,
      blockNumber: Number(receipt.blockNumber),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ error: msg.substring(0, 200) });
  }
}
