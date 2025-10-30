import { useState } from "react";
import { KingsCupRule } from "@/types/game";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Save } from "lucide-react";

interface RuleEditorProps {
  rules: KingsCupRule[];
  onSave: (rules: KingsCupRule[]) => void;
  onClose: () => void;
}

export const RuleEditor = ({ rules, onSave, onClose }: RuleEditorProps) => {
  const [editedRules, setEditedRules] = useState<KingsCupRule[]>(rules);

  const handleRuleChange = (index: number, newRule: string) => {
    const updated = [...editedRules];
    updated[index] = { ...updated[index], rule: newRule };
    setEditedRules(updated);
  };

  const handleSave = () => {
    onSave(editedRules);
  };

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 overflow-y-auto p-4">
      <div className="max-w-4xl mx-auto my-8">
        <div className="bg-gradient-card border border-border rounded-xl p-6 shadow-card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-foreground">Edit Rules</h2>
            <Button
              variant="ghost"
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-6 h-6" />
            </Button>
          </div>

          <div className="space-y-4 mb-6">
            {editedRules.map((rule, index) => (
              <div key={index} className="space-y-2">
                <Label htmlFor={`rule-${index}`} className="text-foreground font-bold">
                  {rule.card}
                </Label>
                <Input
                  id={`rule-${index}`}
                  value={rule.rule}
                  onChange={(e) => handleRuleChange(index, e.target.value)}
                  className="bg-input border-border text-foreground"
                />
              </div>
            ))}
          </div>

          <Button
            onClick={handleSave}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xl py-6 shadow-glow-cyan"
          >
            <Save className="w-5 h-5 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};
