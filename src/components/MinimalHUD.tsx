import { useState, useEffect } from "react";
import { Battery, Zap, Activity, Maximize2, Minimize2, Eye, EyeOff, Mic, MicOff } from "lucide-react";
import ArcReactor from "./ArcReactor";
import { SuitTheme } from "./SuitSelector";

interface MinimalHUDProps {
  isActive: boolean;
  onToggle: () => void;
  onExitFullscreen?: () => void;
  isFullscreen?: boolean;
  currentSuit: SuitTheme;
  systemStats: {
    cpu: number;
    ram: number;
    battery: number;
    processes: number;
  };
  isVoiceListening?: boolean;
  onVoiceToggle?: () => void;
  time: Date;
}

const MinimalHUD = ({
  isActive,
  onToggle,
  onExitFullscreen,
  isFullscreen,
  currentSuit,
  systemStats,
  isVoiceListening = false,
  onVoiceToggle,
  time,
}: MinimalHUDProps) => {
  const [showStats, setShowStats] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isActive) {
      setTimeout(() => setIsVisible(true), 100);
    } else {
      setIsVisible(false);
    }
  }, [isActive]);

  if (!isActive) return null;

  return (
    <div
      className={`fixed inset-0 z-40 transition-opacity duration-500 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      style={{ background: "rgba(0, 0, 0, 0.85)" }}
    >
      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)`,
          backgroundSize: "100px 100px",
        }}
      />

      {/* Top bar - minimal info */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start">
        {/* Time display */}
        <div className="font-orbitron">
          <p className="text-2xl md:text-4xl text-primary jarvis-glow tracking-wider">
            {time.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            })}
          </p>
          <p className="text-[10px] text-muted-foreground/60 uppercase tracking-[0.2em]">
            {time.toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
            })}
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          {onVoiceToggle && (
            <button
              onClick={onVoiceToggle}
              className={`p-2 rounded-full border transition-all ${
                isVoiceListening
                  ? "border-primary bg-primary/20 text-primary animate-pulse"
                  : "border-muted-foreground/30 text-muted-foreground hover:border-primary hover:text-primary"
              }`}
              title={isVoiceListening ? "Voice commands active" : "Activate voice commands"}
            >
              {isVoiceListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            </button>
          )}
          <button
            onClick={() => setShowStats(!showStats)}
            className="p-2 rounded-full border border-muted-foreground/30 text-muted-foreground hover:border-primary hover:text-primary transition-all"
            title="Toggle stats"
          >
            {showStats ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
          {isFullscreen && onExitFullscreen && (
            <button
              onClick={onExitFullscreen}
              className="p-2 rounded-full border border-muted-foreground/30 text-muted-foreground hover:border-primary hover:text-primary transition-all"
              title="Exit fullscreen"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onToggle}
            className="p-2 rounded-full border border-primary/50 text-primary hover:bg-primary/10 transition-all"
            title="Exit minimal mode"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Center - Arc Reactor */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="transform scale-75 md:scale-100">
          <ArcReactor suit={currentSuit} />
        </div>
      </div>

      {/* Stats overlay - appears on hover or toggle */}
      <div
        className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-300 ${
          showStats ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* Circular stats around reactor */}
        <div className="relative w-[400px] h-[400px] md:w-[500px] md:h-[500px]">
          {/* CPU */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-8 text-center">
            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">CPU</div>
            <div className="font-mono text-lg text-primary jarvis-glow">{systemStats.cpu.toFixed(0)}%</div>
          </div>

          {/* Memory */}
          <div className="absolute top-1/2 right-0 translate-x-8 -translate-y-1/2 text-center">
            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">MEM</div>
            <div className="font-mono text-lg text-primary jarvis-glow">{systemStats.ram.toFixed(0)}%</div>
          </div>

          {/* Battery */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-8 text-center">
            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">PWR</div>
            <div className="font-mono text-lg text-primary jarvis-glow">{systemStats.battery.toFixed(0)}%</div>
          </div>

          {/* Processes */}
          <div className="absolute top-1/2 left-0 -translate-x-8 -translate-y-1/2 text-center">
            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">PROC</div>
            <div className="font-mono text-lg text-primary jarvis-glow">{systemStats.processes}</div>
          </div>
        </div>
      </div>

      {/* Bottom bar - suit info & status */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <div className="flex justify-between items-end">
          {/* Suit name */}
          <div>
            <p className="text-[10px] text-muted-foreground/60 uppercase tracking-[0.15em]">Active Armor</p>
            <p className="font-orbitron text-sm text-primary jarvis-glow">{currentSuit.name}</p>
          </div>

          {/* Status indicators */}
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <Battery className="w-3 h-3 text-primary" />
              <span className="font-mono text-primary/80">{systemStats.battery.toFixed(0)}%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="w-3 h-3 text-yellow-500" />
              <span className="font-mono text-yellow-500/80">OPT</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Activity className="w-3 h-3 text-green-500" />
              <span className="font-mono text-green-500/80">STB</span>
            </div>
          </div>
        </div>

        {/* Voice command hint */}
        {isVoiceListening && (
          <div className="absolute left-1/2 -translate-x-1/2 bottom-16 animate-pulse">
            <p className="text-[10px] text-primary/60 uppercase tracking-[0.2em]">
              Voice commands active - say "exit minimal" to return
            </p>
          </div>
        )}
      </div>

      {/* Corner decorations */}
      <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-primary/30" />
      <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-primary/30" />
      <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-primary/30" />
      <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-primary/30" />
    </div>
  );
};

export default MinimalHUD;
