import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X } from "lucide-react";
import { Player } from "@/types/game";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface MateSelectorProps {
  players: Player[];
  onConfirm: (player1Id: string, player2Id: string) => void;
  onClose: () => void;
}

export const MateSelector = ({ players, onConfirm, onClose }: MateSelectorProps) => {
  const [player1, setPlayer1] = useState<string>("");
  const [player2, setPlayer2] = useState<string>("");

  const handleConfirm = () => {
    if (player1 && player2 && player1 !== player2) {
      onConfirm(player1, player2);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <Card className="w-full max-w-md bg-gradient-card border-primary shadow-glow-cyan p-6 animate-scale-in">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground">Select Mates</h2>
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">First Player</label>
            <Select value={player1} onValueChange={setPlayer1}>
              <SelectTrigger className="bg-input border-border text-foreground">
                <SelectValue placeholder="Select player..." />
              </SelectTrigger>
              <SelectContent className="bg-card border-border z-[60]">
                {players.map((player) => (
                  <SelectItem key={player.id} value={player.id}>
                    {player.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Second Player</label>
            <Select value={player2} onValueChange={setPlayer2}>
              <SelectTrigger className="bg-input border-border text-foreground">
                <SelectValue placeholder="Select player..." />
              </SelectTrigger>
              <SelectContent className="bg-card border-border z-[60]">
                {players.map((player) => (
                  <SelectItem key={player.id} value={player.id} disabled={player.id === player1}>
                    {player.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleConfirm}
            disabled={!player1 || !player2 || player1 === player2}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-6 shadow-glow-cyan hover:scale-105 transition-all disabled:opacity-50"
          >
            Confirm Mates
          </Button>
        </div>
      </Card>
    </div>
  );
};
