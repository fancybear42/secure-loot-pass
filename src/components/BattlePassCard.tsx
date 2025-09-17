import { Lock, Unlock, Star, Coins } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Reward {
  id: number;
  tier: number;
  name: string;
  type: "coins" | "item" | "premium";
  value: string;
  isUnlocked: boolean;
  isPremium: boolean;
}

interface BattlePassCardProps {
  reward: Reward;
  currentProgress: number;
  onClick?: () => void;
}

export const BattlePassCard = ({ reward, currentProgress, onClick }: BattlePassCardProps) => {
  const isAccessible = currentProgress >= reward.tier;
  const canUnlock = isAccessible && !reward.isUnlocked;

  return (
    <Card 
      className={cn(
        "relative overflow-hidden transition-gaming cursor-pointer group",
        "gradient-card border-border/50 hover:border-primary/30",
        reward.isUnlocked && "shadow-unlock",
        canUnlock && "shadow-encrypted animate-glow-pulse",
        !isAccessible && "locked-blur"
      )}
      onClick={onClick}
    >
      {/* Premium Badge */}
      {reward.isPremium && (
        <Badge className="absolute top-2 right-2 gradient-unlock text-accent-foreground">
          <Star className="w-3 h-3 mr-1" />
          Premium
        </Badge>
      )}

      {/* Lock/Unlock Icon */}
      <div className="absolute top-2 left-2">
        {reward.isUnlocked ? (
          <Unlock className="w-5 h-5 text-accent animate-unlock-pulse" />
        ) : isAccessible ? (
          <Lock className="w-5 h-5 text-primary animate-glow-pulse" />
        ) : (
          <Lock className="w-5 h-5 text-muted-foreground" />
        )}
      </div>

      {/* Tier Number */}
      <div className="absolute bottom-2 left-2">
        <Badge variant="outline" className="text-xs">
          Tier {reward.tier}
        </Badge>
      </div>

      {/* Reward Content */}
      <div className="p-6 pt-10 pb-12 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-secondary rounded-lg flex items-center justify-center">
          {reward.type === "coins" ? (
            <Coins className="w-8 h-8 text-accent" />
          ) : (
            <Star className="w-8 h-8 text-primary" />
          )}
        </div>

        <h3 className={cn(
          "font-semibold text-sm mb-2",
          reward.isUnlocked ? "text-foreground" : "text-muted-foreground"
        )}>
          {reward.isUnlocked || isAccessible ? reward.name : "???"}
        </h3>
        
        <p className={cn(
          "text-xs",
          reward.isUnlocked ? "text-accent" : "text-muted-foreground"
        )}>
          {reward.isUnlocked || isAccessible ? reward.value : "Encrypted"}
        </p>
      </div>

      {/* Unlock Button */}
      {canUnlock && (
        <div className="absolute inset-0 bg-background/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-gaming">
          <Button size="sm" className="gradient-encrypted text-primary-foreground">
            <Unlock className="w-4 h-4 mr-2" />
            Unlock
          </Button>
        </div>
      )}

      {/* Encrypted Overlay */}
      {!isAccessible && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-background/10 to-transparent animate-encrypted-shimmer" />
      )}
    </Card>
  );
};