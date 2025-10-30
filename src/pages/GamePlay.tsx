import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, RotateCcw, Edit, Shuffle } from "lucide-react";
import { KingsCupRule, Player } from "@/types/game";
import { PlayerManager } from "@/components/PlayerManager";
import { RuleEditor } from "@/components/RuleEditor";
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
  const [deckCount, setDeckCount] = useState(52);

  useEffect(() => {
    // Load rules from localStorage
    const savedRules = localStorage.getItem(`${gameId}-rules`);
    if (savedRules) {
      setRules(JSON.parse(savedRules));
    }
  }, [gameId]);

  const handleDrawCard = () => {
    if (deckCount === 0) {
      toast.error("Deck is empty! Restart the game.");
      return;
    }

    // Pick a random card type
    const cardType = CARD_DECK[Math.floor(Math.random() * CARD_DECK.length)];
    const rule = rules.find((r) => r.card === cardType);

    setCurrentCard(cardType);
    setCurrentRule(rule?.rule || "No rule found!");
    setDeckCount(deckCount - 1);

    // Move to next player
    setCurrentPlayerIndex((currentPlayerIndex + 1) % players.length);

    toast.success(`${players[currentPlayerIndex].name} drew a ${cardType}!`);
  };

  const handleRestart = () => {
    setCurrentCard(null);
    setCurrentRule(null);
    setCurrentPlayerIndex(0);
    setDeckCount(52);
    toast.success("Game restarted!");
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(`/game/${gameId}/settings`)}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Settings
          </Button>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowRuleEditor(true)}
              className="border-primary text-primary hover:bg-primary/10"
            >
              <Edit className="w-4 h-4 mr-2" />
              Rules
            </Button>
            <Button
              variant="outline"
              onClick={handleRestart}
              className="border-secondary text-secondary hover:bg-secondary/10"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Restart
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Player Management */}
          <div className="md:col-span-1">
            <PlayerManager
              players={players}
              currentPlayerIndex={currentPlayerIndex}
              onPlayersChange={setPlayers}
            />
          </div>

          {/* Game Area */}
          <div className="md:col-span-2 space-y-6">
            {/* Current Turn Display */}
            <Card className="p-8 bg-gradient-card border-border text-center animate-slide-in">
              <div className="mb-4">
                <span className="text-muted-foreground text-lg">Current Turn</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-primary mb-2 animate-glow-pulse">
                {players[currentPlayerIndex]?.name}
              </h2>
            </Card>

            {/* Card Display */}
            <Card className="p-8 bg-gradient-primary border-primary shadow-glow-cyan">
              <div className="text-center">
                <div className="mb-4 flex items-center justify-center gap-4">
                  <span className="text-muted-foreground">Deck:</span>
                  <span className="text-2xl font-bold text-foreground">{deckCount} cards</span>
                </div>

                <Button
                  onClick={handleDrawCard}
                  disabled={deckCount === 0}
                  className="w-full bg-background hover:bg-background/90 text-primary font-bold text-2xl py-12 mb-6 shadow-card"
                >
                  <Shuffle className="w-8 h-8 mr-3" />
                  Draw Card
                </Button>

                {currentCard && (
                  <div className="animate-slide-in">
                    <div className="text-8xl md:text-9xl font-bold mb-4 text-background">
                      {currentCard}
                    </div>
                    <div className="bg-background/90 rounded-lg p-6">
                      <p className="text-xl text-foreground">{currentRule}</p>
                    </div>
                  </div>
                )}

                {!currentCard && (
                  <div className="text-muted-foreground text-xl">
                    Click "Draw Card" to start!
                  </div>
                )}
              </div>
            </Card>
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
