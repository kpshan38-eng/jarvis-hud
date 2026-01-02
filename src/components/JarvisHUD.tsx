import { useState, useEffect } from "react";
import { Cpu, Wifi, Brain, Battery, HardDrive, Activity, Globe, Shield, Zap, Clock, MapPin } from "lucide-react";
import ArcReactor from "./ArcReactor";
import InfoPanel from "./InfoPanel";
import StatLine from "./StatLine";
import ProgressBar from "./ProgressBar";
import CommandConsole from "./CommandConsole";
import WorldMap from "./WorldMap";
import StockTicker from "./StockTicker";
import CalendarWidget from "./CalendarWidget";
import DiagnosticsModal from "./DiagnosticsModal";
import WeatherPanel from "./WeatherPanel";
import SuitSelector, { suits, SuitTheme } from "./SuitSelector";

type DiagnosticsMode = "combat" | "stealth" | "power-save" | "diagnostics";

const JarvisHUD = () => {
  const [systemStats, setSystemStats] = useState({
    cpu: 45,
    ram: 62,
    battery: 87,
    processes: 142,
  });

  const [time, setTime] = useState(new Date());
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [diagnosticsMode, setDiagnosticsMode] = useState<DiagnosticsMode>("diagnostics");
  const [currentSuit, setCurrentSuit] = useState<SuitTheme>(suits[0]);

  useEffect(() => {
    const interval = setInterval(() => {
      setSystemStats(prev => ({
        cpu: Math.max(20, Math.min(80, prev.cpu + (Math.random() - 0.5) * 10)),
        ram: Math.max(40, Math.min(85, prev.ram + (Math.random() - 0.5) * 5)),
        battery: Math.max(0, prev.battery - 0.01),
        processes: Math.floor(prev.processes + (Math.random() - 0.5) * 4),
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Apply suit theme to CSS variables
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--primary', currentSuit.colors.primary);
    root.style.setProperty('--secondary', currentSuit.colors.secondary);
    root.style.setProperty('--accent', currentSuit.colors.accent);
    root.style.setProperty('--jarvis-glow', currentSuit.colors.glow);
  }, [currentSuit]);

  const handleArcReactorClick = () => {
    setDiagnosticsMode("diagnostics");
    setShowDiagnostics(true);
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8 overflow-hidden relative">
      {/* Scanline overlay */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden opacity-[0.03]">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary to-transparent animate-scanline" style={{ height: '200%' }} />
      </div>

      {/* Grid background */}
      <div className="fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}
      />

      {/* Header */}
      <header className="relative z-10 flex justify-between items-center mb-6 md:mb-8 animate-fade-in-up">
        <div>
          <h1 className="font-orbitron text-xl md:text-2xl lg:text-3xl text-primary jarvis-glow tracking-widest">J.A.R.V.I.S.</h1>
          <p className="text-xs text-muted-foreground tracking-wider mt-1">JUST A RATHER VERY INTELLIGENT SYSTEM</p>
        </div>
        <div className="text-right">
          <p className="font-mono text-lg md:text-xl text-primary jarvis-glow">
            {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
          </p>
          <p className="text-xs text-muted-foreground">
            {time.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </header>

      {/* Main content */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Left panels */}
        <div className="space-y-4 md:space-y-6">
          <InfoPanel title="System Status" delay={200}>
            <div className="flex items-center gap-2 mb-3">
              <Cpu className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">Core Processing</span>
            </div>
            <ProgressBar value={systemStats.cpu} label="CPU Usage" />
            <ProgressBar value={systemStats.ram} label="Memory" />
            <div className="pt-2 space-y-1.5">
              <StatLine label="Active Processes" value={systemStats.processes} highlight />
              <StatLine label="Uptime" value="14h 32m" />
            </div>
          </InfoPanel>

          <WeatherPanel delay={400} />
          <CalendarWidget delay={600} />
        </div>

        {/* Center - Arc Reactor */}
        <div className="flex flex-col items-center justify-center py-8 lg:py-0">
          <ArcReactor onClick={handleArcReactorClick} suit={currentSuit} />
          
          <div className="flex gap-6 mt-12">
            <div className="flex items-center gap-2">
              <Battery className="w-4 h-4 text-primary" />
              <span className="text-xs font-mono text-primary">{systemStats.battery.toFixed(0)}%</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-500" />
              <span className="text-xs font-mono text-yellow-500/80">OPTIMAL</span>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-green-500" />
              <span className="text-xs font-mono text-green-500/80">STABLE</span>
            </div>
          </div>

          <div className="flex gap-2 mt-6">
            {(["combat", "stealth", "power-save"] as DiagnosticsMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => { setDiagnosticsMode(mode); setShowDiagnostics(true); }}
                className={`px-3 py-1 text-[10px] font-mono uppercase border rounded transition-all hover:scale-105 ${
                  mode === "combat" ? "border-red-500/50 text-red-500/80 hover:bg-red-500/10"
                    : mode === "stealth" ? "border-purple-500/50 text-purple-500/80 hover:bg-purple-500/10"
                    : "border-green-500/50 text-green-500/80 hover:bg-green-500/10"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        {/* Right panels */}
        <div className="space-y-4 md:space-y-6">
          <SuitSelector currentSuit={currentSuit} onSuitChange={setCurrentSuit} delay={300} />
          <StockTicker delay={500} />
        </div>
      </div>

      {/* World Map */}
      <div className="relative z-10 mt-6 md:mt-8">
        <WorldMap delay={800} />
      </div>

      {/* Command Console */}
      <div className="relative z-10 mt-6 md:mt-8 max-w-4xl mx-auto">
        <CommandConsole delay={900} />
      </div>

      <footer className="relative z-10 mt-6 text-center">
        <p className="text-xs text-muted-foreground/50 tracking-wider">
          STARK INDUSTRIES © {new Date().getFullYear()} | {currentSuit.name.toUpperCase()} ACTIVE
        </p>
      </footer>

      <DiagnosticsModal isOpen={showDiagnostics} onClose={() => setShowDiagnostics(false)} mode={diagnosticsMode} />
    </div>
  );
};

export default JarvisHUD;
