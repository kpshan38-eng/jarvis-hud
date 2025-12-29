interface StatLineProps {
  label: string;
  value: string | number;
  highlight?: boolean;
  unit?: string;
}

const StatLine = ({ label, value, highlight = false, unit = "" }: StatLineProps) => {
  return (
    <div className="flex justify-between items-center text-xs">
      <span className="text-muted-foreground uppercase tracking-wide">{label}</span>
      <span className={`font-mono ${highlight ? 'text-primary jarvis-glow' : 'text-foreground'}`}>
        {value}{unit}
      </span>
    </div>
  );
};

export default StatLine;
