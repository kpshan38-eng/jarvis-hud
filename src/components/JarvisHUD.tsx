import { useState, useEffect, useRef, useCallback } from "react";
import { Cpu, Wifi, Brain, Battery, HardDrive, Activity, Globe, Shield, Zap, Clock, MapPin, Settings, Maximize2, Minimize2, Palette, Mic, MicOff } from "lucide-react";
import ArcReactor from "./ArcReactor";
import InfoPanel from "./InfoPanel";
import StatLine from "./StatLine";
import ProgressBar from "./ProgressBar";
import CommandConsole from "./CommandConsole";
import WorldMap, { ThreatMarker } from "./WorldMap";
import StockTicker from "./StockTicker";
import CalendarWidget from "./CalendarWidget";
import DiagnosticsModal from "./DiagnosticsModal";
import WeatherPanel from "./WeatherPanel";
import SuitSelector, { suits, SuitTheme } from "./SuitSelector";
import SettingsPanel, { UserSettings, defaultSettings } from "./SettingsPanel";
import ThreatNotification, { ThreatAlert } from "./ThreatNotification";
import ThemeCustomizer from "./ThemeCustomizer";
import SuitTransitionOverlay from "./SuitTransitionOverlay";
import MinimalHUD from "./MinimalHUD";
import useKeyboardShortcuts from "@/hooks/useKeyboardShortcuts";
import { useUserSettings } from "@/hooks/useUserSettings";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { useFullscreen } from "@/hooks/useFullscreen";
import { useVoiceAnnouncer } from "@/hooks/useVoiceAnnouncer";
import { useSuitTransition } from "@/hooks/useSuitTransition";
import { useVoiceCommands } from "@/hooks/useVoiceCommands";

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
  const [showSettings, setShowSettings] = useState(false);
  const [threatAlerts, setThreatAlerts] = useState<ThreatAlert[]>([]);
  const [voiceActive, setVoiceActive] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showThemeCustomizer, setShowThemeCustomizer] = useState(false);
  const [hasAnnounced, setHasAnnounced] = useState(false);
  const [minimalMode, setMinimalMode] = useState(false);
  const [voiceCommandsEnabled, setVoiceCommandsEnabled] = useState(false);
  const consoleRef = useRef<HTMLDivElement>(null);

  // Persistent settings
  const { settings, updateSettings, isLoading: settingsLoading } = useUserSettings();
  
  // Sound effects
  const { playSound } = useSoundEffects(settings.soundEffectsEnabled ?? true);
  
  // Fullscreen mode
  const { isFullscreen, toggleFullscreen } = useFullscreen();

  // Voice announcer for TTS
  const { announceThreat, announceSystemStart, announceModeChange } = useVoiceAnnouncer({
    enabled: settings.voiceEnabled ?? true,
    speechRate: settings.speechRate ?? 1,
  });

  // Suit transition effects
  const { isTransitioning, progress, phase, startTransition, fromSuit, toSuit } = useSuitTransition(1200);

  // Handle suit change with transition
  const handleSuitChange = useCallback((newSuit: SuitTheme) => {
    if (newSuit.id !== currentSuit.id) {
      startTransition(currentSuit, newSuit);
      playSound("mode-switch");
      setTimeout(() => setCurrentSuit(newSuit), 600);
    }
  }, [currentSuit, startTransition, playSound]);

  // Voice commands
  const { isListening: voiceListening } = useVoiceCommands({
    enabled: voiceCommandsEnabled,
    onModeChange: (mode) => handleModeSwitch(mode),
    onToggleDiagnostics: () => setShowDiagnostics(true),
    onToggleFullscreen: toggleFullscreen,
    onToggleMinimalMode: () => setMinimalMode(prev => !prev),
    onToggleSettings: () => setShowSettings(true),
    onSuitChange: (suitId) => {
      const suit = suits.find(s => s.id === suitId);
      if (suit) handleSuitChange(suit);
    },
  });

  // Announce system start once
  useEffect(() => {
    if (!hasAnnounced && settings.voiceEnabled) {
      const timer = setTimeout(() => {
        announceSystemStart();
        setHasAnnounced(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [hasAnnounced, settings.voiceEnabled, announceSystemStart]);

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

  // Apply suit theme to CSS variables (with transition interpolation)
  useEffect(() => {
    const root = document.documentElement;
    if (isTransitioning && fromSuit && toSuit) {
      // During transition, colors are applied via the transition overlay
      return;
    }
    root.style.setProperty('--primary', currentSuit.colors.primary);
    root.style.setProperty('--secondary', currentSuit.colors.secondary);
    root.style.setProperty('--accent', currentSuit.colors.accent);
    root.style.setProperty('--jarvis-glow', currentSuit.colors.glow);
  }, [currentSuit, isTransitioning, fromSuit, toSuit]);

  const handleArcReactorClick = () => {
    setDiagnosticsMode("diagnostics");
    setShowDiagnostics(true);
  };

  const handleThreatChange = useCallback((threat: ThreatMarker, previousLevel: "low" | "medium" | "high") => {
    const newAlert: ThreatAlert = {
      id: `${threat.id}-${Date.now()}`,
      name: threat.name,
      type: threat.type,
      level: threat.level,
      timestamp: new Date(),
    };
    setThreatAlerts(prev => [newAlert, ...prev].slice(0, 10));
    playSound("threat");
    // Voice announce the threat
    announceThreat(newAlert);
  }, [playSound, announceThreat]);

  const handleModeSwitch = useCallback((mode: DiagnosticsMode) => {
    setDiagnosticsMode(mode);
    setShowDiagnostics(true);
    playSound("mode-switch");
    announceModeChange(mode);
  }, [playSound, announceModeChange]);

  const handleApplyCustomTheme = useCallback((theme: SuitTheme) => {
    setCurrentSuit(theme);
    playSound("toggle");
  }, [playSound]);

  const dismissAlert = (id: string) => {
    setThreatAlerts(prev => prev.filter(a => a.id !== id));
  };

  const dismissAllAlerts = () => {
    setThreatAlerts([]);
  };

  // Keyboard shortcuts
  useKeyboardShortcuts({
    toggleVoice: () => {
      setVoiceActive(prev => !prev);
      playSound("toggle");
    },
    openDiagnostics: () => {
      setShowDiagnostics(true);
      playSound("click");
    },
    toggleSettings: () => {
      setShowSettings(prev => !prev);
      playSound("click");
    },
    switchMode: (mode) => {
      handleModeSwitch(mode as DiagnosticsMode);
    },
    focusConsole: () => {
      const input = consoleRef.current?.querySelector('input');
      input?.focus();
      playSound("click");
    },
    toggleHistory: () => {
      setShowHistory(prev => !prev);
      playSound("toggle");
    },
    toggleFullscreen: () => {
      toggleFullscreen();
      playSound("mode-switch");
    },
  });

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8 overflow-hidden relative">
      {/* Suit Transition Overlay */}
      <SuitTransitionOverlay
        isTransitioning={isTransitioning}
        progress={progress}
        phase={phase}
        fromGlow={fromSuit?.colors.glow}
        toGlow={toSuit?.colors.glow}
      />

      {/* Minimal HUD Mode */}
      <MinimalHUD
        isActive={minimalMode}
        onToggle={() => setMinimalMode(false)}
        onExitFullscreen={toggleFullscreen}
        isFullscreen={isFullscreen}
        currentSuit={currentSuit}
        systemStats={systemStats}
        isVoiceListening={voiceListening}
        onVoiceToggle={() => setVoiceCommandsEnabled(prev => !prev)}
        time={time}
      />

      {/* Threat Notifications */}
      <ThreatNotification
        alerts={threatAlerts} 
        onDismiss={dismissAlert} 
        onDismissAll={dismissAllAlerts} 
      />

      {/* Settings & Fullscreen Buttons */}
      <div className="fixed top-4 right-4 z-40 flex gap-2">
        <button
          onClick={() => {
            setVoiceCommandsEnabled(prev => !prev);
            playSound("toggle");
          }}
          className={`p-2 border rounded transition-colors ${
            voiceCommandsEnabled 
              ? "bg-primary/20 border-primary text-primary animate-pulse" 
              : "bg-card/80 border-border hover:bg-card text-muted-foreground"
          }`}
          title={voiceCommandsEnabled ? "Voice commands active" : "Enable voice commands (say 'activate combat mode', etc.)"}
        >
          {voiceCommandsEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
        </button>
        <button
          onClick={() => {
            setMinimalMode(true);
            playSound("mode-switch");
          }}
          className="p-2 bg-card/80 border border-border rounded hover:bg-card transition-colors"
          title="Minimal HUD Mode (M)"
        >
          <Globe className="w-5 h-5 text-primary" />
        </button>
        <button
          onClick={() => {
            setShowThemeCustomizer(true);
            playSound("click");
          }}
          className="p-2 bg-card/80 border border-border rounded hover:bg-card transition-colors"
          title="Theme Customizer"
        >
          <Palette className="w-5 h-5 text-primary" />
        </button>
        <button
          onClick={() => {
            toggleFullscreen();
            playSound("mode-switch");
          }}
          className="p-2 bg-card/80 border border-border rounded hover:bg-card transition-colors"
          title={isFullscreen ? "Exit Fullscreen (F)" : "Fullscreen (F)"}
        >
          {isFullscreen ? (
            <Minimize2 className="w-5 h-5 text-primary" />
          ) : (
            <Maximize2 className="w-5 h-5 text-primary" />
          )}
        </button>
        <button
          onClick={() => {
            setShowSettings(true);
            playSound("click");
          }}
          className="p-2 bg-card/80 border border-border rounded hover:bg-card transition-colors"
          title="Settings (Shift+S)"
        >
          <Settings className="w-5 h-5 text-primary" />
        </button>
      </div>

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

          {settings.showWeather && <WeatherPanel delay={400} />}
          {settings.showCalendar && <CalendarWidget delay={600} />}
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
                onClick={() => handleModeSwitch(mode)}
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
          <SuitSelector currentSuit={currentSuit} onSuitChange={handleSuitChange} delay={300} />
          {settings.showStocks && <StockTicker delay={500} />}
        </div>
      </div>

      {/* World Map */}
      {settings.showWorldMap && (
        <div className="relative z-10 mt-6 md:mt-8">
          <WorldMap delay={800} onThreatChange={handleThreatChange} />
        </div>
      )}

      {/* Command Console */}
      <div ref={consoleRef} className="relative z-10 mt-6 md:mt-8 max-w-4xl mx-auto">
        <CommandConsole delay={900} />
      </div>

      <footer className="relative z-10 mt-6 text-center">
        <p className="text-xs text-muted-foreground/50 tracking-wider">
          STARK INDUSTRIES © {new Date().getFullYear()} | {currentSuit.name.toUpperCase()} ACTIVE
        </p>
      </footer>

      <DiagnosticsModal isOpen={showDiagnostics} onClose={() => setShowDiagnostics(false)} mode={diagnosticsMode} />
      <SettingsPanel 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
        settings={settings}
        onSettingsChange={updateSettings}
      />
      <ThemeCustomizer
        isOpen={showThemeCustomizer}
        onClose={() => setShowThemeCustomizer(false)}
        onApplyTheme={handleApplyCustomTheme}
        currentTheme={currentSuit}
      />
    </div>
  );
};

export default JarvisHUD;
