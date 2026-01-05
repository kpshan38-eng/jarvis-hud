import { useCallback, useRef, useEffect } from "react";
import { ThreatAlert } from "@/components/ThreatNotification";

interface UseVoiceAnnouncerOptions {
  enabled: boolean;
  speechRate?: number;
}

export const useVoiceAnnouncer = ({ enabled, speechRate = 1 }: UseVoiceAnnouncerOptions) => {
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      synthRef.current = window.speechSynthesis;
      
      const loadVoices = () => {
        const voices = synthRef.current?.getVoices() || [];
        // Prefer British English voice for J.A.R.V.I.S. style
        voiceRef.current = voices.find(v => 
          v.lang.includes('en-GB') || v.name.includes('British')
        ) || voices.find(v => v.lang.includes('en')) || voices[0];
      };

      loadVoices();
      synthRef.current.onvoiceschanged = loadVoices;
    }
  }, []);

  const speak = useCallback((text: string, priority: boolean = false) => {
    if (!enabled || !synthRef.current) return;

    if (priority) {
      synthRef.current.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = voiceRef.current;
    utterance.rate = speechRate;
    utterance.pitch = 1;
    utterance.volume = 0.8;

    synthRef.current.speak(utterance);
  }, [enabled, speechRate]);

  const announceThreat = useCallback((alert: ThreatAlert) => {
    const levelText = alert.level === 'high' ? 'critical' : alert.level;
    const message = `Warning. ${levelText} level ${alert.type} threat detected. ${alert.name}. Recommend immediate attention.`;
    speak(message, alert.level === 'high');
  }, [speak]);

  const announceStatus = useCallback((status: string) => {
    speak(status);
  }, [speak]);

  const announceSystemStart = useCallback(() => {
    speak("J.A.R.V.I.S. online. All systems operational. Good day, sir.", true);
  }, [speak]);

  const announceModeChange = useCallback((mode: string) => {
    const modeMessages: Record<string, string> = {
      combat: "Combat mode activated. Weapons systems online.",
      stealth: "Stealth mode engaged. Reducing power signature.",
      "power-save": "Power save mode enabled. Non-essential systems offline.",
      diagnostics: "Running full system diagnostics.",
    };
    speak(modeMessages[mode] || `${mode} mode activated.`);
  }, [speak]);

  const stop = useCallback(() => {
    synthRef.current?.cancel();
  }, []);

  return {
    speak,
    announceThreat,
    announceStatus,
    announceSystemStart,
    announceModeChange,
    stop,
  };
};
