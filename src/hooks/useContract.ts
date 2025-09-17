import { useContract, useContractRead, useContractWrite, useAccount } from 'wagmi';
import { useState, useEffect } from 'react';

// Contract ABI - This would be generated from the compiled contract
const CONTRACT_ABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_verifier",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "passId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "name",
        "type": "string"
      }
    ],
    "name": "BattlePassCreated",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_name",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_description",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "_totalLevels",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_duration",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_price",
        "type": "uint256"
      }
    ],
    "name": "createBattlePass",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "passId",
        "type": "uint256"
      }
    ],
    "name": "purchaseBattlePass",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "passId",
        "type": "uint256"
      }
    ],
    "name": "upgradeToPremium",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "passId",
        "type": "uint256"
      }
    ],
    "name": "getPlayerLevel",
    "outputs": [
      {
        "internalType": "uint32",
        "name": "",
        "type": "uint32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "passId",
        "type": "uint256"
      }
    ],
    "name": "getPlayerExperience",
    "outputs": [
      {
        "internalType": "uint32",
        "name": "",
        "type": "uint32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

// Contract address - This would be the deployed contract address
const CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000"; // Replace with actual deployed address

export function useSecureLootPass() {
  const { address } = useAccount();
  const [contractAddress, setContractAddress] = useState(CONTRACT_ADDRESS);

  const contract = useContract({
    address: contractAddress as `0x${string}`,
    abi: CONTRACT_ABI,
  });

  return {
    contract,
    contractAddress,
    setContractAddress,
  };
}

export function useBattlePass(passId: number) {
  const { contract } = useSecureLootPass();

  const { data: playerLevel, isLoading: isLoadingLevel } = useContractRead({
    address: contract?.address,
    abi: CONTRACT_ABI,
    functionName: 'getPlayerLevel',
    args: [BigInt(passId)],
    enabled: !!contract && passId >= 0,
  });

  const { data: playerExperience, isLoading: isLoadingExperience } = useContractRead({
    address: contract?.address,
    abi: CONTRACT_ABI,
    functionName: 'getPlayerExperience',
    args: [BigInt(passId)],
    enabled: !!contract && passId >= 0,
  });

  return {
    playerLevel: playerLevel ? Number(playerLevel) : 0,
    playerExperience: playerExperience ? Number(playerExperience) : 0,
    isLoading: isLoadingLevel || isLoadingExperience,
  };
}

export function useBattlePassActions() {
  const { contract } = useSecureLootPass();

  const { write: createBattlePass, isLoading: isCreating } = useContractWrite({
    address: contract?.address,
    abi: CONTRACT_ABI,
    functionName: 'createBattlePass',
  });

  const { write: purchaseBattlePass, isLoading: isPurchasing } = useContractWrite({
    address: contract?.address,
    abi: CONTRACT_ABI,
    functionName: 'purchaseBattlePass',
  });

  const { write: upgradeToPremium, isLoading: isUpgrading } = useContractWrite({
    address: contract?.address,
    abi: CONTRACT_ABI,
    functionName: 'upgradeToPremium',
  });

  return {
    createBattlePass,
    purchaseBattlePass,
    upgradeToPremium,
    isCreating,
    isPurchasing,
    isUpgrading,
  };
}
