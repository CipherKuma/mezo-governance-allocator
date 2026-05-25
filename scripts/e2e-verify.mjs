// e2e-verify.mjs — full-lifecycle end-to-end proof of EVERY contract write path.
//
// Deploys a FRESH throwaway instance (short epoch so settleEpoch is testable) and
// exercises every state-changing function with on-chain receipts + state assertions:
//   faucet → approve → depositTreasury → registerGauge → registerVoter →
//   lockMezo → vote → settleEpoch → unlock(guard).
//
// Does NOT touch the live demo contract or outputs/full-deployment.json.
// Writes outputs/e2e-verify.json. Exits non-zero on any failed assertion.
//
// Usage: MEZO_DEPLOYER_PRIVATE_KEY=0x... node scripts/e2e-verify.mjs

import fs from "node:fs";
import path from "node:path";
import {
  createPublicClient,
  createWalletClient,
  http,
  parseEther,
  formatEther,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";

const pk = process.env.MEZO_DEPLOYER_PRIVATE_KEY;
if (!pk) throw new Error("MEZO_DEPLOYER_PRIVATE_KEY required");

const rpcUrl = "https://rpc.test.mezo.org";
const mezoTestnet = {
  id: 31611,
  name: "Mezo Testnet",
  nativeCurrency: { name: "Bitcoin", symbol: "BTC", decimals: 18 },
  rpcUrls: { default: { http: [rpcUrl] } },
};
const account = privateKeyToAccount(pk);
const pub = createPublicClient({ chain: mezoTestnet, transport: http(rpcUrl) });
const wallet = createWalletClient({ account, chain: mezoTestnet, transport: http(rpcUrl) });

const results = [];
function check(name, ok, detail) {
  results.push({ name, ok, detail });
  console.log(`${ok ? "✅" : "❌"} ${name} — ${detail}`);
  if (!ok) throw new Error(`ASSERTION FAILED: ${name} — ${detail}`);
}

function loadArtifact(name) {
  return JSON.parse(
    fs.readFileSync(path.join(process.cwd(), "artifacts", `${name}.json`), "utf8"),
  );
}

// Explicit nonce management — Mezo testnet's RPC lags on eth_getTransactionCount
// under rapid sequential sends, causing nonce-reuse races. Track locally instead.
let nonce;
async function nextNonce() {
  if (nonce === undefined) {
    nonce = await pub.getTransactionCount({ address: account.address, blockTag: "pending" });
  }
  return nonce++;
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function deploy(name, args = []) {
  const a = loadArtifact(name);
  const gas = await pub
    .estimateContractGas({ abi: a.abi, bytecode: a.bytecode, args, account })
    .catch(() => 3_000_000n);
  const hash = await wallet.deployContract({ abi: a.abi, bytecode: a.bytecode, args, gas: gas * 2n, nonce: await nextNonce() });
  const r = await pub.waitForTransactionReceipt({ hash });
  if (r.status !== "success") throw new Error(`deploy ${name} reverted`);
  await sleep(800);
  return { address: r.contractAddress, abi: a.abi };
}

// Sends a write; retries ONCE on a transient revert (Mezo testnet intermittently
// returns reverted receipts for txs that re-execute successfully).
async function write(c, fn, args) {
  for (let attempt = 1; attempt <= 2; attempt++) {
    const gas = await pub
      .estimateContractGas({ address: c.address, abi: c.abi, functionName: fn, args, account })
      .catch(() => 600_000n);
    const hash = await wallet.writeContract({ address: c.address, abi: c.abi, functionName: fn, args, gas: gas * 3n, nonce: await nextNonce() });
    const r = await pub.waitForTransactionReceipt({ hash });
    await sleep(800);
    if (r.status === "success" || attempt === 2) {
      return { hash, status: r.status, logs: r.logs.length, block: r.blockNumber };
    }
    await sleep(1500); // transient revert — back off and retry once
  }
}

async function read(c, fn, args = []) {
  return pub.readContract({ address: c.address, abi: c.abi, functionName: fn, args });
}

// Mezo testnet RPC load-balances across nodes with slight sync lag; retry reads
// until the expected condition holds (or give up after `tries`).
async function readUntil(c, fn, args, ok, tries = 8) {
  let v;
  for (let i = 0; i < tries; i++) {
    v = await read(c, fn, args);
    if (ok(v)) return v;
    await new Promise((r) => setTimeout(r, 1500));
  }
  return v;
}

console.log(`\nE2E verify as ${account.address}\n`);

const mezo = await deploy("MockMEZO");
const musd = await deploy("MockMUSD");
const alloc = await deploy("MUSDGovernanceAllocator", [musd.address, mezo.address, 1n]);
check("deploy stack", true, `allocator ${alloc.address}`);

// faucet
let tx = await write(mezo, "faucet", [parseEther("100000")]);
check("faucet MEZO", tx.status === "success", `tx ${tx.hash}`);
tx = await write(musd, "faucet", [parseEther("50000")]);
check("faucet MUSD", tx.status === "success", `tx ${tx.hash}`);
const mezoBal = await read(mezo, "balanceOf", [account.address]);
check("MEZO balance minted", mezoBal === parseEther("100000"), `${formatEther(mezoBal)} MEZO`);

// depositTreasury
await write(musd, "approve", [alloc.address, parseEther("50000")]);
tx = await write(alloc, "depositTreasury", [parseEther("50000")]);
check("depositTreasury", tx.status === "success", `tx ${tx.hash}`);
const treasury = await readUntil(alloc, "treasuryBalance", [], (v) => v === parseEther("50000"));
check("treasuryBalance == 50000", treasury === parseEther("50000"), `${formatEther(treasury)} MUSD`);

// registerGauge x4 — assert each tx individually
for (const [id, label] of [[1n, "BTC/MUSD Pool"], [2n, "MUSD Savings"], [3n, "Validator Yield"], [4n, "Ecosystem Grants"]]) {
  const gtx = await write(alloc, "registerGauge", [id, label, account.address]);
  check(`registerGauge ${id}`, gtx.status === "success", `${label} tx ${gtx.hash}`);
}
const gaugeCount = await readUntil(alloc, "gaugeCount", [], (v) => v === 4n);
check("4 gauges registered", gaugeCount === 4n, `gaugeCount=${gaugeCount}`);

// registerVoter
tx = await write(alloc, "registerVoter", [account.address]);
check("registerVoter", tx.status === "success", `tx ${tx.hash}`);
const verified = await readUntil(alloc, "verifiedVoters", [account.address], (v) => v === true);
check("voter verified", verified === true, `verifiedVoters=${verified}`);

// lockMezo
await write(mezo, "approve", [alloc.address, parseEther("10000")]);
tx = await write(alloc, "lockMezo", [parseEther("10000"), 180n]);
check("lockMezo", tx.status === "success", `tx ${tx.hash}`);
const lock = await readUntil(alloc, "getUserLock", [account.address], (v) => v[0] === parseEther("10000"));
check("lock amount == 10000", lock[0] === parseEther("10000"), `${formatEther(lock[0])} MEZO locked`);
const power = await readUntil(alloc, "getVotingPower", [account.address], (v) => v > 0n);
check("voting power > 0", power > 0n, `power=${formatEther(power)}`);

// vote
tx = await write(alloc, "vote", [[1n, 2n, 3n, 4n], [3000n, 2000n, 1500n, 3500n]]);
check("vote cast", tx.status === "success", `tx ${tx.hash}, ${tx.logs} log(s)`);
const g1 = await readUntil(alloc, "gauges", [1n], (v) => v[2] > 0n);
check("gauge 1 has votes", g1[2] > 0n, `totalVotes=${formatEther(g1[2])}`);

// settleEpoch (epoch duration was 1s; wait it out)
await new Promise((r) => setTimeout(r, 3000));
const recipientBefore = await read(musd, "balanceOf", [account.address]);
tx = await write(alloc, "settleEpoch", []);
check("settleEpoch", tx.status === "success", `tx ${tx.hash}, ${tx.logs} log(s)`);
const epochAfter = await readUntil(alloc, "currentEpoch", [], (v) => v === 2n);
check("epoch advanced to 2", epochAfter === 2n, `currentEpoch=${epochAfter}`);
const treasuryAfter = await readUntil(alloc, "treasuryBalance", [], (v) => v < parseEther("50000"));
check("treasury distributed", treasuryAfter < parseEther("50000"), `${formatEther(treasuryAfter)} MUSD left`);
const recipientAfter = await readUntil(musd, "balanceOf", [account.address], (v) => v > recipientBefore);
check("recipient received MUSD", recipientAfter > recipientBefore, `+${formatEther(recipientAfter - recipientBefore)} MUSD`);

// unlock guard: lock is 180d, not expired → tx must revert (on-chain or at estimate)
let unlockGuarded = false;
try {
  const u = await write(alloc, "unlock", []);
  unlockGuarded = u.status === "reverted";
} catch {
  unlockGuarded = true; // threw before broadcast = also correctly guarded
}
check("unlock guard (LockNotExpired)", unlockGuarded, "unlock reverts before expiry");

const out = {
  verifiedAt: new Date().toISOString(),
  network: "mezo-testnet-31611",
  tester: account.address,
  testInstance: { allocator: alloc.address, mockMezo: mezo.address, mockMusd: musd.address },
  note: "Throwaway instance for write-path proof. Demo contract 0x1cdba6… untouched.",
  allPassed: results.every((r) => r.ok),
  checks: results,
};
fs.mkdirSync(path.join(process.cwd(), "outputs"), { recursive: true });
fs.writeFileSync(path.join(process.cwd(), "outputs", "e2e-verify.json"), `${JSON.stringify(out, null, 2)}\n`);
console.log(`\n${out.allPassed ? "✅ ALL WRITE PATHS VERIFIED" : "❌ FAILED"} — ${results.length} checks`);
process.exit(out.allPassed ? 0 : 1);
