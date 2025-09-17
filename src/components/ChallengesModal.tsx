import { useState, useEffect } from "react";
import { X, Target, CheckCircle, Clock, Zap, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAccount } from "wagmi";
import { useProgressTracking } from "@/hooks/useProgressTracking";
import { TrackProgressRequest } from "@/services/progressService";
import { toast } from "sonner";

interface Challenge {
  id: number;
  title: string;
  description: string;
  progress: number;
  maxProgress: number;
  reward: string;
  difficulty: "Easy" | "Medium" | "Hard";
  timeLeft: string;
  isCompleted: boolean;
}

const mockChallenges: Challenge[] = [
  {
    id: 1,
    title: "Complete 5 Encrypted Missions",
    description: "Successfully complete any 5 missions while maintaining privacy",
    progress: 3,
    maxProgress: 5,
    reward: "250 XP + Stealth Badge",
    difficulty: "Easy",
    timeLeft: "2 days",
    isCompleted: false
  },
  {
    id: 2,
    title: "Unlock Without Detection",
    description: "Unlock 3 reward tiers without revealing progress to other players", 
    progress: 1,
    maxProgress: 3,
    reward: "500 XP + Privacy Crown",
    difficulty: "Medium",
    timeLeft: "5 days",
    isCompleted: false
  },
  {
    id: 3,
    title: "Master of Encryption",
    description: "Complete the season while keeping 80% of progress encrypted",
    progress: 0,
    maxProgress: 1,
    reward: "1000 XP + Legendary Cipher",
    difficulty: "Hard", 
    timeLeft: "23 days",
    isCompleted: false
  },
  {
    id: 4,
    title: "Daily Login Streak",
    description: "Log in for 7 consecutive days",
    progress: 7,
    maxProgress: 7,
    reward: "100 XP + Loyalty Token",
    difficulty: "Easy",
    timeLeft: "Completed",
    isCompleted: true
  }
];

interface ChallengesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChallengesModal = ({ isOpen, onClose }: ChallengesModalProps) => {
  const { address, isConnected } = useAccount();
  const { isInitialized, isTracking, trackProgress, refreshProgress } = useProgressTracking();
  const [trackingProgress, setTrackingProgress] = useState<Set<number>>(new Set());
  const [challenges, setChallenges] = useState<Challenge[]>(mockChallenges);

  useEffect(() => {
    if (isOpen && isInitialized) {
      loadExistingProgress();
    }
  }, [isOpen, isInitialized]);

  const loadExistingProgress = async () => {
    const updatedChallenges = await Promise.all(
      mockChallenges.map(async (challenge) => {
        try {
          const progress = await progressService.getProgress(challenge.id.toString());
          if (progress) {
            return {
              ...challenge,
              progress: progress.currentProgress,
              isCompleted: progress.isCompleted
            };
          }
        } catch (error) {
          console.error(`Failed to load progress for challenge ${challenge.id}:`, error);
        }
        return challenge;
      })
    );
    setChallenges(updatedChallenges);
  };

  const handleTrackProgress = async (challengeId: number) => {
    if (!isConnected || !address || !isInitialized) {
      toast.error('Please connect your wallet and wait for initialization');
      return;
    }

    setTrackingProgress(prev => new Set(prev).add(challengeId));

    try {
      const challenge = challenges.find(c => c.id === challengeId);
      if (!challenge) return;

      const newProgress = Math.min(challenge.progress + 1, challenge.maxProgress);
      
      const request: TrackProgressRequest = {
        challengeId: challengeId.toString(),
        progress: newProgress,
        maxProgress: challenge.maxProgress,
        experience: challenge.difficulty === 'Easy' ? 10 : challenge.difficulty === 'Medium' ? 25 : 50,
        userId: address
      };

      const success = await trackProgress(request);

      if (success) {
        // Update local state
        setChallenges(prev => prev.map(c => 
          c.id === challengeId 
            ? { ...c, progress: newProgress, isCompleted: newProgress >= c.maxProgress }
            : c
        ));
      }
    } catch (error: any) {
      console.error('Failed to track progress:', error);
      toast.error(error.message || 'Failed to track progress');
    } finally {
      setTrackingProgress(prev => {
        const newSet = new Set(prev);
        newSet.delete(challengeId);
        return newSet;
      });
    }
  };

  if (!isOpen) return null;

  const getDifficultyColor = (difficulty: Challenge["difficulty"]) => {
    switch (difficulty) {
      case "Easy": return "bg-green-500/20 text-green-400 border-green-500/30";
      case "Medium": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "Hard": return "bg-red-500/20 text-red-400 border-red-500/30";
    }
  };

  const getDifficultyIcon = (difficulty: Challenge["difficulty"]) => {
    switch (difficulty) {
      case "Easy": return <Target className="w-3 h-3" />;
      case "Medium": return <Zap className="w-3 h-3" />;
      case "Hard": return <CheckCircle className="w-3 h-3" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="gradient-card border-border/50 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">Season Challenges</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="space-y-4">
            {mockChallenges.map((challenge) => (
              <Card key={challenge.id} className="gradient-card border-border/30 p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-foreground">{challenge.title}</h3>
                      <Badge 
                        className={`text-xs ${getDifficultyColor(challenge.difficulty)}`}
                      >
                        {getDifficultyIcon(challenge.difficulty)}
                        {challenge.difficulty}
                      </Badge>
                      {challenge.isCompleted && (
                        <Badge className="gradient-unlock text-accent-foreground">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Completed
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {challenge.description}
                    </p>
                    
                    {!challenge.isCompleted && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            Progress: {challenge.progress}/{challenge.maxProgress}
                          </span>
                          <div className="flex items-center gap-1 text-accent">
                            <Clock className="w-3 h-3" />
                            {challenge.timeLeft}
                          </div>
                        </div>
                        <Progress 
                          value={(challenge.progress / challenge.maxProgress) * 100}
                          className="h-2"
                        />
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Reward: </span>
                    <span className="text-accent font-medium">{challenge.reward}</span>
                  </div>
                  
                  {challenge.isCompleted ? (
                    <Button size="sm" className="gradient-unlock text-accent-foreground" disabled>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Completed
                    </Button>
                  ) : challenge.progress >= challenge.maxProgress ? (
                    <Button size="sm" className="gradient-unlock text-accent-foreground">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Claim Reward
                    </Button>
                  ) : (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="border-primary/30 text-primary hover:bg-primary/10"
                      onClick={() => handleTrackProgress(challenge.id)}
                      disabled={trackingProgress.has(challenge.id) || !isConnected || !isInitialized || isTracking}
                    >
                      {trackingProgress.has(challenge.id) ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Encrypting...
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 mr-2" />
                          Track Progress
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>

          <div className="mt-6 p-4 gradient-card rounded-lg border border-border/30">
            <h3 className="font-semibold text-foreground mb-2">Weekly Challenge Rotation</h3>
            <p className="text-sm text-muted-foreground">
              New challenges unlock every Monday. Complete them before they expire to earn exclusive rewards 
              and maintain your encrypted progress advantage.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};