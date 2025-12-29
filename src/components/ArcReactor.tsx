import { useEffect, useState } from "react";

const ArcReactor = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div 
      className={`relative w-64 h-64 md:w-80 md:h-80 transition-all duration-1000 ${
        isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
      }`}
    >
      {/* Outer glow */}
      <div className="absolute inset-0 rounded-full bg-primary/20 blur-3xl animate-pulse-ring" />
      
      {/* Outermost ring */}
      <div className="absolute inset-2 rounded-full border-2 border-primary/40 animate-spin-slow">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-4 bg-primary/60"
            style={{
              top: '50%',
              left: '50%',
              transform: `rotate(${i * 30}deg) translateY(-120px) translateX(-50%)`,
            }}
          />
        ))}
      </div>

      {/* Second ring */}
      <div className="absolute inset-8 rounded-full border border-primary/50 animate-spin-slower">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1.5 h-3 bg-primary/50"
            style={{
              top: '50%',
              left: '50%',
              transform: `rotate(${i * 45}deg) translateY(-90px) translateX(-50%)`,
            }}
          />
        ))}
      </div>

      {/* Third ring with segments */}
      <div className="absolute inset-14 rounded-full border-2 border-primary/60 animate-spin-slow">
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
          {[...Array(6)].map((_, i) => (
            <path
              key={i}
              d={`M 50 10 A 40 40 0 0 1 ${50 + 40 * Math.cos((i * 60 - 90) * Math.PI / 180)} ${50 + 40 * Math.sin((i * 60 - 90) * Math.PI / 180)}`}
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="2"
              strokeLinecap="round"
              className="opacity-60"
            />
          ))}
        </svg>
      </div>

      {/* Inner triangle core */}
      <div className="absolute inset-20 flex items-center justify-center">
        <div className="relative w-full h-full animate-pulse-glow">
          {/* Triangle */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
              <linearGradient id="triangleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.9"/>
                <stop offset="100%" stopColor="hsl(var(--secondary))" stopOpacity="0.7"/>
              </linearGradient>
            </defs>
            <polygon
              points="50,15 85,75 15,75"
              fill="url(#triangleGradient)"
              stroke="hsl(var(--primary))"
              strokeWidth="2"
              filter="url(#glow)"
            />
          </svg>
          
          {/* Center glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/3 w-8 h-8 rounded-full bg-primary/80 blur-lg" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/3 w-4 h-4 rounded-full bg-white/90" />
        </div>
      </div>

      {/* STARK INDUSTRIES text */}
      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-center">
        <p className="font-orbitron text-xs tracking-[0.3em] text-primary/80 jarvis-glow">
          STARK INDUSTRIES
        </p>
      </div>
    </div>
  );
};

export default ArcReactor;
