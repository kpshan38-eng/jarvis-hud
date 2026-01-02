import { useState, useEffect } from "react";
import { AlertTriangle, Shield, MapPin } from "lucide-react";
import InfoPanel from "./InfoPanel";

interface ThreatMarker {
  id: string;
  name: string;
  lat: number;
  lng: number;
  level: "low" | "medium" | "high";
  type: string;
}

const WorldMap = ({ delay = 0 }: { delay?: number }) => {
  const [threats, setThreats] = useState<ThreatMarker[]>([
    { id: "1", name: "Moscow", lat: 25, lng: 68, level: "medium", type: "Cyber Activity" },
    { id: "2", name: "Seoul", lat: 30, lng: 82, level: "low", type: "Drone Surveillance" },
    { id: "3", name: "Cairo", lat: 45, lng: 55, level: "high", type: "Energy Signature" },
    { id: "4", name: "New York", lat: 35, lng: 22, level: "low", type: "Seismic Activity" },
  ]);
  
  const [activeMarker, setActiveMarker] = useState<string | null>(null);

  useEffect(() => {
    // Simulate threat level changes
    const interval = setInterval(() => {
      setThreats(prev => prev.map(t => ({
        ...t,
        level: Math.random() > 0.8 
          ? (["low", "medium", "high"] as const)[Math.floor(Math.random() * 3)]
          : t.level
      })));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const getLevelColor = (level: string) => {
    switch (level) {
      case "high": return "text-red-500 bg-red-500";
      case "medium": return "text-yellow-500 bg-yellow-500";
      default: return "text-green-500 bg-green-500";
    }
  };

  return (
    <InfoPanel title="Global Threat Monitor" delay={delay}>
      <div className="relative w-full h-48 bg-background/50 rounded overflow-hidden border border-border/30">
        {/* Simple world map outline using SVG */}
        <svg 
          viewBox="0 0 100 50" 
          className="absolute inset-0 w-full h-full opacity-30"
          preserveAspectRatio="xMidYMid slice"
        >
          {/* Simplified continent outlines */}
          <ellipse cx="25" cy="20" rx="15" ry="10" fill="none" stroke="hsl(var(--primary))" strokeWidth="0.3" />
          <ellipse cx="25" cy="35" rx="8" ry="8" fill="none" stroke="hsl(var(--primary))" strokeWidth="0.3" />
          <ellipse cx="55" cy="22" rx="20" ry="12" fill="none" stroke="hsl(var(--primary))" strokeWidth="0.3" />
          <ellipse cx="55" cy="38" rx="10" ry="6" fill="none" stroke="hsl(var(--primary))" strokeWidth="0.3" />
          <ellipse cx="82" cy="35" rx="8" ry="6" fill="none" stroke="hsl(var(--primary))" strokeWidth="0.3" />
          
          {/* Grid lines */}
          {[...Array(5)].map((_, i) => (
            <line key={`h${i}`} x1="0" y1={i * 12.5} x2="100" y2={i * 12.5} stroke="hsl(var(--primary))" strokeWidth="0.1" opacity="0.3" />
          ))}
          {[...Array(8)].map((_, i) => (
            <line key={`v${i}`} x1={i * 12.5} y1="0" x2={i * 12.5} y2="50" stroke="hsl(var(--primary))" strokeWidth="0.1" opacity="0.3" />
          ))}
        </svg>

        {/* Threat markers */}
        {threats.map((threat) => (
          <div
            key={threat.id}
            className="absolute cursor-pointer group"
            style={{ left: `${threat.lng}%`, top: `${threat.lat}%` }}
            onMouseEnter={() => setActiveMarker(threat.id)}
            onMouseLeave={() => setActiveMarker(null)}
          >
            <div className={`w-3 h-3 rounded-full ${getLevelColor(threat.level).split(" ")[1]} animate-pulse`} />
            <div className={`absolute w-6 h-6 -top-1.5 -left-1.5 rounded-full ${getLevelColor(threat.level).split(" ")[1]}/20 animate-ping`} />
            
            {/* Tooltip */}
            {activeMarker === threat.id && (
              <div className="absolute z-10 left-4 top-0 bg-card/95 border border-border p-2 rounded text-xs whitespace-nowrap">
                <p className={`font-bold ${getLevelColor(threat.level).split(" ")[0]}`}>{threat.name}</p>
                <p className="text-muted-foreground">{threat.type}</p>
                <p className="text-muted-foreground/60">Level: {threat.level.toUpperCase()}</p>
              </div>
            )}
          </div>
        ))}

        {/* Home marker */}
        <div className="absolute" style={{ left: "72%", top: "42%" }}>
          <MapPin className="w-4 h-4 text-primary" />
          <span className="absolute left-5 top-0 text-[10px] text-primary/80 whitespace-nowrap">Malappuram</span>
        </div>

        {/* Scanning line animation */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div 
            className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"
            style={{ animation: "scan 4s linear infinite" }}
          />
        </div>
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between mt-3 text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Shield className="w-3 h-3 text-green-500" />
            <span className="text-green-500/80">{threats.filter(t => t.level === "low").length} Low</span>
          </div>
          <div className="flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-yellow-500" />
            <span className="text-yellow-500/80">{threats.filter(t => t.level === "medium").length} Med</span>
          </div>
          <div className="flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-red-500" />
            <span className="text-red-500/80">{threats.filter(t => t.level === "high").length} High</span>
          </div>
        </div>
        <span className="text-muted-foreground/60">SCANNING ACTIVE</span>
      </div>
      
      <style>{`
        @keyframes scan {
          0% { transform: translateY(-100px); }
          100% { transform: translateY(200px); }
        }
      `}</style>
    </InfoPanel>
  );
};

export default WorldMap;
