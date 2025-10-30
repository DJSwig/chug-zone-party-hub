import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, RotateCcw, Edit, Shuffle } from "lucide-react";
import { KingsCupRule, Player } from "@/types/game";
import { PlayerManager } from "@/components/PlayerManager";
import { RuleEditor } from "@/components/RuleEditor";
import { PageTransition } from "@/components/PageTransition";
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
  const [flippingCard, setFlippingCard] = useState<number | null>(null);

  useEffect(() => {
    const savedRules = localStorage.getItem(`${gameId}-rules`);
    if (savedRules) {
      setRules(JSON.parse(savedRules));
    }
  }, [gameId]);

  const handleDrawCard = () => {
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
      setCurrentRule(rule?.rule || "No rule found!");
      setDrawnCards(new Set([...drawnCards, cardIndex]));
      setFlippingCard(null);
      
      toast.success(`${players[currentPlayerIndex].name} drew a ${cardType}!`);
      
      setCurrentPlayerIndex((currentPlayerIndex + 1) % players.length);
    }, 300);
  };

  const handleRestart = () => {
    setCurrentCard(null);
    setCurrentRule(null);
    setCurrentPlayerIndex(0);
    setDrawnCards(new Set());
    setFlippingCard(null);
    toast.success("Game restarted!");
  };

  // Create circle of 52 cards
  const totalCards = 52;
  const centerX = 250; // center X position
  const centerY = 250; // center Y position
  const radius = 180; // radius of the circle

  return (
    <PageTransition>
      <div className="h-screen bg-background flex overflow-hidden">
      {/* Left Sidebar - Player List */}
      <div className="w-80 border-r border-border flex flex-col overflow-hidden">
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
        
        <div className="flex-1 overflow-y-auto p-4">
          <PlayerManager
            players={players}
            currentPlayerIndex={currentPlayerIndex}
            onPlayersChange={setPlayers}
          />
        </div>
      </div>

      {/* Main Game Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar - Current Player */}
        <div className="flex items-center justify-center py-4 border-b border-border bg-card/50">
          <Card className="px-8 py-3 bg-gradient-card border-primary shadow-glow-cyan">
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Current Turn:</span>
              <span className="text-3xl font-bold text-primary animate-glow-pulse">
                {players[currentPlayerIndex]?.name}
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

        {/* Bottom Controls */}
        <div className="border-t border-border bg-card/50 p-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
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
                disabled={drawnCards.size >= 52}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xl px-8 py-6 shadow-glow-cyan hover:shadow-glow-purple hover:scale-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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

            <div className="w-32" /> {/* Spacer for balance */}
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
    </PageTransition>
  );
}
