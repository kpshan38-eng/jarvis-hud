import { useEffect, useState } from "react";

interface SuitTransitionOverlayProps {
  isTransitioning: boolean;
  progress: number;
  phase: "idle" | "dissolve" | "morph" | "resolve";
  fromGlow?: string;
  toGlow?: string;
}

const SuitTransitionOverlay = ({
  isTransitioning,
  progress,
  phase,
  fromGlow = "0 212 255",
  toGlow = "0 212 255",
}: SuitTransitionOverlayProps) => {
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; delay: number; size: number }[]>([]);
  const [hexagons, setHexagons] = useState<{ id: number; x: number; y: number; rotation: number }[]>([]);

  useEffect(() => {
    if (isTransitioning) {
      // Generate nanotech particles
      const newParticles = Array.from({ length: 60 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 0.5,
        size: Math.random() * 4 + 2,
      }));
      setParticles(newParticles);

      // Generate hexagon grid
      const newHexagons = Array.from({ length: 30 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        rotation: Math.random() * 360,
      }));
      setHexagons(newHexagons);
    }
  }, [isTransitioning]);

  if (!isTransitioning) return null;

  const phaseOpacity = {
    dissolve: Math.min(progress * 3, 1),
    morph: 1,
    resolve: Math.max(1 - (progress - 0.66) * 3, 0),
    idle: 0,
  };

  return (
    <div
      className="fixed inset-0 z-50 pointer-events-none overflow-hidden"
      style={{ opacity: phaseOpacity[phase] }}
    >
      {/* Radial gradient overlay */}
      <div
        className="absolute inset-0 transition-all duration-300"
        style={{
          background: `radial-gradient(circle at center, 
            rgba(${progress < 0.5 ? fromGlow : toGlow}, 0.3) 0%, 
            rgba(${progress < 0.5 ? fromGlow : toGlow}, 0.1) 30%, 
            transparent 60%)`,
        }}
      />

      {/* Scanning lines */}
      <div className="absolute inset-0">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute left-0 right-0 h-0.5"
            style={{
              top: `${20 + i * 15}%`,
              background: `linear-gradient(90deg, transparent, rgba(${toGlow}, ${0.6 - i * 0.1}), transparent)`,
              animation: `suit-scan 0.8s ease-out ${i * 0.1}s forwards`,
              opacity: phase === "morph" ? 1 : 0,
            }}
          />
        ))}
      </div>

      {/* Nanotech particles */}
      <div className="absolute inset-0">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute rounded-full"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              background: `rgba(${progress < 0.5 ? fromGlow : toGlow}, 0.8)`,
              boxShadow: `0 0 ${particle.size * 2}px rgba(${toGlow}, 0.5)`,
              animation: `nanotech-float 1.2s ease-in-out ${particle.delay}s infinite`,
              transform: `scale(${phase === "morph" ? 1 : 0.5})`,
              transition: "transform 0.3s, background 0.3s",
            }}
          />
        ))}
      </div>

      {/* Hexagonal grid morphing effect */}
      <div className="absolute inset-0">
        {hexagons.map((hex) => (
          <div
            key={hex.id}
            className="absolute"
            style={{
              left: `${hex.x}%`,
              top: `${hex.y}%`,
              transform: `rotate(${hex.rotation}deg) scale(${phase === "morph" ? 1 : 0})`,
              transition: "transform 0.5s ease-out",
            }}
          >
            <svg width="40" height="40" viewBox="0 0 40 40">
              <polygon
                points="20,2 38,12 38,28 20,38 2,28 2,12"
                fill="none"
                stroke={`rgba(${toGlow}, 0.4)`}
                strokeWidth="1"
              />
            </svg>
          </div>
        ))}
      </div>

      {/* Center morphing ring */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="rounded-full border-2"
          style={{
            width: `${100 + progress * 200}px`,
            height: `${100 + progress * 200}px`,
            borderColor: `rgba(${toGlow}, ${1 - progress * 0.5})`,
            boxShadow: `0 0 30px rgba(${toGlow}, 0.5), inset 0 0 20px rgba(${toGlow}, 0.3)`,
            animation: "pulse-ring 0.6s ease-out infinite",
          }}
        />
      </div>

      {/* Energy wave */}
      {phase === "resolve" && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            animation: "energy-wave 0.6s ease-out forwards",
          }}
        >
          <div
            className="rounded-full"
            style={{
              width: "100%",
              height: "100%",
              background: `radial-gradient(circle, rgba(${toGlow}, 0.3) 0%, transparent 70%)`,
            }}
          />
        </div>
      )}

      {/* Phase indicator text */}
      <div className="absolute bottom-10 left-0 right-0 text-center">
        <p
          className="font-orbitron text-xs uppercase tracking-[0.3em]"
          style={{
            color: `rgb(${toGlow})`,
            textShadow: `0 0 10px rgba(${toGlow}, 0.8)`,
          }}
        >
          {phase === "dissolve" && "INITIATING SUIT RECONFIGURATION"}
          {phase === "morph" && "NANOTECH REASSEMBLY IN PROGRESS"}
          {phase === "resolve" && "SUIT DEPLOYMENT COMPLETE"}
        </p>
      </div>

      <style>{`
        @keyframes suit-scan {
          0% {
            transform: scaleX(0);
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: scaleX(1);
            opacity: 0;
          }
        }

        @keyframes nanotech-float {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          50% {
            transform: translate(${Math.random() * 20 - 10}px, ${Math.random() * 20 - 10}px) scale(1.2);
          }
        }

        @keyframes pulse-ring {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          100% {
            transform: scale(1.1);
            opacity: 0.5;
          }
        }

        @keyframes energy-wave {
          0% {
            transform: scale(0);
            opacity: 1;
          }
          100% {
            transform: scale(2);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default SuitTransitionOverlay;
