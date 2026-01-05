import { useState, useEffect } from "react";
import { X, Palette, RotateCcw, Save, Sparkles } from "lucide-react";
import { SuitTheme } from "./SuitSelector";

interface ThemeCustomizerProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyTheme: (theme: SuitTheme) => void;
  currentTheme: SuitTheme;
}

interface CustomColors {
  primary: string;
  secondary: string;
  accent: string;
  glow: string;
}

const presetPalettes = [
  { name: "Ocean", primary: "190 100% 50%", secondary: "200 100% 40%", accent: "180 100% 45%", glow: "0 200 255" },
  { name: "Sunset", primary: "25 100% 55%", secondary: "15 100% 45%", accent: "35 100% 50%", glow: "255 150 50" },
  { name: "Aurora", primary: "150 80% 50%", secondary: "180 70% 45%", accent: "120 90% 45%", glow: "100 255 150" },
  { name: "Neon", primary: "300 100% 60%", secondary: "280 100% 50%", accent: "320 100% 55%", glow: "255 100 255" },
  { name: "Matrix", primary: "120 100% 45%", secondary: "140 90% 35%", accent: "100 100% 50%", glow: "50 255 50" },
  { name: "Ember", primary: "0 80% 55%", secondary: "20 90% 45%", accent: "10 100% 60%", glow: "255 100 50" },
];

const ThemeCustomizer = ({ isOpen, onClose, onApplyTheme, currentTheme }: ThemeCustomizerProps) => {
  const [colors, setColors] = useState<CustomColors>({
    primary: "190 100% 50%",
    secondary: "200 100% 40%",
    accent: "190 100% 45%",
    glow: "0 212 255",
  });
  const [themeName, setThemeName] = useState("Custom Theme");
  const [previewActive, setPreviewActive] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setColors({
        primary: currentTheme.colors.primary,
        secondary: currentTheme.colors.secondary,
        accent: currentTheme.colors.accent,
        glow: currentTheme.colors.glow,
      });
    }
  }, [isOpen, currentTheme]);

  // Apply preview colors
  useEffect(() => {
    if (previewActive && isOpen) {
      const root = document.documentElement;
      root.style.setProperty('--primary', colors.primary);
      root.style.setProperty('--secondary', colors.secondary);
      root.style.setProperty('--accent', colors.accent);
      root.style.setProperty('--jarvis-glow', colors.glow);
    }
  }, [colors, previewActive, isOpen]);

  const handleClose = () => {
    // Restore original theme
    const root = document.documentElement;
    root.style.setProperty('--primary', currentTheme.colors.primary);
    root.style.setProperty('--secondary', currentTheme.colors.secondary);
    root.style.setProperty('--accent', currentTheme.colors.accent);
    root.style.setProperty('--jarvis-glow', currentTheme.colors.glow);
    onClose();
  };

  const handleApply = () => {
    const customTheme: SuitTheme = {
      id: `custom-${Date.now()}`,
      name: themeName,
      mark: "C",
      description: "Your custom color scheme",
      colors: { ...colors },
      arcReactorStyle: "classic",
    };
    onApplyTheme(customTheme);
    onClose();
  };

  const handlePresetApply = (preset: typeof presetPalettes[0]) => {
    setColors({
      primary: preset.primary,
      secondary: preset.secondary,
      accent: preset.accent,
      glow: preset.glow,
    });
    setThemeName(preset.name);
  };

  const handleReset = () => {
    setColors({
      primary: currentTheme.colors.primary,
      secondary: currentTheme.colors.secondary,
      accent: currentTheme.colors.accent,
      glow: currentTheme.colors.glow,
    });
    setThemeName("Custom Theme");
  };

  // Convert HSL string to hex for input
  const hslToHex = (hsl: string): string => {
    const [h, s, l] = hsl.split(' ').map(v => parseFloat(v));
    const sNorm = s / 100;
    const lNorm = l / 100;
    const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = lNorm - c / 2;
    let r = 0, g = 0, b = 0;
    if (h >= 0 && h < 60) { r = c; g = x; b = 0; }
    else if (h >= 60 && h < 120) { r = x; g = c; b = 0; }
    else if (h >= 120 && h < 180) { r = 0; g = c; b = x; }
    else if (h >= 180 && h < 240) { r = 0; g = x; b = c; }
    else if (h >= 240 && h < 300) { r = x; g = 0; b = c; }
    else { r = c; g = 0; b = x; }
    const toHex = (n: number) => Math.round((n + m) * 255).toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };

  // Convert hex to HSL string
  const hexToHsl = (hex: string): string => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) * 60; break;
        case g: h = ((b - r) / d + 2) * 60; break;
        case b: h = ((r - g) / d + 4) * 60; break;
      }
    }
    return `${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/90 backdrop-blur-sm" onClick={handleClose} />
      
      <div className="relative w-full max-w-lg jarvis-panel p-6 animate-fade-in-up">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-primary" />
            <h2 className="font-orbitron text-lg text-primary jarvis-glow">Theme Customizer</h2>
          </div>
          <button onClick={handleClose} className="p-1 hover:bg-muted rounded transition-colors">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Theme Name */}
        <div className="mb-4">
          <label className="text-xs text-muted-foreground mb-1 block">Theme Name</label>
          <input
            type="text"
            value={themeName}
            onChange={(e) => setThemeName(e.target.value)}
            className="w-full bg-muted/50 border border-border rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
          />
        </div>

        {/* Color Pickers */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {[
            { key: 'primary', label: 'Primary' },
            { key: 'secondary', label: 'Secondary' },
            { key: 'accent', label: 'Accent' },
          ].map(({ key, label }) => (
            <div key={key} className="space-y-1">
              <label className="text-xs text-muted-foreground">{label}</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={hslToHex(colors[key as keyof CustomColors])}
                  onChange={(e) => setColors(prev => ({ ...prev, [key]: hexToHsl(e.target.value) }))}
                  className="w-10 h-10 rounded cursor-pointer border border-border"
                />
                <div
                  className="flex-1 h-10 rounded border border-border"
                  style={{ backgroundColor: `hsl(${colors[key as keyof CustomColors]})` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Preset Palettes */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <label className="text-xs text-muted-foreground">Preset Palettes</label>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {presetPalettes.map((preset) => (
              <button
                key={preset.name}
                onClick={() => handlePresetApply(preset)}
                className="p-2 border border-border rounded hover:border-primary transition-colors group"
              >
                <div className="flex gap-1 mb-1">
                  <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: `hsl(${preset.primary})` }} />
                  <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: `hsl(${preset.secondary})` }} />
                  <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: `hsl(${preset.accent})` }} />
                </div>
                <span className="text-[10px] text-muted-foreground group-hover:text-foreground">{preset.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Preview Toggle */}
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => setPreviewActive(!previewActive)}
            className={`px-3 py-1.5 text-xs border rounded transition-all ${
              previewActive 
                ? 'border-primary bg-primary/20 text-primary' 
                : 'border-border text-muted-foreground hover:border-primary'
            }`}
          >
            {previewActive ? 'Preview Active' : 'Enable Preview'}
          </button>
          <span className="text-[10px] text-muted-foreground">See changes in real-time</span>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-1 px-3 py-2 text-xs border border-border rounded hover:border-muted-foreground transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
          <button
            onClick={handleApply}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs bg-primary/20 border border-primary text-primary rounded hover:bg-primary/30 transition-colors"
          >
            <Save className="w-3 h-3" />
            Apply Theme
          </button>
        </div>

        {/* Corner decorations */}
        <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-primary" />
        <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-primary" />
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-primary" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-primary" />
      </div>
    </div>
  );
};

export default ThemeCustomizer;
