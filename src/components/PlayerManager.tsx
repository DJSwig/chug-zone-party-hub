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
  onCurrentPlayerIndexChange?: (newIndex: number) => void;
}

export const PlayerManager = ({
  players,
  currentPlayerIndex,
  onPlayersChange,
  onCurrentPlayerIndexChange,
}: PlayerManagerProps) => {
  const [newPlayerName, setNewPlayerName] = useState("");
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [draggedOverIndex, setDraggedOverIndex] = useState<number | null>(null);

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
    const playerIndex = players.findIndex((p) => p.id === playerId);
    const newPlayers = players.filter((p) => p.id !== playerId);
    
    onPlayersChange(newPlayers);
    
    // If we removed the current player, notify parent to adjust currentPlayerIndex
    if (playerIndex === currentPlayerIndex && newPlayers.length > 0) {
      // The parent component will need to handle this via the onPlayersChange callback
      toast.info(`Turn passes to ${newPlayers[currentPlayerIndex % newPlayers.length]?.name}`);
    }
    
    toast.success(`${player?.name} left the game`);
  };

  const handleNameChange = (playerId: string, newName: string) => {
    onPlayersChange(
      players.map((p) => (p.id === playerId ? { ...p, name: newName } : p))
    );
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDraggedOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDraggedOverIndex(null);
      return;
    }

    const newPlayers = [...players];
    const [draggedPlayer] = newPlayers.splice(draggedIndex, 1);
    newPlayers.splice(dropIndex, 0, draggedPlayer);

    // Calculate new current player index
    // The current player should remain the same person, just at a different index
    const currentPlayerId = players[currentPlayerIndex]?.id;
    const newCurrentPlayerIndex = newPlayers.findIndex(p => p.id === currentPlayerId);

    onPlayersChange(newPlayers);
    if (onCurrentPlayerIndexChange && newCurrentPlayerIndex !== -1) {
      onCurrentPlayerIndexChange(newCurrentPlayerIndex);
    }

    setDraggedIndex(null);
    setDraggedOverIndex(null);
    toast.success("Player order updated");
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDraggedOverIndex(null);
  };

  return (
    <Card className="p-5 bg-gradient-card border-border h-full flex flex-col transition-all duration-300">
      <h2 className="text-2xl font-bold mb-4 text-foreground flex items-center justify-between flex-shrink-0">
        Players
        <span className="text-sm text-muted-foreground font-normal">({players.length})</span>
      </h2>

      {players.length === 0 && (
        <div className="text-center py-8 text-muted-foreground flex-1 flex items-center justify-center">
          <div>
            <p className="text-sm mb-2">No players yet</p>
            <p className="text-xs">Add players below to start!</p>
          </div>
        </div>
      )}

      {/* Player Grid - No Scrolling, Expands Vertically Then Horizontally */}
      {players.length > 0 && (
        <div className={`mb-4 flex-1 min-h-0 transition-all duration-300 ease-out ${
          players.length > 10 
            ? 'grid grid-cols-2 gap-x-3 gap-y-2 content-start items-start' 
            : 'flex flex-col gap-2'
        }`}>
          {players.map((player, index) => (
            <div
              key={player.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border transition-all duration-200 relative group cursor-move ${
                index === currentPlayerIndex
                  ? "border-primary bg-primary/10 shadow-glow-cyan"
                  : "border-border bg-muted/30 hover:border-primary/30 hover:shadow-glow-cyan/30"
              } ${
                draggedIndex === index ? "opacity-50" : ""
              } ${
                draggedOverIndex === index && draggedIndex !== null && draggedIndex !== index
                  ? "border-primary/60 scale-105"
                  : ""
              }`}
            >
              <GripVertical className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0 cursor-grab active:cursor-grabbing" />
              <div className="flex-1 min-w-0 overflow-hidden">
                <Input
                  value={player.name}
                  onChange={(e) => handleNameChange(player.id, e.target.value)}
                  className="bg-transparent border-none focus-visible:ring-0 text-foreground font-medium text-sm h-auto p-0 w-full truncate"
                  title={player.name}
                />
              </div>
              {player.name.length > 15 && (
                <div className="absolute left-0 top-full mt-1 px-3 py-2 bg-card border-2 border-primary rounded-lg shadow-glow-cyan z-[100] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap text-sm font-medium text-foreground">
                  {player.name}
                </div>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemovePlayer(player.id)}
                className="flex-shrink-0 text-muted-foreground hover:text-destructive h-6 w-6 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2 flex-shrink-0 mt-auto pt-2">
        <Input
          value={newPlayerName}
          onChange={(e) => setNewPlayerName(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleAddPlayer()}
          placeholder="New player name"
          className="bg-input border-border text-foreground transition-colors"
        />
        <Button
          onClick={handleAddPlayer}
          className="bg-primary hover:bg-primary/90 text-primary-foreground flex-shrink-0 transition-all hover:scale-105"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
};
