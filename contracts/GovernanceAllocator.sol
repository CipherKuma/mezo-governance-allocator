// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract GovernanceAllocator {
    struct Gauge {
        string label;
        uint16 weightBps;
        bool exists;
    }

    address public immutable owner;
    mapping(bytes32 => Gauge) private gauges;
    bytes32[] public gaugeList;

    event GaugeRegistered(bytes32 indexed gaugeId, string label, uint16 weightBps);
    event AllocationUpdated(
        uint256 indexed positionId,
        bytes32 indexed leadingGauge,
        uint16 leadingWeightBps,
        uint256 mezoBoostAmount,
        uint256 epoch,
        bytes32 allocationHash
    );

    error NotOwner();
    error GaugeMissing(bytes32 gaugeId);
    error InvalidWeights();
    error InvalidGauge();

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        if (msg.sender != owner) {
            revert NotOwner();
        }
        _;
    }

    function registerGauge(bytes32 gaugeId, string calldata label, uint16 weightBps) external onlyOwner {
        if (gaugeId == bytes32(0) || weightBps > 10_000) {
            revert InvalidGauge();
        }

        if (!gauges[gaugeId].exists) {
            gaugeList.push(gaugeId);
        }

        gauges[gaugeId] = Gauge({label: label, weightBps: weightBps, exists: true});
        emit GaugeRegistered(gaugeId, label, weightBps);
    }

    function castVote(
        uint256 positionId,
        bytes32[] calldata gaugeIds,
        uint16[] calldata weightsBps,
        uint256 mezoBoostAmount
    ) external returns (bytes32 allocationHash) {
        if (gaugeIds.length == 0 || gaugeIds.length != weightsBps.length) {
            revert InvalidWeights();
        }

        uint256 totalWeight;
        bytes32 leadingGauge;
        uint16 leadingWeight;

        for (uint256 index = 0; index < gaugeIds.length; index += 1) {
            bytes32 gaugeId = gaugeIds[index];
            Gauge storage gauge = gauges[gaugeId];
            if (!gauge.exists) {
                revert GaugeMissing(gaugeId);
            }

            uint16 nextWeight = weightsBps[index];
            totalWeight += nextWeight;
            gauge.weightBps = nextWeight;

            if (nextWeight > leadingWeight) {
                leadingWeight = nextWeight;
                leadingGauge = gaugeId;
            }
        }

        if (totalWeight != 10_000) {
            revert InvalidWeights();
        }

        uint256 epoch = block.timestamp / 1 weeks;
        allocationHash = keccak256(abi.encode(msg.sender, positionId, gaugeIds, weightsBps, mezoBoostAmount, epoch));

        emit AllocationUpdated(positionId, leadingGauge, leadingWeight, mezoBoostAmount, epoch, allocationHash);
    }

    function getGauge(bytes32 gaugeId) external view returns (string memory label, uint16 weightBps, bool exists) {
        Gauge storage gauge = gauges[gaugeId];
        return (gauge.label, gauge.weightBps, gauge.exists);
    }

    function gaugeCount() external view returns (uint256) {
        return gaugeList.length;
    }
}
