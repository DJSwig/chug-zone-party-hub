import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Play, Save, Download } from "lucide-react";
import { kingsCupPresets } from "@/data/kingsCupPresets";
import { KingsCupRule } from "@/types/game";
import { PageTransition } from "@/components/PageTransition";
import { toast } from "sonner";

export default function GameSettings() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const [selectedPreset, setSelectedPreset] = useState(0);
  const [rules, setRules] = useState<KingsCupRule[]>(kingsCupPresets[0].rules);
  const [loadKey, setLoadKey] = useState("");
  const [loadedKeyName, setLoadedKeyName] = useState<string | null>(null);
  const [saveKey, setSaveKey] = useState("");

  const handlePresetChange = (index: number) => {
    setSelectedPreset(index);
    setRules(kingsCupPresets[index].rules);
    setLoadedKeyName(null); // Clear loaded key when switching presets
  };

  const handleStartGame = () => {
    // Store rules in localStorage for the game
    localStorage.setItem(`${gameId}-rules`, JSON.stringify(rules));
    navigate(`/game/${gameId}/play`);
  };

  const handleLoadGame = () => {
    if (!loadKey.trim()) {
      toast.error("Please enter a rule key");
      return;
    }
    
    const savedRuleset = localStorage.getItem(`ruleset-${loadKey}`);
    if (!savedRuleset) {
      toast.error("Rule key not found");
      return;
    }

    try {
      const decoded = atob(savedRuleset);
      const loadedRules = JSON.parse(decoded);
      setRules(loadedRules);
      setLoadedKeyName(loadKey.trim());
      toast.success(`Rules loaded from "${loadKey}"!`);
    } catch (error) {
      toast.error("Invalid rule key");
    }
  };

  const handleSaveCustomKey = () => {
    if (!saveKey.trim()) {
      toast.error("Please enter a Rule Key name");
      return;
    }

    if (loadedKeyName && saveKey.trim() === loadedKeyName) {
      toast.error("Cannot overwrite loaded keys. Choose a different name.");
      return;
    }

    const existingKey = localStorage.getItem(`ruleset-${saveKey.trim()}`);
    if (existingKey) {
      toast.error("This Rule Key already exists. Choose a different name.");
      return;
    }

    const encoded = btoa(JSON.stringify(rules));
    localStorage.setItem(`ruleset-${saveKey.trim()}`, encoded);
    toast.success(`Rules saved as "${saveKey.trim()}"!`);
    setSaveKey("");
  };

  const handleRuleChange = (index: number, newRule: string) => {
    const updated = [...rules];
    updated[index] = { ...updated[index], rule: newRule };
    setRules(updated);
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-5xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-6 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Games
          </Button>

          <div className="text-center mb-8 animate-slide-in">
            <h1 className="text-5xl md:text-6xl font-bold mb-3 bg-gradient-primary bg-clip-text text-transparent animate-text-glow">
              King's Cup
            </h1>
            <p className="text-xl text-muted-foreground">
              Choose your rules and start the party!
            </p>
          </div>

          {loadedKeyName && (
            <div className="mb-6 p-4 rounded-lg bg-primary/10 border-2 border-primary text-center shadow-glow-cyan">
              <p className="text-sm text-foreground">
                Currently loaded: <span className="font-bold text-primary text-lg">{loadedKeyName}</span>
              </p>
            </div>
          )}

          {/* Preset Selection */}
          <Card className="p-6 bg-gradient-card border-border shadow-glow-cyan mb-6">
            <h2 className="text-2xl font-bold mb-4 text-foreground">Choose Ruleset</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {kingsCupPresets.map((preset, index) => (
                <button
                  key={preset.name}
                  onClick={() => handlePresetChange(index)}
                  className={`p-4 rounded-lg border-2 transition-all text-left hover:scale-105 ${
                    selectedPreset === index
                      ? "border-primary bg-primary/10 shadow-glow-cyan"
                      : "border-border hover:border-primary/50 bg-card hover:shadow-glow-cyan"
                  }`}
                >
                  <h3 className="text-lg font-bold mb-1 text-foreground">{preset.name}</h3>
                  <p className="text-xs text-muted-foreground">{preset.description}</p>
                </button>
              ))}
            </div>
          </Card>

          {/* Inline Rules Editor */}
          <Card className="p-6 bg-gradient-card border-border shadow-glow-magenta mb-6">
            <h2 className="text-2xl font-bold mb-4 text-foreground">Edit Rules</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
              {rules.map((rule, index) => (
                <div key={index} className="space-y-1">
                  <Label htmlFor={`rule-${index}`} className="text-foreground font-bold text-sm">
                    {rule.card}
                  </Label>
                  <Input
                    id={`rule-${index}`}
                    value={rule.rule}
                    onChange={(e) => handleRuleChange(index, e.target.value)}
                    className="bg-input border-border text-foreground text-sm hover:border-primary/50 focus:border-primary transition-colors"
                  />
                </div>
              ))}
            </div>
          </Card>

          {/* Save and Load Keys */}
          <Card className="p-6 bg-gradient-card border-border shadow-glow-purple mb-6">
            <h2 className="text-2xl font-bold mb-4 text-foreground">Rule Keys</h2>
            
            <div className="space-y-4">
              {/* Save Custom Key */}
              <div>
                <label className="text-sm text-muted-foreground mb-2 block font-medium">Save Custom Key</label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={saveKey}
                    onChange={(e) => setSaveKey(e.target.value)}
                    placeholder="Enter new Rule Key name..."
                    className="bg-input border-border text-foreground"
                  />
                  <Button
                    onClick={handleSaveCustomKey}
                    variant="outline"
                    className="border-secondary text-secondary hover:bg-secondary/10 hover:scale-105 transition-all"
                  >
                    <Save className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground px-1">
                  💡 Enter a new Rule Key name to save your custom ruleset. Loaded keys can't be overwritten.
                </p>
              </div>

              <div className="h-px bg-gradient-primary opacity-30 my-4" />
              
              {/* Load Saved Key */}
              <div>
                <label className="text-sm text-muted-foreground mb-2 block font-medium">Load Saved Ruleset</label>
                <div className="flex gap-2">
                  <Input
                    value={loadKey}
                    onChange={(e) => setLoadKey(e.target.value)}
                    placeholder="Enter rule key..."
                    className="bg-input border-border text-foreground"
                  />
                  <Button
                    onClick={handleLoadGame}
                    variant="outline"
                    className="border-accent text-accent hover:bg-accent/10 hover:scale-105 transition-all"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Start Button */}
          <Button
            onClick={handleStartGame}
            className="w-full bg-gradient-primary hover:opacity-90 text-primary-foreground font-bold text-2xl py-8 shadow-glow-cyan hover:shadow-glow-purple hover:scale-105 active:scale-95 transition-all duration-300 animate-button-pulse"
          >
            <Play className="w-6 h-6 mr-3" />
            Start Game
          </Button>
        </div>
      </div>
    </PageTransition>
  );
}
