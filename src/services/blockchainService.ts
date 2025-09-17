// Blockchain Service for Secure Loot Pass
// Handles smart contract interactions and encrypted data storage

import { ethers } from 'ethers';
import { EncryptedProgress, ProgressData } from './fheService';

export interface ContractConfig {
  contractAddress: string;
  abi: any[];
  provider: ethers.Provider;
  signer?: ethers.Signer;
}

export interface TransactionResult {
  hash: string;
  success: boolean;
  error?: string;
}

export interface ChallengeProgress {
  challengeId: string;
  encryptedProgress: string;
  publicKey: string;
  timestamp: number;
  blockNumber?: number;
  transactionHash?: string;
}

class BlockchainService {
  private contract: ethers.Contract | null = null;
  private config: ContractConfig | null = null;
  private isInitialized = false;

  /**
   * Initialize blockchain service with contract configuration
   */
  async initialize(config: ContractConfig): Promise<void> {
    try {
      this.config = config;
      this.contract = new ethers.Contract(
        config.contractAddress,
        config.abi,
        config.signer || config.provider
      );
      this.isInitialized = true;
      console.log('Blockchain service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize blockchain service:', error);
      throw new Error('Blockchain initialization failed');
    }
  }

  /**
   * Submit encrypted progress to blockchain
   */
  async submitEncryptedProgress(
    challengeId: string,
    encryptedProgress: EncryptedProgress
  ): Promise<TransactionResult> {
    if (!this.isInitialized || !this.contract) {
      throw new Error('Blockchain service not initialized');
    }

    try {
      // Convert challenge ID to bytes32
      const challengeIdBytes = ethers.encodeBytes32String(challengeId);
      
      // Prepare transaction data
      const txData = {
        challengeId: challengeIdBytes,
        encryptedData: encryptedProgress.encryptedData,
        publicKey: encryptedProgress.publicKey,
        timestamp: encryptedProgress.timestamp
      };

      // Estimate gas
      const gasEstimate = await this.contract.updateChallengeProgress.estimateGas(
        challengeIdBytes,
        encryptedProgress.encryptedData,
        encryptedProgress.publicKey
      );

      // Submit transaction
      const tx = await this.contract.updateChallengeProgress(
        challengeIdBytes,
        encryptedProgress.encryptedData,
        encryptedProgress.publicKey,
        {
          gasLimit: gasEstimate * 120n / 100n, // Add 20% buffer
        }
      );

      // Wait for confirmation
      const receipt = await tx.wait();
      
      return {
        hash: tx.hash,
        success: receipt?.status === 1,
        error: receipt?.status === 0 ? 'Transaction failed' : undefined
      };
    } catch (error: any) {
      console.error('Failed to submit encrypted progress:', error);
      return {
        hash: '',
        success: false,
        error: error.message || 'Transaction failed'
      };
    }
  }

  /**
   * Gain experience with encrypted amount
   */
  async gainExperience(
    passId: number,
    encryptedAmount: string,
    publicKey: string
  ): Promise<TransactionResult> {
    if (!this.isInitialized || !this.contract) {
      throw new Error('Blockchain service not initialized');
    }

    try {
      // Estimate gas
      const gasEstimate = await this.contract.gainExperience.estimateGas(
        passId,
        encryptedAmount,
        publicKey
      );

      // Submit transaction
      const tx = await this.contract.gainExperience(
        passId,
        encryptedAmount,
        publicKey,
        {
          gasLimit: gasEstimate * 120n / 100n, // Add 20% buffer
        }
      );

      // Wait for confirmation
      const receipt = await tx.wait();
      
      return {
        hash: tx.hash,
        success: receipt?.status === 1,
        error: receipt?.status === 0 ? 'Transaction failed' : undefined
      };
    } catch (error: any) {
      console.error('Failed to gain experience:', error);
      return {
        hash: '',
        success: false,
        error: error.message || 'Transaction failed'
      };
    }
  }

  /**
   * Purchase battle pass
   */
  async purchaseBattlePass(passId: number, price: string): Promise<TransactionResult> {
    if (!this.isInitialized || !this.contract) {
      throw new Error('Blockchain service not initialized');
    }

    try {
      const tx = await this.contract.purchaseBattlePass(passId, {
        value: ethers.parseEther(price)
      });

      const receipt = await tx.wait();
      
      return {
        hash: tx.hash,
        success: receipt?.status === 1,
        error: receipt?.status === 0 ? 'Transaction failed' : undefined
      };
    } catch (error: any) {
      console.error('Failed to purchase battle pass:', error);
      return {
        hash: '',
        success: false,
        error: error.message || 'Transaction failed'
      };
    }
  }

  /**
   * Get player level
   */
  async getPlayerLevel(passId: number): Promise<number> {
    if (!this.isInitialized || !this.contract) {
      throw new Error('Blockchain service not initialized');
    }

    try {
      const level = await this.contract.getPlayerLevel(passId);
      return Number(level);
    } catch (error) {
      console.error('Failed to get player level:', error);
      return 0;
    }
  }

  /**
   * Get player experience
   */
  async getPlayerExperience(passId: number): Promise<number> {
    if (!this.isInitialized || !this.contract) {
      throw new Error('Blockchain service not initialized');
    }

    try {
      const experience = await this.contract.getPlayerExperience(passId);
      return Number(experience);
    } catch (error) {
      console.error('Failed to get player experience:', error);
      return 0;
    }
  }

  /**
   * Get required experience for next level
   */
  async getRequiredExperience(passId: number): Promise<number> {
    if (!this.isInitialized || !this.contract) {
      throw new Error('Blockchain service not initialized');
    }

    try {
      const requiredExp = await this.contract.getRequiredExperience(passId);
      return Number(requiredExp);
    } catch (error) {
      console.error('Failed to get required experience:', error);
      return 1000; // Default value
    }
  }

  /**
   * Check if challenge is completed
   */
  async isChallengeCompleted(challengeId: string): Promise<boolean> {
    if (!this.isInitialized || !this.contract) {
      throw new Error('Blockchain service not initialized');
    }

    try {
      const challengeIdBytes = ethers.encodeBytes32String(challengeId);
      const isCompleted = await this.contract.isChallengeCompleted(challengeIdBytes);
      return isCompleted;
    } catch (error) {
      console.error('Failed to check challenge completion:', error);
      return false;
    }
  }

  /**
   * Get challenge progress from blockchain
   */
  async getChallengeProgress(challengeId: string): Promise<ChallengeProgress | null> {
    if (!this.isInitialized || !this.contract) {
      throw new Error('Blockchain service not initialized');
    }

    try {
      const challengeIdBytes = ethers.encodeBytes32String(challengeId);
      const progress = await this.contract.getChallengeProgress(challengeIdBytes);
      
      return {
        challengeId,
        encryptedProgress: progress.encryptedData,
        publicKey: progress.publicKey,
        timestamp: Number(progress.timestamp),
        blockNumber: progress.blockNumber ? Number(progress.blockNumber) : undefined,
        transactionHash: progress.transactionHash
      };
    } catch (error) {
      console.error('Failed to get challenge progress:', error);
      return null;
    }
  }

  /**
   * Get current network
   */
  async getNetwork(): Promise<{ chainId: number; name: string }> {
    if (!this.config?.provider) {
      throw new Error('Provider not initialized');
    }

    try {
      const network = await this.config.provider.getNetwork();
      return {
        chainId: Number(network.chainId),
        name: network.name
      };
    } catch (error) {
      console.error('Failed to get network:', error);
      throw new Error('Network detection failed');
    }
  }

  /**
   * Check if service is initialized
   */
  isReady(): boolean {
    return this.isInitialized && this.contract !== null;
  }

  /**
   * Get contract address
   */
  getContractAddress(): string | null {
    return this.config?.contractAddress || null;
  }
}

// Export singleton instance
export const blockchainService = new BlockchainService();

