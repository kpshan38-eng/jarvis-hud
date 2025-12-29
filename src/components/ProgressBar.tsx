interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showPercentage?: boolean;
}

const ProgressBar = ({ value, max = 100, label, showPercentage = true }: ProgressBarProps) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  
  return (
    <div className="space-y-1">
      {label && (
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground uppercase tracking-wide">{label}</span>
          {showPercentage && (
            <span className="text-primary font-mono">{percentage.toFixed(0)}%</span>
          )}
        </div>
      )}
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500 rounded-full"
          style={{ width: `${percentage}%` }}
        >
          <div className="w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;
