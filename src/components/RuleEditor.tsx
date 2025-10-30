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

          <div className="grid grid-cols-2 gap-x-6 gap-y-3 overflow-y-auto flex-1 pr-2">
            {editedRules.map((rule, index) => (
              <div key={index} className="space-y-1">
                <Label htmlFor={`rule-${index}`} className="text-foreground font-bold text-sm">
                  {rule.card}
                </Label>
                <Input
                  id={`rule-${index}`}
                  value={rule.rule}
                  onChange={(e) => handleRuleChange(index, e.target.value)}
                  className="bg-input border-border text-foreground text-sm"
                />
              </div>
            ))}
          </div>

          <Button
            onClick={handleSave}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-lg py-5 shadow-glow-cyan mt-4"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};
