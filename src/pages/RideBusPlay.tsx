import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Play, RotateCcw } from "lucide-react";
import { Player } from "@/types/game";
import { PlayerManager } from "@/components/PlayerManager";
import { PageTransition } from "@/components/PageTransition";
import { RideBusCard } from "@/components/RideBusCard";
import { useCardBack } from "@/hooks/useCardBack";
import { toast } from "sonner";

const SUITS = ["hearts", "clubs", "diamonds", "spades"];
const RANKS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

interface PlayerCards {
  playerId: string;
  cards: string[];
  drinksGiven: number;
  drinksTaken: number;
}

type GamePhase = "round1" | "round2" | "round3" | "round4" | "bus" | "finished";

export default function RideBusPlay() {
  const navigate = useNavigate();
  const { cardBackUrl } = useCardBack();
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [currentPhase, setCurrentPhase] = useState<GamePhase>("round1");
  const [currentRound, setCurrentRound] = useState(1);
  const [playerCards, setPlayerCards] = useState<PlayerCards[]>([]);
  const [drawnDeck, setDrawnDeck] = useState<Set<string>>(new Set());
  const [busCards, setBusCards] = useState<string[]>([]);
  const [flippedBusCards, setFlippedBusCards] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [lastDrawnCard, setLastDrawnCard] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  const drawCard = (): string => {
    let card: string;
    do {
      const suit = SUITS[Math.floor(Math.random() * SUITS.length)];
      const rank = RANKS[Math.floor(Math.random() * RANKS.length)];
      card = `${rank}-${suit}`;
    } while (drawnDeck.has(card));
    
    setDrawnDeck(new Set([...drawnDeck, card]));
    return card;
  };

  const handleChoice = async (choice: string) => {
    if (players.length === 0) {
      toast.error("Add players first!");
      return;
    }

    setSelectedChoice(choice);
    
    // Draw card and check if correct
    const card = drawCard();
    setLastDrawnCard(card);
    
    const currentPlayer = players[currentPlayerIndex];
    let playerCardData = playerCards.find(pc => pc.playerId === currentPlayer.id);
    
    if (!playerCardData) {
      playerCardData = {
        playerId: currentPlayer.id,
        cards: [],
        drinksGiven: 0,
        drinksTaken: 0
      };
    }

    const [rank, suit] = card.split("-");
    let isCorrect = false;

    // Determine if choice is correct based on current phase
    if (currentPhase === "round1") {
      const isRed = suit === "hearts" || suit === "diamonds";
      isCorrect = (choice === "red" && isRed) || (choice === "black" && !isRed);
    } else if (currentPhase === "round2") {
      const lastCard = playerCardData.cards[playerCardData.cards.length - 1];
      const lastRank = RANKS.indexOf(lastCard.split("-")[0]);
      const currentRank = RANKS.indexOf(rank);
      isCorrect = (choice === "higher" && currentRank > lastRank) || (choice === "lower" && currentRank < lastRank);
    } else if (currentPhase === "round3") {
      const card1Rank = RANKS.indexOf(playerCardData.cards[0].split("-")[0]);
      const card2Rank = RANKS.indexOf(playerCardData.cards[1].split("-")[0]);
      const currentRank = RANKS.indexOf(rank);
      const min = Math.min(card1Rank, card2Rank);
      const max = Math.max(card1Rank, card2Rank);
      const isInside = currentRank > min && currentRank < max;
      isCorrect = (choice === "inside" && isInside) || (choice === "outside" && !isInside);
    } else if (currentPhase === "round4") {
      isCorrect = choice === suit;
    }

    // Update player cards
    playerCardData.cards.push(card);
    if (isCorrect) {
      playerCardData.drinksGiven += currentRound;
      toast.success(`${currentPlayer.name} guessed ${choice} - Correct! ✅ Give ${currentRound} drink${currentRound > 1 ? 's' : ''}`);
    } else {
      playerCardData.drinksTaken += currentRound;
      toast.error(`${currentPlayer.name} guessed ${choice} - Wrong! ❌ Take ${currentRound} drink${currentRound > 1 ? 's' : ''}`);
    }

    const updatedPlayerCards = playerCards.filter(pc => pc.playerId !== currentPlayer.id);
    updatedPlayerCards.push(playerCardData);
    setPlayerCards(updatedPlayerCards);
    setShowResult(true);

    // Move to next turn after showing result
    setTimeout(() => {
      const nextPlayerIndex = (currentPlayerIndex + 1) % players.length;
      
      if (nextPlayerIndex === 0) {
        // Round complete, move to next round
        if (currentRound < 4) {
          const roundPhases: GamePhase[] = ["round1", "round2", "round3", "round4"];
          setCurrentRound(currentRound + 1);
          setCurrentPhase(roundPhases[currentRound]);
        } else {
          // Move to bus phase
          setCurrentPhase("bus");
          const newBusCards = Array.from({ length: 8 }, () => drawCard());
          setBusCards(newBusCards);
          setFlippedBusCards(0);
        }
      }
      
      setCurrentPlayerIndex(nextPlayerIndex);
      setSelectedChoice(null);
      setLastDrawnCard(null);
      setShowResult(false);
    }, 2000);
  };

  const handleFlipBusCard = () => {
    if (flippedBusCards >= busCards.length) {
      setCurrentPhase("finished");
      toast.success("Game Over! 🎉");
      return;
    }

    setFlippedBusCards(flippedBusCards + 1);
  };

  const handleRestart = () => {
    setCurrentPlayerIndex(0);
    setCurrentPhase("round1");
    setCurrentRound(1);
    setPlayerCards([]);
    setDrawnDeck(new Set());
    setBusCards([]);
    setFlippedBusCards(0);
    setSelectedChoice(null);
    setLastDrawnCard(null);
    setShowResult(false);
    toast.success("Game restarted!");
  };

  const currentPlayer = players[currentPlayerIndex];
  const currentPlayerCards = playerCards.find(pc => pc.playerId === currentPlayer?.id);

  return (
    <PageTransition>
      <div className="min-h-screen bg-background flex overflow-y-auto">
        {/* Left Sidebar - Player List */}
        <div className="w-80 border-r border-border flex flex-col h-screen sticky top-0 shadow-[0_0_20px_hsl(var(--primary)/0.2)]">
          <div className="p-4 border-b border-border flex-shrink-0 bg-card/50 backdrop-blur-sm">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/game/ride-bus/setup")}
              className="w-full justify-start text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Setup
            </Button>
          </div>
          
          <div className="flex-1 p-4 flex flex-col min-h-0 overflow-hidden">
            <PlayerManager
              players={players}
              currentPlayerIndex={currentPlayerIndex}
              onPlayersChange={setPlayers}
              onCurrentPlayerIndexChange={setCurrentPlayerIndex}
            />
          </div>

          {/* Player Stats */}
          <div className="p-4 border-t border-border bg-card/50 max-h-64 overflow-y-auto">
            <h3 className="text-sm font-bold text-foreground mb-2">Drink Stats</h3>
            <div className="space-y-2">
              {players.map(player => {
                const pc = playerCards.find(p => p.playerId === player.id);
                return (
                  <div key={player.id} className="text-xs flex justify-between text-muted-foreground">
                    <span className="font-medium">{player.name}</span>
                    <span>
                      <span className="text-primary">+{pc?.drinksGiven || 0}</span> / 
                      <span className="text-secondary"> -{pc?.drinksTaken || 0}</span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Game Area */}
        <div className="flex-1 flex flex-col">
          {/* Top Bar */}
          <div className="flex items-center justify-between py-4 px-6 border-b border-border bg-card/50 sticky top-0 z-10">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                {currentPhase === "round1" && "Round 1: Red or Black"}
                {currentPhase === "round2" && "Round 2: Higher or Lower"}
                {currentPhase === "round3" && "Round 3: Inside or Outside"}
                {currentPhase === "round4" && "Round 4: Pick a Suit"}
                {currentPhase === "bus" && "Ride the Bus! 🚌"}
                {currentPhase === "finished" && "Game Over! 🎉"}
              </h2>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleRestart}
              className="border-accent text-accent hover:bg-accent/10"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Restart
            </Button>
          </div>

          {/* Game Content */}
          <div className="flex-1 flex items-center justify-center p-8">
            {currentPhase === "bus" ? (
              // Bus Phase
              <div className="text-center">
                <h3 className="text-3xl font-bold text-foreground mb-8">
                  Flip the Bus Cards
                </h3>
                <div className="grid grid-cols-4 gap-4 mb-8">
                  {busCards.slice(0, 4).map((card, idx) => (
                    <div key={idx} className="flex flex-col items-center">
                      <RideBusCard 
                        card={card} 
                        size="lg" 
                        faceDown={idx >= flippedBusCards}
                      />
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-4 gap-4 mb-8">
                  {busCards.slice(4, 8).map((card, idx) => (
                    <div key={idx + 4} className="flex flex-col items-center">
                      <RideBusCard 
                        card={card} 
                        size="lg" 
                        faceDown={idx + 4 >= flippedBusCards}
                      />
                    </div>
                  ))}
                </div>
                <Button
                  onClick={handleFlipBusCard}
                  disabled={flippedBusCards >= busCards.length}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-8 py-4 text-xl"
                >
                  {flippedBusCards >= busCards.length ? "Game Over" : "Flip Next Card"}
                </Button>
              </div>
            ) : currentPhase === "finished" ? (
              // Finished
              <div className="text-center">
                <h2 className="text-5xl font-bold text-primary mb-8">🎉 Game Over! 🎉</h2>
                <Button
                  onClick={handleRestart}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-8 py-4 text-xl"
                >
                  <RotateCcw className="w-5 h-5 mr-2" />
                  Play Again
                </Button>
              </div>
            ) : (
              // Regular Rounds
              <div className="max-w-2xl w-full">
                <Card className="p-8 bg-card/95 backdrop-blur-sm border-border">
                  {/* Current Player */}
                  <div className="text-center mb-6">
                    <h3 className="text-4xl font-bold text-primary mb-2">
                      {currentPlayer?.name || "Add players to start"}
                    </h3>
                    <p className="text-muted-foreground">Your turn!</p>
                  </div>

                  {/* Player's Cards */}
                  {currentPlayerCards && currentPlayerCards.cards.length > 0 && (
                    <div className="mb-6 flex gap-3 justify-center flex-wrap">
                      {currentPlayerCards.cards.map((card, idx) => (
                        <RideBusCard key={idx} card={card} size="md" />
                      ))}
                    </div>
                  )}

                  {/* Result Display */}
                  {showResult && lastDrawnCard && (
                    <div className="mb-6 p-6 bg-primary/10 rounded-lg border-2 border-primary animate-fade-in">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground mb-2">Drew:</p>
                        <div className="flex justify-center mb-2">
                          <RideBusCard card={lastDrawnCard} size="lg" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Choice Buttons */}
                  {!selectedChoice && !showResult && currentPlayer && (
                    <div className="space-y-3">
                      {currentPhase === "round1" && (
                        <>
                          <Button
                            onClick={() => handleChoice("red")}
                            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-6 text-lg"
                          >
                            ❤️ Red
                          </Button>
                          <Button
                            onClick={() => handleChoice("black")}
                            className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-6 text-lg"
                          >
                            ♠️ Black
                          </Button>
                        </>
                      )}

                      {currentPhase === "round2" && (
                        <>
                          <Button
                            onClick={() => handleChoice("higher")}
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-6 text-lg"
                          >
                            ⬆️ Higher
                          </Button>
                          <Button
                            onClick={() => handleChoice("lower")}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-6 text-lg"
                          >
                            ⬇️ Lower
                          </Button>
                        </>
                      )}

                      {currentPhase === "round3" && (
                        <>
                          <Button
                            onClick={() => handleChoice("inside")}
                            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-6 text-lg"
                          >
                            📍 Inside
                          </Button>
                          <Button
                            onClick={() => handleChoice("outside")}
                            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-6 text-lg"
                          >
                            🌐 Outside
                          </Button>
                        </>
                      )}

                      {currentPhase === "round4" && (
                        <>
                          <Button
                            onClick={() => handleChoice("hearts")}
                            className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-4"
                          >
                            ♥️ Hearts
                          </Button>
                          <Button
                            onClick={() => handleChoice("clubs")}
                            className="w-full bg-green-700 hover:bg-green-800 text-white font-bold py-4"
                          >
                            ♣️ Clubs
                          </Button>
                          <Button
                            onClick={() => handleChoice("diamonds")}
                            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-4"
                          >
                            ♦️ Diamonds
                          </Button>
                          <Button
                            onClick={() => handleChoice("spades")}
                            className="w-full bg-gray-800 hover:bg-gray-900 text-white font-bold py-4"
                          >
                            ♠️ Spades
                          </Button>
                        </>
                      )}
                    </div>
                  )}

                  {selectedChoice && !showResult && (
                    <div className="p-4 rounded-lg bg-accent/20 border border-accent text-center">
                      <p className="text-sm text-foreground">
                        Processing...
                      </p>
                    </div>
                  )}
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
