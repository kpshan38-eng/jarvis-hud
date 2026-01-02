import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { city = "Malappuram", country = "IN" } = await req.json().catch(() => ({}));
    
    // Using wttr.in - free weather API, no API key needed
    const weatherUrl = `https://wttr.in/${encodeURIComponent(city)},${country}?format=j1`;
    
    console.log(`Fetching weather for: ${city}, ${country}`);
    
    const response = await fetch(weatherUrl, {
      headers: {
        "User-Agent": "JARVIS-HUD/1.0",
      },
    });

    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }

    const data = await response.json();
    
    const current = data.current_condition?.[0];
    const area = data.nearest_area?.[0];
    
    if (!current) {
      throw new Error("No weather data available");
    }

    const weatherData = {
      temperature: parseInt(current.temp_C),
      feelsLike: parseInt(current.FeelsLikeC),
      humidity: parseInt(current.humidity),
      windSpeed: parseInt(current.windspeedKmph),
      windDirection: current.winddir16Point,
      visibility: parseInt(current.visibility),
      uvIndex: parseInt(current.uvIndex),
      condition: current.weatherDesc?.[0]?.value || "Unknown",
      icon: current.weatherCode,
      pressure: parseInt(current.pressure),
      cloudCover: parseInt(current.cloudcover),
      location: {
        city: area?.areaName?.[0]?.value || city,
        region: area?.region?.[0]?.value || "",
        country: area?.country?.[0]?.value || country,
      },
      astronomy: {
        sunrise: data.weather?.[0]?.astronomy?.[0]?.sunrise || "",
        sunset: data.weather?.[0]?.astronomy?.[0]?.sunset || "",
        moonPhase: data.weather?.[0]?.astronomy?.[0]?.moon_phase || "",
      },
      forecast: data.weather?.slice(0, 3).map((day: any) => ({
        date: day.date,
        maxTemp: parseInt(day.maxtempC),
        minTemp: parseInt(day.mintempC),
        condition: day.hourly?.[4]?.weatherDesc?.[0]?.value || "Unknown",
      })) || [],
    };

    return new Response(JSON.stringify(weatherData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Weather error:", e);
    return new Response(JSON.stringify({ 
      error: e instanceof Error ? e.message : "Failed to fetch weather",
      // Return fallback data
      temperature: 28,
      humidity: 65,
      condition: "Partly Cloudy",
      location: { city: "Malappuram", country: "India" },
    }), {
      status: 200, // Return 200 with fallback data
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
