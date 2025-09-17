// Custom hook for managing progress tracking with FHE encryption

import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { progressService, TrackProgressRequest, ProgressUpdate } from '@/services/progressService';
import { toast } from 'sonner';

export interface UseProgressTrackingReturn {
  // State
  isInitialized: boolean;
  isTracking: boolean;
  progressUpdates: ProgressUpdate[];
  playerStats: {
    level: number;
    experience: number;
    requiredExperience: number;
  };
  
  // Actions
  trackProgress: (request: TrackProgressRequest) => Promise<boolean>;
  refreshProgress: () => Promise<void>;
  refreshPlayerStats: () => Promise<void>;
  clearCache: () => void;
}

export const useProgressTracking = (): UseProgressTrackingReturn => {
  const { address, isConnected } = useAccount();
  const [isInitialized, setIsInitialized] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [progressUpdates, setProgressUpdates] = useState<ProgressUpdate[]>([]);
  const [playerStats, setPlayerStats] = useState({
    level: 1,
    experience: 0,
    requiredExperience: 1000
  });

  // Initialize services when wallet connects
  useEffect(() => {
    if (isConnected && address && !isInitialized) {
      initializeServices();
    }
  }, [isConnected, address, isInitialized]);

  const initializeServices = async () => {
    try {
      await progressService.initialize();
      setIsInitialized(true);
      
      // Load initial data
      await refreshProgress();
      await refreshPlayerStats();
    } catch (error) {
      console.error('Failed to initialize progress tracking:', error);
      toast.error('Failed to initialize progress tracking');
    }
  };

  const trackProgress = useCallback(async (request: TrackProgressRequest): Promise<boolean> => {
    if (!isInitialized || !isConnected) {
      toast.error('Please connect your wallet and wait for initialization');
      return false;
    }

    setIsTracking(true);
    try {
      const result = await progressService.trackProgress(request);
      
      if (result.success) {
        toast.success(`Progress updated! ${result.transactionHash ? `Tx: ${result.transactionHash.slice(0, 10)}...` : ''}`);
        
        // Refresh data after successful tracking
        await refreshProgress();
        await refreshPlayerStats();
        
        return true;
      } else {
        toast.error(result.error || 'Failed to track progress');
        return false;
      }
    } catch (error: any) {
      console.error('Failed to track progress:', error);
      toast.error(error.message || 'Failed to track progress');
      return false;
    } finally {
      setIsTracking(false);
    }
  }, [isInitialized, isConnected]);

  const refreshProgress = useCallback(async () => {
    if (!isInitialized) return;
    
    try {
      const updates = progressService.getAllProgress();
      setProgressUpdates(updates);
    } catch (error) {
      console.error('Failed to refresh progress:', error);
    }
  }, [isInitialized]);

  const refreshPlayerStats = useCallback(async () => {
    if (!isInitialized) return;
    
    try {
      const stats = await progressService.getPlayerStats(1); // Assuming passId = 1
      setPlayerStats(stats);
    } catch (error) {
      console.error('Failed to refresh player stats:', error);
    }
  }, [isInitialized]);

  const clearCache = useCallback(() => {
    progressService.clearCache();
    setProgressUpdates([]);
  }, []);

  return {
    isInitialized,
    isTracking,
    progressUpdates,
    playerStats,
    trackProgress,
    refreshProgress,
    refreshPlayerStats,
    clearCache
  };
};
