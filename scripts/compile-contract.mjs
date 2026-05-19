import fs from "node:fs";
import path from "node:path";
import solc from "solc";

const root = process.cwd();
const contractPath = path.join(root, "contracts", "GovernanceAllocator.sol");
const source = fs.readFileSync(contractPath, "utf8");

const input = {
  language: "Solidity",
  sources: {
    "GovernanceAllocator.sol": {
      content: source
    }
  },
  settings: {
    optimizer: {
      enabled: true,
      runs: 200
    },
    outputSelection: {
      "*": {
        "*": ["abi", "evm.bytecode.object", "evm.deployedBytecode.object"]
      }
    }
  }
};

const output = JSON.parse(solc.compile(JSON.stringify(input)));
const errors = output.errors?.filter((entry) => entry.severity === "error") ?? [];

if (errors.length > 0) {
  for (const error of errors) {
    console.error(error.formattedMessage);
  }
  process.exit(1);
}

const contract = output.contracts["GovernanceAllocator.sol"].GovernanceAllocator;
const artifact = {
  contractName: "GovernanceAllocator",
  abi: contract.abi,
  bytecode: `0x${contract.evm.bytecode.object}`,
  deployedBytecode: `0x${contract.evm.deployedBytecode.object}`
};

const artifactDir = path.join(root, "artifacts");
fs.mkdirSync(artifactDir, { recursive: true });
fs.writeFileSync(path.join(artifactDir, "GovernanceAllocator.json"), `${JSON.stringify(artifact, null, 2)}\n`);

console.log("Compiled contracts/GovernanceAllocator.sol -> artifacts/GovernanceAllocator.json");
