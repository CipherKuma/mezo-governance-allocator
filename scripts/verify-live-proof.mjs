// verify-live-proof.mjs — verify Borealis live Mezo testnet deployment against RPC.
// Reads canonical deployment metadata from outputs/full-deployment.json, validates
// every claim against the live chain, and writes outputs/live-proof.json.
//
// Usage: node scripts/verify-live-proof.mjs
// No private key required — read-only RPC calls.

import { createPublicClient, http, defineChain, getContract } from "viem";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const deployment = JSON.parse(
  readFileSync(join(root, "outputs/full-deployment.json"), "utf8"),
);

const EXPECTED_CHAIN_ID = 31611;
const RPC_URL = deployment.rpcUrl || "https://rpc.test.mezo.org";
const EXPLORER = deployment.explorerBase || "https://explorer.test.mezo.org";

const mezoTestnet = defineChain({
  id: EXPECTED_CHAIN_ID,
  name: "Mezo Testnet",
  nativeCurrency: { name: "Bitcoin", symbol: "BTC", decimals: 18 },
  rpcUrls: { default: { http: [RPC_URL] } },
});

const allocatorAbi = [
  { inputs: [], name: "treasuryBalance", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "currentEpoch", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "epochTimeRemaining", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "epochDuration", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "gaugeCount", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "getGaugeIds", outputs: [{ type: "uint256[]" }], stateMutability: "view", type: "function" },
  {
    inputs: [{ type: "uint256" }],
    name: "gauges",
    outputs: [
      { name: "label", type: "string" },
      { name: "recipient", type: "address" },
      { name: "totalVotes", type: "uint256" },
      { name: "exists", type: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },
];

async function main() {
  const client = createPublicClient({ chain: mezoTestnet, transport: http(RPC_URL) });
  const checks = [];
  const fail = (name, detail) => checks.push({ name, ok: false, detail });
  const pass = (name, detail) => checks.push({ name, ok: true, detail });

  // 1. Chain id
  const chainId = await client.getChainId();
  if (chainId === EXPECTED_CHAIN_ID) pass("chain_id", `chainId=${chainId}`);
  else fail("chain_id", `expected ${EXPECTED_CHAIN_ID}, got ${chainId}`);

  // 2. Code at contract addresses
  const addrs = {
    allocator: deployment.allocatorAddress,
    mockMezo: deployment.mockMezoAddress,
    mockMusd: deployment.mockMusdAddress,
  };
  for (const [label, addr] of Object.entries(addrs)) {
    if (!addr) { fail(`code_${label}`, "address missing"); continue; }
    const code = await client.getBytecode({ address: addr });
    if (code && code.length > 2) pass(`code_${label}`, `${addr} has ${(code.length - 2) / 2} bytes`);
    else fail(`code_${label}`, `${addr} has no code`);
  }

  // 3. Allocator reads
  const allocator = getContract({ address: deployment.allocatorAddress, abi: allocatorAbi, client });
  const reads = {};
  try {
    reads.treasuryBalance = (await allocator.read.treasuryBalance()).toString();
    reads.currentEpoch = (await allocator.read.currentEpoch()).toString();
    reads.epochTimeRemaining = (await allocator.read.epochTimeRemaining()).toString();
    reads.epochDuration = (await allocator.read.epochDuration()).toString();
    reads.gaugeCount = (await allocator.read.gaugeCount()).toString();
    pass("allocator_reads", JSON.stringify(reads));
  } catch (e) {
    fail("allocator_reads", e.shortMessage || e.message);
  }

  // 4. Gauges
  const gauges = [];
  try {
    const ids = await allocator.read.getGaugeIds();
    for (const id of ids) {
      const g = await allocator.read.gauges([id]);
      gauges.push({ id: id.toString(), label: g[0], recipient: g[1], totalVotes: g[2].toString(), exists: g[3] });
    }
    if (gauges.length > 0) pass("gauges", `${gauges.length} gauges registered`);
    else fail("gauges", "no gauges registered");
  } catch (e) {
    fail("gauges", e.shortMessage || e.message);
  }

  // 5. Vote tx receipt
  let voteTx = null;
  if (deployment.voteHash) {
    try {
      const receipt = await client.getTransactionReceipt({ hash: deployment.voteHash });
      voteTx = {
        hash: deployment.voteHash,
        status: receipt.status,
        blockNumber: receipt.blockNumber.toString(),
        from: receipt.from,
        to: receipt.to,
        logs: receipt.logs.length,
        explorer: `${EXPLORER}/tx/${deployment.voteHash}`,
      };
      if (receipt.status === "success") pass("vote_tx", `block ${receipt.blockNumber}, ${receipt.logs.length} logs`);
      else fail("vote_tx", `status=${receipt.status}`);
    } catch (e) {
      fail("vote_tx", e.shortMessage || e.message);
    }
  }

  const allOk = checks.every((c) => c.ok);
  const proof = {
    verifiedAt: new Date().toISOString(),
    verified: allOk,
    chainId: EXPECTED_CHAIN_ID,
    rpcUrl: RPC_URL,
    explorer: EXPLORER,
    canonicalDeployment: {
      allocator: deployment.allocatorAddress,
      mockMezo: deployment.mockMezoAddress,
      mockMusd: deployment.mockMusdAddress,
      deployer: deployment.deployerAddress,
      deployedAt: deployment.deployedAt,
    },
    reads,
    gauges,
    voteTx,
    checks,
  };

  writeFileSync(join(root, "outputs/live-proof.json"), JSON.stringify(proof, null, 2));
  console.log(JSON.stringify(proof, null, 2));
  console.log(`\n${allOk ? "✅ ALL CHECKS PASSED" : "❌ SOME CHECKS FAILED"}`);
  process.exit(allOk ? 0 : 1);
}

main().catch((e) => {
  console.error("verify-live-proof failed:", e);
  process.exit(2);
});
