import { useState } from "react";
import { KingsCupRule } from "@/types/game";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Save, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface RuleEditorProps {
  rules: KingsCupRule[];
  onSave: (rules: KingsCupRule[]) => void;
  onClose: () => void;
}

export const RuleEditor = ({ rules, onSave, onClose }: RuleEditorProps) => {
  const [editedRules, setEditedRules] = useState<KingsCupRule[]>(rules);
  const [customKey, setCustomKey] = useState("");
  const [keyExists, setKeyExists] = useState(false);
  const [checking, setChecking] = useState(false);

  const handleRuleChange = (index: number, newRule: string) => {
    const updated = [...editedRules];
    updated[index] = { ...updated[index], rule: newRule };
    setEditedRules(updated);
  };

  const checkKeyAvailability = (key: string) => {
    if (!key.trim()) {
      setKeyExists(false);
      return;
    }
    setChecking(true);
    setTimeout(() => {
      const trimmedKey = key.trim();
      const exists = localStorage.getItem(`ruleset-${trimmedKey}`) !== null;
      setKeyExists(exists);
      setChecking(false);
    }, 300);
  };

  const handleSave = () => {
    onSave(editedRules);
  };

  const handleSaveCustomKey = () => {
    if (!customKey.trim()) {
      toast.error("Please enter a rule key name");
      return;
    }

    if (keyExists) {
      toast.error("That Rule Key is already taken. Choose another.");
      return;
    }

    const encoded = btoa(JSON.stringify(editedRules));
    localStorage.setItem(`ruleset-${customKey.trim()}`, encoded);
    navigator.clipboard.writeText(customKey.trim());
    toast.success(`Rules saved under '${customKey.trim()}' successfully!`);
    
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl max-h-[90vh] flex flex-col">
        <div className="bg-gradient-card border border-border rounded-xl p-6 shadow-card flex flex-col overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-foreground">Edit Rules</h2>
            <Button
              variant="ghost"
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-3 overflow-y-auto flex-1 pr-2 custom-scrollbar">
            {editedRules.map((rule, index) => (
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

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent my-4" />

          {/* Save Custom Key Section */}
          <div className="space-y-3 p-4 rounded-lg bg-card/30 border border-primary/20">
            <div>
              <Label htmlFor="customKey" className="text-foreground mb-2 block text-sm font-semibold">
                Save Custom Key
              </Label>
              <p className="text-xs text-muted-foreground mb-2">
                Enter a new Rule Key name to save your custom ruleset. Loaded keys can't be overwritten.
              </p>
              <Input
                id="customKey"
                value={customKey}
                onChange={(e) => {
                  setCustomKey(e.target.value);
                  checkKeyAvailability(e.target.value);
                }}
                placeholder="e.g., PARTY2024"
                className="bg-input border-border text-foreground"
              />
              {checking && (
                <p className="text-xs text-muted-foreground mt-1">Checking availability...</p>
              )}
              {keyExists && !checking && (
                <div className="flex items-center gap-2 mt-2 text-destructive text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>This key is already taken</span>
                </div>
              )}
              {!keyExists && !checking && customKey.trim() && (
                <p className="text-xs text-primary mt-1">✓ Available</p>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleSaveCustomKey}
                disabled={!customKey.trim() || keyExists || checking}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 shadow-glow-cyan hover:scale-105 transition-all disabled:opacity-50"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Custom Key
              </Button>

              <Button
                onClick={handleSave}
                className="flex-1 bg-gradient-primary hover:opacity-90 text-primary-foreground font-bold py-3 shadow-glow-purple hover:scale-105 transition-all"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
