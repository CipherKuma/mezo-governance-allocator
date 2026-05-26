import { createPublicClient, createWalletClient, http, defineChain, parseEther, formatEther } from "viem";
import { privateKeyToAccount, generatePrivateKey } from "viem/accounts";
import fs from "fs";

const mezo = defineChain({ id: 31611, name: "Mezo Testnet", nativeCurrency: { name: "BTC", symbol: "BTC", decimals: 18 }, rpcUrls: { default: { http: ["https://rpc.test.mezo.org"] } } });
const client = createPublicClient({ chain: mezo, transport: http() });

const deployerKey = process.env.MEZO_DEPLOYER_PRIVATE_KEY;
const deployer = privateKeyToAccount(deployerKey);
const deployerWallet = createWalletClient({ account: deployer, chain: mezo, transport: http() });

const ALLOC = "0x1cdba6eec37d77d8994296a29fdc2c230cc0596a";
const MEZO_TOKEN = "0x08b9caca9c9885d86d97d6928a3f44903a030778";
const MUSD_TOKEN = "0xd6f43325a1103a16fccf268e28da053daadb755a";

const allocAbi = JSON.parse(fs.readFileSync(process.cwd() + "/artifacts/MUSDGovernanceAllocator.json", "utf8")).abi;
const erc20Abi = JSON.parse(fs.readFileSync(process.cwd() + "/artifacts/MockMEZO.json", "utf8")).abi;

async function send(wallet, addr, abi, fn, args) {
  const gas = await client.estimateContractGas({ address: addr, abi, functionName: fn, args, account: wallet.account }).catch(() => 500000n);
  const hash = await wallet.writeContract({ address: addr, abi, functionName: fn, args, gas: gas * 3n });
  await client.waitForTransactionReceipt({ hash });
  return hash;
}

// Generate 8 simulated voters with different allocation preferences
const voterProfiles = [
  { name: "Liquidity-focused",  weights: [4500n, 2000n, 1000n, 2500n], lockAmount: "8000",  lockDays: 365n },
  { name: "Savings-heavy",      weights: [1500n, 4000n, 1500n, 3000n], lockAmount: "12000", lockDays: 270n },
  { name: "Validator-supporter", weights: [2000n, 1500n, 4500n, 2000n], lockAmount: "5000",  lockDays: 180n },
  { name: "Ecosystem-builder",  weights: [1000n, 1500n, 2000n, 5500n], lockAmount: "15000", lockDays: 300n },
  { name: "Balanced-allocator", weights: [2500n, 2500n, 2500n, 2500n], lockAmount: "7000",  lockDays: 200n },
  { name: "BTC-pool-maximizer", weights: [5000n, 1500n, 1000n, 2500n], lockAmount: "20000", lockDays: 350n },
  { name: "Grant-advocate",     weights: [1500n, 2000n, 1500n, 5000n], lockAmount: "9000",  lockDays: 240n },
  { name: "Yield-optimizer",    weights: [3000n, 3000n, 2500n, 1500n], lockAmount: "11000", lockDays: 280n },
];

const results = [];

for (let i = 0; i < voterProfiles.length; i++) {
  const profile = voterProfiles[i];
  const key = generatePrivateKey();
  const account = privateKeyToAccount(key);
  const wallet = createWalletClient({ account, chain: mezo, transport: http() });
  
  console.log(`\n[${i+1}/8] ${profile.name} (${account.address.slice(0,10)}...)`);
  
  // Fund with BTC for gas
  const fundHash = await deployerWallet.sendTransaction({ to: account.address, value: parseEther("0.002") });
  await client.waitForTransactionReceipt({ hash: fundHash });
  console.log("  Funded 0.002 BTC for gas");
  
  // Faucet MEZO
  await send(wallet, MEZO_TOKEN, erc20Abi, "faucet", [parseEther(profile.lockAmount)]);
  console.log(`  Fauceted ${profile.lockAmount} MEZO`);
  
  // Approve + Lock
  await send(wallet, MEZO_TOKEN, erc20Abi, "approve", [ALLOC, parseEther(profile.lockAmount)]);
  await send(wallet, ALLOC, allocAbi, "lockMezo", [parseEther(profile.lockAmount), profile.lockDays]);
  console.log(`  Locked ${profile.lockAmount} MEZO for ${Number(profile.lockDays)} days`);
  
  // Register as voter (from deployer)
  const regHash = await send(deployerWallet, ALLOC, allocAbi, "registerVoter", [account.address]);
  console.log(`  Registered as voter (tx: ${regHash.slice(0,14)}...)`);
  
  // Cast vote
  const voteHash = await send(wallet, ALLOC, allocAbi, "vote", [[1n, 2n, 3n, 4n], profile.weights]);
  console.log(`  Voted: ${profile.weights.map(w => Number(w)/100 + "%").join(" / ")} (tx: ${voteHash.slice(0,14)}...)`);
  
  const power = await client.readContract({ address: ALLOC, abi: allocAbi, functionName: "getVotingPower", args: [account.address] });
  
  results.push({
    name: profile.name,
    address: account.address,
    lockAmount: profile.lockAmount,
    lockDays: Number(profile.lockDays),
    weights: profile.weights.map(Number),
    votingPower: formatEther(power),
    voteTx: voteHash,
    registerTx: regHash,
  });
}

// Also deposit more MUSD to treasury from deployer
console.log("\nDepositing additional MUSD to treasury...");
await send(deployerWallet, MUSD_TOKEN, erc20Abi, "faucet", [parseEther("100000")]);
await send(deployerWallet, MUSD_TOKEN, erc20Abi, "approve", [ALLOC, parseEther("100000")]);
await send(deployerWallet, ALLOC, allocAbi, "depositTreasury", [parseEther("100000")]);
console.log("  Deposited 100,000 MUSD");

// Final state
const treasury = await client.readContract({ address: ALLOC, abi: allocAbi, functionName: "treasuryBalance" });
const epoch = await client.readContract({ address: ALLOC, abi: allocAbi, functionName: "currentEpoch" });

console.log("\n✅ Volume generation complete!");
console.log(`Treasury: ${formatEther(treasury)} MUSD`);
console.log(`Epoch: ${Number(epoch)}`);
console.log(`Active voters: ${results.length + 1} (8 new + deployer)`);
console.log(`Total transactions: ${results.length * 5 + 3} (fund+faucet+approve+lock+register+vote per voter + treasury deposit)`);

const output = { timestamp: new Date().toISOString(), voters: results, treasuryBalance: formatEther(treasury), epoch: Number(epoch) };
fs.writeFileSync(process.cwd() + "/outputs/volume-generation.json", JSON.stringify(output, null, 2) + "\n");
console.log("\nSaved to outputs/volume-generation.json");
