import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { UserSettings, defaultSettings } from "@/components/SettingsPanel";

export const useUserSettings = () => {
  const { user, isAuthenticated } = useAuth();
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Load settings from database
  useEffect(() => {
    const loadSettings = async () => {
      if (!isAuthenticated || !user) {
        // Load from localStorage for non-authenticated users
        const saved = localStorage.getItem("jarvis-settings");
        if (saved) {
          try {
            setSettings({ ...defaultSettings, ...JSON.parse(saved) });
          } catch (e) {
            console.error("Failed to parse settings from localStorage");
          }
        }
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("user_settings")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setSettings({
            voiceEnabled: data.voice_enabled ?? defaultSettings.voiceEnabled,
            autoSpeak: data.auto_speak ?? defaultSettings.autoSpeak,
            speechRate: data.speech_rate ?? defaultSettings.speechRate,
            showWeather: data.show_weather ?? defaultSettings.showWeather,
            showStocks: data.show_stocks ?? defaultSettings.showStocks,
            showCalendar: data.show_calendar ?? defaultSettings.showCalendar,
            showWorldMap: data.show_world_map ?? defaultSettings.showWorldMap,
            compactMode: data.compact_mode ?? defaultSettings.compactMode,
          });
        } else {
          // Create default settings for new user
          await supabase.from("user_settings").insert({
            user_id: user.id,
          });
        }
      } catch (error) {
        console.error("Error loading settings:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, [user, isAuthenticated]);

  // Save settings to database or localStorage
  const updateSettings = useCallback(
    async (newSettings: UserSettings) => {
      setSettings(newSettings);

      if (!isAuthenticated || !user) {
        // Save to localStorage for non-authenticated users
        localStorage.setItem("jarvis-settings", JSON.stringify(newSettings));
        return;
      }

      setIsSaving(true);
      try {
        const { error } = await supabase
          .from("user_settings")
          .update({
            voice_enabled: newSettings.voiceEnabled,
            auto_speak: newSettings.autoSpeak,
            speech_rate: newSettings.speechRate,
            show_weather: newSettings.showWeather,
            show_stocks: newSettings.showStocks,
            show_calendar: newSettings.showCalendar,
            show_world_map: newSettings.showWorldMap,
            compact_mode: newSettings.compactMode,
          })
          .eq("user_id", user.id);

        if (error) throw error;
      } catch (error) {
        console.error("Error saving settings:", error);
      } finally {
        setIsSaving(false);
      }
    },
    [user, isAuthenticated]
  );

  return {
    settings,
    updateSettings,
    isLoading,
    isSaving,
  };
};
