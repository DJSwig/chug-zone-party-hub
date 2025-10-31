import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Edit, Play, Save, Download } from "lucide-react";
import { kingsCupPresets } from "@/data/kingsCupPresets";
import { KingsCupRule } from "@/types/game";
import { RuleEditor } from "@/components/RuleEditor";
import { RuleKeySaver } from "@/components/RuleKeySaver";
import { PageTransition } from "@/components/PageTransition";
import { toast } from "sonner";

export default function GameSettings() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const [selectedPreset, setSelectedPreset] = useState(0);
  const [rules, setRules] = useState<KingsCupRule[]>(kingsCupPresets[0].rules);
  const [showRuleEditor, setShowRuleEditor] = useState(false);
  const [showKeySaver, setShowKeySaver] = useState(false);
  const [loadKey, setLoadKey] = useState("");
  const [loadedKeyName, setLoadedKeyName] = useState<string | null>(null);

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

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Preset Selection */}
              <Card className="p-6 bg-gradient-card border-border shadow-glow-cyan">
                <h2 className="text-2xl font-bold mb-4 text-foreground">Choose Ruleset</h2>
                <div className="grid gap-3">
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
                      <h3 className="text-xl font-bold mb-1 text-foreground">{preset.name}</h3>
                      <p className="text-sm text-muted-foreground">{preset.description}</p>
                    </button>
                  ))}
                </div>
              </Card>

              {/* Load/Save Keys */}
              <Card className="p-6 bg-gradient-card border-border shadow-glow-purple">
                <h2 className="text-2xl font-bold mb-4 text-foreground">Rule Keys</h2>
                
                <div className="space-y-4">
                  <div className="h-px bg-gradient-primary opacity-30 my-4" />
                  
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

                  <div className="h-px bg-gradient-primary opacity-30 my-4" />

                  <Button
                    onClick={() => setShowKeySaver(true)}
                    variant="outline"
                    className="w-full border-secondary text-secondary hover:bg-secondary/10 hover:scale-105 transition-all"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {loadedKeyName ? "Save as New Key" : "Save Custom Key"}
                  </Button>

                  {loadedKeyName && (
                    <p className="text-xs text-muted-foreground text-center mt-2 px-2">
                      💡 Loaded rulesets can't be overwritten — save under a new Rule Key to keep changes.
                    </p>
                  )}
                </div>
              </Card>
            </div>

            {/* Right Column */}
            <div>
              {/* Rule Preview & Edit */}
              <Card className="p-6 bg-gradient-card border-border shadow-glow-magenta h-full">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-foreground">Current Rules</h2>
                  <Button
                    variant="outline"
                    onClick={() => setShowRuleEditor(true)}
                    className="border-primary text-primary hover:bg-primary/10 hover:scale-105 transition-all"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Rules
                  </Button>
                </div>
                <div className="max-h-[600px] overflow-y-auto space-y-2 custom-scrollbar pr-2">
                  {rules.map((rule, index) => (
                    <div
                      key={index}
                      className="p-3 rounded-lg bg-muted/50 border border-border hover:border-primary/30 transition-colors"
                    >
                      <span className="font-bold text-primary mr-2">{rule.card}:</span>
                      <span className="text-foreground text-sm">{rule.rule}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>

          {/* Start Button */}
          <Button
            onClick={handleStartGame}
            className="w-full bg-gradient-primary hover:opacity-90 text-primary-foreground font-bold text-2xl py-8 shadow-glow-cyan hover:shadow-glow-purple hover:scale-105 active:scale-95 transition-all duration-300 animate-button-pulse"
          >
            <Play className="w-6 h-6 mr-3" />
            Start Game
          </Button>
        </div>

        {showRuleEditor && (
          <RuleEditor
            rules={rules}
            onSave={(newRules) => {
              setRules(newRules);
              setShowRuleEditor(false);
              toast.success("Rules updated!");
            }}
            onClose={() => setShowRuleEditor(false)}
          />
        )}

        {showKeySaver && (
          <RuleKeySaver
            rules={rules}
            onClose={() => setShowKeySaver(false)}
            loadedKeyName={loadedKeyName}
          />
        )}
      </div>
    </PageTransition>
  );
}
