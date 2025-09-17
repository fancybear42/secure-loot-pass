import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  current: number;
  total: number;
  label?: string;
  className?: string;
}

export const ProgressBar = ({ current, total, label, className }: ProgressBarProps) => {
  const percentage = Math.min((current / total) * 100, 100);

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <div className="flex justify-between text-sm">
          <span className="text-foreground font-medium">{label}</span>
          <span className="text-muted-foreground">
            {current} / {total}
          </span>
        </div>
      )}
      <div className="relative">
        <Progress 
          value={percentage} 
          className="h-3 bg-secondary"
        />
        <div 
          className="absolute top-0 left-0 h-full gradient-encrypted rounded-full transition-all duration-500 shadow-encrypted"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};