import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, RotateCcw, Edit, Shuffle } from "lucide-react";
import { KingsCupRule, Player } from "@/types/game";
import { PlayerManager } from "@/components/PlayerManager";
import { RuleEditor } from "@/components/RuleEditor";
import { HostPanel } from "@/components/HostPanel";
import { MateSelector } from "@/components/MateSelector";
import { PageTransition } from "@/components/PageTransition";
import { toast } from "sonner";

interface Mate {
  id: string;
  player1: Player;
  player2: Player;
}

const CARD_DECK = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

export default function GamePlay() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [rules, setRules] = useState<KingsCupRule[]>([]);
  const [currentCard, setCurrentCard] = useState<string | null>(null);
  const [currentRule, setCurrentRule] = useState<string | null>(null);
  const [showRuleEditor, setShowRuleEditor] = useState(false);
  const [drawnCards, setDrawnCards] = useState<Set<number>>(new Set());
  const [flippingCard, setFlippingCard] = useState<number | null>(null);
  const [mates, setMates] = useState<Mate[]>([]);
  const [showMateSelector, setShowMateSelector] = useState(false);
  const [stackDates, setStackDates] = useState(false);

  useEffect(() => {
    const savedRules = localStorage.getItem(`${gameId}-rules`);
    if (savedRules) {
      setRules(JSON.parse(savedRules));
    }
  }, [gameId]);

  const handleDrawCard = () => {
    if (players.length === 0) {
      toast.error("Add players first!");
      return;
    }

    if (drawnCards.size >= 52) {
      toast.error("All cards drawn! Restart the game.");
      return;
    }

    // Find an undrawn card
    let cardIndex;
    do {
      cardIndex = Math.floor(Math.random() * 52);
    } while (drawnCards.has(cardIndex));

    // Pick a random card type
    const cardType = CARD_DECK[Math.floor(Math.random() * CARD_DECK.length)];
    const rule = rules.find((r) => r.card === cardType);

    setFlippingCard(cardIndex);
    
    setTimeout(() => {
      setCurrentCard(cardType);
      const ruleText = rule?.rule || "No rule found!";
      setCurrentRule(ruleText);
      setDrawnCards(new Set([...drawnCards, cardIndex]));
      setFlippingCard(null);
      
      toast.success(`${players[currentPlayerIndex].name} drew a ${cardType}!`);
      
      // Check if rule contains "date" or "mate"
      if (ruleText.toLowerCase().includes("date") || ruleText.toLowerCase().includes("mate")) {
        setTimeout(() => {
          setShowMateSelector(true);
        }, 500);
      }
      
      // Move to next player
      const nextIndex = (currentPlayerIndex + 1) % players.length;
      setCurrentPlayerIndex(nextIndex);
    }, 300);
  };

  const handleAddMate = (player1Id: string, player2Id: string) => {
    const player1 = players.find((p) => p.id === player1Id);
    const player2 = players.find((p) => p.id === player2Id);

    if (!player1 || !player2) return;

    const newMate: Mate = {
      id: Date.now().toString(),
      player1,
      player2,
    };

    if (stackDates) {
      setMates([...mates, newMate]);
    } else {
      setMates([newMate]);
    }

    toast.success(`${player1.name} & ${player2.name} are now mates! 💕`);
  };

  const handleRemoveMate = (mateId: string) => {
    setMates(mates.filter((m) => m.id !== mateId));
    toast.success("Mate removed");
  };

  const handleRestart = () => {
    setCurrentCard(null);
    setCurrentRule(null);
    setCurrentPlayerIndex(0);
    setDrawnCards(new Set());
    setFlippingCard(null);
    setMates([]);
    toast.success("Game restarted!");
  };

  // Create circle of 52 cards
  const totalCards = 52;
  const centerX = 250; // center X position
  const centerY = 250; // center Y position
  const radius = 180; // radius of the circle

  return (
    <PageTransition>
      <div className="min-h-screen bg-background flex overflow-y-auto">
      {/* Left Sidebar - Player List */}
      <div className="w-80 border-r border-border flex flex-col max-h-screen sticky top-0">
        <div className="p-4 border-b border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/game/${gameId}/settings`)}
            className="w-full justify-start text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Settings
          </Button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <PlayerManager
            players={players}
            currentPlayerIndex={currentPlayerIndex}
            onPlayersChange={(newPlayers) => {
              // Handle player removal - adjust currentPlayerIndex if needed
              if (newPlayers.length < players.length && newPlayers.length > 0) {
                // A player was removed
                if (currentPlayerIndex >= newPlayers.length) {
                  // Current player was at the end, wrap to start
                  setCurrentPlayerIndex(0);
                }
                // If current player was removed from middle, index stays same (next player shifts into position)
              } else if (newPlayers.length === 0) {
                // All players removed
                setCurrentPlayerIndex(0);
              }
              setPlayers(newPlayers);
            }}
          />
        </div>
      </div>

      {/* Main Game Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar - Current Player */}
        <div className="flex items-center justify-center py-4 border-b border-border bg-card/50 sticky top-0 z-10">
          <Card className="px-8 py-3 bg-gradient-card border-primary shadow-glow-cyan">
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Current Turn:</span>
              <span className="text-3xl font-bold text-primary animate-glow-pulse">
                {players[currentPlayerIndex]?.name || "Add players to start"}
              </span>
            </div>
          </Card>
        </div>

        {/* Card Circle Area */}
        <div className="flex-1 flex items-center justify-center p-8 relative">
          {/* Card Circle */}
          <div className="relative" style={{ width: '500px', height: '500px' }}>
            {Array.from({ length: totalCards }).map((_, i) => {
              const angle = (i / totalCards) * 2 * Math.PI - Math.PI / 2;
              const x = centerX + radius * Math.cos(angle);
              const y = centerY + radius * Math.sin(angle);
              const isDrawn = drawnCards.has(i);
              const isFlipping = flippingCard === i;

              return (
                <div
                  key={i}
                  className={`absolute transition-all duration-300 ${
                    isDrawn
                      ? "opacity-0 pointer-events-none"
                      : isFlipping
                      ? "animate-card-flip scale-125 shadow-glow-cyan z-20"
                      : "opacity-100"
                  }`}
                  style={{
                    left: `${x - 24}px`,
                    top: `${y - 32}px`,
                    width: '48px',
                    height: '64px',
                  }}
                >
                  <div
                    className="w-full h-full rounded-md bg-gradient-primary shadow-card"
                    style={{
                      transform: `rotate(${(i / totalCards) * 360}deg)`,
                    }}
                  />
                </div>
              );
            })}

            {/* Center Display */}
            <div
              className="absolute flex items-center justify-center"
              style={{
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                width: '240px',
                height: '240px',
              }}
            >
              <Card className="w-full h-full bg-gradient-card border-primary shadow-glow-cyan flex items-center justify-center">
                {currentCard ? (
                  <div className="text-center animate-scale-in px-4">
                    <div className="text-7xl font-bold mb-3 text-primary animate-glow-pulse">
                      {currentCard}
                    </div>
                    <div className="text-sm text-foreground leading-tight">
                      {currentRule}
                    </div>
                  </div>
                ) : (
                  <div className="text-muted-foreground text-center px-4">
                    <div className="text-6xl mb-2">👑♣️</div>
                    <p className="text-sm">Click Draw Card to start!</p>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>

        {/* Bottom Controls - Fixed */}
        <div className="sticky bottom-0 border-t border-border bg-card/95 backdrop-blur-sm p-4 z-10">
          <div className="max-w-4xl mx-auto flex items-center justify-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <span className="font-bold text-foreground">{52 - drawnCards.size}</span>
              <span>cards remaining</span>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowRuleEditor(true)}
                className="border-primary text-primary hover:bg-primary/10 hover:scale-105 transition-all"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Rules
              </Button>

              <Button
                onClick={handleDrawCard}
                disabled={drawnCards.size >= 52 || players.length === 0}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xl px-8 py-6 shadow-glow-cyan hover:shadow-glow-purple hover:scale-110 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed animate-button-pulse"
              >
                <Shuffle className="w-5 h-5 mr-2" />
                Draw Card
              </Button>

              <Button
                variant="outline"
                onClick={handleRestart}
                className="border-secondary text-secondary hover:bg-secondary/10 hover:scale-105 transition-all"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Restart
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Host Notes & Mates */}
      <HostPanel
        players={players}
        mates={mates}
        onAddMate={() => setShowMateSelector(true)}
        onRemoveMate={handleRemoveMate}
        stackDates={stackDates}
        onStackDatesChange={setStackDates}
      />

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

      {showMateSelector && (
        <MateSelector
          players={players}
          onConfirm={handleAddMate}
          onClose={() => setShowMateSelector(false)}
        />
      )}
      </div>
    </PageTransition>
  );
}
