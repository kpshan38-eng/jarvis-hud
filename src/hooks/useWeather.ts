import { useState, useEffect, useCallback } from "react";

interface WeatherData {
  temperature: number;
  feelsLike?: number;
  humidity: number;
  windSpeed?: number;
  windDirection?: string;
  visibility?: number;
  uvIndex?: number;
  condition: string;
  pressure?: number;
  cloudCover?: number;
  location: {
    city: string;
    region?: string;
    country: string;
  };
  astronomy?: {
    sunrise: string;
    sunset: string;
    moonPhase: string;
  };
  forecast?: Array<{
    date: string;
    maxTemp: number;
    minTemp: number;
    condition: string;
  }>;
}

const WEATHER_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/weather`;

export const useWeather = (city: string = "Malappuram", country: string = "IN") => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchWeather = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(WEATHER_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ city, country }),
      });

      const data = await response.json();
      
      if (data.error && !data.temperature) {
        throw new Error(data.error);
      }

      setWeather(data);
      setLastUpdated(new Date());
    } catch (e) {
      console.error("Weather fetch error:", e);
      setError(e instanceof Error ? e.message : "Failed to fetch weather");
      // Set fallback data
      setWeather({
        temperature: 28,
        humidity: 65,
        condition: "Partly Cloudy",
        location: { city, country },
      });
    } finally {
      setIsLoading(false);
    }
  }, [city, country]);

  useEffect(() => {
    fetchWeather();
    
    // Refresh every 10 minutes
    const interval = setInterval(fetchWeather, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchWeather]);

  return { weather, isLoading, error, lastUpdated, refetch: fetchWeather };
};
