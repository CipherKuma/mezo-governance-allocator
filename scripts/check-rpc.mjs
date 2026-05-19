const rpcUrl = process.env.MEZO_RPC_URL ?? "https://rpc.test.mezo.org";
const expected = (process.env.MEZO_CHAIN_ID_HEX ?? "0x7b7b").toLowerCase();

const response = await fetch(rpcUrl, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "eth_chainId", params: [] })
});

if (!response.ok) {
  throw new Error(`RPC HTTP ${response.status} from ${rpcUrl}`);
}

const payload = await response.json();
const actual = String(payload.result ?? "").toLowerCase();

if (actual !== expected) {
  throw new Error(`Unexpected chain id ${actual}; expected ${expected}`);
}

console.log(`Mezo RPC OK: ${rpcUrl} -> ${actual}`);
