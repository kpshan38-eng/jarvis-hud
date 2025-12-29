import { ReactNode, useEffect, useState } from "react";

interface InfoPanelProps {
  title: string;
  children: ReactNode;
  delay?: number;
  className?: string;
}

const InfoPanel = ({ title, children, delay = 0, className = "" }: InfoPanelProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div 
      className={`jarvis-panel p-4 transition-all duration-700 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      } ${className}`}
    >
      {/* Panel header */}
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border/50">
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        <h3 className="font-orbitron text-xs tracking-wider text-primary uppercase jarvis-glow">
          {title}
        </h3>
      </div>
      
      {/* Panel content */}
      <div className="space-y-2 text-sm">
        {children}
      </div>

      {/* Corner decorations */}
      <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-primary/60" />
      <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-primary/60" />
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-primary/60" />
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-primary/60" />
    </div>
  );
};

export default InfoPanel;
