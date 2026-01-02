import { useState, useEffect } from "react";
import { X, Zap, Shield, Cpu, HardDrive, Wifi, Battery, ThermometerSun, Activity } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import ProgressBar from "./ProgressBar";

interface DiagnosticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "combat" | "stealth" | "power-save" | "diagnostics";
}

const DiagnosticsModal = ({ isOpen, onClose, mode }: DiagnosticsModalProps) => {
  const [diagnostics, setDiagnostics] = useState({
    arcReactor: 100,
    repulsors: 98,
    lifeSupportSystems: 100,
    flightSystems: 97,
    weaponsSystems: 95,
    shieldIntegrity: 100,
    neuralInterface: 99,
    communicationArray: 100,
    temperature: 42,
    powerOutput: 3200,
  });

  const [scanProgress, setScanProgress] = useState(0);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    if (isOpen && mode === "diagnostics") {
      setIsScanning(true);
      setScanProgress(0);
      const interval = setInterval(() => {
        setScanProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsScanning(false);
            return 100;
          }
          return prev + 2;
        });
      }, 50);
      return () => clearInterval(interval);
    }
  }, [isOpen, mode]);

  const getModeColor = () => {
    switch (mode) {
      case "combat": return "text-red-500";
      case "stealth": return "text-purple-500";
      case "power-save": return "text-green-500";
      default: return "text-primary";
    }
  };

  const getModeDescription = () => {
    switch (mode) {
      case "combat": return "All weapons systems active. Maximum power output.";
      case "stealth": return "Minimal emissions. Radar absorption active.";
      case "power-save": return "Non-essential systems offline. Extended operation mode.";
      default: return "Running full systems diagnostic scan...";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card/95 backdrop-blur-xl border-primary/30 max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-orbitron text-primary jarvis-glow flex items-center gap-2">
            <Zap className={`w-5 h-5 ${getModeColor()}`} />
            {mode.toUpperCase()} MODE - ARC REACTOR DIAGNOSTICS
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Mode Description */}
          <div className="p-3 bg-background/50 rounded border border-border/30">
            <p className={`text-sm ${getModeColor()}`}>{getModeDescription()}</p>
          </div>

          {/* Scanning Animation */}
          {isScanning && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary animate-pulse" />
                <span className="text-xs text-muted-foreground">Scanning systems...</span>
                <span className="text-xs text-primary ml-auto">{scanProgress}%</span>
              </div>
              <div className="h-1 bg-muted rounded overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-100"
                  style={{ width: `${scanProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Main Systems */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Zap className="w-3 h-3" /> Core Systems
              </h4>
              <ProgressBar value={diagnostics.arcReactor} label="Arc Reactor" />
              <ProgressBar value={diagnostics.repulsors} label="Repulsors" />
              <ProgressBar value={diagnostics.flightSystems} label="Flight Systems" />
              <ProgressBar value={diagnostics.weaponsSystems} label="Weapons" />
            </div>

            <div className="space-y-3">
              <h4 className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Shield className="w-3 h-3" /> Support Systems
              </h4>
              <ProgressBar value={diagnostics.lifeSupportSystems} label="Life Support" />
              <ProgressBar value={diagnostics.shieldIntegrity} label="Shield Integrity" />
              <ProgressBar value={diagnostics.neuralInterface} label="Neural Interface" />
              <ProgressBar value={diagnostics.communicationArray} label="Comms Array" />
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-2 pt-4 border-t border-border/30">
            <div className="text-center p-2 bg-background/30 rounded">
              <ThermometerSun className="w-4 h-4 text-yellow-500 mx-auto mb-1" />
              <p className="text-lg font-mono text-foreground">{diagnostics.temperature}°C</p>
              <p className="text-[10px] text-muted-foreground">CORE TEMP</p>
            </div>
            <div className="text-center p-2 bg-background/30 rounded">
              <Battery className="w-4 h-4 text-green-500 mx-auto mb-1" />
              <p className="text-lg font-mono text-foreground">{diagnostics.powerOutput}</p>
              <p className="text-[10px] text-muted-foreground">MW OUTPUT</p>
            </div>
            <div className="text-center p-2 bg-background/30 rounded">
              <Cpu className="w-4 h-4 text-primary mx-auto mb-1" />
              <p className="text-lg font-mono text-foreground">8</p>
              <p className="text-[10px] text-muted-foreground">AI CORES</p>
            </div>
            <div className="text-center p-2 bg-background/30 rounded">
              <Wifi className="w-4 h-4 text-primary mx-auto mb-1" />
              <p className="text-lg font-mono text-foreground">ACTIVE</p>
              <p className="text-[10px] text-muted-foreground">UPLINK</p>
            </div>
          </div>

          {/* Suit Status */}
          <div className="p-3 bg-background/50 rounded border border-green-500/30">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-500" />
              <span className="text-xs text-green-500">ALL SYSTEMS NOMINAL</span>
              <span className="text-[10px] text-muted-foreground ml-auto">MARK LXXXV READY</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DiagnosticsModal;
