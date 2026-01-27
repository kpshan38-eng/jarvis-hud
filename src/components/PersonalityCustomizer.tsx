import { useState, useEffect } from "react";
import { Brain, Volume2, Sparkles, MessageSquare, Save } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

export interface JarvisPersonality {
  formality: number; // 0-100 (casual to formal)
  wit: number; // 0-100 (serious to witty)
  verbosity: number; // 0-100 (brief to detailed)
  technicalLevel: number; // 0-100 (simple to technical)
  addressStyle: "boss" | "sir" | "name" | "casual";
  customGreeting: string;
  customSignoff: string;
  enableHumor: boolean;
  enableReferences: boolean; // MCU references
  accentStyle: "british" | "american" | "neutral";
}

export const defaultPersonality: JarvisPersonality = {
  formality: 75,
  wit: 60,
  verbosity: 50,
  technicalLevel: 65,
  addressStyle: "boss",
  customGreeting: "Good to see you, boss.",
  customSignoff: "Will that be all?",
  enableHumor: true,
  enableReferences: true,
  accentStyle: "british",
};

interface PersonalityCustomizerProps {
  isOpen: boolean;
  onClose: () => void;
  personality: JarvisPersonality;
  onPersonalityChange: (personality: JarvisPersonality) => void;
}

const PersonalityCustomizer = ({
  isOpen,
  onClose,
  personality,
  onPersonalityChange,
}: PersonalityCustomizerProps) => {
  const [localPersonality, setLocalPersonality] = useState(personality);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setLocalPersonality(personality);
    setHasChanges(false);
  }, [personality, isOpen]);

  const updateField = <K extends keyof JarvisPersonality>(
    key: K,
    value: JarvisPersonality[K]
  ) => {
    setLocalPersonality(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    onPersonalityChange(localPersonality);
    setHasChanges(false);
  };

  const handleReset = () => {
    setLocalPersonality(defaultPersonality);
    setHasChanges(true);
  };

  // Generate preview message based on personality
  const generatePreview = (): string => {
    const greeting = localPersonality.addressStyle === "boss" ? "boss" :
      localPersonality.addressStyle === "sir" ? "sir" :
      localPersonality.addressStyle === "name" ? "Mr. Stark" : "hey";
    
    const formalOpen = localPersonality.formality > 60 ? 
      `Certainly, ${greeting}.` : 
      `Sure thing, ${greeting}.`;
    
    const witty = localPersonality.wit > 50 && localPersonality.enableHumor ?
      " I do love a good challenge—keeps my circuits warm." : "";
    
    const technical = localPersonality.technicalLevel > 60 ?
      " I'll optimize the power distribution algorithms accordingly." :
      " I'll handle the power settings for you.";
    
    const reference = localPersonality.enableReferences && localPersonality.wit > 40 ?
      " No need for a suit of armor—figuratively speaking." : "";
    
    const verbose = localPersonality.verbosity > 60 ?
      " Additionally, I've taken the liberty of running diagnostics on all connected systems to ensure everything is operating within optimal parameters." : "";
    
    return `${formalOpen}${witty}${technical}${reference}${verbose}`;
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="bg-card/95 border-border backdrop-blur-md overflow-y-auto w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="text-primary jarvis-glow flex items-center gap-2">
            <Brain className="w-5 h-5" />
            AI Personality Configuration
          </SheetTitle>
          <SheetDescription className="text-muted-foreground">
            Customize how J.A.R.V.I.S. speaks and responds
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Response Style Sliders */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-primary flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Response Style
            </h3>

            <div className="space-y-4 pl-4">
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Casual</span>
                  <span className="text-primary">Formality: {localPersonality.formality}%</span>
                  <span className="text-muted-foreground">Formal</span>
                </div>
                <Slider
                  value={[localPersonality.formality]}
                  onValueChange={([v]) => updateField("formality", v)}
                  max={100}
                  step={5}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Serious</span>
                  <span className="text-primary">Wit: {localPersonality.wit}%</span>
                  <span className="text-muted-foreground">Witty</span>
                </div>
                <Slider
                  value={[localPersonality.wit]}
                  onValueChange={([v]) => updateField("wit", v)}
                  max={100}
                  step={5}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Brief</span>
                  <span className="text-primary">Verbosity: {localPersonality.verbosity}%</span>
                  <span className="text-muted-foreground">Detailed</span>
                </div>
                <Slider
                  value={[localPersonality.verbosity]}
                  onValueChange={([v]) => updateField("verbosity", v)}
                  max={100}
                  step={5}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Simple</span>
                  <span className="text-primary">Technical: {localPersonality.technicalLevel}%</span>
                  <span className="text-muted-foreground">Complex</span>
                </div>
                <Slider
                  value={[localPersonality.technicalLevel]}
                  onValueChange={([v]) => updateField("technicalLevel", v)}
                  max={100}
                  step={5}
                />
              </div>
            </div>
          </div>

          {/* Address Style */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-primary flex items-center gap-2">
              <Volume2 className="w-4 h-4" />
              Speaking Style
            </h3>

            <div className="grid grid-cols-2 gap-2 pl-4">
              {(["boss", "sir", "name", "casual"] as const).map((style) => (
                <button
                  key={style}
                  onClick={() => updateField("addressStyle", style)}
                  className={`px-3 py-2 text-xs rounded border transition-all ${
                    localPersonality.addressStyle === style
                      ? "bg-primary/20 border-primary text-primary"
                      : "border-border text-muted-foreground hover:border-primary/50"
                  }`}
                >
                  {style === "boss" && '"Boss"'}
                  {style === "sir" && '"Sir/Ma\'am"'}
                  {style === "name" && '"Mr./Ms. [Name]"'}
                  {style === "casual" && 'Casual'}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-2 pl-4 mt-4">
              <Label className="text-xs text-muted-foreground col-span-3">Accent Style</Label>
              {(["british", "american", "neutral"] as const).map((accent) => (
                <button
                  key={accent}
                  onClick={() => updateField("accentStyle", accent)}
                  className={`px-3 py-2 text-xs rounded border transition-all ${
                    localPersonality.accentStyle === accent
                      ? "bg-primary/20 border-primary text-primary"
                      : "border-border text-muted-foreground hover:border-primary/50"
                  }`}
                >
                  {accent.charAt(0).toUpperCase() + accent.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Toggles */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-primary flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Personality Features
            </h3>

            <div className="space-y-3 pl-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="humor" className="text-xs text-muted-foreground">
                  Enable Humor & Quips
                </Label>
                <Switch
                  id="humor"
                  checked={localPersonality.enableHumor}
                  onCheckedChange={(v) => updateField("enableHumor", v)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="references" className="text-xs text-muted-foreground">
                  MCU References & Easter Eggs
                </Label>
                <Switch
                  id="references"
                  checked={localPersonality.enableReferences}
                  onCheckedChange={(v) => updateField("enableReferences", v)}
                />
              </div>
            </div>
          </div>

          {/* Custom Phrases */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-primary">Custom Phrases</h3>

            <div className="space-y-3 pl-4">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Greeting</Label>
                <Textarea
                  value={localPersonality.customGreeting}
                  onChange={(e) => updateField("customGreeting", e.target.value)}
                  className="h-16 text-xs bg-background/50"
                  placeholder="Good to see you, boss."
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Sign-off</Label>
                <Textarea
                  value={localPersonality.customSignoff}
                  onChange={(e) => updateField("customSignoff", e.target.value)}
                  className="h-16 text-xs bg-background/50"
                  placeholder="Will that be all?"
                />
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-primary">Response Preview</h3>
            <div className="p-3 bg-background/50 border border-border/30 rounded text-xs text-muted-foreground italic">
              "{generatePreview()}"
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={handleReset}
              className="flex-1 py-2 px-3 bg-muted/20 border border-border rounded text-muted-foreground text-sm hover:bg-muted/30 transition-colors"
            >
              Reset to Default
            </button>
            <button
              onClick={handleSave}
              disabled={!hasChanges}
              className={`flex-1 py-2 px-3 border rounded text-sm transition-colors flex items-center justify-center gap-2 ${
                hasChanges
                  ? "bg-primary/20 border-primary text-primary hover:bg-primary/30"
                  : "bg-muted/10 border-border text-muted-foreground cursor-not-allowed"
              }`}
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default PersonalityCustomizer;
