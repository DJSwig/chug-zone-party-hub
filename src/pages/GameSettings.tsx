import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Edit, Play, Save, Download } from "lucide-react";
import { kingsCupPresets } from "@/data/kingsCupPresets";
import { KingsCupRule } from "@/types/game";
import { RuleEditor } from "@/components/RuleEditor";
import { toast } from "sonner";

export default function GameSettings() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const [selectedPreset, setSelectedPreset] = useState(0);
  const [rules, setRules] = useState<KingsCupRule[]>(kingsCupPresets[0].rules);
  const [showRuleEditor, setShowRuleEditor] = useState(false);
  const [saveKey, setSaveKey] = useState("");

  const handlePresetChange = (index: number) => {
    setSelectedPreset(index);
    setRules(kingsCupPresets[index].rules);
  };

  const handleStartGame = () => {
    // Store rules in localStorage for the game
    localStorage.setItem(`${gameId}-rules`, JSON.stringify(rules));
    navigate(`/game/${gameId}/play`);
  };

  const handleLoadGame = () => {
    if (!saveKey.trim()) {
      toast.error("Please enter a rule key");
      return;
    }
    try {
      const decoded = atob(saveKey);
      const loadedRules = JSON.parse(decoded);
      setRules(loadedRules);
      toast.success("Rules loaded successfully!");
    } catch (error) {
      toast.error("Invalid rule key");
    }
  };

  const handleSaveGame = () => {
    const encoded = btoa(JSON.stringify(rules));
    navigator.clipboard.writeText(encoded);
    toast.success("Rule key copied to clipboard!");
  };

  return (
    <div className="min-h-screen h-screen bg-background p-4 flex flex-col overflow-hidden">
      <div className="max-w-4xl mx-auto flex-1 flex flex-col overflow-hidden">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Games
        </Button>

        <div className="text-center mb-4 animate-slide-in">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
            King's Cup
          </h1>
          <p className="text-lg text-muted-foreground">
            Choose your rules and start the party!
          </p>
        </div>

        <div className="grid gap-4 flex-1 overflow-y-auto">
          {/* Preset Selection */}
          <Card className="p-4 bg-gradient-card border-border">
            <h2 className="text-xl font-bold mb-3 text-foreground">Choose Ruleset</h2>
            <div className="grid gap-2">
              {kingsCupPresets.map((preset, index) => (
                <button
                  key={preset.name}
                  onClick={() => handlePresetChange(index)}
                  className={`p-3 rounded-lg border-2 transition-all text-left ${
                    selectedPreset === index
                      ? "border-primary bg-primary/10 shadow-glow-cyan"
                      : "border-border hover:border-primary/50 bg-card"
                  }`}
                >
                  <h3 className="text-lg font-bold mb-0.5 text-foreground">{preset.name}</h3>
                  <p className="text-xs text-muted-foreground">{preset.description}</p>
                </button>
              ))}
            </div>
          </Card>

          {/* Rule Preview & Edit */}
          <Card className="p-4 bg-gradient-card border-border">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-bold text-foreground">Current Rules</h2>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSaveGame}
                  className="border-secondary text-secondary hover:bg-secondary/10"
                >
                  <Save className="w-4 h-4 mr-1" />
                  Save Key
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowRuleEditor(true)}
                  className="border-primary text-primary hover:bg-primary/10"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
              </div>
            </div>
            <div className="max-h-48 overflow-y-auto space-y-1">
              {rules.map((rule, index) => (
                <div
                  key={index}
                  className="p-2 rounded-lg bg-muted/50 border border-border hover:border-primary/30 transition-colors text-sm"
                >
                  <span className="font-bold text-primary mr-2">{rule.card}:</span>
                  <span className="text-foreground">{rule.rule}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Load Game */}
          <Card className="p-4 bg-gradient-card border-border">
            <h2 className="text-xl font-bold mb-3 text-foreground">Load Saved Ruleset</h2>
            <div className="flex gap-2">
              <Input
                id="saveKey"
                value={saveKey}
                onChange={(e) => setSaveKey(e.target.value)}
                placeholder="Paste rule key here..."
                className="bg-input border-border text-foreground"
              />
              <Button
                onClick={handleLoadGame}
                variant="outline"
                className="border-accent text-accent hover:bg-accent/10"
              >
                <Download className="w-4 h-4 mr-1" />
                Load
              </Button>
            </div>
          </Card>
        </div>

        {/* Start Button */}
        <Button
          onClick={handleStartGame}
          className="w-full bg-gradient-primary hover:opacity-90 text-primary-foreground font-bold text-xl py-6 shadow-glow-cyan hover:shadow-glow-purple transition-all duration-300 mt-4"
        >
          <Play className="w-5 h-5 mr-2" />
          Start Game
        </Button>
      </div>

      {showRuleEditor && (
        <RuleEditor
          rules={rules}
          onSave={(newRules) => {
            setRules(newRules);
            setShowRuleEditor(false);
          }}
          onClose={() => setShowRuleEditor(false)}
        />
      )}
    </div>
  );
}
