import { useState, useEffect, useRef, useCallback } from "react";
import { Mic, MicOff, Volume2, Check, X } from "lucide-react";

interface VoiceCommandIndicatorProps {
  isListening: boolean;
  lastCommand: string | null;
  confidence: number;
  onClose?: () => void;
}

const VoiceCommandIndicator = ({
  isListening,
  lastCommand,
  confidence,
  onClose,
}: VoiceCommandIndicatorProps) => {
  const [audioLevel, setAudioLevel] = useState<number[]>(Array(32).fill(0.1));
  const [showCommand, setShowCommand] = useState(false);
  const [displayedCommand, setDisplayedCommand] = useState<string | null>(null);
  const animationRef = useRef<number | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);

  // Initialize audio visualization
  useEffect(() => {
    if (!isListening) {
      setAudioLevel(Array(32).fill(0.1));
      if (analyserRef.current) {
        analyserRef.current = null;
      }
      return;
    }

    const initAudio = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const audioContext = new AudioContext();
        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        
        analyser.fftSize = 64;
        analyser.smoothingTimeConstant = 0.8;
        source.connect(analyser);
        
        analyserRef.current = analyser;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const updateLevels = () => {
          if (!analyserRef.current) return;
          
          analyserRef.current.getByteFrequencyData(dataArray);
          const levels: number[] = [];
          for (let i = 0; i < bufferLength; i++) {
            levels.push(dataArray[i] / 255);
          }
          setAudioLevel(levels);
          
          animationRef.current = requestAnimationFrame(updateLevels);
        };

        updateLevels();
      } catch (err) {
        console.error("Failed to access microphone for visualization:", err);
      }
    };

    initAudio();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isListening]);

  // Handle command display
  useEffect(() => {
    if (lastCommand) {
      setDisplayedCommand(lastCommand);
      setShowCommand(true);
      
      const timer = setTimeout(() => {
        setShowCommand(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [lastCommand]);

  if (!isListening && !showCommand) return null;

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50">
      {/* Main indicator container */}
      <div className="relative">
        {/* Listening indicator */}
        {isListening && (
          <div className="jarvis-panel p-4 backdrop-blur-md animate-fade-in">
            <div className="flex items-center gap-4">
              {/* Mic icon with pulse */}
              <div className="relative">
                <div className="absolute inset-0 bg-primary/30 rounded-full animate-ping" />
                <div className="relative w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center border border-primary/50">
                  <Mic className="w-5 h-5 text-primary" />
                </div>
              </div>

              {/* Waveform visualization */}
              <div className="flex items-center gap-0.5 h-10">
                {audioLevel.slice(0, 24).map((level, i) => (
                  <div
                    key={i}
                    className="w-1 bg-primary rounded-full transition-all duration-75"
                    style={{
                      height: `${Math.max(4, level * 40)}px`,
                      opacity: 0.4 + level * 0.6,
                    }}
                  />
                ))}
              </div>

              {/* Status text */}
              <div className="text-xs">
                <p className="text-primary font-orbitron uppercase tracking-wider">
                  Listening...
                </p>
                <p className="text-muted-foreground text-[10px]">
                  Say a command
                </p>
              </div>
            </div>

            {/* Voice command hints */}
            <div className="mt-3 pt-3 border-t border-border/50">
              <div className="flex flex-wrap gap-1.5">
                {["combat mode", "stealth mode", "minimal mode", "show diagnostics"].map((hint) => (
                  <span
                    key={hint}
                    className="px-2 py-0.5 text-[10px] bg-muted/50 rounded text-muted-foreground font-mono"
                  >
                    "{hint}"
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Command recognized feedback */}
        {showCommand && displayedCommand && (
          <div
            className={`jarvis-panel p-4 backdrop-blur-md animate-scale-in ${
              isListening ? "mt-2" : ""
            }`}
          >
            <div className="flex items-center gap-3">
              {/* Success/Processing indicator */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  confidence > 0.5
                    ? "bg-green-500/20 border border-green-500/50"
                    : "bg-yellow-500/20 border border-yellow-500/50"
                }`}
              >
                {confidence > 0.5 ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Volume2 className="w-4 h-4 text-yellow-500" />
                )}
              </div>

              {/* Command text */}
              <div className="flex-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  {confidence > 0.5 ? "Command Recognized" : "Processing..."}
                </p>
                <p className="text-sm text-primary font-mono">
                  "{displayedCommand}"
                </p>
              </div>

              {/* Confidence bar */}
              <div className="w-16">
                <div className="text-[10px] text-muted-foreground text-right mb-1">
                  {(confidence * 100).toFixed(0)}%
                </div>
                <div className="h-1 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      confidence > 0.7
                        ? "bg-green-500"
                        : confidence > 0.5
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                    style={{ width: `${confidence * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Corner decorations */}
        <div className="absolute -top-1 -left-1 w-2 h-2 border-t border-l border-primary/60" />
        <div className="absolute -top-1 -right-1 w-2 h-2 border-t border-r border-primary/60" />
        <div className="absolute -bottom-1 -left-1 w-2 h-2 border-b border-l border-primary/60" />
        <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b border-r border-primary/60" />
      </div>
    </div>
  );
};

export default VoiceCommandIndicator;
