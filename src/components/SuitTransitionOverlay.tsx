import { useEffect, useState } from "react";
import { TransitionStyle } from "@/hooks/useSuitTransition";

interface SuitTransitionOverlayProps {
  isTransitioning: boolean;
  progress: number;
  phase: "idle" | "dissolve" | "morph" | "resolve";
  style?: TransitionStyle;
  fromGlow?: string;
  toGlow?: string;
}

const SuitTransitionOverlay = ({
  isTransitioning,
  progress,
  phase,
  style = "nanotech",
  fromGlow = "0 212 255",
  toGlow = "0 212 255",
}: SuitTransitionOverlayProps) => {
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; delay: number; size: number; angle: number }[]>([]);
  const [elements, setElements] = useState<{ id: number; x: number; y: number; rotation: number; scale: number }[]>([]);

  useEffect(() => {
    if (isTransitioning) {
      // Generate particles/elements based on style
      const newParticles = Array.from({ length: style === "nanotech" ? 60 : 40 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 0.5,
        size: Math.random() * 4 + 2,
        angle: Math.random() * 360,
      }));
      setParticles(newParticles);

      const newElements = Array.from({ length: 30 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        rotation: Math.random() * 360,
        scale: Math.random() * 0.5 + 0.5,
      }));
      setElements(newElements);
    }
  }, [isTransitioning, style]);

  if (!isTransitioning) return null;

  const phaseOpacity = {
    dissolve: Math.min(progress * 3, 1),
    morph: 1,
    resolve: Math.max(1 - (progress - 0.66) * 3, 0),
    idle: 0,
  };

  // Style-specific rendering
  const renderNanotech = () => (
    <>
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

      {/* Hexagonal grid */}
      <div className="absolute inset-0">
        {elements.map((hex) => (
          <div
            key={hex.id}
            className="absolute"
            style={{
              left: `${hex.x}%`,
              top: `${hex.y}%`,
              transform: `rotate(${hex.rotation}deg) scale(${phase === "morph" ? hex.scale : 0})`,
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
    </>
  );

  const renderHolographic = () => (
    <>
      {/* Holographic scanlines */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={i}
            className="absolute left-0 right-0 h-px"
            style={{
              top: `${i * 2}%`,
              background: `linear-gradient(90deg, transparent 0%, rgba(${toGlow}, ${0.1 + Math.random() * 0.2}) 50%, transparent 100%)`,
              animation: `holographic-scan 2s linear ${i * 0.05}s infinite`,
            }}
          />
        ))}
      </div>

      {/* Holographic noise */}
      <div
        className="absolute inset-0"
        style={{
          background: `repeating-linear-gradient(
            ${45 + progress * 90}deg,
            transparent,
            transparent 2px,
            rgba(${toGlow}, 0.05) 2px,
            rgba(${toGlow}, 0.05) 4px
          )`,
        }}
      />

      {/* Glitch effect */}
      {phase === "morph" && (
        <div className="absolute inset-0">
          <div
            className="absolute inset-0"
            style={{
              transform: `translateX(${Math.sin(progress * 20) * 5}px)`,
              background: `rgba(${fromGlow}, 0.1)`,
              clipPath: `inset(${Math.random() * 50}% 0 ${Math.random() * 50}% 0)`,
            }}
          />
        </div>
      )}

      {/* Projection beams */}
      <div className="absolute inset-0 flex items-center justify-center">
        {[0, 72, 144, 216, 288].map((angle) => (
          <div
            key={angle}
            className="absolute w-1 origin-bottom"
            style={{
              height: `${50 + progress * 50}%`,
              transform: `rotate(${angle + progress * 180}deg)`,
              background: `linear-gradient(to top, rgba(${toGlow}, 0.5), transparent)`,
              opacity: phase === "morph" ? 0.8 : 0.2,
              transition: "opacity 0.3s",
            }}
          />
        ))}
      </div>
    </>
  );

  const renderMechanical = () => (
    <>
      {/* Mechanical plates */}
      <div className="absolute inset-0">
        {/* Top plates */}
        <div
          className="absolute top-0 left-0 right-0 bg-gradient-to-b"
          style={{
            height: `${phase === "morph" ? 50 : phase === "dissolve" ? progress * 50 : (1 - progress) * 50}%`,
            background: `linear-gradient(to bottom, rgba(${toGlow}, 0.3), transparent)`,
            borderBottom: `2px solid rgba(${toGlow}, 0.6)`,
            transition: "height 0.3s ease-out",
          }}
        />
        {/* Bottom plates */}
        <div
          className="absolute bottom-0 left-0 right-0"
          style={{
            height: `${phase === "morph" ? 50 : phase === "dissolve" ? progress * 50 : (1 - progress) * 50}%`,
            background: `linear-gradient(to top, rgba(${toGlow}, 0.3), transparent)`,
            borderTop: `2px solid rgba(${toGlow}, 0.6)`,
            transition: "height 0.3s ease-out",
          }}
        />
      </div>

      {/* Rotating gears */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {[1, 0.7, 0.4].map((scale, i) => (
          <div
            key={i}
            className="absolute"
            style={{
              transform: `scale(${scale}) rotate(${progress * 360 * (i % 2 === 0 ? 1 : -1)}deg)`,
            }}
          >
            <svg width="200" height="200" viewBox="0 0 200 200">
              <circle
                cx="100"
                cy="100"
                r={80 - i * 15}
                fill="none"
                stroke={`rgba(${toGlow}, ${0.3 - i * 0.1})`}
                strokeWidth="2"
                strokeDasharray="10 5"
              />
              {Array.from({ length: 8 }).map((_, j) => (
                <rect
                  key={j}
                  x="95"
                  y="10"
                  width="10"
                  height="20"
                  fill={`rgba(${toGlow}, 0.4)`}
                  transform={`rotate(${j * 45} 100 100)`}
                />
              ))}
            </svg>
          </div>
        ))}
      </div>

      {/* Assembly sparks */}
      {phase === "morph" && (
        <div className="absolute inset-0">
          {particles.slice(0, 20).map((spark) => (
            <div
              key={spark.id}
              className="absolute w-1 h-1 bg-yellow-400 rounded-full"
              style={{
                left: `${spark.x}%`,
                top: `${spark.y}%`,
                boxShadow: "0 0 4px #fbbf24, 0 0 8px #fbbf24",
                animation: `spark-fly 0.5s ease-out ${spark.delay}s infinite`,
              }}
            />
          ))}
        </div>
      )}
    </>
  );

  const renderDissolve = () => (
    <>
      {/* Dissolving pixels */}
      <div className="absolute inset-0">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.size * 3}px`,
              height: `${p.size * 3}px`,
              background: `rgba(${progress < 0.5 ? fromGlow : toGlow}, 0.6)`,
              transform: `rotate(${p.angle}deg) scale(${phase === "morph" ? 1 : 0})`,
              transition: `transform 0.4s ease-out ${p.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Dissolve wave */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle at ${progress * 100}% ${progress * 100}%, 
            rgba(${toGlow}, 0.4) 0%, 
            rgba(${fromGlow}, 0.2) 30%, 
            transparent 60%)`,
        }}
      />

      {/* Particle burst at center */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="rounded-full"
          style={{
            width: `${progress * 400}px`,
            height: `${progress * 400}px`,
            border: `2px solid rgba(${toGlow}, ${1 - progress})`,
            boxShadow: `0 0 30px rgba(${toGlow}, ${0.5 - progress * 0.5})`,
          }}
        />
      </div>
    </>
  );

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

      {/* Style-specific effects */}
      {style === "nanotech" && renderNanotech()}
      {style === "holographic" && renderHolographic()}
      {style === "mechanical" && renderMechanical()}
      {style === "dissolve" && renderDissolve()}

      {/* Scanning lines (common to all) */}
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

      {/* Phase indicator text */}
      <div className="absolute bottom-10 left-0 right-0 text-center">
        <p
          className="font-orbitron text-xs uppercase tracking-[0.3em]"
          style={{
            color: `rgb(${toGlow})`,
            textShadow: `0 0 10px rgba(${toGlow}, 0.8)`,
          }}
        >
          {style === "nanotech" && phase === "dissolve" && "NANOTECH RECONFIGURATION"}
          {style === "nanotech" && phase === "morph" && "MOLECULAR REASSEMBLY"}
          {style === "nanotech" && phase === "resolve" && "SUIT DEPLOYED"}
          
          {style === "holographic" && phase === "dissolve" && "HOLOGRAPHIC MATRIX LOADING"}
          {style === "holographic" && phase === "morph" && "PROJECTION RENDERING"}
          {style === "holographic" && phase === "resolve" && "HOLOGRAM STABLE"}
          
          {style === "mechanical" && phase === "dissolve" && "ARMOR PLATES RETRACTING"}
          {style === "mechanical" && phase === "morph" && "MECHANICAL ASSEMBLY"}
          {style === "mechanical" && phase === "resolve" && "SUIT LOCKED"}
          
          {style === "dissolve" && phase === "dissolve" && "MATTER DISSOLUTION"}
          {style === "dissolve" && phase === "morph" && "PARTICLE REFORMATION"}
          {style === "dissolve" && phase === "resolve" && "INTEGRATION COMPLETE"}
        </p>
      </div>

      <style>{`
        @keyframes suit-scan {
          0% { transform: scaleX(0); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: scaleX(1); opacity: 0; }
        }

        @keyframes nanotech-float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(${Math.random() * 20 - 10}px, ${Math.random() * 20 - 10}px) scale(1.2); }
        }

        @keyframes pulse-ring {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(1.1); opacity: 0.5; }
        }

        @keyframes holographic-scan {
          0% { transform: translateX(-100%); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateX(100%); opacity: 0; }
        }

        @keyframes spark-fly {
          0% { transform: translate(0, 0) scale(1); opacity: 1; }
          100% { transform: translate(${Math.random() * 40 - 20}px, ${Math.random() * 40 - 20}px) scale(0); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default SuitTransitionOverlay;
