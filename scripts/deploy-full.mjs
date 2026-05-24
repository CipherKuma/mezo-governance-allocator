import fs from "node:fs";
import path from "node:path";
import { createPublicClient, createWalletClient, http, parseEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";

const privateKey = process.env.MEZO_DEPLOYER_PRIVATE_KEY;
if (!privateKey) throw new Error("MEZO_DEPLOYER_PRIVATE_KEY required");

const rpcUrl = "https://rpc.test.mezo.org";
const mezoTestnet = {
  id: 31611,
  name: "Mezo Testnet",
  nativeCurrency: { name: "Bitcoin", symbol: "BTC", decimals: 18 },
  rpcUrls: { default: { http: [rpcUrl] } },
  blockExplorers: { default: { name: "Explorer", url: "https://explorer.test.mezo.org" } },
};

const account = privateKeyToAccount(privateKey);
const publicClient = createPublicClient({ chain: mezoTestnet, transport: http(rpcUrl) });
const walletClient = createWalletClient({ account, chain: mezoTestnet, transport: http(rpcUrl) });

function loadArtifact(name) {
  return JSON.parse(fs.readFileSync(path.join(process.cwd(), "artifacts", `${name}.json`), "utf8"));
}

async function deploy(name, args = []) {
  const artifact = loadArtifact(name);
  const gas = await publicClient.estimateContractGas({
    abi: artifact.abi,
    bytecode: artifact.bytecode,
    args,
    account,
  }).catch(() => 3_000_000n);
  const hash = await walletClient.deployContract({
    abi: artifact.abi,
    bytecode: artifact.bytecode,
    args,
    gas: gas * 2n,
  });
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  console.log(`  ${name} deployed at ${receipt.contractAddress} (tx: ${hash})`);
  return { address: receipt.contractAddress, abi: artifact.abi, hash };
}

async function write(address, abi, fn, args) {
  const gas = await publicClient.estimateContractGas({
    address, abi, functionName: fn, args, account,
  }).catch(() => 500_000n);
  const hash = await walletClient.writeContract({
    address, abi, functionName: fn, args, gas: gas * 3n,
  });
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  if (receipt.status === "reverted") {
    throw new Error(`Transaction reverted: ${fn}(${JSON.stringify(args)}) tx=${hash}`);
  }
  return hash;
}

console.log("Deploying full MUSD Governance Allocator stack...\n");

console.log("1. Deploying MockMEZO...");
const mockMezo = await deploy("MockMEZO");

console.log("2. Deploying MockMUSD...");
const mockMusd = await deploy("MockMUSD");

console.log("3. Deploying MUSDGovernanceAllocator...");
const epochDuration = 300n;
const allocator = await deploy("MUSDGovernanceAllocator", [mockMusd.address, mockMezo.address, epochDuration]);

console.log("\n4. Faucet tokens to deployer...");
await write(mockMezo.address, mockMezo.abi, "faucet", [parseEther("100000")]);
console.log("  100,000 MEZO minted");
await write(mockMusd.address, mockMusd.abi, "faucet", [parseEther("50000")]);
console.log("  50,000 MUSD minted");

console.log("\n5. Deposit MUSD into treasury...");
await write(mockMusd.address, mockMusd.abi, "approve", [allocator.address, parseEther("50000")]);
await write(allocator.address, allocator.abi, "depositTreasury", [parseEther("50000")]);
console.log("  50,000 MUSD deposited");

console.log("\n6. Register gauges...");
const gauges = [
  [1n, "BTC/MUSD Pool", account.address],
  [2n, "MUSD Savings", account.address],
  [3n, "Validator Yield", account.address],
  [4n, "Ecosystem Grants", account.address],
];
for (const [id, label, recipient] of gauges) {
  await write(allocator.address, allocator.abi, "registerGauge", [id, label, recipient]);
  console.log(`  Gauge ${id}: ${label}`);
}

console.log("\n7. Register deployer as verified voter...");
await write(allocator.address, allocator.abi, "registerVoter", [account.address]);
console.log(`  ${account.address} verified`);

console.log("\n8. Lock MEZO + cast sample vote...");
await write(mockMezo.address, mockMezo.abi, "approve", [allocator.address, parseEther("10000")]);
await write(allocator.address, allocator.abi, "lockMezo", [parseEther("10000"), 180n]);
console.log("  10,000 MEZO locked for 180 days");

const voteHash = await write(allocator.address, allocator.abi, "vote", [
  [1n, 2n, 3n, 4n],
  [3000n, 2000n, 1500n, 3500n],
]);
console.log(`  Vote cast (tx: ${voteHash})`);

const output = {
  chainId: 31611,
  rpcUrl,
  epochDuration: Number(epochDuration),
  mockMezoAddress: mockMezo.address,
  mockMusdAddress: mockMusd.address,
  allocatorAddress: allocator.address,
  deployerAddress: account.address,
  voteHash,
  explorerBase: "https://explorer.test.mezo.org",
  deployedAt: new Date().toISOString(),
};

fs.mkdirSync(path.join(process.cwd(), "outputs"), { recursive: true });
fs.writeFileSync(
  path.join(process.cwd(), "outputs", "full-deployment.json"),
  `${JSON.stringify(output, null, 2)}\n`,
);

console.log("\n✅ Full deployment complete!");
console.log(JSON.stringify(output, null, 2));
