import { useState, useEffect } from "react";
import { Settings, Volume2, VolumeX, Layout, Palette, Keyboard, X, Bell } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onSettingsChange: (settings: UserSettings) => void;
}

export interface UserSettings {
  voiceEnabled: boolean;
  autoSpeak: boolean;
  speechRate: number;
  showWeather: boolean;
  showStocks: boolean;
  showCalendar: boolean;
  showWorldMap: boolean;
  compactMode: boolean;
  soundEffectsEnabled?: boolean;
}

export const defaultSettings: UserSettings = {
  voiceEnabled: true,
  autoSpeak: true,
  speechRate: 1,
  showWeather: true,
  showStocks: true,
  showCalendar: true,
  showWorldMap: true,
  compactMode: false,
  soundEffectsEnabled: true,
};

const SettingsPanel = ({ isOpen, onClose, settings, onSettingsChange }: SettingsProps) => {
  const updateSetting = <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  const shortcuts = [
    { key: "V", action: "Toggle Voice Input" },
    { key: "D", action: "Open Diagnostics" },
    { key: "Shift+S", action: "Open Settings" },
    { key: "F", action: "Toggle Fullscreen" },
    { key: "1", action: "Combat Mode" },
    { key: "2", action: "Stealth Mode" },
    { key: "3", action: "Power-Save Mode" },
    { key: "/", action: "Focus Console" },
    { key: "H", action: "Toggle History" },
    { key: "Esc", action: "Close Modal" },
  ];

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="bg-card/95 border-border backdrop-blur-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-primary jarvis-glow flex items-center gap-2">
            <Settings className="w-5 h-5" />
            System Configuration
          </SheetTitle>
          <SheetDescription className="text-muted-foreground">
            Customize your J.A.R.V.I.S. experience
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Voice Settings */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-primary flex items-center gap-2">
              <Volume2 className="w-4 h-4" />
              Voice Settings
            </h3>
            <div className="space-y-3 pl-6">
              <div className="flex items-center justify-between">
                <Label htmlFor="voice-enabled" className="text-xs text-muted-foreground">
                  Voice Input
                </Label>
                <Switch
                  id="voice-enabled"
                  checked={settings.voiceEnabled}
                  onCheckedChange={(checked) => updateSetting("voiceEnabled", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-speak" className="text-xs text-muted-foreground">
                  Auto-Speak Responses
                </Label>
                <Switch
                  id="auto-speak"
                  checked={settings.autoSpeak}
                  onCheckedChange={(checked) => updateSetting("autoSpeak", checked)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">
                  Speech Rate: {settings.speechRate.toFixed(1)}x
                </Label>
                <Slider
                  value={[settings.speechRate]}
                  onValueChange={([value]) => updateSetting("speechRate", value)}
                  min={0.5}
                  max={2}
                  step={0.1}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Sound Effects Settings */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-primary flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Sound Effects
            </h3>
            <div className="space-y-3 pl-6">
              <div className="flex items-center justify-between">
                <Label htmlFor="sound-effects" className="text-xs text-muted-foreground">
                  UI Sound Effects
                </Label>
                <Switch
                  id="sound-effects"
                  checked={settings.soundEffectsEnabled ?? true}
                  onCheckedChange={(checked) => updateSetting("soundEffectsEnabled", checked)}
                />
              </div>
            </div>
          </div>

          {/* Layout Settings */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-primary flex items-center gap-2">
              <Layout className="w-4 h-4" />
              Layout
            </h3>
            <div className="space-y-3 pl-6">
              <div className="flex items-center justify-between">
                <Label htmlFor="show-weather" className="text-xs text-muted-foreground">
                  Weather Panel
                </Label>
                <Switch
                  id="show-weather"
                  checked={settings.showWeather}
                  onCheckedChange={(checked) => updateSetting("showWeather", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="show-stocks" className="text-xs text-muted-foreground">
                  Stock Ticker
                </Label>
                <Switch
                  id="show-stocks"
                  checked={settings.showStocks}
                  onCheckedChange={(checked) => updateSetting("showStocks", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="show-calendar" className="text-xs text-muted-foreground">
                  Calendar Widget
                </Label>
                <Switch
                  id="show-calendar"
                  checked={settings.showCalendar}
                  onCheckedChange={(checked) => updateSetting("showCalendar", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="show-worldmap" className="text-xs text-muted-foreground">
                  World Map
                </Label>
                <Switch
                  id="show-worldmap"
                  checked={settings.showWorldMap}
                  onCheckedChange={(checked) => updateSetting("showWorldMap", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="compact-mode" className="text-xs text-muted-foreground">
                  Compact Mode
                </Label>
                <Switch
                  id="compact-mode"
                  checked={settings.compactMode}
                  onCheckedChange={(checked) => updateSetting("compactMode", checked)}
                />
              </div>
            </div>
          </div>

          {/* Keyboard Shortcuts */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-primary flex items-center gap-2">
              <Keyboard className="w-4 h-4" />
              Keyboard Shortcuts
            </h3>
            <div className="space-y-2 pl-6">
              {shortcuts.map((shortcut) => (
                <div key={shortcut.key} className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{shortcut.action}</span>
                  <kbd className="px-2 py-0.5 bg-muted border border-border rounded text-primary font-mono">
                    {shortcut.key}
                  </kbd>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default SettingsPanel;
