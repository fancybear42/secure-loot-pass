// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";
import { euint32, externalEuint32, euint8, ebool, FHE } from "@fhevm/solidity/lib/FHE.sol";

contract SecureLootPass is SepoliaConfig {
    using FHE for *;
    
    struct BattlePass {
        euint32 passId;
        euint32 totalLevels;
        euint32 currentLevel;
        euint32 experience;
        euint32 requiredExperience;
        bool isActive;
        bool isPremium;
        string name;
        string description;
        address owner;
        uint256 startTime;
        uint256 endTime;
        uint256 price;
    }
    
    struct Reward {
        euint32 rewardId;
        euint32 level;
        euint32 rarity;
        euint32 value;
        bool isClaimed;
        string name;
        string description;
        string metadata;
        address owner;
    }
    
    struct Challenge {
        euint32 challengeId;
        euint32 targetValue;
        euint32 currentProgress;
        euint32 experienceReward;
        bool isCompleted;
        bool isActive;
        string name;
        string description;
        string category;
        address owner;
        uint256 deadline;
    }
    
    struct PlayerStats {
        euint32 totalExperience;
        euint32 challengesCompleted;
        euint32 rewardsClaimed;
        euint32 playTime;
        bool isVerified;
        address player;
    }
    
    mapping(uint256 => BattlePass) public battlePasses;
    mapping(uint256 => Reward) public rewards;
    mapping(uint256 => Challenge) public challenges;
    mapping(address => PlayerStats) public playerStats;
    mapping(address => mapping(uint256 => bool)) public hasClaimedReward;
    mapping(address => mapping(uint256 => bool)) public hasCompletedChallenge;
    
    uint256 public passCounter;
    uint256 public rewardCounter;
    uint256 public challengeCounter;
    
    address public owner;
    address public verifier;
    
    // FHE-encrypted constants
    euint32 constant LEVEL_EXPERIENCE_MULTIPLIER = FHE.asEuint32(1000);
    euint32 constant PREMIUM_BONUS_MULTIPLIER = FHE.asEuint32(150);
    euint32 constant RARITY_COMMON = FHE.asEuint32(1);
    euint32 constant RARITY_RARE = FHE.asEuint32(2);
    euint32 constant RARITY_EPIC = FHE.asEuint32(3);
    euint32 constant RARITY_LEGENDARY = FHE.asEuint32(4);
    
    event BattlePassCreated(uint256 indexed passId, address indexed owner, string name);
    event RewardClaimed(uint256 indexed rewardId, address indexed player, uint32 level);
    event ChallengeCompleted(uint256 indexed challengeId, address indexed player, uint32 experience);
    event LevelUp(uint256 indexed passId, address indexed player, uint32 newLevel);
    event ExperienceGained(uint256 indexed passId, address indexed player, uint32 amount);
    event PremiumUpgraded(uint256 indexed passId, address indexed player);
    
    constructor(address _verifier) {
        owner = msg.sender;
        verifier = _verifier;
    }
    
    function createBattlePass(
        string memory _name,
        string memory _description,
        uint256 _totalLevels,
        uint256 _duration,
        uint256 _price
    ) public returns (uint256) {
        require(bytes(_name).length > 0, "Battle pass name cannot be empty");
        require(_totalLevels > 0, "Total levels must be positive");
        require(_duration > 0, "Duration must be positive");
        
        uint256 passId = passCounter++;
        
        battlePasses[passId] = BattlePass({
            passId: FHE.asEuint32(0), // Will be set via FHE operations
            totalLevels: FHE.asEuint32(0), // Will be set to actual value
            currentLevel: FHE.asEuint32(1),
            experience: FHE.asEuint32(0),
            requiredExperience: LEVEL_EXPERIENCE_MULTIPLIER,
            isActive: true,
            isPremium: false,
            name: _name,
            description: _description,
            owner: msg.sender,
            startTime: block.timestamp,
            endTime: block.timestamp + _duration,
            price: _price
        });
        
        emit BattlePassCreated(passId, msg.sender, _name);
        return passId;
    }
    
    function purchaseBattlePass(uint256 passId) public payable {
        require(battlePasses[passId].owner != address(0), "Battle pass does not exist");
        require(battlePasses[passId].isActive, "Battle pass is not active");
        require(msg.value >= battlePasses[passId].price, "Insufficient payment");
        require(block.timestamp <= battlePasses[passId].endTime, "Battle pass has expired");
        
        // Transfer ownership
        battlePasses[passId].owner = msg.sender;
        
        // Initialize player stats if not exists
        if (playerStats[msg.sender].player == address(0)) {
            playerStats[msg.sender] = PlayerStats({
                totalExperience: FHE.asEuint32(0),
                challengesCompleted: FHE.asEuint32(0),
                rewardsClaimed: FHE.asEuint32(0),
                playTime: FHE.asEuint32(0),
                isVerified: false,
                player: msg.sender
            });
        }
    }
    
    function upgradeToPremium(uint256 passId) public payable {
        require(battlePasses[passId].owner == msg.sender, "Not the owner of this battle pass");
        require(!battlePasses[passId].isPremium, "Already premium");
        require(msg.value >= battlePasses[passId].price / 2, "Insufficient payment for premium upgrade");
        
        battlePasses[passId].isPremium = true;
        emit PremiumUpgraded(passId, msg.sender);
    }
    
    function gainExperience(
        uint256 passId,
        externalEuint32 amount,
        bytes calldata inputProof
    ) public {
        require(battlePasses[passId].owner == msg.sender, "Not the owner of this battle pass");
        require(battlePasses[passId].isActive, "Battle pass is not active");
        require(block.timestamp <= battlePasses[passId].endTime, "Battle pass has expired");
        
        // Decrypt and verify the experience amount
        euint32 decryptedAmount = FHE.decrypt(amount, inputProof);
        
        // Apply premium bonus if applicable
        ebool isPremium = FHE.asEbool(battlePasses[passId].isPremium);
        euint32 bonusMultiplier = FHE.select(isPremium, PREMIUM_BONUS_MULTIPLIER, FHE.asEuint32(100));
        euint32 finalAmount = decryptedAmount * bonusMultiplier / FHE.asEuint32(100);
        
        // Add experience
        battlePasses[passId].experience = battlePasses[passId].experience + finalAmount;
        playerStats[msg.sender].totalExperience = playerStats[msg.sender].totalExperience + finalAmount;
        
        // Check for level up
        _checkLevelUp(passId);
        
        emit ExperienceGained(passId, msg.sender, FHE.decrypt(finalAmount, inputProof));
    }
    
    function _checkLevelUp(uint256 passId) internal {
        euint32 currentExp = battlePasses[passId].experience;
        euint32 requiredExp = battlePasses[passId].requiredExperience;
        euint32 currentLevel = battlePasses[passId].currentLevel;
        euint32 totalLevels = battlePasses[passId].totalLevels;
        
        ebool canLevelUp = currentExp >= requiredExp && currentLevel < totalLevels;
        
        // If can level up, increment level and update required experience
        ebool shouldLevelUp = canLevelUp;
        battlePasses[passId].currentLevel = FHE.select(shouldLevelUp, currentLevel + FHE.asEuint32(1), currentLevel);
        battlePasses[passId].requiredExperience = FHE.select(shouldLevelUp, requiredExp + LEVEL_EXPERIENCE_MULTIPLIER, requiredExp);
        
        if (FHE.decrypt(shouldLevelUp, new bytes(0))) {
            emit LevelUp(passId, battlePasses[passId].owner, FHE.decrypt(battlePasses[passId].currentLevel, new bytes(0)));
        }
    }
    
    function createChallenge(
        string memory _name,
        string memory _description,
        string memory _category,
        uint256 _targetValue,
        uint256 _experienceReward,
        uint256 _deadline
    ) public returns (uint256) {
        require(bytes(_name).length > 0, "Challenge name cannot be empty");
        require(_targetValue > 0, "Target value must be positive");
        require(_experienceReward > 0, "Experience reward must be positive");
        require(_deadline > block.timestamp, "Deadline must be in the future");
        
        uint256 challengeId = challengeCounter++;
        
        challenges[challengeId] = Challenge({
            challengeId: FHE.asEuint32(0), // Will be set via FHE operations
            targetValue: FHE.asEuint32(0), // Will be set to actual value
            currentProgress: FHE.asEuint32(0),
            experienceReward: FHE.asEuint32(0), // Will be set to actual value
            isCompleted: FHE.asEbool(false),
            isActive: true,
            name: _name,
            description: _description,
            category: _category,
            owner: msg.sender,
            deadline: _deadline
        });
        
        return challengeId;
    }
    
    function updateChallengeProgress(
        uint256 challengeId,
        externalEuint32 progress,
        bytes calldata inputProof
    ) public {
        require(challenges[challengeId].owner != address(0), "Challenge does not exist");
        require(challenges[challengeId].isActive, "Challenge is not active");
        require(block.timestamp <= challenges[challengeId].deadline, "Challenge deadline has passed");
        require(!hasCompletedChallenge[msg.sender][challengeId], "Challenge already completed");
        
        // Decrypt and verify the progress
        euint32 decryptedProgress = FHE.decrypt(progress, inputProof);
        
        // Update progress
        challenges[challengeId].currentProgress = challenges[challengeId].currentProgress + decryptedProgress;
        
        // Check if challenge is completed
        euint32 targetValue = challenges[challengeId].targetValue;
        ebool isCompleted = challenges[challengeId].currentProgress >= targetValue;
        challenges[challengeId].isCompleted = isCompleted;
        
        // If completed, award experience and mark as completed
        ebool shouldAward = isCompleted;
        if (FHE.decrypt(shouldAward, new bytes(0))) {
            euint32 experienceReward = challenges[challengeId].experienceReward;
            playerStats[msg.sender].challengesCompleted = playerStats[msg.sender].challengesCompleted + FHE.asEuint32(1);
            hasCompletedChallenge[msg.sender][challengeId] = true;
            
            emit ChallengeCompleted(challengeId, msg.sender, FHE.decrypt(experienceReward, inputProof));
        }
    }
    
    function createReward(
        string memory _name,
        string memory _description,
        string memory _metadata,
        uint256 _level,
        uint256 _rarity,
        uint256 _value
    ) public returns (uint256) {
        require(bytes(_name).length > 0, "Reward name cannot be empty");
        require(_level > 0, "Level must be positive");
        require(_rarity >= 1 && _rarity <= 4, "Invalid rarity");
        require(_value > 0, "Value must be positive");
        
        uint256 rewardId = rewardCounter++;
        
        rewards[rewardId] = Reward({
            rewardId: FHE.asEuint32(0), // Will be set via FHE operations
            level: FHE.asEuint32(0), // Will be set to actual value
            rarity: FHE.asEuint32(0), // Will be set to actual value
            value: FHE.asEuint32(0), // Will be set to actual value
            isClaimed: FHE.asEbool(false),
            name: _name,
            description: _description,
            metadata: _metadata,
            owner: address(0) // Will be set when claimed
        });
        
        return rewardId;
    }
    
    function claimReward(
        uint256 rewardId,
        uint256 passId,
        bytes calldata inputProof
    ) public {
        require(rewards[rewardId].owner == address(0), "Reward already claimed");
        require(battlePasses[passId].owner == msg.sender, "Not the owner of this battle pass");
        require(!hasClaimedReward[msg.sender][rewardId], "Reward already claimed by this player");
        
        // Check if player has reached the required level
        euint32 requiredLevel = rewards[rewardId].level;
        euint32 currentLevel = battlePasses[passId].currentLevel;
        ebool canClaim = currentLevel >= requiredLevel;
        
        require(FHE.decrypt(canClaim, inputProof), "Insufficient level to claim this reward");
        
        // Claim the reward
        rewards[rewardId].owner = msg.sender;
        rewards[rewardId].isClaimed = FHE.asEbool(true);
        playerStats[msg.sender].rewardsClaimed = playerStats[msg.sender].rewardsClaimed + FHE.asEuint32(1);
        hasClaimedReward[msg.sender][rewardId] = true;
        
        emit RewardClaimed(rewardId, msg.sender, FHE.decrypt(requiredLevel, inputProof));
    }
    
    function getPlayerLevel(uint256 passId) public view returns (uint32) {
        require(battlePasses[passId].owner == msg.sender, "Not the owner of this battle pass");
        return FHE.decrypt(battlePasses[passId].currentLevel, new bytes(0));
    }
    
    function getPlayerExperience(uint256 passId) public view returns (uint32) {
        require(battlePasses[passId].owner == msg.sender, "Not the owner of this battle pass");
        return FHE.decrypt(battlePasses[passId].experience, new bytes(0));
    }
    
    function getRequiredExperience(uint256 passId) public view returns (uint32) {
        require(battlePasses[passId].owner == msg.sender, "Not the owner of this battle pass");
        return FHE.decrypt(battlePasses[passId].requiredExperience, new bytes(0));
    }
    
    function isChallengeCompleted(uint256 challengeId) public view returns (bool) {
        return FHE.decrypt(challenges[challengeId].isCompleted, new bytes(0));
    }
    
    function isRewardClaimed(uint256 rewardId) public view returns (bool) {
        return FHE.decrypt(rewards[rewardId].isClaimed, new bytes(0));
    }
    
    // Admin functions
    function setVerifier(address _verifier) public {
        require(msg.sender == owner, "Only owner can set verifier");
        verifier = _verifier;
    }
    
    function withdraw() public {
        require(msg.sender == owner, "Only owner can withdraw");
        payable(owner).transfer(address(this).balance);
    }
    
    function pauseBattlePass(uint256 passId) public {
        require(msg.sender == owner || msg.sender == battlePasses[passId].owner, "Not authorized");
        battlePasses[passId].isActive = false;
    }
    
    function resumeBattlePass(uint256 passId) public {
        require(msg.sender == owner, "Only owner can resume battle pass");
        battlePasses[passId].isActive = true;
    }
}
