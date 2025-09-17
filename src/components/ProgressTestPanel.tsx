// Test Panel for FHE-encrypted progress tracking
// This component allows testing the complete encryption and blockchain flow

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAccount } from 'wagmi';
import { useProgressTracking } from '@/hooks/useProgressTracking';
import { fheService } from '@/services/fheService';
import { blockchainService } from '@/services/blockchainService';
import { toast } from 'sonner';
import { 
  Shield, 
  Lock, 
  Unlock, 
  Database, 
  CheckCircle, 
  XCircle, 
  Loader2,
  TestTube
} from 'lucide-react';

export const ProgressTestPanel = () => {
  const { address, isConnected } = useAccount();
  const { isInitialized, isTracking, playerStats, trackProgress } = useProgressTracking();
  const [testResults, setTestResults] = useState<{
    fheInitialized: boolean;
    blockchainConnected: boolean;
    encryptionTest: boolean;
    decryptionTest: boolean;
    verificationTest: boolean;
    blockchainTest: boolean;
  }>({
    fheInitialized: false,
    blockchainConnected: false,
    encryptionTest: false,
    decryptionTest: false,
    verificationTest: false,
    blockchainTest: false
  });
  const [isRunningTests, setIsRunningTests] = useState(false);

  const runAllTests = async () => {
    if (!isConnected || !address) {
      toast.error('Please connect your wallet first');
      return;
    }

    setIsRunningTests(true);
    const results = { ...testResults };

    try {
      // Test 1: FHE Service Initialization
      toast.info('Testing FHE service initialization...');
      results.fheInitialized = fheService.isReady();
      setTestResults({ ...results });

      // Test 2: Blockchain Service Connection
      toast.info('Testing blockchain service connection...');
      results.blockchainConnected = blockchainService.isReady();
      setTestResults({ ...results });

      // Test 3: Encryption Test
      toast.info('Testing FHE encryption...');
      try {
        const testData = {
          challengeId: 'test_challenge',
          progress: 5,
          maxProgress: 10,
          experience: 25,
          timestamp: Date.now(),
          userId: address
        };
        const encrypted = await fheService.encryptProgress(testData);
        results.encryptionTest = encrypted.encryptedData.length > 0;
        setTestResults({ ...results });
      } catch (error) {
        console.error('Encryption test failed:', error);
        results.encryptionTest = false;
        setTestResults({ ...results });
      }

      // Test 4: Decryption Test
      toast.info('Testing FHE decryption...');
      try {
        const testData = {
          challengeId: 'test_challenge',
          progress: 5,
          maxProgress: 10,
          experience: 25,
          timestamp: Date.now(),
          userId: address
        };
        const encrypted = await fheService.encryptProgress(testData);
        const decrypted = await fheService.decryptProgress(encrypted);
        results.decryptionTest = decrypted.progress === testData.progress;
        setTestResults({ ...results });
      } catch (error) {
        console.error('Decryption test failed:', error);
        results.decryptionTest = false;
        setTestResults({ ...results });
      }

      // Test 5: Verification Test
      toast.info('Testing FHE verification...');
      try {
        const testData = {
          challengeId: 'test_challenge',
          progress: 5,
          maxProgress: 10,
          experience: 25,
          timestamp: Date.now(),
          userId: address
        };
        const encrypted = await fheService.encryptProgress(testData);
        const verified = await fheService.verifyProgress(encrypted);
        results.verificationTest = verified;
        setTestResults({ ...results });
      } catch (error) {
        console.error('Verification test failed:', error);
        results.verificationTest = false;
        setTestResults({ ...results });
      }

      // Test 6: Blockchain Integration Test
      toast.info('Testing blockchain integration...');
      try {
        const testRequest = {
          challengeId: 'test_challenge_' + Date.now(),
          progress: 1,
          maxProgress: 5,
          experience: 10,
          userId: address
        };
        const success = await trackProgress(testRequest);
        results.blockchainTest = success;
        setTestResults({ ...results });
      } catch (error) {
        console.error('Blockchain test failed:', error);
        results.blockchainTest = false;
        setTestResults({ ...results });
      }

      // Calculate overall success
      const allTestsPassed = Object.values(results).every(result => result === true);
      
      if (allTestsPassed) {
        toast.success('All tests passed! FHE-encrypted progress tracking is working correctly.');
      } else {
        toast.warning('Some tests failed. Check the test results below.');
      }

    } catch (error) {
      console.error('Test suite failed:', error);
      toast.error('Test suite encountered an error');
    } finally {
      setIsRunningTests(false);
    }
  };

  const getTestIcon = (passed: boolean) => {
    return passed ? (
      <CheckCircle className="w-4 h-4 text-green-500" />
    ) : (
      <XCircle className="w-4 h-4 text-red-500" />
    );
  };

  const getTestStatus = (passed: boolean) => {
    return passed ? (
      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
        Passed
      </Badge>
    ) : (
      <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
        Failed
      </Badge>
    );
  };

  if (!isConnected) {
    return (
      <Card className="gradient-card border-border/50 p-6">
        <div className="text-center">
          <Shield className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2 text-foreground">Progress Test Panel</h3>
          <p className="text-muted-foreground">
            Connect your wallet to test FHE-encrypted progress tracking
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="gradient-card border-border/50 p-6">
      <div className="flex items-center gap-3 mb-6">
        <TestTube className="w-6 h-6 text-accent" />
        <h3 className="text-xl font-semibold text-foreground">FHE Progress Test Panel</h3>
      </div>

      {/* Service Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="space-y-3">
          <h4 className="font-medium text-foreground">Service Status</h4>
          
          <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-accent" />
              <span className="text-sm text-foreground">FHE Service</span>
            </div>
            {getTestStatus(testResults.fheInitialized)}
          </div>

          <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-accent" />
              <span className="text-sm text-foreground">Blockchain Service</span>
            </div>
            {getTestStatus(testResults.blockchainConnected)}
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-medium text-foreground">Player Stats</h4>
          
          <div className="p-3 bg-background/50 rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">Level</div>
            <div className="text-lg font-semibold text-foreground">{playerStats.level}</div>
          </div>

          <div className="p-3 bg-background/50 rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">Experience</div>
            <div className="text-lg font-semibold text-foreground">
              {playerStats.experience} / {playerStats.requiredExperience}
            </div>
            <Progress 
              value={(playerStats.experience / playerStats.requiredExperience) * 100} 
              className="mt-2 h-2"
            />
          </div>
        </div>
      </div>

      {/* Test Results */}
      <div className="space-y-3 mb-6">
        <h4 className="font-medium text-foreground">Test Results</h4>
        
        {Object.entries(testResults).map(([test, passed]) => (
          <div key={test} className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
            <div className="flex items-center gap-2">
              {getTestIcon(passed)}
              <span className="text-sm text-foreground capitalize">
                {test.replace(/([A-Z])/g, ' $1').trim()}
              </span>
            </div>
            {getTestStatus(passed)}
          </div>
        ))}
      </div>

      {/* Test Actions */}
      <div className="flex gap-3">
        <Button 
          onClick={runAllTests}
          disabled={!isInitialized || isRunningTests}
          className="gradient-encrypted text-primary-foreground flex-1"
        >
          {isRunningTests ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Running Tests...
            </>
          ) : (
            <>
              <TestTube className="w-4 h-4 mr-2" />
              Run All Tests
            </>
          )}
        </Button>
      </div>

      {/* Test Description */}
      <div className="mt-4 p-4 bg-background/30 rounded-lg">
        <h5 className="font-medium text-foreground mb-2">Test Description</h5>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• <strong>FHE Service:</strong> Tests initialization of fully homomorphic encryption</li>
          <li>• <strong>Blockchain Service:</strong> Tests smart contract connection</li>
          <li>• <strong>Encryption:</strong> Tests FHE encryption of progress data</li>
          <li>• <strong>Decryption:</strong> Tests FHE decryption and data integrity</li>
          <li>• <strong>Verification:</strong> Tests encrypted data verification without decryption</li>
          <li>• <strong>Blockchain:</strong> Tests complete encrypted progress submission to blockchain</li>
        </ul>
      </div>
    </Card>
  );
};
