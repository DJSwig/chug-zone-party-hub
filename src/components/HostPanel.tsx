import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { X, Plus } from "lucide-react";
import { Player } from "@/types/game";
import { Checkbox } from "@/components/ui/checkbox";

interface Mate {
  id: string;
  player1: Player;
  player2: Player;
}

interface HostPanelProps {
  players: Player[];
  mates: Mate[];
  onAddMate: () => void;
  onRemoveMate: (mateId: string) => void;
  stackDates: boolean;
  onStackDatesChange: (checked: boolean) => void;
}

export const HostPanel = ({
  players,
  mates,
  onAddMate,
  onRemoveMate,
  stackDates,
  onStackDatesChange,
}: HostPanelProps) => {
  const [notes, setNotes] = useState("");

  return (
    <div className="w-80 border-l border-border flex flex-col max-h-screen sticky top-0">
      <div className="p-4 border-b border-border">
        <h3 className="text-lg font-bold text-foreground">Host Panel</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {/* Mates Section */}
        <Card className="p-4 bg-card border-border shadow-[0_0_20px_hsl(var(--primary)/0.2)]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xl font-bold text-foreground">Mates</h3>
            <Button
              onClick={onAddMate}
              size="sm"
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <Checkbox
              id="stackDates"
              checked={stackDates}
              onCheckedChange={(checked) => onStackDatesChange(checked as boolean)}
            />
            <label
              htmlFor="stackDates"
              className="text-sm text-muted-foreground cursor-pointer"
            >
              Stack Dates
            </label>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
            {mates.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No mates yet
              </p>
            ) : (
              mates.map((mate) => (
                <div
                  key={mate.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-muted/50 border border-border hover:border-primary/30 transition-colors"
                >
                  <span className="text-sm text-foreground">
                    {mate.player1.name} 💕 {mate.player2.name}
                  </span>
                  <button
                    onClick={() => onRemoveMate(mate.id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Notes Section */}
        <Card className="p-4 bg-card border-border shadow-[0_0_20px_hsl(var(--primary)/0.2)]">
          <h3 className="text-xl font-bold text-foreground mb-3">Notes</h3>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Type your notes here..."
            className="bg-input border-border text-foreground min-h-32 resize-none custom-scrollbar"
          />
          <p className="text-xs text-muted-foreground mt-2">
            Notes clear on page refresh
          </p>
        </Card>
      </div>
    </div>
  );
};
