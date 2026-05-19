export const allocatorAbi = [
  {
    type: "function",
    name: "castVote",
    stateMutability: "nonpayable",
    inputs: [
      { name: "positionId", type: "uint256" },
      { name: "gaugeIds", type: "bytes32[]" },
      { name: "weightsBps", type: "uint16[]" },
      { name: "mezoBoostAmount", type: "uint256" }
    ],
    outputs: [{ name: "allocationHash", type: "bytes32" }]
  },
  {
    type: "event",
    name: "AllocationUpdated",
    inputs: [
      { name: "positionId", type: "uint256", indexed: true },
      { name: "leadingGauge", type: "bytes32", indexed: true },
      { name: "leadingWeightBps", type: "uint16", indexed: false },
      { name: "mezoBoostAmount", type: "uint256", indexed: false },
      { name: "epoch", type: "uint256", indexed: false },
      { name: "allocationHash", type: "bytes32", indexed: false }
    ]
  }
] as const;
