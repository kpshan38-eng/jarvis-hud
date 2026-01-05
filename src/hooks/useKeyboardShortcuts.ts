import { useEffect, useCallback } from "react";

export interface KeyboardShortcuts {
  toggleVoice?: () => void;
  openDiagnostics?: () => void;
  toggleSettings?: () => void;
  switchMode?: (mode: "combat" | "stealth" | "power-save") => void;
  focusConsole?: () => void;
  toggleHistory?: () => void;
  toggleFullscreen?: () => void;
}

const useKeyboardShortcuts = (shortcuts: KeyboardShortcuts) => {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Ignore if typing in input
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      return;
    }

    const key = e.key.toLowerCase();
    const ctrl = e.ctrlKey || e.metaKey;

    // V - Toggle Voice
    if (key === "v" && !ctrl) {
      e.preventDefault();
      shortcuts.toggleVoice?.();
    }
    
    // D - Open Diagnostics
    if (key === "d" && !ctrl) {
      e.preventDefault();
      shortcuts.openDiagnostics?.();
    }
    
    // S - Open Settings (with Shift to avoid conflict)
    if (key === "s" && e.shiftKey && !ctrl) {
      e.preventDefault();
      shortcuts.toggleSettings?.();
    }
    
    // 1, 2, 3 - Switch Modes
    if (key === "1" && !ctrl) {
      e.preventDefault();
      shortcuts.switchMode?.("combat");
    }
    if (key === "2" && !ctrl) {
      e.preventDefault();
      shortcuts.switchMode?.("stealth");
    }
    if (key === "3" && !ctrl) {
      e.preventDefault();
      shortcuts.switchMode?.("power-save");
    }
    
    // / - Focus Console
    if (key === "/" && !ctrl) {
      e.preventDefault();
      shortcuts.focusConsole?.();
    }
    
    // H - Toggle History
    if (key === "h" && !ctrl) {
      e.preventDefault();
      shortcuts.toggleHistory?.();
    }
    
    // F - Toggle Fullscreen
    if (key === "f" && !ctrl) {
      e.preventDefault();
      shortcuts.toggleFullscreen?.();
    }
    
    // Escape - Close modals (handled by individual components)
  }, [shortcuts]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
};

export default useKeyboardShortcuts;
