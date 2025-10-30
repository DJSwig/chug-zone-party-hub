import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, RotateCcw, Edit, Plus, X, GripVertical } from "lucide-react";
import { KingsCupRule, Player } from "@/types/game";
import { RuleEditor } from "@/components/RuleEditor";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const CARD_DECK = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

export default function GamePlay() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const [players, setPlayers] = useState<Player[]>([
    { id: "1", name: "Player 1" },
    { id: "2", name: "Player 2" },
  ]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [rules, setRules] = useState<KingsCupRule[]>([]);
  const [currentCard, setCurrentCard] = useState<string | null>(null);
  const [currentRule, setCurrentRule] = useState<string | null>(null);
  const [showRuleEditor, setShowRuleEditor] = useState(false);
  const [drawnCards, setDrawnCards] = useState<Set<number>>(new Set());
  const [newPlayerName, setNewPlayerName] = useState("");

  useEffect(() => {
    const savedRules = localStorage.getItem(`${gameId}-rules`);
    if (savedRules) {
      setRules(JSON.parse(savedRules));
    }
  }, [gameId]);

  const handleDrawCard = (cardIndex: number) => {
    if (drawnCards.has(cardIndex)) return;

    const cardType = CARD_DECK[Math.floor(Math.random() * CARD_DECK.length)];
    const rule = rules.find((r) => r.card === cardType);

    setCurrentCard(cardType);
    setCurrentRule(rule?.rule || "No rule found!");
    setDrawnCards(new Set([...drawnCards, cardIndex]));
    
    toast.success(`${players[currentPlayerIndex].name} drew a ${cardType}!`);
    
    setCurrentPlayerIndex((currentPlayerIndex + 1) % players.length);
  };

  const handleRestart = () => {
    setCurrentCard(null);
    setCurrentRule(null);
    setCurrentPlayerIndex(0);
    setDrawnCards(new Set());
    toast.success("Game restarted!");
  };

  const handleAddPlayer = () => {
    if (!newPlayerName.trim()) {
      toast.error("Please enter a player name");
      return;
    }
    const newPlayer: Player = {
      id: Date.now().toString(),
      name: newPlayerName.trim(),
    };
    setPlayers([...players, newPlayer]);
    setNewPlayerName("");
    toast.success(`${newPlayer.name} joined!`);
  };

  const handleRemovePlayer = (playerId: string) => {
    if (players.length <= 2) {
      toast.error("Need at least 2 players!");
      return;
    }
    const player = players.find((p) => p.id === playerId);
    setPlayers(players.filter((p) => p.id !== playerId));
    toast.success(`${player?.name} left`);
  };

  const handleNameChange = (playerId: string, newName: string) => {
    setPlayers(players.map((p) => (p.id === playerId ? { ...p, name: newName } : p)));
  };

  // Create circle of 52 cards
  const totalCards = 52;
  const radius = 200;

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/50">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/game/${gameId}/settings`)}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Settings
        </Button>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowRuleEditor(true)}
            className="border-primary text-primary hover:bg-primary/10"
          >
            <Edit className="w-4 h-4 mr-1" />
            Rules
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRestart}
            className="border-secondary text-secondary hover:bg-secondary/10"
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            Restart
          </Button>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 relative overflow-hidden">
        {/* Current Player */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
          <Card className="px-6 py-3 bg-gradient-card border-primary shadow-glow-cyan">
            <div className="text-center">
              <span className="text-sm text-muted-foreground mr-2">Current Turn:</span>
              <span className="text-2xl font-bold text-primary animate-glow-pulse">
                {players[currentPlayerIndex]?.name}
              </span>
            </div>
          </Card>
        </div>

        {/* Card Circle */}
        <div className="relative w-[500px] h-[500px]">
          {Array.from({ length: totalCards }).map((_, i) => {
            const angle = (i / totalCards) * 2 * Math.PI - Math.PI / 2;
            const x = radius * Math.cos(angle);
            const y = radius * Math.sin(angle);
            const isDrawn = drawnCards.has(i);

            return (
              <button
                key={i}
                onClick={() => !isDrawn && handleDrawCard(i)}
                disabled={isDrawn}
                className={`absolute w-12 h-16 rounded-md transition-all duration-500 ${
                  isDrawn
                    ? "bg-muted/20 cursor-not-allowed opacity-0"
                    : "bg-gradient-primary hover:scale-125 hover:shadow-glow-cyan cursor-pointer shadow-card animate-card-flip"
                }`}
                style={{
                  left: `calc(50% + ${x}px - 24px)`,
                  top: `calc(50% + ${y}px - 32px)`,
                  transform: `rotate(${(i / totalCards) * 360}deg)`,
                }}
              />
            );
          })}

          {/* Center Display */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Card className="w-64 h-64 bg-gradient-card border-primary shadow-glow-cyan flex items-center justify-center">
              {currentCard ? (
                <div className="text-center animate-scale-in">
                  <div className="text-8xl font-bold mb-2 text-primary animate-glow-pulse">
                    {currentCard}
                  </div>
                  <div className="px-4 text-sm text-foreground max-w-xs">
                    {currentRule}
                  </div>
                </div>
              ) : (
                <div className="text-muted-foreground text-center px-4">
                  <div className="text-6xl mb-2">👑♣️</div>
                  <p className="text-sm">Click any card to draw!</p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* Bottom Player Management */}
      <div className="border-t border-border bg-card/50 p-3">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-bold text-foreground">Players:</span>
            {players.map((player, index) => (
              <div
                key={player.id}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full border transition-all text-sm ${
                  index === currentPlayerIndex
                    ? "border-primary bg-primary/10 shadow-glow-cyan"
                    : "border-border bg-muted/30"
                }`}
              >
                <GripVertical className="w-3 h-3 text-muted-foreground" />
                <Input
                  value={player.name}
                  onChange={(e) => handleNameChange(player.id, e.target.value)}
                  className="bg-transparent border-none h-auto p-0 text-sm font-medium focus-visible:ring-0 w-20"
                />
                <button
                  onClick={() => handleRemovePlayer(player.id)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            <div className="flex gap-1">
              <Input
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAddPlayer()}
                placeholder="New player"
                className="bg-input border-border text-foreground text-sm h-8 w-28"
              />
              <Button
                onClick={handleAddPlayer}
                size="sm"
                className="h-8 w-8 p-0 bg-primary hover:bg-primary/90"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="text-xs text-muted-foreground text-center">
            {52 - drawnCards.size} cards remaining
          </div>
        </div>
      </div>

      {showRuleEditor && (
        <RuleEditor
          rules={rules}
          onSave={(newRules) => {
            setRules(newRules);
            localStorage.setItem(`${gameId}-rules`, JSON.stringify(newRules));
            setShowRuleEditor(false);
            toast.success("Rules updated!");
          }}
          onClose={() => setShowRuleEditor(false)}
        />
      )}
    </div>
  );
}
