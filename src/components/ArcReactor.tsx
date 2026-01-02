import { useEffect, useState } from "react";
import { SuitTheme } from "./SuitSelector";

interface ArcReactorProps {
  onClick?: () => void;
  suit?: SuitTheme;
}

const ArcReactor = ({ onClick, suit }: ArcReactorProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const primaryColor = suit?.colors.primary || "190 100% 50%";
  const secondaryColor = suit?.colors.secondary || "200 100% 40%";
  const glowColor = suit?.colors.glow || "0 212 255";
  const reactorStyle = suit?.arcReactorStyle || "classic";

  const renderCore = () => {
    switch (reactorStyle) {
      case "triangular":
        return (
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
                <stop offset="0%" stopColor={`hsl(${primaryColor})`} stopOpacity="0.9"/>
                <stop offset="100%" stopColor={`hsl(${secondaryColor})`} stopOpacity="0.7"/>
              </linearGradient>
            </defs>
            <polygon
              points="50,15 85,75 15,75"
              fill="url(#triangleGradient)"
              stroke={`hsl(${primaryColor})`}
              strokeWidth="2"
              filter="url(#glow)"
            />
          </svg>
        );
      
      case "circular":
        return (
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
            <defs>
              <filter id="circleGlow">
                <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
              <radialGradient id="circleGradient" cx="50%" cy="50%">
                <stop offset="0%" stopColor={`hsl(${primaryColor})`} stopOpacity="0.9"/>
                <stop offset="100%" stopColor={`hsl(${secondaryColor})`} stopOpacity="0.5"/>
              </radialGradient>
            </defs>
            <circle
              cx="50" cy="50" r="35"
              fill="url(#circleGradient)"
              stroke={`hsl(${primaryColor})`}
              strokeWidth="3"
              filter="url(#circleGlow)"
            />
            {[...Array(8)].map((_, i) => (
              <line
                key={i}
                x1="50" y1="50"
                x2={50 + 30 * Math.cos(i * Math.PI / 4)}
                y2={50 + 30 * Math.sin(i * Math.PI / 4)}
                stroke={`hsl(${primaryColor})`}
                strokeWidth="2"
                opacity="0.6"
              />
            ))}
          </svg>
        );

      case "hexagonal":
        return (
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
            <defs>
              <filter id="hexGlow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
              <linearGradient id="hexGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={`hsl(${primaryColor})`} stopOpacity="0.9"/>
                <stop offset="100%" stopColor={`hsl(${secondaryColor})`} stopOpacity="0.6"/>
              </linearGradient>
            </defs>
            <polygon
              points="50,15 80,32 80,68 50,85 20,68 20,32"
              fill="url(#hexGradient)"
              stroke={`hsl(${primaryColor})`}
              strokeWidth="2"
              filter="url(#hexGlow)"
            />
          </svg>
        );

      case "nano":
        return (
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
            <defs>
              <filter id="nanoGlow">
                <feGaussianBlur stdDeviation="5" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            {/* Multiple pulsing circles for nano effect */}
            <circle
              cx="50" cy="50" r="30"
              fill="none"
              stroke={`hsl(${primaryColor})`}
              strokeWidth="1"
              opacity="0.4"
              filter="url(#nanoGlow)"
            />
            <circle
              cx="50" cy="50" r="22"
              fill="none"
              stroke={`hsl(${primaryColor})`}
              strokeWidth="1.5"
              opacity="0.6"
            />
            <circle
              cx="50" cy="50" r="15"
              fill={`hsl(${primaryColor})`}
              opacity="0.8"
              filter="url(#nanoGlow)"
            />
            {/* Nano particles */}
            {[...Array(12)].map((_, i) => (
              <circle
                key={i}
                cx={50 + 25 * Math.cos(i * Math.PI / 6)}
                cy={50 + 25 * Math.sin(i * Math.PI / 6)}
                r="2"
                fill={`hsl(${primaryColor})`}
                opacity="0.7"
              />
            ))}
          </svg>
        );

      default: // classic
        return (
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
            <defs>
              <filter id="classicGlow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
              <linearGradient id="classicGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={`hsl(${primaryColor})`} stopOpacity="0.9"/>
                <stop offset="100%" stopColor={`hsl(${secondaryColor})`} stopOpacity="0.7"/>
              </linearGradient>
            </defs>
            <polygon
              points="50,15 85,75 15,75"
              fill="url(#classicGradient)"
              stroke={`hsl(${primaryColor})`}
              strokeWidth="2"
              filter="url(#classicGlow)"
            />
          </svg>
        );
    }
  };

  return (
    <div 
      className={`relative w-64 h-64 md:w-80 md:h-80 transition-all duration-1000 cursor-pointer ${
        isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
      } ${isHovered ? 'scale-105' : ''}`}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Click hint */}
      {isHovered && (
        <div 
          className="absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] whitespace-nowrap animate-fade-in"
          style={{ color: `hsl(${primaryColor} / 0.6)` }}
        >
          Click for diagnostics
        </div>
      )}

      {/* Outer glow */}
      <div 
        className={`absolute inset-0 rounded-full blur-3xl animate-pulse-ring transition-all duration-300`}
        style={{ 
          backgroundColor: `rgba(${glowColor}, ${isHovered ? 0.3 : 0.2})` 
        }}
      />
      
      {/* Outermost ring */}
      <div 
        className="absolute inset-2 rounded-full border-2 animate-spin-slow"
        style={{ borderColor: `hsl(${primaryColor} / 0.4)` }}
      >
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-4"
            style={{
              backgroundColor: `hsl(${primaryColor} / 0.6)`,
              top: '50%',
              left: '50%',
              transform: `rotate(${i * 30}deg) translateY(-120px) translateX(-50%)`,
            }}
          />
        ))}
      </div>

      {/* Second ring */}
      <div 
        className="absolute inset-8 rounded-full border animate-spin-slower"
        style={{ borderColor: `hsl(${primaryColor} / 0.5)` }}
      >
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1.5 h-3"
            style={{
              backgroundColor: `hsl(${primaryColor} / 0.5)`,
              top: '50%',
              left: '50%',
              transform: `rotate(${i * 45}deg) translateY(-90px) translateX(-50%)`,
            }}
          />
        ))}
      </div>

      {/* Third ring with segments */}
      <div 
        className="absolute inset-14 rounded-full border-2 animate-spin-slow"
        style={{ borderColor: `hsl(${primaryColor} / 0.6)` }}
      >
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
          {[...Array(6)].map((_, i) => (
            <path
              key={i}
              d={`M 50 10 A 40 40 0 0 1 ${50 + 40 * Math.cos((i * 60 - 90) * Math.PI / 180)} ${50 + 40 * Math.sin((i * 60 - 90) * Math.PI / 180)}`}
              fill="none"
              stroke={`hsl(${primaryColor})`}
              strokeWidth="2"
              strokeLinecap="round"
              className="opacity-60"
            />
          ))}
        </svg>
      </div>

      {/* Inner core */}
      <div className="absolute inset-20 flex items-center justify-center">
        <div className={`relative w-full h-full animate-pulse-glow transition-all duration-300 ${isHovered ? 'scale-110' : ''}`}>
          {renderCore()}
          
          {/* Center glow */}
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/3 w-8 h-8 rounded-full blur-lg"
            style={{ backgroundColor: `hsl(${primaryColor} / 0.8)` }}
          />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/3 w-4 h-4 rounded-full bg-white/90" />
        </div>
      </div>

      {/* STARK INDUSTRIES text */}
      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-center">
        <p 
          className="font-orbitron text-xs tracking-[0.3em]"
          style={{ 
            color: `hsl(${primaryColor} / 0.8)`,
            textShadow: `0 0 10px hsl(${primaryColor}), 0 0 20px hsl(${primaryColor} / 0.5)`
          }}
        >
          STARK INDUSTRIES
        </p>
      </div>
    </div>
  );
};

export default ArcReactor;
