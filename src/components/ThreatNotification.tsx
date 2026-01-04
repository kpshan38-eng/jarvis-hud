import { useEffect, useState } from "react";
import { AlertTriangle, X, Shield } from "lucide-react";

export interface ThreatAlert {
  id: string;
  name: string;
  type: string;
  level: "low" | "medium" | "high";
  timestamp: Date;
}

interface ThreatNotificationProps {
  alerts: ThreatAlert[];
  onDismiss: (id: string) => void;
  onDismissAll: () => void;
}

const ThreatNotification = ({ alerts, onDismiss, onDismissAll }: ThreatNotificationProps) => {
  if (alerts.length === 0) return null;

  const getLevelStyles = (level: string) => {
    switch (level) {
      case "high":
        return "border-red-500/50 bg-red-500/10 text-red-500";
      case "medium":
        return "border-yellow-500/50 bg-yellow-500/10 text-yellow-500";
      default:
        return "border-green-500/50 bg-green-500/10 text-green-500";
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {alerts.slice(0, 3).map((alert, index) => (
        <div
          key={alert.id}
          className={`animate-fade-in border rounded p-3 backdrop-blur-md ${getLevelStyles(alert.level)}`}
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">
                {alert.level.toUpperCase()} THREAT: {alert.name}
              </p>
              <p className="text-xs opacity-80 truncate">{alert.type}</p>
              <p className="text-[10px] opacity-60 mt-1">
                {alert.timestamp.toLocaleTimeString()}
              </p>
            </div>
            <button
              onClick={() => onDismiss(alert.id)}
              className="p-1 hover:bg-white/10 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
      
      {alerts.length > 3 && (
        <div className="text-center">
          <span className="text-xs text-muted-foreground">
            +{alerts.length - 3} more alerts
          </span>
        </div>
      )}
      
      {alerts.length > 1 && (
        <button
          onClick={onDismissAll}
          className="w-full text-xs text-muted-foreground hover:text-primary transition-colors py-1"
        >
          Dismiss All
        </button>
      )}
    </div>
  );
};

export default ThreatNotification;
