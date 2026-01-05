import { useEffect, useState, useMemo } from "react";

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("INITIALIZING SYSTEMS...");
  const [fadeOut, setFadeOut] = useState(false);
  const [glitchActive, setGlitchActive] = useState(false);
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; delay: number }[]>([]);
  const [hexCodes, setHexCodes] = useState<string[]>([]);

  const statuses = useMemo(() => [
    { progress: 10, text: "INITIALIZING CORE SYSTEMS...", subsystems: ["power_grid", "cpu_core", "memory_banks"] },
    { progress: 20, text: "LOADING ARC REACTOR...", subsystems: ["reactor_init", "plasma_flow", "containment"] },
    { progress: 35, text: "CALIBRATING SENSORS...", subsystems: ["optical", "thermal", "proximity"] },
    { progress: 50, text: "ESTABLISHING NETWORK...", subsystems: ["satellite_link", "encryption", "firewall"] },
    { progress: 65, text: "SYNCING AI CORE...", subsystems: ["neural_net", "voice_module", "learning_algo"] },
    { progress: 80, text: "LOADING INTERFACE...", subsystems: ["hud_render", "gesture_ctrl", "haptic_fb"] },
    { progress: 92, text: "RUNNING DIAGNOSTICS...", subsystems: ["sys_check", "integrity", "optimization"] },
    { progress: 100, text: "SYSTEMS ONLINE", subsystems: ["ready"] },
  ], []);

  // Generate random hex codes for effect
  useEffect(() => {
    const interval = setInterval(() => {
      setHexCodes(Array.from({ length: 6 }, () => 
        Math.random().toString(16).substring(2, 8).toUpperCase()
      ));
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // Generate particles
  useEffect(() => {
    setParticles(Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 2,
    })));
  }, []);

  // Glitch effect
  useEffect(() => {
    const glitchInterval = setInterval(() => {
      if (Math.random() > 0.7) {
        setGlitchActive(true);
        setTimeout(() => setGlitchActive(false), 100);
      }
    }, 500);
    return () => clearInterval(glitchInterval);
  }, []);

  useEffect(() => {
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < statuses.length) {
        setProgress(statuses[currentIndex].progress);
        setStatus(statuses[currentIndex].text);
        currentIndex++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setFadeOut(true);
          setTimeout(onComplete, 600);
        }, 400);
      }
    }, 350);

    return () => clearInterval(interval);
  }, [onComplete, statuses]);

  const currentSubsystems = useMemo(() => {
    const current = statuses.find(s => s.progress === Math.ceil(progress / 10) * 10 || s.progress <= progress);
    return statuses.find(s => s.progress >= progress)?.subsystems || [];
  }, [progress, statuses]);

  return (
    <div 
      className={`fixed inset-0 bg-background z-50 flex flex-col items-center justify-center transition-opacity duration-600 overflow-hidden ${
        fadeOut ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
      }`}
      style={{ transition: 'opacity 0.6s, transform 0.6s' }}
    >
      {/* Animated particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute w-1 h-1 bg-primary/40 rounded-full animate-pulse"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              animationDelay: `${p.delay}s`,
              boxShadow: '0 0 10px hsl(var(--primary))',
            }}
          />
        ))}
      </div>

      {/* Hex code rain effect */}
      <div className="absolute top-4 left-4 font-mono text-[8px] text-primary/20 space-y-1 opacity-60">
        {hexCodes.map((code, i) => (
          <div key={i} className="tracking-widest">0x{code}</div>
        ))}
      </div>
      <div className="absolute top-4 right-4 font-mono text-[8px] text-primary/20 space-y-1 opacity-60 text-right">
        {hexCodes.slice().reverse().map((code, i) => (
          <div key={i} className="tracking-widest">0x{code}</div>
        ))}
      </div>

      {/* Scanning lines */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute w-full h-[2px] bg-gradient-to-r from-transparent via-primary/50 to-transparent"
          style={{
            animation: 'scan-line 2s linear infinite',
            top: `${(progress % 100)}%`,
          }}
        />
      </div>

      {/* Animated rings with enhanced effects */}
      <div className={`relative w-48 h-48 mb-8 ${glitchActive ? 'translate-x-[2px]' : ''}`}>
        {/* Outer glow */}
        <div 
          className="absolute inset-[-20px] rounded-full opacity-30"
          style={{
            background: `radial-gradient(circle, hsl(var(--primary) / 0.3) 0%, transparent 70%)`,
            animation: 'pulse 2s ease-in-out infinite',
          }}
        />
        
        {/* Ring 1 - outermost */}
        <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-spin-slow">
          {/* Tick marks */}
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-[2px] h-3 bg-primary/50 left-1/2 -translate-x-1/2"
              style={{ transform: `rotate(${i * 30}deg) translateY(-94px)` }}
            />
          ))}
        </div>
        
        {/* Ring 2 */}
        <div className="absolute inset-4 rounded-full border border-primary/40 animate-spin-slower" />
        
        {/* Ring 3 */}
        <div className="absolute inset-8 rounded-full border-2 border-primary/50 animate-spin-slow">
          <div className="absolute inset-0 rounded-full border border-dashed border-primary/20 animate-spin-slower" />
        </div>
        
        {/* Ring 4 - innermost ring */}
        <div className="absolute inset-12 rounded-full border border-primary/60">
          {/* Arc segments */}
          <svg className="absolute inset-0 w-full h-full animate-spin-slow" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="1"
              strokeDasharray={`${progress * 2.83} 283`}
              strokeLinecap="round"
              className="transition-all duration-300"
            />
          </svg>
        </div>
        
        {/* Center core */}
        <div className="absolute inset-16 flex items-center justify-center">
          <div 
            className="w-full h-full rounded-full flex items-center justify-center"
            style={{
              background: `radial-gradient(circle, hsl(var(--primary) / 0.8) 0%, hsl(var(--primary) / 0.2) 60%, transparent 80%)`,
              boxShadow: `0 0 30px hsl(var(--primary) / 0.6), inset 0 0 20px hsl(var(--primary) / 0.3)`,
              animation: 'pulse-glow 2s ease-in-out infinite',
            }}
          >
            <svg className="w-8 h-8" viewBox="0 0 100 100">
              <polygon
                points="50,15 85,75 15,75"
                fill="hsl(var(--primary))"
                className="animate-pulse"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Title with glitch effect */}
      <h1 
        className={`font-orbitron text-3xl md:text-4xl text-primary jarvis-glow mb-2 tracking-[0.3em] ${
          glitchActive ? 'translate-x-[1px] opacity-80' : ''
        }`}
      >
        J.A.R.V.I.S.
      </h1>
      <p className="text-[10px] text-muted-foreground tracking-[0.2em] mb-8">
        JUST A RATHER VERY INTELLIGENT SYSTEM
      </p>

      {/* Progress bar with segments */}
      <div className="w-72 md:w-96 mb-4">
        <div className="flex gap-[2px] h-2 mb-2">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className={`flex-1 rounded-sm transition-all duration-200 ${
                (i + 1) * 5 <= progress 
                  ? 'bg-primary' 
                  : 'bg-muted/30'
              }`}
              style={{
                boxShadow: (i + 1) * 5 <= progress ? '0 0 8px hsl(var(--primary))' : 'none',
              }}
            />
          ))}
        </div>
        <div className="h-[2px] bg-muted/20 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary via-accent to-primary transition-all duration-300 rounded-full"
            style={{ 
              width: `${progress}%`,
              boxShadow: '0 0 10px hsl(var(--primary))',
            }}
          />
        </div>
      </div>

      {/* Status text with typing effect */}
      <div className="h-6 flex items-center gap-2 mb-2">
        <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
        <p className="font-mono text-xs text-primary/90 tracking-wider">
          {status}
        </p>
      </div>

      {/* Subsystems being loaded */}
      <div className="flex gap-3 mb-4 h-4">
        {currentSubsystems.slice(0, 3).map((sub, i) => (
          <span 
            key={sub} 
            className="text-[9px] font-mono text-muted-foreground/60 uppercase tracking-wider animate-pulse"
            style={{ animationDelay: `${i * 0.2}s` }}
          >
            [{sub}]
          </span>
        ))}
      </div>

      {/* Progress percentage */}
      <div className="flex items-baseline gap-1">
        <p className="font-orbitron text-3xl text-primary jarvis-glow tabular-nums">
          {progress}
        </p>
        <span className="text-primary/60 text-lg">%</span>
      </div>

      {/* Corner decorations */}
      <div className="absolute top-6 left-6 w-16 h-16">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-primary/80 to-transparent" />
        <div className="absolute top-0 left-0 w-[1px] h-full bg-gradient-to-b from-primary/80 to-transparent" />
      </div>
      <div className="absolute top-6 right-6 w-16 h-16">
        <div className="absolute top-0 right-0 w-full h-[1px] bg-gradient-to-l from-primary/80 to-transparent" />
        <div className="absolute top-0 right-0 w-[1px] h-full bg-gradient-to-b from-primary/80 to-transparent" />
      </div>
      <div className="absolute bottom-6 left-6 w-16 h-16">
        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-primary/80 to-transparent" />
        <div className="absolute bottom-0 left-0 w-[1px] h-full bg-gradient-to-t from-primary/80 to-transparent" />
      </div>
      <div className="absolute bottom-6 right-6 w-16 h-16">
        <div className="absolute bottom-0 right-0 w-full h-[1px] bg-gradient-to-l from-primary/80 to-transparent" />
        <div className="absolute bottom-0 right-0 w-[1px] h-full bg-gradient-to-t from-primary/80 to-transparent" />
      </div>

      {/* Custom animation keyframes */}
      <style>{`
        @keyframes scan-line {
          0% { top: -2px; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;
