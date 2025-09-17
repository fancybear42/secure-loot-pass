import { useState } from "react";
import { X, Crown, Check, Zap, Shield, Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface PremiumFeature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const premiumFeatures: PremiumFeature[] = [
  {
    icon: <Crown className="w-5 h-5" />,
    title: "Exclusive Premium Rewards",
    description: "Access to legendary items, rare skins, and premium currency"
  },
  {
    icon: <Zap className="w-5 h-5" />,
    title: "2x XP Multiplier",
    description: "Double experience points for faster progression through tiers"
  },
  {
    icon: <Shield className="w-5 h-5" />,
    title: "Enhanced Privacy Protection",
    description: "Advanced encryption for even greater progress privacy"
  },
  {
    icon: <Star className="w-5 h-5" />,
    title: "Priority Support",
    description: "Get help faster with dedicated premium customer support"
  }
];

const pricingTiers = [
  {
    name: "Battle Pass Premium",
    price: "$9.99",
    period: "Season",
    description: "Unlock all premium rewards for this season",
    features: ["All premium tier rewards", "2x XP boost", "Exclusive cosmetics"],
    isPopular: true
  },
  {
    name: "Premium Plus",
    price: "$19.99", 
    period: "Season",
    description: "Premium + additional benefits",
    features: ["Everything in Premium", "Instant tier skip tokens", "Early access to new content", "Priority matchmaking"],
    isPopular: false
  }
];

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PremiumModal = ({ isOpen, onClose }: PremiumModalProps) => {
  const [selectedTier, setSelectedTier] = useState(0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="gradient-card border-border/50 w-full max-w-5xl max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="gradient-encrypted p-2 rounded-lg">
                <Crown className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">Upgrade to Premium</h2>
                <p className="text-muted-foreground">Unlock exclusive rewards and enhanced features</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Premium Features */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-foreground mb-4">Premium Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {premiumFeatures.map((feature, index) => (
                <Card key={index} className="gradient-card border-border/30 p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-accent mt-1">
                      {feature.icon}
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground mb-1">{feature.title}</h4>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Pricing Tiers */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-foreground mb-4">Choose Your Plan</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pricingTiers.map((tier, index) => (
                <Card 
                  key={index}
                  className={`gradient-card border-border/30 p-6 cursor-pointer transition-all ${
                    selectedTier === index ? 'ring-2 ring-primary shadow-encrypted' : ''
                  } ${tier.isPopular ? 'relative' : ''}`}
                  onClick={() => setSelectedTier(index)}
                >
                  {tier.isPopular && (
                    <Badge className="gradient-encrypted text-primary-foreground absolute -top-2 left-1/2 transform -translate-x-1/2">
                      Most Popular
                    </Badge>
                  )}
                  
                  <div className="text-center mb-4">
                    <h4 className="text-xl font-bold text-foreground mb-1">{tier.name}</h4>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-3xl font-bold text-accent">{tier.price}</span>
                      <span className="text-muted-foreground">/{tier.period}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">{tier.description}</p>
                  </div>

                  <div className="space-y-3">
                    {tier.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-accent" />
                        <span className="text-sm text-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Purchase Section */}
          <div className="border-t border-border/30 pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Selected: <span className="text-foreground font-medium">{pricingTiers[selectedTier].name}</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Secure payment • Cancel anytime • 30-day money-back guarantee
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={onClose}>
                  Maybe Later
                </Button>
                <Button className="gradient-encrypted text-primary-foreground">
                  Purchase {pricingTiers[selectedTier].price}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};