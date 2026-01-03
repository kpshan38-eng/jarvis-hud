import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";

export interface SuitTheme {
  id: string;
  name: string;
  mark: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    glow: string;
  };
  arcReactorStyle: "classic" | "triangular" | "circular" | "hexagonal" | "nano";
}

const suits: SuitTheme[] = [
  {
    id: "mark-iii",
    name: "Mark III",
    mark: "III",
    description: "The iconic red and gold. First fully combat-ready suit.",
    colors: {
      primary: "190 100% 50%",
      secondary: "200 100% 40%",
      accent: "190 100% 45%",
      glow: "0 212 255",
    },
    arcReactorStyle: "classic",
  },
  {
    id: "mark-vi",
    name: "Mark VI",
    mark: "VI",
    description: "Triangular arc reactor. Enhanced power output.",
    colors: {
      primary: "210 100% 60%",
      secondary: "220 100% 50%",
      accent: "200 100% 55%",
      glow: "50 150 255",
    },
    arcReactorStyle: "triangular",
  },
  {
    id: "mark-xlii",
    name: "Mark XLII",
    mark: "XLII",
    description: "Autonomous prehensile suit. Gold and crimson.",
    colors: {
      primary: "35 100% 50%",
      secondary: "25 100% 45%",
      accent: "40 100% 55%",
      glow: "255 180 50",
    },
    arcReactorStyle: "circular",
  },
  {
    id: "mark-xlv",
    name: "Mark XLV",
    mark: "XLV",
    description: "Age of Ultron suit. Hexagonal reactor design.",
    colors: {
      primary: "0 85% 55%",
      secondary: "10 80% 45%",
      accent: "350 90% 50%",
      glow: "255 80 80",
    },
    arcReactorStyle: "hexagonal",
  },
  {
    id: "mark-l",
    name: "Mark L",
    mark: "L",
    description: "Bleeding Edge. Nanotech suit with limitless potential.",
    colors: {
      primary: "280 100% 60%",
      secondary: "290 80% 50%",
      accent: "270 100% 65%",
      glow: "180 100 255",
    },
    arcReactorStyle: "nano",
  },
  {
    id: "mark-lxxxv",
    name: "Mark LXXXV",
    mark: "LXXXV",
    description: "Endgame suit. Ultimate nanotech evolution.",
    colors: {
      primary: "160 100% 45%",
      secondary: "170 90% 40%",
      accent: "150 100% 50%",
      glow: "50 255 150",
    },
    arcReactorStyle: "nano",
  },
  {
    id: "hulkbuster",
    name: "Hulkbuster",
    mark: "XLIV",
    description: "Veronica. Heavy-duty anti-Hulk modular armor.",
    colors: {
      primary: "15 90% 50%",
      secondary: "8 85% 40%",
      accent: "20 95% 55%",
      glow: "255 100 50",
    },
    arcReactorStyle: "hexagonal",
  },
  {
    id: "iron-spider",
    name: "Iron Spider",
    mark: "SP",
    description: "Peter Parker's nanotech suit. Waldoes enabled.",
    colors: {
      primary: "0 80% 50%",
      secondary: "220 90% 55%",
      accent: "45 100% 50%",
      glow: "255 50 50",
    },
    arcReactorStyle: "circular",
  },
  {
    id: "rescue",
    name: "Rescue",
    mark: "XLIX",
    description: "Pepper Potts' armor. Defense and rescue operations.",
    colors: {
      primary: "220 70% 60%",
      secondary: "210 60% 50%",
      accent: "45 90% 55%",
      glow: "100 150 255",
    },
    arcReactorStyle: "classic",
  },
  {
    id: "stealth",
    name: "Stealth",
    mark: "VII",
    description: "Night operations. Minimal signature.",
    colors: {
      primary: "220 20% 40%",
      secondary: "210 15% 30%",
      accent: "200 25% 45%",
      glow: "100 120 140",
    },
    arcReactorStyle: "classic",
  },
  {
    id: "war-machine",
    name: "War Machine",
    mark: "II",
    description: "James Rhodes' heavy artillery variant.",
    colors: {
      primary: "0 0% 50%",
      secondary: "0 0% 35%",
      accent: "0 0% 60%",
      glow: "150 150 150",
    },
    arcReactorStyle: "circular",
  },
];

interface SuitSelectorProps {
  currentSuit: SuitTheme;
  onSuitChange: (suit: SuitTheme) => void;
  delay?: number;
}

const SuitSelector = ({ currentSuit, onSuitChange, delay = 0 }: SuitSelectorProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(
    suits.findIndex(s => s.id === currentSuit.id)
  );

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const handlePrevious = () => {
    const newIndex = currentIndex === 0 ? suits.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  const handleNext = () => {
    const newIndex = currentIndex === suits.length - 1 ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  };

  const handleSelect = () => {
    onSuitChange(suits[currentIndex]);
  };

  const previewSuit = suits[currentIndex];
  const isSelected = previewSuit.id === currentSuit.id;

  return (
    <div 
      className={`jarvis-panel p-4 transition-all duration-700 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        <h3 className="font-orbitron text-xs tracking-wider text-primary uppercase jarvis-glow">
          Suit Selection
        </h3>
      </div>

      {/* Suit preview */}
      <div className="relative">
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrevious}
            className="p-2 text-muted-foreground hover:text-primary transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex-1 text-center">
            {/* Mini arc reactor preview */}
            <div 
              className="w-16 h-16 mx-auto rounded-full border-2 flex items-center justify-center mb-3"
              style={{ 
                borderColor: `hsl(${previewSuit.colors.primary})`,
                boxShadow: `0 0 20px rgba(${previewSuit.colors.glow}, 0.5), inset 0 0 15px rgba(${previewSuit.colors.glow}, 0.3)`,
                background: `radial-gradient(circle, rgba(${previewSuit.colors.glow}, 0.3) 0%, transparent 70%)`,
              }}
            >
              <span 
                className="font-orbitron text-lg font-bold"
                style={{ color: `hsl(${previewSuit.colors.primary})` }}
              >
                {previewSuit.mark}
              </span>
            </div>

            <h4 
              className="font-orbitron text-sm tracking-wide"
              style={{ color: `hsl(${previewSuit.colors.primary})` }}
            >
              {previewSuit.name}
            </h4>
            <p className="text-xs text-muted-foreground mt-1 px-4">
              {previewSuit.description}
            </p>
          </div>

          <button
            onClick={handleNext}
            className="p-2 text-muted-foreground hover:text-primary transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Suit dots indicator */}
        <div className="flex justify-center gap-1 mt-4">
          {suits.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`w-2 h-2 rounded-full transition-all ${
                i === currentIndex 
                  ? 'bg-primary scale-125' 
                  : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
              }`}
            />
          ))}
        </div>

        {/* Select button */}
        <button
          onClick={handleSelect}
          disabled={isSelected}
          className={`w-full mt-4 py-2 px-4 rounded text-xs font-orbitron uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
            isSelected
              ? 'bg-primary/20 text-primary border border-primary/50 cursor-default'
              : 'bg-transparent border border-primary/50 text-primary hover:bg-primary/10 hover:border-primary'
          }`}
        >
          {isSelected ? (
            <>
              <Check className="w-3 h-3" />
              Active
            </>
          ) : (
            'Deploy Suit'
          )}
        </button>
      </div>

      {/* Corner decorations */}
      <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-primary/60" />
      <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-primary/60" />
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-primary/60" />
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-primary/60" />
    </div>
  );
};

export { suits };
export default SuitSelector;
