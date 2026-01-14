import { useState, useCallback, useEffect } from "react";
import { SuitTheme } from "@/components/SuitSelector";

interface TransitionState {
  isTransitioning: boolean;
  progress: number;
  fromSuit: SuitTheme | null;
  toSuit: SuitTheme | null;
  phase: "idle" | "dissolve" | "morph" | "resolve";
}

export const useSuitTransition = (duration: number = 1200) => {
  const [transitionState, setTransitionState] = useState<TransitionState>({
    isTransitioning: false,
    progress: 0,
    fromSuit: null,
    toSuit: null,
    phase: "idle",
  });

  const startTransition = useCallback((from: SuitTheme, to: SuitTheme) => {
    if (from.id === to.id) return;

    setTransitionState({
      isTransitioning: true,
      progress: 0,
      fromSuit: from,
      toSuit: to,
      phase: "dissolve",
    });
  }, []);

  useEffect(() => {
    if (!transitionState.isTransitioning) return;

    const phaseDuration = duration / 3;
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const totalProgress = Math.min(elapsed / duration, 1);

      let phase: "dissolve" | "morph" | "resolve" = "dissolve";
      if (totalProgress > 0.66) {
        phase = "resolve";
      } else if (totalProgress > 0.33) {
        phase = "morph";
      }

      setTransitionState((prev) => ({
        ...prev,
        progress: totalProgress,
        phase,
      }));

      if (totalProgress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setTransitionState((prev) => ({
          ...prev,
          isTransitioning: false,
          progress: 0,
          phase: "idle",
        }));
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [transitionState.isTransitioning, duration]);

  // Calculate interpolated colors during transition
  const getInterpolatedColors = useCallback(() => {
    if (!transitionState.isTransitioning || !transitionState.fromSuit || !transitionState.toSuit) {
      return null;
    }

    const { progress, fromSuit, toSuit } = transitionState;
    
    // Parse HSL values
    const parseHSL = (hsl: string) => {
      const parts = hsl.split(" ").map(Number);
      return { h: parts[0], s: parts[1], l: parts[2] };
    };

    const interpolateHSL = (from: string, to: string) => {
      const fromHSL = parseHSL(from);
      const toHSL = parseHSL(to);
      
      // Handle hue wrapping
      let hDiff = toHSL.h - fromHSL.h;
      if (hDiff > 180) hDiff -= 360;
      if (hDiff < -180) hDiff += 360;
      
      const h = fromHSL.h + hDiff * progress;
      const s = fromHSL.s + (toHSL.s - fromHSL.s) * progress;
      const l = fromHSL.l + (toHSL.l - fromHSL.l) * progress;
      
      return `${((h % 360) + 360) % 360} ${s}% ${l}%`;
    };

    const interpolateRGB = (from: string, to: string) => {
      const fromRGB = from.split(" ").map(Number);
      const toRGB = to.split(" ").map(Number);
      
      const r = Math.round(fromRGB[0] + (toRGB[0] - fromRGB[0]) * progress);
      const g = Math.round(fromRGB[1] + (toRGB[1] - fromRGB[1]) * progress);
      const b = Math.round(fromRGB[2] + (toRGB[2] - fromRGB[2]) * progress);
      
      return `${r} ${g} ${b}`;
    };

    return {
      primary: interpolateHSL(fromSuit.colors.primary, toSuit.colors.primary),
      secondary: interpolateHSL(fromSuit.colors.secondary, toSuit.colors.secondary),
      accent: interpolateHSL(fromSuit.colors.accent, toSuit.colors.accent),
      glow: interpolateRGB(fromSuit.colors.glow, toSuit.colors.glow),
    };
  }, [transitionState]);

  return {
    ...transitionState,
    startTransition,
    getInterpolatedColors,
  };
};
