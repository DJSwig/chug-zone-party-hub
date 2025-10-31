import { useState } from "react";
import { Player } from "@/types/game";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Plus, X, GripVertical } from "lucide-react";
import { toast } from "sonner";

interface PlayerManagerProps {
  players: Player[];
  currentPlayerIndex: number;
  onPlayersChange: (players: Player[]) => void;
}

export const PlayerManager = ({
  players,
  currentPlayerIndex,
  onPlayersChange,
}: PlayerManagerProps) => {
  const [newPlayerName, setNewPlayerName] = useState("");

  const handleAddPlayer = () => {
    if (!newPlayerName.trim()) {
      toast.error("Please enter a player name");
      return;
    }

    const newPlayer: Player = {
      id: Date.now().toString(),
      name: newPlayerName.trim(),
    };

    onPlayersChange([...players, newPlayer]);
    setNewPlayerName("");
    toast.success(`${newPlayer.name} joined the game!`);
  };

  const handleRemovePlayer = (playerId: string) => {
    const player = players.find((p) => p.id === playerId);
    onPlayersChange(players.filter((p) => p.id !== playerId));
    toast.success(`${player?.name} left the game`);
  };

  const handleNameChange = (playerId: string, newName: string) => {
    onPlayersChange(
      players.map((p) => (p.id === playerId ? { ...p, name: newName } : p))
    );
  };

  return (
    <Card className="p-6 bg-gradient-card border-border">
      <h2 className="text-2xl font-bold mb-4 text-foreground flex items-center justify-between">
        Players
        <span className="text-sm text-muted-foreground font-normal">({players.length})</span>
      </h2>

      {players.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p className="text-sm mb-2">No players yet</p>
          <p className="text-xs">Add players below to start!</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
        {players.map((player, index) => (
          <div
            key={player.id}
            className={`flex items-center gap-2 p-3 rounded-lg border transition-all group ${
              index === currentPlayerIndex
                ? "border-primary bg-primary/10 shadow-glow-cyan"
                : "border-border bg-muted/30 hover:border-primary/30"
            }`}
          >
            <GripVertical className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <div className="flex-1 min-w-0 relative group">
              <Input
                value={player.name}
                onChange={(e) => handleNameChange(player.id, e.target.value)}
                className="bg-transparent border-none focus-visible:ring-0 text-foreground font-medium text-sm h-auto p-1 pr-6"
              />
              {player.name.length > 15 && (
                <div className="absolute left-0 top-full mt-1 px-2 py-1 bg-popover border border-border rounded-md shadow-lg z-50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap text-xs">
                  {player.name}
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleRemovePlayer(player.id)}
              className="flex-shrink-0 text-muted-foreground hover:text-destructive h-7 w-7"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <Input
          value={newPlayerName}
          onChange={(e) => setNewPlayerName(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleAddPlayer()}
          placeholder="New player name"
          className="bg-input border-border text-foreground"
        />
        <Button
          onClick={handleAddPlayer}
          className="bg-primary hover:bg-primary/90 text-primary-foreground flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
};
