import { useFaceDetection } from "@/hooks/useFaceDetection";
import { SuitTheme } from "./SuitSelector";
import { Shield, Zap, Target, Activity, AlertTriangle, Wifi } from "lucide-react";

interface FaceAROverlayProps {
  enabled: boolean;
  suit: SuitTheme;
  systemStats: { cpu: number; ram: number; battery: number };
}

const FaceAROverlay = ({ enabled, suit, systemStats }: FaceAROverlayProps) => {
  const { isActive, isLoading, error, faceBox, landmarks, faceAngle, videoRef, canvasRef } = useFaceDetection(enabled);

  if (!enabled) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Hidden video and canvas for processing */}
      <video
        ref={videoRef}
        className="absolute opacity-0 pointer-events-none"
        autoPlay
        playsInline
        muted
      />
      <canvas ref={canvasRef} className="absolute opacity-0 pointer-events-none" />

      {/* Loading state */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80">
          <div className="text-primary text-sm animate-pulse">
            INITIALIZING FACE TRACKING...
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-destructive/20 border border-destructive px-4 py-2 rounded">
          <p className="text-destructive text-xs">{error}</p>
        </div>
      )}

      {/* AR HUD Elements positioned on face */}
      {isActive && faceBox && landmarks && (
        <div className="absolute inset-0 overflow-hidden">
          {/* Face bounding box with Iron Man HUD style */}
          <div
            className="absolute border-2 rounded-lg transition-all duration-75"
            style={{
              left: `${faceBox.x * 100}%`,
              top: `${faceBox.y * 100}%`,
              width: `${faceBox.width * 100}%`,
              height: `${faceBox.height * 100}%`,
              borderColor: `hsl(var(--primary))`,
              boxShadow: `0 0 20px rgba(${suit.colors.glow}, 0.5), inset 0 0 20px rgba(${suit.colors.glow}, 0.1)`,
              transform: `rotateZ(${faceAngle.roll}deg)`,
            }}
          >
            {/* Corner brackets */}
            <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-primary" />
            <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-primary" />
            <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-primary" />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-primary" />

            {/* Scanning line animation */}
            <div
              className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"
              style={{ animation: "faceARScan 2s linear infinite" }}
            />
          </div>

          {/* Eye tracking indicators */}
          {landmarks.leftEye && (
            <div
              className="absolute w-8 h-8 -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `${landmarks.leftEye.x * 100}%`,
                top: `${landmarks.leftEye.y * 100}%`,
              }}
            >
              <div className="w-full h-full border border-primary/60 rounded-full animate-pulse" />
              <div className="absolute inset-1 border border-primary/40 rounded-full" />
              <Target className="absolute inset-2 w-4 h-4 text-primary/60" />
            </div>
          )}

          {landmarks.rightEye && (
            <div
              className="absolute w-8 h-8 -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `${landmarks.rightEye.x * 100}%`,
                top: `${landmarks.rightEye.y * 100}%`,
              }}
            >
              <div className="w-full h-full border border-primary/60 rounded-full animate-pulse" />
              <div className="absolute inset-1 border border-primary/40 rounded-full" />
              <Target className="absolute inset-2 w-4 h-4 text-primary/60" />
            </div>
          )}

          {/* Left side HUD panel - System stats */}
          <div
            className="absolute flex flex-col gap-1 transition-all duration-150"
            style={{
              right: `${(1 - faceBox.x) * 100 + 2}%`,
              top: `${faceBox.y * 100}%`,
            }}
          >
            <div className="bg-card/80 backdrop-blur-sm border border-primary/30 rounded px-2 py-1 text-[10px] font-mono">
              <div className="flex items-center gap-1 text-primary">
                <Activity className="w-3 h-3" />
                <span>CPU: {systemStats.cpu.toFixed(0)}%</span>
              </div>
            </div>
            <div className="bg-card/80 backdrop-blur-sm border border-primary/30 rounded px-2 py-1 text-[10px] font-mono">
              <div className="flex items-center gap-1 text-primary">
                <Zap className="w-3 h-3" />
                <span>PWR: {systemStats.battery.toFixed(0)}%</span>
              </div>
            </div>
            <div className="bg-card/80 backdrop-blur-sm border border-primary/30 rounded px-2 py-1 text-[10px] font-mono">
              <div className="flex items-center gap-1 text-green-500">
                <Shield className="w-3 h-3" />
                <span>SHIELDS: 100%</span>
              </div>
            </div>
          </div>

          {/* Right side HUD panel - Suit info */}
          <div
            className="absolute flex flex-col gap-1 transition-all duration-150"
            style={{
              left: `${(faceBox.x + faceBox.width) * 100 + 2}%`,
              top: `${faceBox.y * 100}%`,
            }}
          >
            <div className="bg-card/80 backdrop-blur-sm border border-primary/30 rounded px-2 py-1 text-[10px] font-mono">
              <div className="flex items-center gap-1 text-primary">
                <Shield className="w-3 h-3" />
                <span>{suit.name}</span>
              </div>
            </div>
            <div className="bg-card/80 backdrop-blur-sm border border-primary/30 rounded px-2 py-1 text-[10px] font-mono">
              <div className="flex items-center gap-1 text-primary">
                <Wifi className="w-3 h-3" />
                <span>LINK: ACTIVE</span>
              </div>
            </div>
            <div className="bg-card/80 backdrop-blur-sm border border-primary/30 rounded px-2 py-1 text-[10px] font-mono">
              <div className="flex items-center gap-1 text-yellow-500">
                <AlertTriangle className="w-3 h-3" />
                <span>THREATS: 0</span>
              </div>
            </div>
          </div>

          {/* Nose targeting reticle */}
          {landmarks.nose && (
            <div
              className="absolute w-12 h-12 -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `${landmarks.nose.x * 100}%`,
                top: `${landmarks.nose.y * 100}%`,
              }}
            >
              <svg viewBox="0 0 48 48" className="w-full h-full">
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  fill="none"
                  stroke={`hsl(var(--primary))`}
                  strokeWidth="0.5"
                  opacity="0.5"
                />
                <circle
                  cx="24"
                  cy="24"
                  r="10"
                  fill="none"
                  stroke={`hsl(var(--primary))`}
                  strokeWidth="0.5"
                  opacity="0.7"
                />
                <line x1="24" y1="4" x2="24" y2="14" stroke={`hsl(var(--primary))`} strokeWidth="0.5" opacity="0.6" />
                <line x1="24" y1="34" x2="24" y2="44" stroke={`hsl(var(--primary))`} strokeWidth="0.5" opacity="0.6" />
                <line x1="4" y1="24" x2="14" y2="24" stroke={`hsl(var(--primary))`} strokeWidth="0.5" opacity="0.6" />
                <line x1="34" y1="24" x2="44" y2="24" stroke={`hsl(var(--primary))`} strokeWidth="0.5" opacity="0.6" />
              </svg>
            </div>
          )}

          {/* Biometric readout at mouth */}
          {landmarks.mouth && (
            <div
              className="absolute -translate-x-1/2 transition-all duration-150"
              style={{
                left: `${landmarks.mouth.x * 100}%`,
                top: `${(landmarks.mouth.y + 0.08) * 100}%`,
              }}
            >
              <div className="bg-card/80 backdrop-blur-sm border border-primary/30 rounded px-2 py-1 text-[10px] font-mono text-center">
                <div className="text-primary/60">BIOMETRIC LOCK</div>
                <div className="text-green-500 font-bold">VERIFIED</div>
              </div>
            </div>
          )}

          {/* Suit designation floating above head */}
          <div
            className="absolute -translate-x-1/2 transition-all duration-150"
            style={{
              left: `${(faceBox.x + faceBox.width / 2) * 100}%`,
              top: `${Math.max(0, faceBox.y * 100 - 8)}%`,
            }}
          >
            <div className="text-primary text-xs font-mono text-center animate-pulse">
              {suit.mark} ONLINE
            </div>
          </div>
        </div>
      )}

      {/* Instruction when no face detected */}
      {isActive && !faceBox && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-card/80 backdrop-blur-sm border border-primary/30 rounded px-4 py-2">
          <p className="text-primary text-xs font-mono animate-pulse">
            POSITION FACE IN CAMERA VIEW
          </p>
        </div>
      )}

      <style>{`
        @keyframes faceARScan {
          0% { top: 0; }
          100% { top: 100%; }
        }
      `}</style>
    </div>
  );
};

export default FaceAROverlay;
