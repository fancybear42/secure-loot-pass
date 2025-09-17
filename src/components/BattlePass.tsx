import { useState, useEffect } from "react";
import { Crown, Calendar, Trophy } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BattlePassCard } from "./BattlePassCard";
import { ProgressBar } from "./ProgressBar";
import { WalletConnection } from "./WalletConnection";
import { ChallengesModal } from "./ChallengesModal";
import { PremiumModal } from "./PremiumModal";
import { Logo } from "./Logo";
import heroImage from "@/assets/battle-pass-hero.jpg";

const mockRewards = [
  { id: 1, tier: 1, name: "Starter Pack", type: "coins" as const, value: "100 XP", isUnlocked: true, isPremium: false },
  { id: 2, tier: 2, name: "Silver Badge", type: "item" as const, value: "Epic Badge", isUnlocked: true, isPremium: false },
  { id: 3, tier: 3, name: "Premium Boost", type: "premium" as const, value: "2x XP Multiplier", isUnlocked: false, isPremium: true },
  { id: 4, tier: 4, name: "Golden Crown", type: "item" as const, value: "Legendary Crown", isUnlocked: false, isPremium: false },
  { id: 5, tier: 5, name: "Master Chest", type: "premium" as const, value: "5000 Coins", isUnlocked: false, isPremium: true },
  { id: 6, tier: 6, name: "Elite Status", type: "item" as const, value: "VIP Access", isUnlocked: false, isPremium: false },
];

export const BattlePass = () => {
  const [currentProgress, setCurrentProgress] = useState(2);
  const [selectedReward, setSelectedReward] = useState<number | null>(null);
  const [isWalletConnected] = useState(false);
  const [showChallenges, setShowChallenges] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  const totalTiers = 6;
  const seasonTimeLeft = "23 days";

  const handleUnlock = (rewardId: number) => {
    const reward = mockRewards.find(r => r.id === rewardId);
    if (reward && currentProgress >= reward.tier && !reward.isUnlocked) {
      // In a real app, this would call the blockchain/backend
      console.log(`Unlocking reward: ${reward.name}`);
      setSelectedReward(rewardId);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div 
        className="relative h-96 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />
        <div className="relative z-10 container mx-auto px-6 h-full flex items-center">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-4">
              <Logo size="md" />
              <Badge className="gradient-encrypted text-primary-foreground">
                <Crown className="w-4 h-4 mr-2" />
                Season 1 - Encrypted Legends
              </Badge>
            </div>
            <h1 className="text-5xl font-bold mb-4 text-foreground">
              Progress Privately, Unlock Publicly
            </h1>
            <p className="text-xl text-muted-foreground mb-6">
              Your battle pass progress is encrypted until milestone completion. 
              Others can only see what you choose to reveal.
            </p>
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-accent" />
                <span className="text-foreground">{seasonTimeLeft} remaining</span>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-accent" />
                <span className="text-foreground">{currentProgress}/{totalTiers} tiers unlocked</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        {/* Wallet Connection */}
        {!isWalletConnected && (
          <div className="mb-12 max-w-md mx-auto">
            <WalletConnection />
          </div>
        )}

        {/* Progress Overview */}
        <Card className="gradient-card border-border/50 p-8 mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2 text-foreground">Season Progress</h2>
            <p className="text-muted-foreground">
              Complete challenges to unlock new tiers and reveal encrypted rewards
            </p>
          </div>
          
          <ProgressBar 
            current={currentProgress} 
            total={totalTiers}
            label="Battle Pass Progression"
            className="max-w-2xl mx-auto"
          />

          <div className="flex justify-center gap-4 mt-8">
            <Button 
              variant="outline" 
              className="border-primary/30 text-primary hover:bg-primary/10"
              onClick={() => setShowChallenges(true)}
            >
              View Challenges
            </Button>
            <Button 
              className="gradient-encrypted text-primary-foreground"
              onClick={() => setShowPremiumModal(true)}
            >
              Upgrade to Premium
            </Button>
          </div>
        </Card>

        {/* Rewards Grid */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-8 text-center text-foreground">
            Battle Pass Rewards
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
            {mockRewards.map((reward) => (
              <BattlePassCard
                key={reward.id}
                reward={reward}
                currentProgress={currentProgress}
                onClick={() => handleUnlock(reward.id)}
              />
            ))}
          </div>
        </div>

        {/* Season Info */}
        <Card className="gradient-card border-border/50 p-8 text-center">
          <h3 className="text-xl font-bold mb-4 text-foreground">
            Encrypted Battle Pass System
          </h3>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Your progress and unreached rewards remain encrypted and private. 
            Only completed milestones are revealed publicly on the blockchain, 
            giving you control over what others can see about your gaming journey.
          </p>
        </Card>
      </div>

      {/* Modals */}
      <ChallengesModal isOpen={showChallenges} onClose={() => setShowChallenges(false)} />
      <PremiumModal isOpen={showPremiumModal} onClose={() => setShowPremiumModal(false)} />
    </div>
  );
};