import { Hand, ArrowLeft, ArrowRight, ArrowUp, ArrowDown, Minimize2, Maximize2 } from "lucide-react";

interface GestureControlOverlayProps {
  isActive: boolean;
  gesture: string;
  handPosition: { x: number; y: number } | null;
  isLoading: boolean;
  error: string | null;
  onClose?: () => void;
}

const GestureControlOverlay = ({
  isActive,
  gesture,
  handPosition,
  isLoading,
  error,
  onClose,
}: GestureControlOverlayProps) => {
  const getGestureIcon = () => {
    switch (gesture) {
      case "swipe-left":
        return <ArrowLeft className="w-8 h-8" />;
      case "swipe-right":
        return <ArrowRight className="w-8 h-8" />;
      case "swipe-up":
        return <ArrowUp className="w-8 h-8" />;
      case "swipe-down":
        return <ArrowDown className="w-8 h-8" />;
      case "pinch":
        return <Minimize2 className="w-8 h-8" />;
      case "spread":
        return <Maximize2 className="w-8 h-8" />;
      case "fist":
        return <span className="text-2xl">✊</span>;
      case "open-palm":
        return <Hand className="w-8 h-8" />;
      default:
        return null;
    }
  };

  const getGestureLabel = () => {
    switch (gesture) {
      case "swipe-left":
        return "Previous Suit";
      case "swipe-right":
        return "Next Suit";
      case "swipe-up":
        return "Show All Panels";
      case "swipe-down":
        return "Minimal Mode";
      case "pinch":
        return "Zoom Out";
      case "spread":
        return "Zoom In";
      case "fist":
        return "Combat Mode";
      case "open-palm":
        return "Stealth Mode";
      default:
        return "";
    }
  };

  return (
    <>
      {/* Hand cursor indicator */}
      {isActive && handPosition && (
        <div
          className="fixed z-50 pointer-events-none transition-all duration-100"
          style={{
            left: `${handPosition.x * 100}%`,
            top: `${handPosition.y * 100}%`,
            transform: "translate(-50%, -50%)",
          }}
        >
          {/* Hand indicator */}
          <div className="relative">
            {/* Outer glow ring */}
            <div
              className="absolute -inset-4 rounded-full animate-pulse"
              style={{
                background: `radial-gradient(circle, rgba(var(--jarvis-glow), 0.3) 0%, transparent 70%)`,
              }}
            />
            {/* Inner ring */}
            <div className="w-8 h-8 rounded-full border-2 border-primary flex items-center justify-center bg-background/50 backdrop-blur-sm">
              <Hand className="w-4 h-4 text-primary" />
            </div>
            {/* Crosshairs */}
            <div className="absolute left-1/2 top-[-20px] w-0.5 h-4 bg-primary/50 -translate-x-1/2" />
            <div className="absolute left-1/2 bottom-[-20px] w-0.5 h-4 bg-primary/50 -translate-x-1/2" />
            <div className="absolute top-1/2 left-[-20px] w-4 h-0.5 bg-primary/50 -translate-y-1/2" />
            <div className="absolute top-1/2 right-[-20px] w-4 h-0.5 bg-primary/50 -translate-y-1/2" />
          </div>
        </div>
      )}

      {/* Gesture feedback */}
      {gesture !== "none" && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none">
          <div className="jarvis-panel p-6 backdrop-blur-md animate-scale-in">
            <div className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center text-primary">
                {getGestureIcon()}
              </div>
              <p className="font-orbitron text-sm text-primary uppercase tracking-wider">
                {getGestureLabel()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Status indicator */}
      <div className="fixed bottom-4 left-4 z-40">
        <div className="jarvis-panel p-3 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center border ${
                isLoading
                  ? "border-yellow-500/50 bg-yellow-500/20"
                  : error
                  ? "border-red-500/50 bg-red-500/20"
                  : isActive
                  ? "border-green-500/50 bg-green-500/20"
                  : "border-muted-foreground/30 bg-muted/20"
              }`}
            >
              <Hand
                className={`w-4 h-4 ${
                  isLoading
                    ? "text-yellow-500 animate-pulse"
                    : error
                    ? "text-red-500"
                    : isActive
                    ? "text-green-500"
                    : "text-muted-foreground"
                }`}
              />
            </div>
            <div>
              <p className="text-xs font-orbitron uppercase tracking-wider text-primary">
                Gesture Control
              </p>
              <p className="text-[10px] text-muted-foreground">
                {isLoading
                  ? "Initializing camera..."
                  : error
                  ? "Camera error"
                  : isActive
                  ? "Hand detected"
                  : "Waiting for hand..."}
              </p>
            </div>
          </div>

          {/* Gesture hints */}
          <div className="mt-2 pt-2 border-t border-border/50 grid grid-cols-2 gap-1 text-[10px] text-muted-foreground">
            <div className="flex items-center gap-1">
              <ArrowLeft className="w-3 h-3" />
              <span>Prev suit</span>
            </div>
            <div className="flex items-center gap-1">
              <ArrowRight className="w-3 h-3" />
              <span>Next suit</span>
            </div>
            <div className="flex items-center gap-1">
              <span>✊</span>
              <span>Combat</span>
            </div>
            <div className="flex items-center gap-1">
              <Hand className="w-3 h-3" />
              <span>Stealth</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default GestureControlOverlay;
