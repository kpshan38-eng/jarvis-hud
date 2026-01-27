import { useState, useEffect, useCallback } from "react";
import { Target, Clock, MapPin, AlertTriangle, CheckCircle2, XCircle, Play, Pause, RotateCcw, ChevronRight } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Progress } from "@/components/ui/progress";

export interface MissionObjective {
  id: string;
  title: string;
  description: string;
  status: "pending" | "active" | "completed" | "failed";
  priority: "primary" | "secondary" | "optional";
  location?: { lat: number; lng: number; name: string };
}

export interface Mission {
  id: string;
  codename: string;
  title: string;
  description: string;
  threatLevel: "low" | "medium" | "high" | "critical";
  status: "briefing" | "active" | "completed" | "aborted";
  objectives: MissionObjective[];
  timeLimit?: number; // in seconds
  startTime?: Date;
}

interface MissionBriefingProps {
  isOpen: boolean;
  onClose: () => void;
  onMissionStart?: (mission: Mission) => void;
  onObjectiveUpdate?: (missionId: string, objectiveId: string, status: MissionObjective["status"]) => void;
}

const sampleMissions: Mission[] = [
  {
    id: "mission-001",
    codename: "OPERATION THUNDERSTRIKE",
    title: "Neutralize Energy Signature",
    description: "An unknown energy signature has been detected in Cairo. Investigate the source and neutralize any threats.",
    threatLevel: "high",
    status: "briefing",
    timeLimit: 3600,
    objectives: [
      { id: "obj-1", title: "Reach Cairo", description: "Navigate to the target location", status: "pending", priority: "primary", location: { lat: 45, lng: 55, name: "Cairo" } },
      { id: "obj-2", title: "Scan for Energy Source", description: "Use suit sensors to locate the energy signature origin", status: "pending", priority: "primary" },
      { id: "obj-3", title: "Neutralize Threat", description: "Eliminate or contain the threat source", status: "pending", priority: "primary" },
      { id: "obj-4", title: "Extract Civilians", description: "Ensure civilian safety in the area", status: "pending", priority: "secondary" },
      { id: "obj-5", title: "Collect Data Sample", description: "Retrieve energy readings for analysis", status: "pending", priority: "optional" },
    ],
  },
  {
    id: "mission-002",
    codename: "GHOST PROTOCOL",
    title: "Cyber Security Breach",
    description: "Stark Industries servers are under attack from an unknown source traced to Moscow. Trace and shut down the intrusion.",
    threatLevel: "medium",
    status: "briefing",
    timeLimit: 1800,
    objectives: [
      { id: "obj-1", title: "Trace Attack Origin", description: "Identify the source of the cyber attack", status: "pending", priority: "primary", location: { lat: 25, lng: 68, name: "Moscow" } },
      { id: "obj-2", title: "Deploy Countermeasures", description: "Activate JARVIS firewall protocols", status: "pending", priority: "primary" },
      { id: "obj-3", title: "Secure Data Vaults", description: "Ensure no data has been compromised", status: "pending", priority: "secondary" },
    ],
  },
  {
    id: "mission-003",
    codename: "SILENT GUARDIAN",
    title: "Surveillance Drone Detection",
    description: "Unauthorized drones detected near Seoul. Investigate and determine their origin and purpose.",
    threatLevel: "low",
    status: "briefing",
    objectives: [
      { id: "obj-1", title: "Intercept Drone", description: "Capture one drone for analysis", status: "pending", priority: "primary", location: { lat: 30, lng: 82, name: "Seoul" } },
      { id: "obj-2", title: "Analyze Technology", description: "Determine drone manufacturer and capabilities", status: "pending", priority: "primary" },
      { id: "obj-3", title: "Track Control Signal", description: "Locate the operator", status: "pending", priority: "secondary" },
    ],
  },
];

const MissionBriefing = ({ isOpen, onClose, onMissionStart, onObjectiveUpdate }: MissionBriefingProps) => {
  const [missions, setMissions] = useState<Mission[]>(sampleMissions);
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [activeMission, setActiveMission] = useState<Mission | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isPaused, setIsPaused] = useState(false);

  // Countdown timer
  useEffect(() => {
    if (!activeMission || isPaused || !activeMission.timeLimit) return;

    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 0) {
          // Time's up - mission failed
          handleMissionEnd("aborted");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeMission, isPaused]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const getThreatColor = (level: Mission["threatLevel"]) => {
    switch (level) {
      case "critical": return "text-red-500 bg-red-500/20 border-red-500/50";
      case "high": return "text-orange-500 bg-orange-500/20 border-orange-500/50";
      case "medium": return "text-yellow-500 bg-yellow-500/20 border-yellow-500/50";
      case "low": return "text-green-500 bg-green-500/20 border-green-500/50";
    }
  };

  const getStatusIcon = (status: MissionObjective["status"]) => {
    switch (status) {
      case "completed": return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case "failed": return <XCircle className="w-4 h-4 text-red-500" />;
      case "active": return <div className="w-4 h-4 rounded-full bg-primary animate-pulse" />;
      default: return <div className="w-4 h-4 rounded-full border border-muted-foreground/50" />;
    }
  };

  const handleStartMission = useCallback((mission: Mission) => {
    const startedMission = {
      ...mission,
      status: "active" as const,
      startTime: new Date(),
      objectives: mission.objectives.map((obj, i) => ({
        ...obj,
        status: i === 0 ? "active" as const : "pending" as const,
      })),
    };
    
    setActiveMission(startedMission);
    setTimeRemaining(mission.timeLimit || 0);
    setMissions(prev => prev.map(m => m.id === mission.id ? startedMission : m));
    onMissionStart?.(startedMission);
  }, [onMissionStart]);

  const handleMissionEnd = useCallback((status: "completed" | "aborted") => {
    if (!activeMission) return;
    
    const endedMission = { ...activeMission, status };
    setMissions(prev => prev.map(m => m.id === activeMission.id ? endedMission : m));
    setActiveMission(null);
    setTimeRemaining(0);
  }, [activeMission]);

  const handleObjectiveToggle = useCallback((objectiveId: string) => {
    if (!activeMission) return;

    setActiveMission(prev => {
      if (!prev) return null;
      
      const updatedObjectives = prev.objectives.map(obj => {
        if (obj.id === objectiveId) {
          const newStatus = obj.status === "completed" ? "active" : "completed";
          onObjectiveUpdate?.(prev.id, objectiveId, newStatus);
          return { ...obj, status: newStatus as MissionObjective["status"] };
        }
        return obj;
      });

      // Check if all primary objectives completed
      const allPrimaryComplete = updatedObjectives
        .filter(o => o.priority === "primary")
        .every(o => o.status === "completed");

      if (allPrimaryComplete) {
        setTimeout(() => handleMissionEnd("completed"), 1000);
      }

      return { ...prev, objectives: updatedObjectives };
    });
  }, [activeMission, onObjectiveUpdate, handleMissionEnd]);

  const completedObjectives = activeMission?.objectives.filter(o => o.status === "completed").length || 0;
  const totalObjectives = activeMission?.objectives.length || 0;
  const progressPercent = totalObjectives > 0 ? (completedObjectives / totalObjectives) * 100 : 0;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="bg-card/95 border-border backdrop-blur-md overflow-y-auto w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="text-primary jarvis-glow flex items-center gap-2">
            <Target className="w-5 h-5" />
            Mission Briefing
          </SheetTitle>
          <SheetDescription className="text-muted-foreground">
            {activeMission ? `Active: ${activeMission.codename}` : "Select a mission to begin"}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Active Mission Display */}
          {activeMission && (
            <div className="space-y-4 p-4 border border-primary/30 rounded-lg bg-primary/5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{activeMission.codename}</p>
                  <h3 className="text-sm font-semibold text-primary">{activeMission.title}</h3>
                </div>
                <span className={`px-2 py-1 text-[10px] rounded border ${getThreatColor(activeMission.threatLevel)}`}>
                  {activeMission.threatLevel.toUpperCase()}
                </span>
              </div>

              {/* Timer */}
              {activeMission.timeLimit && (
                <div className="flex items-center justify-between p-3 bg-background/50 rounded border border-border/50">
                  <div className="flex items-center gap-2">
                    <Clock className={`w-4 h-4 ${timeRemaining < 300 ? "text-red-500 animate-pulse" : "text-primary"}`} />
                    <span className={`font-mono text-lg ${timeRemaining < 300 ? "text-red-500" : "text-primary"}`}>
                      {formatTime(timeRemaining)}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsPaused(p => !p)}
                      className="p-1 border border-border rounded hover:bg-muted/20"
                    >
                      {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => handleMissionEnd("aborted")}
                      className="p-1 border border-destructive/50 rounded hover:bg-destructive/20 text-destructive"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Mission Progress</span>
                  <span className="text-primary">{completedObjectives}/{totalObjectives}</span>
                </div>
                <Progress value={progressPercent} className="h-2" />
              </div>

              {/* Objectives */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-primary">Objectives</h4>
                {activeMission.objectives.map(obj => (
                  <button
                    key={obj.id}
                    onClick={() => handleObjectiveToggle(obj.id)}
                    className={`w-full text-left p-2 rounded border transition-all ${
                      obj.status === "completed" 
                        ? "bg-green-500/10 border-green-500/30" 
                        : obj.status === "active"
                        ? "bg-primary/10 border-primary/30"
                        : "bg-background/30 border-border/30 hover:border-primary/30"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {getStatusIcon(obj.status)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs ${obj.status === "completed" ? "line-through text-muted-foreground" : ""}`}>
                            {obj.title}
                          </span>
                          <span className={`text-[8px] px-1 rounded ${
                            obj.priority === "primary" ? "bg-primary/20 text-primary" :
                            obj.priority === "secondary" ? "bg-yellow-500/20 text-yellow-500" :
                            "bg-muted/20 text-muted-foreground"
                          }`}>
                            {obj.priority}
                          </span>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{obj.description}</p>
                        {obj.location && (
                          <div className="flex items-center gap-1 mt-1 text-[10px] text-primary/60">
                            <MapPin className="w-3 h-3" />
                            <span>{obj.location.name}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Available Missions */}
          {!activeMission && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-primary flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Available Missions
              </h3>
              
              {missions.filter(m => m.status === "briefing").map(mission => (
                <div
                  key={mission.id}
                  className={`p-3 rounded border transition-all cursor-pointer ${
                    selectedMission?.id === mission.id
                      ? "bg-primary/10 border-primary/50"
                      : "bg-background/30 border-border/30 hover:border-primary/30"
                  }`}
                  onClick={() => setSelectedMission(selectedMission?.id === mission.id ? null : mission)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-muted-foreground">{mission.codename}</p>
                      <h4 className="text-sm font-medium">{mission.title}</h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 text-[8px] rounded border ${getThreatColor(mission.threatLevel)}`}>
                        {mission.threatLevel.toUpperCase()}
                      </span>
                      <ChevronRight className={`w-4 h-4 transition-transform ${selectedMission?.id === mission.id ? "rotate-90" : ""}`} />
                    </div>
                  </div>

                  {selectedMission?.id === mission.id && (
                    <div className="mt-3 pt-3 border-t border-border/30 space-y-3">
                      <p className="text-xs text-muted-foreground">{mission.description}</p>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Target className="w-3 h-3" />
                          <span>{mission.objectives.length} objectives</span>
                        </div>
                        {mission.timeLimit && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{formatTime(mission.timeLimit)}</span>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartMission(mission);
                        }}
                        className="w-full py-2 bg-primary/20 border border-primary rounded text-primary text-sm hover:bg-primary/30 transition-colors flex items-center justify-center gap-2"
                      >
                        <Play className="w-4 h-4" />
                        Start Mission
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Completed Missions */}
          {missions.filter(m => m.status === "completed" || m.status === "aborted").length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground">Mission History</h3>
              {missions.filter(m => m.status === "completed" || m.status === "aborted").map(mission => (
                <div
                  key={mission.id}
                  className="p-3 rounded border border-border/30 bg-background/20"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-muted-foreground">{mission.codename}</p>
                      <h4 className="text-sm">{mission.title}</h4>
                    </div>
                    <span className={`px-2 py-0.5 text-[8px] rounded ${
                      mission.status === "completed" ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"
                    }`}>
                      {mission.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MissionBriefing;
