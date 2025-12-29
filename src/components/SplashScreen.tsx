import { useEffect, useState } from "react";

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("INITIALIZING SYSTEMS...");
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const statuses = [
      { progress: 15, text: "LOADING ARC REACTOR..." },
      { progress: 30, text: "CALIBRATING SENSORS..." },
      { progress: 45, text: "ESTABLISHING NETWORK..." },
      { progress: 60, text: "SYNCING AI CORE..." },
      { progress: 75, text: "LOADING INTERFACE..." },
      { progress: 90, text: "RUNNING DIAGNOSTICS..." },
      { progress: 100, text: "SYSTEMS ONLINE" },
    ];

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
          setTimeout(onComplete, 500);
        }, 500);
      }
    }, 400);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div 
      className={`fixed inset-0 bg-background z-50 flex flex-col items-center justify-center transition-opacity duration-500 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Animated rings */}
      <div className="relative w-40 h-40 mb-8">
        <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-spin-slow" />
        <div className="absolute inset-4 rounded-full border border-primary/40 animate-spin-slower" />
        <div className="absolute inset-8 rounded-full border-2 border-primary/50 animate-spin-slow" />
        
        {/* Center triangle */}
        <div className="absolute inset-12 flex items-center justify-center">
          <svg className="w-full h-full animate-pulse-glow" viewBox="0 0 100 100">
            <polygon
              points="50,20 80,70 20,70"
              fill="hsl(var(--primary))"
              opacity="0.6"
            />
          </svg>
        </div>
      </div>

      {/* Title */}
      <h1 className="font-orbitron text-2xl md:text-3xl text-primary jarvis-glow mb-8 tracking-widest">
        J.A.R.V.I.S.
      </h1>

      {/* Progress bar */}
      <div className="w-64 md:w-80 mb-4">
        <div className="h-1 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Status text */}
      <p className="font-mono text-xs text-primary/80 tracking-wider">
        {status}
      </p>

      {/* Progress percentage */}
      <p className="font-mono text-lg text-primary mt-4 jarvis-glow">
        {progress}%
      </p>
    </div>
  );
};

export default SplashScreen;
