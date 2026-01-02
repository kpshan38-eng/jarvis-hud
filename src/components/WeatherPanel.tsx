import { CloudSun, Thermometer, Droplets, Wind, Eye, Sun, Moon, RefreshCw, MapPin, Cloud, CloudRain, CloudSnow, Zap } from "lucide-react";
import { useWeather } from "@/hooks/useWeather";
import { useState, useEffect } from "react";

interface WeatherPanelProps {
  delay?: number;
}

const getWeatherIcon = (condition: string) => {
  const lowerCondition = condition.toLowerCase();
  if (lowerCondition.includes("rain") || lowerCondition.includes("drizzle")) {
    return <CloudRain className="w-8 h-8 text-blue-400" />;
  }
  if (lowerCondition.includes("snow")) {
    return <CloudSnow className="w-8 h-8 text-blue-200" />;
  }
  if (lowerCondition.includes("thunder") || lowerCondition.includes("storm")) {
    return <Zap className="w-8 h-8 text-yellow-400" />;
  }
  if (lowerCondition.includes("cloud") || lowerCondition.includes("overcast")) {
    return <Cloud className="w-8 h-8 text-gray-400" />;
  }
  if (lowerCondition.includes("clear") || lowerCondition.includes("sunny")) {
    return <Sun className="w-8 h-8 text-yellow-400" />;
  }
  return <CloudSun className="w-8 h-8 text-primary" />;
};

const WeatherPanel = ({ delay = 0 }: WeatherPanelProps) => {
  const { weather, isLoading, lastUpdated, refetch } = useWeather("Malappuram", "IN");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div 
      className={`jarvis-panel p-4 transition-all duration-700 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <h3 className="font-orbitron text-xs tracking-wider text-primary uppercase jarvis-glow">
            Weather Intel
          </h3>
        </div>
        <button 
          onClick={refetch}
          className="p-1 text-muted-foreground hover:text-primary transition-colors"
          title="Refresh weather"
        >
          <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {weather && (
        <>
          {/* Main weather display */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {getWeatherIcon(weather.condition)}
              <div>
                <div className="text-3xl font-orbitron text-primary jarvis-glow">
                  {weather.temperature}°C
                </div>
                {weather.feelsLike && (
                  <div className="text-xs text-muted-foreground">
                    Feels like {weather.feelsLike}°C
                  </div>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-primary">{weather.condition}</div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                <MapPin className="w-3 h-3" />
                {weather.location.city}
              </div>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <Droplets className="w-4 h-4 text-blue-400" />
              <div>
                <div className="text-xs text-muted-foreground">Humidity</div>
                <div className="text-sm text-primary font-mono">{weather.humidity}%</div>
              </div>
            </div>
            {weather.windSpeed !== undefined && (
              <div className="flex items-center gap-2">
                <Wind className="w-4 h-4 text-cyan-400" />
                <div>
                  <div className="text-xs text-muted-foreground">Wind</div>
                  <div className="text-sm text-primary font-mono">{weather.windSpeed} km/h</div>
                </div>
              </div>
            )}
            {weather.visibility !== undefined && (
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-purple-400" />
                <div>
                  <div className="text-xs text-muted-foreground">Visibility</div>
                  <div className="text-sm text-primary font-mono">{weather.visibility} km</div>
                </div>
              </div>
            )}
            {weather.uvIndex !== undefined && (
              <div className="flex items-center gap-2">
                <Sun className="w-4 h-4 text-yellow-400" />
                <div>
                  <div className="text-xs text-muted-foreground">UV Index</div>
                  <div className="text-sm text-primary font-mono">{weather.uvIndex}</div>
                </div>
              </div>
            )}
          </div>

          {/* Astronomy */}
          {weather.astronomy && (
            <div className="flex justify-between mt-4 pt-3 border-t border-border/50">
              <div className="flex items-center gap-2">
                <Sun className="w-3 h-3 text-yellow-500" />
                <span className="text-xs text-muted-foreground">↑ {weather.astronomy.sunrise}</span>
              </div>
              <div className="flex items-center gap-2">
                <Moon className="w-3 h-3 text-blue-300" />
                <span className="text-xs text-muted-foreground">↓ {weather.astronomy.sunset}</span>
              </div>
            </div>
          )}

          {/* Last updated */}
          {lastUpdated && (
            <div className="text-[10px] text-muted-foreground/50 mt-3 text-right">
              Updated: {lastUpdated.toLocaleTimeString()}
            </div>
          )}
        </>
      )}

      {/* Corner decorations */}
      <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-primary/60" />
      <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-primary/60" />
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-primary/60" />
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-primary/60" />
    </div>
  );
};

export default WeatherPanel;
