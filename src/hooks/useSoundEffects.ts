import { useCallback, useRef, useEffect } from "react";

type SoundType = 
  | "click" 
  | "toggle" 
  | "notification" 
  | "threat" 
  | "success" 
  | "error" 
  | "mode-switch" 
  | "startup";

// Web Audio API-based sound effects
const createOscillatorSound = (
  ctx: AudioContext,
  frequency: number,
  duration: number,
  type: OscillatorType = "sine",
  gain: number = 0.1
) => {
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();
  
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
  
  gainNode.gain.setValueAtTime(gain, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
  
  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);
  
  oscillator.start();
  oscillator.stop(ctx.currentTime + duration);
};

const soundDefinitions: Record<SoundType, (ctx: AudioContext) => void> = {
  click: (ctx) => {
    createOscillatorSound(ctx, 800, 0.05, "square", 0.05);
  },
  toggle: (ctx) => {
    createOscillatorSound(ctx, 600, 0.08, "sine", 0.08);
    setTimeout(() => createOscillatorSound(ctx, 900, 0.08, "sine", 0.06), 50);
  },
  notification: (ctx) => {
    createOscillatorSound(ctx, 523, 0.15, "sine", 0.1);
    setTimeout(() => createOscillatorSound(ctx, 659, 0.15, "sine", 0.08), 100);
    setTimeout(() => createOscillatorSound(ctx, 784, 0.2, "sine", 0.06), 200);
  },
  threat: (ctx) => {
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        createOscillatorSound(ctx, 440, 0.15, "sawtooth", 0.12);
      }, i * 200);
    }
  },
  success: (ctx) => {
    createOscillatorSound(ctx, 523, 0.12, "sine", 0.1);
    setTimeout(() => createOscillatorSound(ctx, 659, 0.12, "sine", 0.08), 80);
    setTimeout(() => createOscillatorSound(ctx, 784, 0.2, "sine", 0.1), 160);
  },
  error: (ctx) => {
    createOscillatorSound(ctx, 200, 0.2, "square", 0.1);
    setTimeout(() => createOscillatorSound(ctx, 150, 0.3, "square", 0.08), 150);
  },
  "mode-switch": (ctx) => {
    createOscillatorSound(ctx, 400, 0.08, "triangle", 0.08);
    setTimeout(() => createOscillatorSound(ctx, 600, 0.08, "triangle", 0.06), 60);
    setTimeout(() => createOscillatorSound(ctx, 800, 0.1, "triangle", 0.04), 120);
  },
  startup: (ctx) => {
    const notes = [261, 329, 392, 523];
    notes.forEach((freq, i) => {
      setTimeout(() => createOscillatorSound(ctx, freq, 0.3, "sine", 0.08 - i * 0.015), i * 150);
    });
  },
};

export const useSoundEffects = (enabled: boolean = true) => {
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    // Initialize audio context on first user interaction
    const initAudio = () => {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
    };

    document.addEventListener("click", initAudio, { once: true });
    document.addEventListener("keydown", initAudio, { once: true });

    return () => {
      document.removeEventListener("click", initAudio);
      document.removeEventListener("keydown", initAudio);
    };
  }, []);

  const playSound = useCallback(
    (type: SoundType) => {
      if (!enabled) return;

      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      const ctx = audioContextRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      try {
        soundDefinitions[type](ctx);
      } catch (error) {
        console.error("Error playing sound:", error);
      }
    },
    [enabled]
  );

  return { playSound };
};
