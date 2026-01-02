import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import InfoPanel from "./InfoPanel";

interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

const StockTicker = ({ delay = 0 }: { delay?: number }) => {
  const [stocks, setStocks] = useState<Stock[]>([
    { symbol: "STRK", name: "Stark Industries", price: 2847.50, change: 45.20, changePercent: 1.61 },
    { symbol: "OSCP", name: "Oscorp", price: 156.80, change: -3.40, changePercent: -2.12 },
    { symbol: "WAYN", name: "Wayne Enterprises", price: 892.30, change: 12.80, changePercent: 1.45 },
    { symbol: "PPRK", name: "Pym Technologies", price: 445.60, change: 0.20, changePercent: 0.04 },
    { symbol: "HMRN", name: "Hammer Industries", price: 78.40, change: -8.90, changePercent: -10.19 },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setStocks(prev => prev.map(stock => {
        const changeAmount = (Math.random() - 0.5) * 10;
        const newPrice = Math.max(1, stock.price + changeAmount);
        const newChange = newPrice - (stock.price - stock.change);
        const newChangePercent = (newChange / (newPrice - newChange)) * 100;
        
        return {
          ...stock,
          price: newPrice,
          change: newChange,
          changePercent: newChangePercent,
        };
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getTrendIcon = (change: number) => {
    if (change > 0.5) return <TrendingUp className="w-3 h-3 text-green-500" />;
    if (change < -0.5) return <TrendingDown className="w-3 h-3 text-red-500" />;
    return <Minus className="w-3 h-3 text-muted-foreground" />;
  };

  const getChangeColor = (change: number) => {
    if (change > 0.5) return "text-green-500";
    if (change < -0.5) return "text-red-500";
    return "text-muted-foreground";
  };

  return (
    <InfoPanel title="Market Watch" delay={delay}>
      <div className="space-y-2">
        {stocks.map((stock) => (
          <div 
            key={stock.symbol} 
            className="flex items-center justify-between py-1.5 border-b border-border/20 last:border-0"
          >
            <div className="flex items-center gap-2">
              {getTrendIcon(stock.change)}
              <div>
                <span className="font-mono text-xs text-primary font-bold">{stock.symbol}</span>
                <span className="text-[10px] text-muted-foreground/60 ml-2 hidden sm:inline">{stock.name}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="font-mono text-xs text-foreground">${stock.price.toFixed(2)}</p>
              <p className={`font-mono text-[10px] ${getChangeColor(stock.change)}`}>
                {stock.change >= 0 ? "+" : ""}{stock.change.toFixed(2)} ({stock.changePercent.toFixed(2)}%)
              </p>
            </div>
          </div>
        ))}
      </div>
      
      {/* Ticker tape animation */}
      <div className="mt-3 overflow-hidden border-t border-border/30 pt-2">
        <div className="flex animate-marquee whitespace-nowrap text-[10px] text-muted-foreground/60">
          {stocks.concat(stocks).map((stock, i) => (
            <span key={i} className="mx-4">
              <span className="text-primary">{stock.symbol}</span>
              <span className={`ml-1 ${getChangeColor(stock.change)}`}>
                {stock.change >= 0 ? "▲" : "▼"} {Math.abs(stock.changePercent).toFixed(2)}%
              </span>
            </span>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
      `}</style>
    </InfoPanel>
  );
};

export default StockTicker;
