import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { X, Save, AlertCircle } from "lucide-react";
import { KingsCupRule } from "@/types/game";
import { toast } from "sonner";

interface RuleKeySaverProps {
  rules: KingsCupRule[];
  onClose: () => void;
  loadedKeyName?: string | null;
}

export const RuleKeySaver = ({ rules, onClose, loadedKeyName }: RuleKeySaverProps) => {
  const [customKey, setCustomKey] = useState("");
  const [keyExists, setKeyExists] = useState(false);
  const [checking, setChecking] = useState(false);

  const checkKeyAvailability = (key: string) => {
    if (!key.trim()) {
      setKeyExists(false);
      return;
    }
    setChecking(true);
    setTimeout(() => {
      const trimmedKey = key.trim();
      const exists = localStorage.getItem(`ruleset-${trimmedKey}`) !== null;
      const isSameAsLoaded = loadedKeyName && trimmedKey === loadedKeyName;
      setKeyExists(exists && !isSameAsLoaded);
      setChecking(false);
    }, 300);
  };

  const handleSave = () => {
    if (!customKey.trim()) {
      toast.error("Please enter a rule key");
      return;
    }

    if (keyExists) {
      toast.error("This key already exists. Choose another.");
      return;
    }

    const encoded = btoa(JSON.stringify(rules));
    localStorage.setItem(`ruleset-${customKey}`, encoded);
    navigator.clipboard.writeText(customKey);
    toast.success("Rule key saved and copied to clipboard!");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gradient-card border-primary shadow-glow-cyan p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-foreground">Save Rule Key</h2>
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="space-y-4">
          {loadedKeyName && (
            <div className="p-3 rounded-lg bg-primary/10 border border-primary">
              <p className="text-sm text-foreground">
                Currently loaded: <span className="font-bold text-primary">{loadedKeyName}</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                You must create a new key name to save your changes.
              </p>
            </div>
          )}
          <div>
            <Label htmlFor="customKey" className="text-foreground mb-2 block">
              {loadedKeyName ? "New Rule Key Name" : "Custom Rule Key"}
            </Label>
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

          <Button
            onClick={handleSave}
            disabled={!customKey.trim() || keyExists || checking}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-6 shadow-glow-cyan hover:scale-105 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Rule Key
          </Button>
        </div>
      </Card>
    </div>
  );
};
