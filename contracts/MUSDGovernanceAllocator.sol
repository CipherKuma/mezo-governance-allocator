// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract MUSDGovernanceAllocator {
    IERC20 public immutable musd;
    IERC20 public immutable mezo;
    address public immutable owner;

    uint256 public constant MAX_LOCK_DURATION = 1456 days;
    uint256 public constant MIN_LOCK_DURATION = 7 days;
    uint256 public constant MAX_GAUGES = 20;
    uint256 public constant BPS_DENOMINATOR = 10000;

    struct Lock {
        uint256 amount;
        uint256 unlockTime;
        uint256 lockStart;
    }

    struct Gauge {
        string label;
        address recipient;
        uint256 totalVotes;
        bool exists;
    }

    mapping(address => Lock) public locks;
    mapping(uint256 => Gauge) public gauges;
    uint256[] public gaugeIds;
    mapping(address => bool) public verifiedVoters;
    mapping(address => mapping(uint256 => uint256)) public userVotes;

    uint256 public currentEpoch;
    uint256 public epochStart;
    uint256 public epochDuration;
    uint256 public treasuryBalance;

    event MezoLocked(address indexed user, uint256 amount, uint256 unlockTime, uint256 votingPower);
    event MezoUnlocked(address indexed user, uint256 amount);
    event VoterRegistered(address indexed voter);
    event GaugeRegistered(uint256 indexed gaugeId, string label, address recipient);
    event VoteCast(address indexed voter, uint256 indexed epoch, uint256 votingPower);
    event TreasuryDeposited(address indexed depositor, uint256 amount);
    event EpochSettled(uint256 indexed epoch, uint256 totalDistributed, uint256 gaugeCount);

    error NotOwner();
    error NotVerifiedVoter();
    error NoVotingPower();
    error LockNotExpired();
    error NoActiveLock();
    error InvalidLockDuration();
    error InvalidVoteWeights();
    error EpochNotEnded();
    error GaugeAlreadyExists();
    error TooManyGauges();

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    constructor(IERC20 _musd, IERC20 _mezo, uint256 _epochDuration) {
        musd = _musd;
        mezo = _mezo;
        owner = msg.sender;
        epochDuration = _epochDuration;
        epochStart = block.timestamp;
        currentEpoch = 1;
    }

    function lockMezo(uint256 amount, uint256 durationDays) external {
        uint256 duration = durationDays * 1 days;
        if (duration < MIN_LOCK_DURATION || duration > MAX_LOCK_DURATION)
            revert InvalidLockDuration();

        Lock storage existing = locks[msg.sender];
        if (existing.amount > 0 && block.timestamp < existing.unlockTime) {
            existing.amount += amount;
            uint256 newUnlock = block.timestamp + duration;
            if (newUnlock > existing.unlockTime) existing.unlockTime = newUnlock;
        } else {
            locks[msg.sender] = Lock(amount, block.timestamp + duration, block.timestamp);
        }

        mezo.transferFrom(msg.sender, address(this), amount);
        emit MezoLocked(msg.sender, amount, locks[msg.sender].unlockTime, getVotingPower(msg.sender));
    }

    function unlock() external {
        Lock storage lock = locks[msg.sender];
        if (lock.amount == 0) revert NoActiveLock();
        if (block.timestamp < lock.unlockTime) revert LockNotExpired();

        uint256 amount = lock.amount;
        delete locks[msg.sender];
        mezo.transfer(msg.sender, amount);
        emit MezoUnlocked(msg.sender, amount);
    }

    function getVotingPower(address user) public view returns (uint256) {
        Lock storage lock = locks[user];
        if (lock.amount == 0 || block.timestamp >= lock.unlockTime) return 0;
        uint256 remaining = lock.unlockTime - block.timestamp;
        if (remaining > MAX_LOCK_DURATION) remaining = MAX_LOCK_DURATION;
        return (lock.amount * remaining) / MAX_LOCK_DURATION;
    }

    function registerVoter(address voter) external onlyOwner {
        verifiedVoters[voter] = true;
        emit VoterRegistered(voter);
    }

    function registerGauge(uint256 gaugeId, string calldata label, address recipient) external onlyOwner {
        if (gauges[gaugeId].exists) revert GaugeAlreadyExists();
        if (gaugeIds.length >= MAX_GAUGES) revert TooManyGauges();
        gauges[gaugeId] = Gauge(label, recipient, 0, true);
        gaugeIds.push(gaugeId);
        emit GaugeRegistered(gaugeId, label, recipient);
    }

    function depositTreasury(uint256 amount) external {
        musd.transferFrom(msg.sender, address(this), amount);
        treasuryBalance += amount;
        emit TreasuryDeposited(msg.sender, amount);
    }

    function vote(uint256[] calldata _gaugeIds, uint256[] calldata weightsBps) external {
        if (!verifiedVoters[msg.sender]) revert NotVerifiedVoter();
        if (_gaugeIds.length != weightsBps.length) revert InvalidVoteWeights();

        uint256 power = getVotingPower(msg.sender);
        if (power == 0) revert NoVotingPower();

        uint256 totalWeight;
        for (uint256 i; i < _gaugeIds.length; i++) {
            totalWeight += weightsBps[i];
        }
        if (totalWeight != BPS_DENOMINATOR) revert InvalidVoteWeights();

        for (uint256 i; i < _gaugeIds.length; i++) {
            uint256 gId = _gaugeIds[i];
            uint256 oldVote = userVotes[msg.sender][gId];
            if (oldVote > 0) {
                gauges[gId].totalVotes -= oldVote;
            }
            uint256 newVote = (power * weightsBps[i]) / BPS_DENOMINATOR;
            userVotes[msg.sender][gId] = newVote;
            gauges[gId].totalVotes += newVote;
        }

        emit VoteCast(msg.sender, currentEpoch, power);
    }

    function settleEpoch() external {
        if (block.timestamp < epochStart + epochDuration) revert EpochNotEnded();

        uint256 totalVotes;
        for (uint256 i; i < gaugeIds.length; i++) {
            totalVotes += gauges[gaugeIds[i]].totalVotes;
        }

        uint256 distributed;
        if (totalVotes > 0 && treasuryBalance > 0) {
            uint256 toDistribute = treasuryBalance;
            for (uint256 i; i < gaugeIds.length; i++) {
                uint256 gId = gaugeIds[i];
                uint256 share = (toDistribute * gauges[gId].totalVotes) / totalVotes;
                if (share > 0 && gauges[gId].recipient != address(0)) {
                    musd.transfer(gauges[gId].recipient, share);
                    distributed += share;
                }
                gauges[gId].totalVotes = 0;
            }
            treasuryBalance -= distributed;
        }

        for (uint256 i; i < gaugeIds.length; i++) {
            gauges[gaugeIds[i]].totalVotes = 0;
        }

        emit EpochSettled(currentEpoch, distributed, gaugeIds.length);
        currentEpoch++;
        epochStart = block.timestamp;
    }

    function gaugeCount() external view returns (uint256) {
        return gaugeIds.length;
    }

    function getGaugeIds() external view returns (uint256[] memory) {
        return gaugeIds;
    }

    function getUserLock(address user) external view returns (uint256 amount, uint256 unlockTime, uint256 lockStart) {
        Lock storage lock = locks[user];
        return (lock.amount, lock.unlockTime, lock.lockStart);
    }

    function epochTimeRemaining() external view returns (uint256) {
        uint256 end = epochStart + epochDuration;
        if (block.timestamp >= end) return 0;
        return end - block.timestamp;
    }
}
