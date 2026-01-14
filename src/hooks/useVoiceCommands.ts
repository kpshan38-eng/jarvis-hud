import { useCallback, useEffect, useRef, useState, useMemo } from "react";

interface VoiceCommand {
  patterns: string[];
  action: () => void;
  description: string;
}

interface UseVoiceCommandsProps {
  enabled: boolean;
  onModeChange?: (mode: "combat" | "stealth" | "power-save" | "diagnostics") => void;
  onToggleDiagnostics?: () => void;
  onToggleFullscreen?: () => void;
  onToggleMinimalMode?: () => void;
  onToggleSettings?: () => void;
  onSuitChange?: (suitName: string) => void;
  onCommand?: (command: string, response: string) => void;
}

export const useVoiceCommands = ({
  enabled,
  onModeChange,
  onToggleDiagnostics,
  onToggleFullscreen,
  onToggleMinimalMode,
  onToggleSettings,
  onSuitChange,
  onCommand,
}: UseVoiceCommandsProps) => {
  const [isListening, setIsListening] = useState(false);
  const [lastCommand, setLastCommand] = useState<string | null>(null);
  const [confidence, setConfidence] = useState(0);
  const recognitionRef = useRef<InstanceType<typeof window.SpeechRecognition> | null>(null);
  const restartTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isSupported =
    typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  const commands = useMemo<VoiceCommand[]>(() => [
    // Mode commands
    {
      patterns: ["activate combat mode", "combat mode", "engage combat", "battle mode"],
      action: () => onModeChange?.("combat"),
      description: "Activate combat mode",
    },
    {
      patterns: ["activate stealth mode", "stealth mode", "go dark", "engage stealth"],
      action: () => onModeChange?.("stealth"),
      description: "Activate stealth mode",
    },
    {
      patterns: ["activate power save", "power save mode", "low power", "conserve power"],
      action: () => onModeChange?.("power-save"),
      description: "Activate power-save mode",
    },
    // Diagnostics
    {
      patterns: ["show diagnostics", "open diagnostics", "run diagnostics", "system check"],
      action: () => onToggleDiagnostics?.(),
      description: "Open diagnostics panel",
    },
    // Fullscreen
    {
      patterns: ["full screen", "fullscreen", "maximize", "go fullscreen"],
      action: () => onToggleFullscreen?.(),
      description: "Toggle fullscreen mode",
    },
    // Minimal mode
    {
      patterns: ["minimal mode", "clean interface", "hide panels", "minimal hud", "immersive mode"],
      action: () => onToggleMinimalMode?.(),
      description: "Toggle minimal HUD mode",
    },
    {
      patterns: ["show panels", "full interface", "exit minimal", "show everything"],
      action: () => onToggleMinimalMode?.(),
      description: "Exit minimal mode",
    },
    // Settings
    {
      patterns: ["open settings", "show settings", "configuration", "preferences"],
      action: () => onToggleSettings?.(),
      description: "Open settings panel",
    },
    // Suit changes
    {
      patterns: ["mark 3", "mark three", "mark iii"],
      action: () => onSuitChange?.("mark-iii"),
      description: "Switch to Mark III suit",
    },
    {
      patterns: ["mark 6", "mark six", "mark vi"],
      action: () => onSuitChange?.("mark-vi"),
      description: "Switch to Mark VI suit",
    },
    {
      patterns: ["mark 42", "mark forty two", "mark xlii"],
      action: () => onSuitChange?.("mark-xlii"),
      description: "Switch to Mark XLII suit",
    },
    {
      patterns: ["mark 45", "mark forty five", "mark xlv"],
      action: () => onSuitChange?.("mark-xlv"),
      description: "Switch to Mark XLV suit",
    },
    {
      patterns: ["mark 50", "mark fifty", "mark l", "bleeding edge", "nanotech"],
      action: () => onSuitChange?.("mark-l"),
      description: "Switch to Mark L suit",
    },
    {
      patterns: ["mark 85", "mark eighty five", "mark lxxxv", "endgame suit"],
      action: () => onSuitChange?.("mark-lxxxv"),
      description: "Switch to Mark LXXXV suit",
    },
    {
      patterns: ["hulkbuster", "veronica", "anti hulk"],
      action: () => onSuitChange?.("hulkbuster"),
      description: "Switch to Hulkbuster suit",
    },
    {
      patterns: ["iron spider", "spider suit", "peter's suit"],
      action: () => onSuitChange?.("iron-spider"),
      description: "Switch to Iron Spider suit",
    },
    {
      patterns: ["rescue", "pepper's suit", "rescue armor"],
      action: () => onSuitChange?.("rescue"),
      description: "Switch to Rescue suit",
    },
    {
      patterns: ["stealth suit", "night ops", "black suit"],
      action: () => onSuitChange?.("stealth"),
      description: "Switch to Stealth suit",
    },
    {
      patterns: ["war machine", "rhodey", "iron patriot"],
      action: () => onSuitChange?.("war-machine"),
      description: "Switch to War Machine suit",
    },
    // System commands
    {
      patterns: ["jarvis status", "system status", "how are you"],
      action: () =>
        onCommand?.("jarvis status", "All systems operational, sir. Running at optimal efficiency."),
      description: "Check system status",
    },
    {
      patterns: ["good morning jarvis", "hello jarvis", "hey jarvis"],
      action: () =>
        onCommand?.(
          "greeting",
          "Good day, sir. All systems are online and ready to assist you."
        ),
      description: "Greet JARVIS",
    },
  ], [onModeChange, onToggleDiagnostics, onToggleFullscreen, onToggleMinimalMode, onToggleSettings, onSuitChange, onCommand]);

  const findMatchingCommand = useCallback(
    (transcript: string): VoiceCommand | null => {
      const normalized = transcript.toLowerCase().trim();
      
      for (const command of commands) {
        for (const pattern of command.patterns) {
          if (normalized.includes(pattern)) {
            return command;
          }
        }
      }
      return null;
    },
    [commands]
  );

  const startListening = useCallback(() => {
    if (!recognitionRef.current || isListening || !enabled) return;
    
    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch (e) {
      console.error("Failed to start voice commands:", e);
    }
  }, [isListening, enabled]);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;
    recognitionRef.current.stop();
    setIsListening(false);
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
    }
  }, []);

  useEffect(() => {
    if (!isSupported || !enabled) return;

    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) return;

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      const last = event.results.length - 1;
      const transcript = event.results[last][0].transcript;
      const conf = event.results[last][0].confidence;
      
      setConfidence(conf);
      setLastCommand(transcript);

      const matchedCommand = findMatchingCommand(transcript);
      if (matchedCommand && conf > 0.5) {
        matchedCommand.action();
        onCommand?.(transcript, `Executing: ${matchedCommand.description}`);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      // Auto-restart if still enabled
      if (enabled) {
        restartTimeoutRef.current = setTimeout(() => {
          if (enabled && recognitionRef.current) {
            try {
              recognitionRef.current.start();
              setIsListening(true);
            } catch (e) {
              // Already started or other error
            }
          }
        }, 100);
      }
    };

    recognition.onerror = (event) => {
      if (event.error !== "aborted" && event.error !== "no-speech") {
        console.error("Voice command error:", event.error);
      }
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    // Auto-start if enabled
    if (enabled) {
      try {
        recognition.start();
      } catch (e) {
        // Already started
      }
    }

    return () => {
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
      }
      recognition.abort();
    };
  }, [isSupported, enabled, findMatchingCommand, onCommand]);

  // Handle enable/disable changes
  useEffect(() => {
    if (enabled && isSupported && recognitionRef.current && !isListening) {
      startListening();
    } else if (!enabled && isListening) {
      stopListening();
    }
  }, [enabled, isSupported, isListening, startListening, stopListening]);

  return {
    isListening,
    isSupported,
    lastCommand,
    confidence,
    startListening,
    stopListening,
    availableCommands: commands.map((c) => ({
      patterns: c.patterns,
      description: c.description,
    })),
  };
};
