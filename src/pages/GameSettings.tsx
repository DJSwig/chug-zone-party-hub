import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Play, Save, Download, Home, ChevronDown } from "lucide-react";
import { kingsCupPresets } from "@/data/kingsCupPresets";
import { KingsCupRule } from "@/types/game";
import { RuleKeySaver } from "@/components/RuleKeySaver";
import { PageTransition } from "@/components/PageTransition";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { toast } from "sonner";

export default function GameSettings() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const [selectedPreset, setSelectedPreset] = useState(0);
  const [rules, setRules] = useState<KingsCupRule[]>(kingsCupPresets[0].rules);
  const [showKeySaver, setShowKeySaver] = useState(false);
  const [loadKey, setLoadKey] = useState("");
  const [loadedKeyName, setLoadedKeyName] = useState<string | null>(null);
  const [rulesOpen, setRulesOpen] = useState(true);
  const [keyManagementOpen, setKeyManagementOpen] = useState(false);

  const handlePresetChange = (index: number) => {
    setSelectedPreset(index);
    setRules(kingsCupPresets[index].rules);
    setLoadedKeyName(null); // Clear loaded key when switching presets
  };

  const handleRuleChange = (index: number, newRule: string) => {
    const updatedRules = [...rules];
    updatedRules[index] = { ...updatedRules[index], rule: newRule };
    setRules(updatedRules);
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
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="text-muted-foreground hover:text-foreground"
            >
              <Home className="w-4 h-4 mr-2" />
              Home
            </Button>
          </div>

          <div className="text-center mb-8 animate-slide-in">
            <h1 className="text-5xl md:text-6xl font-bold mb-3 bg-gradient-primary bg-clip-text text-transparent animate-text-glow">
              King's Cup Setup
            </h1>
            <p className="text-xl text-muted-foreground">
              Configure your rules and start the party!
            </p>
          </div>

          {/* Preset Tabs */}
          <div className="mb-6 flex gap-2 flex-wrap justify-center">
            {kingsCupPresets.map((preset, index) => (
              <Button
                key={preset.name}
                onClick={() => handlePresetChange(index)}
                variant={selectedPreset === index ? "default" : "outline"}
                className={`transition-all hover:scale-105 ${
                  selectedPreset === index
                    ? "bg-gradient-primary shadow-glow-cyan"
                    : "border-border hover:border-primary/50 hover:shadow-glow-cyan"
                }`}
              >
                {preset.name}
              </Button>
            ))}
          </div>

          {loadedKeyName && (
            <div className="mb-4 p-3 rounded-lg bg-primary/10 border border-primary text-center">
              <p className="text-sm text-foreground">
                Currently loaded: <span className="font-bold text-primary">{loadedKeyName}</span>
              </p>
            </div>
          )}

          <div className="space-y-4 mb-6">
            {/* Game Rules Section */}
            <Collapsible open={rulesOpen} onOpenChange={setRulesOpen}>
              <Card className="bg-gradient-card border-border shadow-glow-cyan overflow-hidden">
                <CollapsibleTrigger className="w-full p-6 flex items-center justify-between hover:bg-primary/5 transition-colors">
                  <h2 className="text-2xl font-bold text-foreground">Game Rules</h2>
                  <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${rulesOpen ? "rotate-180" : ""}`} />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="px-6 pb-6">
                    <div className="grid md:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
                      {rules.map((rule, index) => (
                        <div
                          key={index}
                          className="p-3 rounded-lg bg-muted/30 border border-border hover:border-primary/30 transition-all group"
                        >
                          <label className="font-bold text-primary text-sm block mb-1">
                            {rule.card}
                          </label>
                          <Input
                            value={rule.rule}
                            onChange={(e) => handleRuleChange(index, e.target.value)}
                            className="bg-input/50 border-border text-foreground text-sm h-auto min-h-[2.5rem] py-2 group-hover:border-primary/50 transition-colors focus:shadow-glow-cyan"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            {/* Rule Key Management */}
            <Collapsible open={keyManagementOpen} onOpenChange={setKeyManagementOpen}>
              <Card className="bg-gradient-card border-border shadow-glow-purple overflow-hidden">
                <CollapsibleTrigger className="w-full p-6 flex items-center justify-between hover:bg-primary/5 transition-colors">
                  <h2 className="text-2xl font-bold text-foreground">Rule Key Management</h2>
                  <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${keyManagementOpen ? "rotate-180" : ""}`} />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="px-6 pb-6 space-y-4">
                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">Load Saved Ruleset</label>
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

                    <Button
                      onClick={() => setShowKeySaver(true)}
                      variant="outline"
                      className="w-full border-secondary text-secondary hover:bg-secondary/10 hover:scale-105 transition-all"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {loadedKeyName ? "Save as New Key" : "Save Custom Key"}
                    </Button>

                    {loadedKeyName && (
                      <p className="text-xs text-muted-foreground text-center mt-2">
                        💡 Loaded keys can't be overwritten — save as a new key to keep your edits.
                      </p>
                    )}
                  </div>
                </CollapsibleContent>
              </Card>
            </Collapsible>
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
