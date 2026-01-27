import { Mission, MissionObjective } from "./MissionBriefing";
import { Target, Clock, CheckCircle2, AlertTriangle, MapPin } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface MissionOverlayProps {
  mission: Mission | null;
  timeRemaining: number;
  onObjectiveClick?: (objectiveId: string) => void;
}

const MissionOverlay = ({ mission, timeRemaining, onObjectiveClick }: MissionOverlayProps) => {
  if (!mission) return null;

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const completedCount = mission.objectives.filter(o => o.status === "completed").length;
  const totalCount = mission.objectives.length;
  const progress = (completedCount / totalCount) * 100;

  const activeObjective = mission.objectives.find(o => o.status === "active") || mission.objectives[0];

  return (
    <div className="fixed left-4 bottom-24 z-40 w-80 pointer-events-auto">
      {/* Mission Card */}
      <div className="bg-card/90 backdrop-blur-md border border-primary/30 rounded-lg overflow-hidden">
        {/* Header */}
        <div className="p-3 border-b border-primary/20 bg-primary/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-primary animate-pulse" />
              <span className="text-xs font-mono text-primary">{mission.codename}</span>
            </div>
            {mission.timeLimit && (
              <div className={`flex items-center gap-1 px-2 py-0.5 rounded ${
                timeRemaining < 300 ? "bg-red-500/20 text-red-500" : "bg-primary/20 text-primary"
              }`}>
                <Clock className="w-3 h-3" />
                <span className="text-xs font-mono">{formatTime(timeRemaining)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Progress */}
        <div className="px-3 py-2 border-b border-border/30">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-muted-foreground">MISSION PROGRESS</span>
            <span className="text-xs text-primary">{completedCount}/{totalCount}</span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>

        {/* Active Objective */}
        <div className="p-3 space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] text-muted-foreground uppercase">Current Objective</span>
          </div>
          
          <div className="pl-4">
            <p className="text-sm text-primary font-medium">{activeObjective.title}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{activeObjective.description}</p>
            
            {activeObjective.location && (
              <div className="flex items-center gap-1 mt-2 text-[10px] text-primary/70">
                <MapPin className="w-3 h-3" />
                <span>Target: {activeObjective.location.name}</span>
                <span className="text-muted-foreground">
                  ({activeObjective.location.lat.toFixed(1)}°, {activeObjective.location.lng.toFixed(1)}°)
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Quick Objective List */}
        <div className="px-3 pb-3">
          <div className="flex flex-wrap gap-1">
            {mission.objectives.map((obj, i) => (
              <button
                key={obj.id}
                onClick={() => onObjectiveClick?.(obj.id)}
                className={`w-6 h-6 rounded flex items-center justify-center text-[10px] transition-all ${
                  obj.status === "completed"
                    ? "bg-green-500/20 text-green-500 border border-green-500/30"
                    : obj.status === "active"
                    ? "bg-primary/20 text-primary border border-primary/30 animate-pulse"
                    : "bg-muted/20 text-muted-foreground border border-border/30"
                }`}
                title={obj.title}
              >
                {obj.status === "completed" ? (
                  <CheckCircle2 className="w-3 h-3" />
                ) : (
                  i + 1
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Threat Level Indicator */}
      <div className={`mt-2 px-3 py-2 rounded border flex items-center justify-between ${
        mission.threatLevel === "critical" ? "bg-red-500/10 border-red-500/30 text-red-500" :
        mission.threatLevel === "high" ? "bg-orange-500/10 border-orange-500/30 text-orange-500" :
        mission.threatLevel === "medium" ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-500" :
        "bg-green-500/10 border-green-500/30 text-green-500"
      }`}>
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          <span className="text-xs">THREAT LEVEL</span>
        </div>
        <span className="text-xs font-bold uppercase">{mission.threatLevel}</span>
      </div>
    </div>
  );
};

export default MissionOverlay;
