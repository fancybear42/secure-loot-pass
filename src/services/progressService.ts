// Progress Tracking Service for Secure Loot Pass
// Integrates FHE encryption with blockchain storage

import { fheService, EncryptedProgress, ProgressData } from './fheService';
import { blockchainService, TransactionResult, ChallengeProgress } from './blockchainService';
import { useAccount } from 'wagmi';

export interface TrackProgressRequest {
  challengeId: string;
  progress: number;
  maxProgress: number;
  experience: number;
  userId: string;
}

export interface TrackProgressResult {
  success: boolean;
  transactionHash?: string;
  encryptedProgress?: EncryptedProgress;
  error?: string;
}

export interface ProgressUpdate {
  challengeId: string;
  currentProgress: number;
  maxProgress: number;
  experience: number;
  isCompleted: boolean;
  lastUpdated: number;
  transactionHash?: string;
}

class ProgressService {
  private isInitialized = false;
  private progressCache = new Map<string, ProgressUpdate>();

  /**
   * Initialize progress service
   */
  async initialize(): Promise<void> {
    try {
      // Initialize FHE service
      await fheService.initialize();
      
      this.isInitialized = true;
      console.log('Progress service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize progress service:', error);
      throw new Error('Progress service initialization failed');
    }
  }

  /**
   * Track progress for a challenge with FHE encryption and blockchain storage
   */
  async trackProgress(request: TrackProgressRequest): Promise<TrackProgressResult> {
    if (!this.isInitialized) {
      throw new Error('Progress service not initialized');
    }

    try {
      // Prepare progress data
      const progressData: ProgressData = {
        challengeId: request.challengeId,
        progress: request.progress,
        maxProgress: request.maxProgress,
        experience: request.experience,
        timestamp: Date.now(),
        userId: request.userId
      };

      // Encrypt progress data using FHE
      const encryptedProgress = await fheService.encryptProgress(progressData);
      
      // Submit encrypted progress to blockchain
      const blockchainResult = await blockchainService.submitEncryptedProgress(
        request.challengeId,
        encryptedProgress
      );

      if (blockchainResult.success) {
        // Update local cache
        this.updateProgressCache({
          challengeId: request.challengeId,
          currentProgress: request.progress,
          maxProgress: request.maxProgress,
          experience: request.experience,
          isCompleted: request.progress >= request.maxProgress,
          lastUpdated: Date.now(),
          transactionHash: blockchainResult.hash
        });

        return {
          success: true,
          transactionHash: blockchainResult.hash,
          encryptedProgress
        };
      } else {
        return {
          success: false,
          error: blockchainResult.error || 'Blockchain transaction failed'
        };
      }
    } catch (error: any) {
      console.error('Failed to track progress:', error);
      return {
        success: false,
        error: error.message || 'Progress tracking failed'
      };
    }
  }

  /**
   * Gain experience with encrypted amount
   */
  async gainExperience(
    passId: number,
    experience: number,
    userId: string
  ): Promise<TransactionResult> {
    if (!this.isInitialized) {
      throw new Error('Progress service not initialized');
    }

    try {
      // Create progress data for experience
      const progressData: ProgressData = {
        challengeId: `experience_${passId}`,
        progress: experience,
        maxProgress: experience,
        experience: experience,
        timestamp: Date.now(),
        userId: userId
      };

      // Encrypt experience data
      const encryptedProgress = await fheService.encryptProgress(progressData);
      
      // Submit to blockchain
      const result = await blockchainService.gainExperience(
        passId,
        encryptedProgress.encryptedData,
        encryptedProgress.publicKey
      );

      return result;
    } catch (error: any) {
      console.error('Failed to gain experience:', error);
      return {
        hash: '',
        success: false,
        error: error.message || 'Experience gain failed'
      };
    }
  }

  /**
   * Get progress for a specific challenge
   */
  async getProgress(challengeId: string): Promise<ProgressUpdate | null> {
    // First check local cache
    const cachedProgress = this.progressCache.get(challengeId);
    if (cachedProgress) {
      return cachedProgress;
    }

    try {
      // Fetch from blockchain
      const blockchainProgress = await blockchainService.getChallengeProgress(challengeId);
      if (blockchainProgress) {
        // Decrypt progress data
        const decryptedData = await fheService.decryptProgress({
          encryptedData: blockchainProgress.encryptedProgress,
          publicKey: blockchainProgress.publicKey,
          timestamp: blockchainProgress.timestamp,
          challengeId: blockchainProgress.challengeId
        });

        const progressUpdate: ProgressUpdate = {
          challengeId: decryptedData.challengeId,
          currentProgress: decryptedData.progress,
          maxProgress: decryptedData.maxProgress,
          experience: decryptedData.experience,
          isCompleted: decryptedData.progress >= decryptedData.maxProgress,
          lastUpdated: decryptedData.timestamp,
          transactionHash: blockchainProgress.transactionHash
        };

        // Update cache
        this.progressCache.set(challengeId, progressUpdate);
        
        return progressUpdate;
      }
    } catch (error) {
      console.error('Failed to get progress:', error);
    }

    return null;
  }

  /**
   * Get all cached progress updates
   */
  getAllProgress(): ProgressUpdate[] {
    return Array.from(this.progressCache.values());
  }

  /**
   * Update progress cache
   */
  private updateProgressCache(progress: ProgressUpdate): void {
    this.progressCache.set(progress.challengeId, progress);
  }

  /**
   * Clear progress cache
   */
  clearCache(): void {
    this.progressCache.clear();
  }

  /**
   * Verify progress without decrypting
   */
  async verifyProgress(challengeId: string): Promise<boolean> {
    try {
      const blockchainProgress = await blockchainService.getChallengeProgress(challengeId);
      if (blockchainProgress) {
        return await fheService.verifyProgress({
          encryptedData: blockchainProgress.encryptedProgress,
          publicKey: blockchainProgress.publicKey,
          timestamp: blockchainProgress.timestamp,
          challengeId: blockchainProgress.challengeId
        });
      }
      return false;
    } catch (error) {
      console.error('Failed to verify progress:', error);
      return false;
    }
  }

  /**
   * Get player statistics
   */
  async getPlayerStats(passId: number): Promise<{
    level: number;
    experience: number;
    requiredExperience: number;
  }> {
    try {
      const [level, experience, requiredExperience] = await Promise.all([
        blockchainService.getPlayerLevel(passId),
        blockchainService.getPlayerExperience(passId),
        blockchainService.getRequiredExperience(passId)
      ]);

      return {
        level,
        experience,
        requiredExperience
      };
    } catch (error) {
      console.error('Failed to get player stats:', error);
      return {
        level: 1,
        experience: 0,
        requiredExperience: 1000
      };
    }
  }

  /**
   * Check if service is ready
   */
  isReady(): boolean {
    return this.isInitialized && fheService.isReady() && blockchainService.isReady();
  }

  /**
   * Get FHE public key
   */
  getPublicKey(): string | null {
    return fheService.getPublicKey();
  }
}

// Export singleton instance
export const progressService = new ProgressService();

