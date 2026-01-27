import { useState, useEffect, useCallback } from "react";
import { Mic, MicOff, CheckCircle2, XCircle, Volume2, ChevronRight, RotateCcw, Trophy, Target } from "lucide-react";

interface TrainingStep {
  id: string;
  category: string;
  command: string;
  patterns: string[];
  description: string;
  tip: string;
}

const trainingSteps: TrainingStep[] = [
  {
    id: "combat-mode",
    category: "Mode Commands",
    command: "Activate Combat Mode",
    patterns: ["activate combat mode", "combat mode", "engage combat"],
    description: "Switches to combat mode with enhanced targeting systems.",
    tip: "Speak clearly and say 'Activate combat mode' or just 'Combat mode'",
  },
  {
    id: "stealth-mode",
    category: "Mode Commands",
    command: "Activate Stealth Mode",
    patterns: ["activate stealth mode", "stealth mode", "go dark"],
    description: "Engages stealth systems for covert operations.",
    tip: "Try saying 'Go dark' for a quick activation",
  },
  {
    id: "power-save",
    category: "Mode Commands",
    command: "Power Save Mode",
    patterns: ["power save mode", "low power", "conserve power"],
    description: "Reduces power consumption for extended operation.",
    tip: "Say 'Power save mode' or 'Conserve power'",
  },
  {
    id: "diagnostics",
    category: "System Commands",
    command: "Show Diagnostics",
    patterns: ["show diagnostics", "run diagnostics", "system check"],
    description: "Opens the full diagnostics panel.",
    tip: "Try 'Show diagnostics' or 'System check'",
  },
  {
    id: "fullscreen",
    category: "Interface Commands",
    command: "Fullscreen",
    patterns: ["fullscreen", "full screen", "maximize"],
    description: "Toggles fullscreen mode for immersive experience.",
    tip: "Simply say 'Fullscreen' or 'Maximize'",
  },
  {
    id: "minimal-mode",
    category: "Interface Commands",
    command: "Minimal Mode",
    patterns: ["minimal mode", "minimal hud", "hide panels"],
    description: "Activates minimal HUD for clean interface.",
    tip: "Say 'Minimal mode' or 'Hide panels'",
  },
  {
    id: "suit-change",
    category: "Suit Commands",
    command: "Mark 50",
    patterns: ["mark 50", "mark fifty", "mark l", "bleeding edge"],
    description: "Deploys the Mark L Bleeding Edge nanotech suit.",
    tip: "Say 'Mark 50', 'Mark L', or 'Bleeding edge'",
  },
  {
    id: "greeting",
    category: "Interaction",
    command: "Hello JARVIS",
    patterns: ["hello jarvis", "hey jarvis", "good morning jarvis"],
    description: "Greet your AI assistant for a status update.",
    tip: "Try 'Hello JARVIS' or 'Hey JARVIS'",
  },
];

interface VoiceCommandTrainingProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

type SpeechRecognitionType = typeof window.SpeechRecognition;

const VoiceCommandTraining = ({ isOpen, onClose, onComplete }: VoiceCommandTrainingProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [lastTranscript, setLastTranscript] = useState<string | null>(null);
  const [stepStatus, setStepStatus] = useState<Record<string, "pending" | "success" | "failed">>({});
  const [isPlaying, setIsPlaying] = useState(false);
  const [recognition, setRecognition] = useState<InstanceType<SpeechRecognitionType> | null>(null);

  const currentTraining = trainingSteps[currentStep];
  const completedCount = Object.values(stepStatus).filter(s => s === "success").length;
  const progress = (completedCount / trainingSteps.length) * 100;

  // Initialize speech recognition
  useEffect(() => {
    if (!isOpen) return;

    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognitionAPI) {
      const rec = new SpeechRecognitionAPI();
      rec.continuous = false;
      rec.interimResults = true;
      rec.lang = "en-US";
      setRecognition(rec);
    }
  }, [isOpen]);

  const playCommandAudio = useCallback((text: string) => {
    if ("speechSynthesis" in window) {
      setIsPlaying(true);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 0.8;
      utterance.onend = () => setIsPlaying(false);
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  const checkMatch = useCallback((transcript: string, patterns: string[]): boolean => {
    const normalized = transcript.toLowerCase().trim();
    return patterns.some(pattern => normalized.includes(pattern.toLowerCase()));
  }, []);

  const startListening = useCallback(() => {
    if (!recognition) return;

    setIsListening(true);
    setLastTranscript(null);

    recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript;
      setLastTranscript(transcript);

      if (event.results[event.results.length - 1].isFinal) {
        const matched = checkMatch(transcript, currentTraining.patterns);
        setStepStatus(prev => ({
          ...prev,
          [currentTraining.id]: matched ? "success" : "failed"
        }));
        setIsListening(false);
      }
    };

    recognition.onerror = () => {
      setIsListening(false);
      setStepStatus(prev => ({ ...prev, [currentTraining.id]: "failed" }));
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    try {
      recognition.start();
    } catch (e) {
      console.error("Recognition error:", e);
    }
  }, [recognition, currentTraining, checkMatch]);

  const handleNext = () => {
    if (currentStep < trainingSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
      setLastTranscript(null);
    } else if (completedCount === trainingSteps.length) {
      onComplete?.();
      onClose();
    }
  };

  const handleRetry = () => {
    setStepStatus(prev => ({ ...prev, [currentTraining.id]: "pending" }));
    setLastTranscript(null);
  };

  const handleSkip = () => {
    handleNext();
  };

  const handleReset = () => {
    setCurrentStep(0);
    setStepStatus({});
    setLastTranscript(null);
  };

  if (!isOpen) return null;

  const status = stepStatus[currentTraining.id] || "pending";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl mx-4">
        {/* Main panel */}
        <div className="jarvis-panel p-6 relative overflow-hidden">
          {/* Background effect */}
          <div 
            className="absolute inset-0 opacity-10"
            style={{
              background: "radial-gradient(circle at center, hsl(var(--primary)) 0%, transparent 70%)"
            }}
          />

          {/* Header */}
          <div className="relative flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center">
                <Target className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="font-orbitron text-lg text-primary tracking-wider">
                  Voice Command Training
                </h2>
                <p className="text-xs text-muted-foreground">
                  Step {currentStep + 1} of {trainingSteps.length}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Progress bar */}
          <div className="relative h-2 bg-muted rounded-full mb-6 overflow-hidden">
            <div 
              className="absolute inset-y-0 left-0 bg-primary transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
            <div className="absolute inset-0 flex">
              {trainingSteps.map((_, i) => (
                <div 
                  key={i}
                  className={`flex-1 border-r border-background/50 last:border-r-0 ${
                    stepStatus[trainingSteps[i].id] === "success" ? "bg-green-500/50" : ""
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Current command training */}
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-primary/60 uppercase tracking-wider">
                {currentTraining.category}
              </span>
            </div>

            <h3 className="font-orbitron text-2xl text-primary mb-2">
              "{currentTraining.command}"
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {currentTraining.description}
            </p>

            {/* Tip box */}
            <div className="bg-primary/5 border border-primary/20 rounded p-3 mb-6">
              <div className="flex items-start gap-2">
                <Volume2 className="w-4 h-4 text-primary mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-primary/80">{currentTraining.tip}</p>
                  <button
                    onClick={() => playCommandAudio(currentTraining.command)}
                    disabled={isPlaying}
                    className="text-xs text-primary hover:underline mt-1 disabled:opacity-50"
                  >
                    {isPlaying ? "Playing..." : "Hear example"}
                  </button>
                </div>
              </div>
            </div>

            {/* Microphone area */}
            <div className="flex flex-col items-center py-6">
              {/* Status feedback */}
              {status === "success" && (
                <div className="flex items-center gap-2 text-green-500 mb-4 animate-scale-in">
                  <CheckCircle2 className="w-6 h-6" />
                  <span className="font-orbitron text-sm">Command Recognized!</span>
                </div>
              )}
              {status === "failed" && (
                <div className="flex items-center gap-2 text-red-500 mb-4 animate-scale-in">
                  <XCircle className="w-6 h-6" />
                  <span className="font-orbitron text-sm">Try again</span>
                </div>
              )}

              {/* Microphone button */}
              <button
                onClick={startListening}
                disabled={isListening || status === "success"}
                className={`relative w-24 h-24 rounded-full border-2 flex items-center justify-center transition-all ${
                  isListening 
                    ? "bg-primary/20 border-primary animate-pulse"
                    : status === "success"
                    ? "bg-green-500/20 border-green-500"
                    : "bg-muted border-muted-foreground/30 hover:border-primary hover:bg-primary/10"
                }`}
              >
                {/* Ripple effect when listening */}
                {isListening && (
                  <>
                    <div className="absolute inset-0 rounded-full border-2 border-primary animate-ping opacity-50" />
                    <div className="absolute inset-[-8px] rounded-full border border-primary/30 animate-pulse" />
                  </>
                )}
                {isListening ? (
                  <Mic className="w-10 h-10 text-primary" />
                ) : status === "success" ? (
                  <CheckCircle2 className="w-10 h-10 text-green-500" />
                ) : (
                  <MicOff className="w-10 h-10 text-muted-foreground" />
                )}
              </button>

              <p className="text-xs text-muted-foreground mt-4">
                {isListening 
                  ? "Listening... speak now" 
                  : status === "success" 
                  ? "Great job! Continue to next command"
                  : "Click to start speaking"}
              </p>

              {/* Transcript display */}
              {lastTranscript && (
                <div className="mt-4 px-4 py-2 bg-muted/50 rounded border border-border">
                  <p className="text-xs text-muted-foreground">You said:</p>
                  <p className="text-sm text-foreground">"{lastTranscript}"</p>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
              <div className="flex gap-2">
                <button
                  onClick={handleRetry}
                  disabled={status === "pending"}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs text-muted-foreground hover:text-primary transition-colors disabled:opacity-50"
                >
                  <RotateCcw className="w-3 h-3" />
                  Retry
                </button>
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  Reset All
                </button>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSkip}
                  className="px-4 py-1.5 text-xs text-muted-foreground hover:text-primary border border-transparent hover:border-primary/50 rounded transition-all"
                >
                  Skip
                </button>
                <button
                  onClick={handleNext}
                  className="flex items-center gap-1 px-4 py-1.5 text-xs bg-primary/20 text-primary border border-primary/50 rounded hover:bg-primary/30 transition-all"
                >
                  {currentStep === trainingSteps.length - 1 ? (
                    <>
                      <Trophy className="w-3 h-3" />
                      Complete
                    </>
                  ) : (
                    <>
                      Next
                      <ChevronRight className="w-3 h-3" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Corner decorations */}
          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary/60" />
          <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary/60" />
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary/60" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary/60" />
        </div>

        {/* Completion celebration */}
        {completedCount === trainingSteps.length && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded animate-fade-in">
            <div className="text-center">
              <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4 animate-bounce" />
              <h3 className="font-orbitron text-xl text-primary mb-2">Training Complete!</h3>
              <p className="text-sm text-muted-foreground">You've mastered all voice commands</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceCommandTraining;
