import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Edit, Play } from "lucide-react";
import { kingsCupPresets } from "@/data/kingsCupPresets";
import { KingsCupRule } from "@/types/game";
import { RuleEditor } from "@/components/RuleEditor";

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
    if (saveKey.trim()) {
      // In a real app, this would load from a backend
      // For now, we'll just show a toast
      alert(`Loading game with key: ${saveKey}`);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Games
        </Button>

        <div className="text-center mb-8 animate-slide-in">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            King's Cup
          </h1>
          <p className="text-xl text-muted-foreground">
            Choose your rules and start the party!
          </p>
        </div>

        <div className="grid gap-6 mb-8">
          {/* Preset Selection */}
          <Card className="p-6 bg-gradient-card border-border">
            <h2 className="text-2xl font-bold mb-4 text-foreground">Choose Ruleset</h2>
            <div className="grid gap-4">
              {kingsCupPresets.map((preset, index) => (
                <button
                  key={preset.name}
                  onClick={() => handlePresetChange(index)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    selectedPreset === index
                      ? "border-primary bg-primary/10 shadow-glow-cyan"
                      : "border-border hover:border-primary/50 bg-card"
                  }`}
                >
                  <h3 className="text-xl font-bold mb-1 text-foreground">{preset.name}</h3>
                  <p className="text-sm text-muted-foreground">{preset.description}</p>
                </button>
              ))}
            </div>
          </Card>

          {/* Rule Preview & Edit */}
          <Card className="p-6 bg-gradient-card border-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-foreground">Current Rules</h2>
              <Button
                variant="outline"
                onClick={() => setShowRuleEditor(true)}
                className="border-primary text-primary hover:bg-primary/10"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Rules
              </Button>
            </div>
            <div className="max-h-96 overflow-y-auto space-y-2">
              {rules.map((rule, index) => (
                <div
                  key={index}
                  className="p-3 rounded-lg bg-muted/50 border border-border hover:border-primary/30 transition-colors"
                >
                  <span className="font-bold text-primary mr-2">{rule.card}:</span>
                  <span className="text-foreground">{rule.rule}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Load Game */}
          <Card className="p-6 bg-gradient-card border-border">
            <h2 className="text-2xl font-bold mb-4 text-foreground">Load Saved Game</h2>
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="saveKey" className="text-foreground mb-2 block">
                  Enter Save Key
                </Label>
                <Input
                  id="saveKey"
                  value={saveKey}
                  onChange={(e) => setSaveKey(e.target.value)}
                  placeholder="e.g., PARTY2024"
                  className="bg-input border-border text-foreground"
                />
              </div>
              <Button
                onClick={handleLoadGame}
                variant="outline"
                className="self-end border-secondary text-secondary hover:bg-secondary/10"
              >
                Load
              </Button>
            </div>
          </Card>
        </div>

        {/* Start Button */}
        <Button
          onClick={handleStartGame}
          className="w-full bg-gradient-primary hover:opacity-90 text-primary-foreground font-bold text-2xl py-8 shadow-glow-cyan hover:shadow-glow-purple transition-all duration-300"
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
          }}
          onClose={() => setShowRuleEditor(false)}
        />
      )}
    </div>
  );
}
