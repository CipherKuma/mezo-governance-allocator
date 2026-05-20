import fs from "node:fs";
import path from "node:path";
import { createPublicClient, createWalletClient, http, stringToHex } from "viem";
import { privateKeyToAccount } from "viem/accounts";

const privateKey = process.env.MEZO_DEPLOYER_PRIVATE_KEY;
if (!privateKey) {
  throw new Error("MEZO_DEPLOYER_PRIVATE_KEY is required for Mezo testnet deployment");
}

const rpcUrl = process.env.MEZO_RPC_URL ?? "https://rpc.test.mezo.org";
const artifactPath = path.join(process.cwd(), "artifacts", "GovernanceAllocator.json");

if (!fs.existsSync(artifactPath)) {
  throw new Error("Missing artifact. Run npm run contracts:compile first.");
}

const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
const account = privateKeyToAccount(privateKey);
const mezoTestnet = {
  id: 31611,
  name: "Mezo Testnet",
  nativeCurrency: { name: "Bitcoin", symbol: "BTC", decimals: 18 },
  rpcUrls: { default: { http: [rpcUrl] } },
  blockExplorers: { default: { name: "Mezo Explorer", url: "https://explorer.test.mezo.org" } }
};

const publicClient = createPublicClient({ chain: mezoTestnet, transport: http(rpcUrl) });
const walletClient = createWalletClient({ account, chain: mezoTestnet, transport: http(rpcUrl) });

const deployHash = await walletClient.deployContract({
  abi: artifact.abi,
  bytecode: artifact.bytecode
});
const deployReceipt = await publicClient.waitForTransactionReceipt({ hash: deployHash });
const contractAddress = deployReceipt.contractAddress;

if (!contractAddress) {
  throw new Error("Deployment transaction did not return a contract address");
}

const gauges = [
  ["btc-musd", "BTC/MUSD Pool", 3500],
  ["musd-savings", "MUSD Savings", 2300],
  ["validator-yield", "Validator Yield", 1900],
  ["ecosystem-grants", "Ecosystem Grants", 2300]
];

for (const [id, label, weight] of gauges) {
  const gas = await publicClient.estimateContractGas({
    address: contractAddress,
    abi: artifact.abi,
    functionName: "registerGauge",
    args: [stringToHex(id, { size: 32 }), label, weight],
    account
  });
  const hash = await walletClient.writeContract({
    address: contractAddress,
    abi: artifact.abi,
    functionName: "registerGauge",
    args: [stringToHex(id, { size: 32 }), label, weight],
    gas: gas * 2n
  });
  await publicClient.waitForTransactionReceipt({ hash });
}

const voteGas = await publicClient.estimateContractGas({
  address: contractAddress,
  abi: artifact.abi,
  functionName: "castVote",
  args: [
    1042n,
    gauges.map(([id]) => stringToHex(id, { size: 32 })),
    [3000, 1900, 1300, 3800],
    4200n
  ],
  account
});
const voteHash = await walletClient.writeContract({
  address: contractAddress,
  abi: artifact.abi,
  functionName: "castVote",
  args: [
    1042n,
    gauges.map(([id]) => stringToHex(id, { size: 32 })),
    [3000, 1900, 1300, 3800],
    4200n
  ],
  gas: voteGas * 2n
});
const voteReceipt = await publicClient.waitForTransactionReceipt({ hash: voteHash });

const deployOutput = {
  chainId: 31611,
  rpcUrl,
  contractAddress,
  deployHash,
  voteHash,
  blockNumber: voteReceipt.blockNumber.toString(),
  explorerTx: `https://explorer.test.mezo.org/tx/${voteHash}`,
  deployedAt: new Date().toISOString()
};

fs.writeFileSync(path.join(process.cwd(), "outputs", "mezo-deployment.json"), `${JSON.stringify(deployOutput, null, 2)}\n`);
console.log(JSON.stringify(deployOutput, null, 2));
