import fs from "node:fs";
import path from "node:path";
import solc from "solc";

const root = process.cwd();
const contractsDir = path.join(root, "contracts");
const artifactDir = path.join(root, "artifacts");
fs.mkdirSync(artifactDir, { recursive: true });

const solFiles = fs.readdirSync(contractsDir).filter((f) => f.endsWith(".sol"));

for (const solFile of solFiles) {
  const source = fs.readFileSync(path.join(contractsDir, solFile), "utf8");
  const input = {
    language: "Solidity",
    sources: { [solFile]: { content: source } },
    settings: {
      optimizer: { enabled: true, runs: 200 },
      outputSelection: {
        "*": { "*": ["abi", "evm.bytecode.object", "evm.deployedBytecode.object"] }
      }
    }
  };

  const output = JSON.parse(solc.compile(JSON.stringify(input)));
  const errors = output.errors?.filter((e) => e.severity === "error") ?? [];

  if (errors.length > 0) {
    console.error(`Errors compiling ${solFile}:`);
    for (const err of errors) console.error(err.formattedMessage);
    process.exit(1);
  }

  const fileContracts = output.contracts[solFile];
  for (const [name, contract] of Object.entries(fileContracts)) {
    if (name === "IERC20") continue;
    const artifact = {
      contractName: name,
      abi: contract.abi,
      bytecode: `0x${contract.evm.bytecode.object}`,
      deployedBytecode: `0x${contract.evm.deployedBytecode.object}`
    };
    fs.writeFileSync(path.join(artifactDir, `${name}.json`), `${JSON.stringify(artifact, null, 2)}\n`);
    console.log(`Compiled ${solFile} -> artifacts/${name}.json`);
  }
}
