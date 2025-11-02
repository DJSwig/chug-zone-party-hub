import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { Player } from "@/types/game";
import { PlayerManager } from "@/components/PlayerManager";
import { PageTransition } from "@/components/PageTransition";
import { RideBusCard } from "@/components/RideBusCard";
import { useCardBack } from "@/hooks/useCardBack";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

const SUITS = ["hearts", "clubs", "diamonds", "spades"];
const RANKS = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];

const PLAYER_COLORS = [
  "hsl(142 76% 45%)", // emerald
  "hsl(217 91% 60%)", // slate
  "hsl(277 85% 60%)", // purple
  "hsl(185 100% 50%)", // cyan
  "hsl(0 84% 60%)", // red
  "hsl(45 93% 47%)", // yellow
  "hsl(340 82% 52%)", // pink
  "hsl(25 95% 53%)", // orange
];

interface ExtendedPlayer extends Player {
  color: string;
}

interface PlayerCards {
  playerId: string;
  cards: string[];
  drinksGiven: number;
  drinksTaken: number;
  matches: number;
}

type GamePhase = "round1" | "round2" | "round3" | "round4" | "community" | "busRider" | "finished";

export default function RideBusPlay() {
  const navigate = useNavigate();
  const { cardBackUrl } = useCardBack();
  const [players, setPlayers] = useState<ExtendedPlayer[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [currentPhase, setCurrentPhase] = useState<GamePhase>("round1");
  const [currentRound, setCurrentRound] = useState(1);
  const [playerCards, setPlayerCards] = useState<PlayerCards[]>([]);
  const [deck, setDeck] = useState<string[]>([]);
  const [communityCards, setCommunityCards] = useState<string[]>([]);
  const [flippedCommunityCards, setFlippedCommunityCards] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [lastDrawnCard, setLastDrawnCard] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [busRider, setBusRider] = useState<ExtendedPlayer | null>(null);
  const [deckCount, setDeckCount] = useState(52);

  // Initialize a shuffled deck
  const initializeDeck = (): string[] => {
    const newDeck: string[] = [];
    for (const suit of SUITS) {
      for (const rank of RANKS) {
        newDeck.push(`${rank}-${suit}`);
      }
    }
    // Fisher-Yates shuffle
    for (let i = newDeck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
    }
    return newDeck;
  };

  useEffect(() => {
    setDeck(initializeDeck());
  }, []);

  const drawCard = (): string => {
    if (deck.length === 0) {
      const newDeck = initializeDeck();
      setDeck(newDeck);
      setDeckCount(52);
      const card = newDeck[0];
      setDeck(newDeck.slice(1));
      setDeckCount(newDeck.length - 1);
      return card;
    }
    const card = deck[0];
    setDeck(deck.slice(1));
    setDeckCount(deck.length - 1);
    return card;
  };

  const handlePlayersChange = (newPlayers: Player[]) => {
    const extendedPlayers: ExtendedPlayer[] = newPlayers.map((player, idx) => ({
      ...player,
      color: PLAYER_COLORS[idx % PLAYER_COLORS.length],
    }));
    setPlayers(extendedPlayers);
  };

  const handleChoice = async (choice: string) => {
    if (players.length === 0) {
      toast.error("Add players first!");
      return;
    }

    if (isAnimating) return;
    setIsAnimating(true);
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
        drinksTaken: 0,
        matches: 0,
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
      isCorrect = (choice === "higher" && currentRank > lastRank) || 
                  (choice === "lower" && currentRank < lastRank) ||
                  (choice === "same" && currentRank === lastRank);
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
    
    // Show result with animation delay
    setTimeout(() => {
      if (isCorrect) {
        playerCardData!.drinksGiven += currentRound;
        toast.success(`${currentPlayer.name} guessed ${choice} - Correct! ✅ Give ${currentRound} drink${currentRound > 1 ? 's' : ''}`, {
          style: { background: 'hsl(142 76% 45%)', color: 'hsl(222 47% 11%)' }
        });
      } else {
        playerCardData!.drinksTaken += currentRound;
        toast.error(`${currentPlayer.name} guessed ${choice} - Wrong! ❌ Take ${currentRound} drink${currentRound > 1 ? 's' : ''}`, {
          style: { background: 'hsl(0 84% 60%)', color: 'hsl(210 40% 98%)' }
        });
      }

      const updatedPlayerCards = playerCards.filter(pc => pc.playerId !== currentPlayer.id);
      updatedPlayerCards.push(playerCardData!);
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
            // Move to community card phase
            setCurrentPhase("community");
            const newCommunityCards = Array.from({ length: 8 }, () => drawCard());
            setCommunityCards(newCommunityCards);
            setFlippedCommunityCards(0);
          }
        }
        
        setCurrentPlayerIndex(nextPlayerIndex);
        setSelectedChoice(null);
        setLastDrawnCard(null);
        setShowResult(false);
        setIsAnimating(false);
      }, 2000);
    }, 600);
  };

  const handleFlipCommunityCard = () => {
    if (flippedCommunityCards >= communityCards.length) {
      determineBusRider();
      return;
    }

    const flippedCard = communityCards[flippedCommunityCards];
    const [flippedRank] = flippedCard.split("-");
    
    setFlippedCommunityCards(flippedCommunityCards + 1);

    // Check for matches
    setTimeout(() => {
      playerCards.forEach((pc) => {
        const player = players.find(p => p.id === pc.playerId);
        if (!player) return;

        const hasMatch = pc.cards.some(card => card.split("-")[0] === flippedRank);
        if (hasMatch) {
          const updatedPlayerCards = playerCards.map(p => {
            if (p.playerId === pc.playerId) {
              return { ...p, matches: p.matches + 1 };
            }
            return p;
          });
          setPlayerCards(updatedPlayerCards);
          
          toast(`${player.name} matched a ${flippedRank}!`, {
            description: "They must give or take a drink!",
            style: { background: player.color, color: 'hsl(210 40% 98%)' }
          });
        }
      });
    }, 600);
  };

  const determineBusRider = () => {
    const maxMatches = Math.max(...playerCards.map(pc => pc.matches));
    const riderData = playerCards.find(pc => pc.matches === maxMatches);
    
    if (riderData) {
      const rider = players.find(p => p.id === riderData.playerId);
      if (rider) {
        setBusRider(rider);
        setCurrentPhase("busRider");
        
        setTimeout(() => {
          toast.success(`🚍 ${rider.name} RIDES THE BUS! 🍻`, {
            duration: 5000,
            style: { background: rider.color, color: 'hsl(210 40% 98%)', fontSize: '1.2rem' }
          });
        }, 500);
      }
    }
  };

  const handleRestart = () => {
    setCurrentPlayerIndex(0);
    setCurrentPhase("round1");
    setCurrentRound(1);
    setPlayerCards([]);
    setDeck(initializeDeck());
    setDeckCount(52);
    setCommunityCards([]);
    setFlippedCommunityCards(0);
    setSelectedChoice(null);
    setLastDrawnCard(null);
    setShowResult(false);
    setBusRider(null);
    setIsAnimating(false);
    toast.success("Game restarted!");
  };

  const currentPlayer = players[currentPlayerIndex];
  const currentPlayerCards = playerCards.find(pc => pc.playerId === currentPlayer?.id);
  
  const getPhaseTitle = () => {
    switch (currentPhase) {
      case "round1": return "Round 1: Red or Black";
      case "round2": return "Round 2: Higher or Lower";
      case "round3": return "Round 3: Inside or Outside";
      case "round4": return "Round 4: Pick a Suit";
      case "community": return "Community Cards - Match Your Cards!";
      case "busRider": return "🚍 Time to Ride the Bus! 🚍";
      case "finished": return "Game Over! 🎉";
      default: return "";
    }
  };

  const getProgressValue = () => {
    if (currentPhase === "round1") return 12.5;
    if (currentPhase === "round2") return 37.5;
    if (currentPhase === "round3") return 62.5;
    if (currentPhase === "round4") return 87.5;
    return 100;
  };

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
              onPlayersChange={handlePlayersChange}
              onCurrentPlayerIndexChange={setCurrentPlayerIndex}
            />
          </div>

          {/* Player Stats */}
          <div className="p-4 border-t border-border bg-card/50 max-h-64 overflow-y-auto custom-scrollbar">
            <h3 className="text-sm font-bold text-foreground mb-3">Player Stats</h3>
            <div className="space-y-3">
              {players.map(player => {
                const pc = playerCards.find(p => p.playerId === player.id);
                const isCurrentPlayer = player.id === currentPlayer?.id;
                return (
                  <div 
                    key={player.id} 
                    className={`p-2 rounded-lg border transition-all ${
                      isCurrentPlayer 
                        ? 'border-2 animate-glow-pulse' 
                        : 'border-border'
                    }`}
                    style={isCurrentPlayer ? { 
                      borderColor: player.color,
                      boxShadow: `0 0 15px ${player.color}40`
                    } : {}}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: player.color }}
                      />
                      <span className="font-medium text-sm text-foreground">{player.name}</span>
                    </div>
                    <div className="text-xs text-muted-foreground flex gap-3">
                      <span className="text-primary">Give: {pc?.drinksGiven || 0}</span>
                      <span className="text-destructive">Take: {pc?.drinksTaken || 0}</span>
                      {(currentPhase === "community" || currentPhase === "busRider") && (
                        <span style={{ color: player.color }}>Matches: {pc?.matches || 0}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Game Area */}
        <div className="flex-1 flex flex-col">
          {/* Top Bar */}
          <div className="border-b border-border bg-card/50 sticky top-0 z-10">
            <div className="flex items-center justify-between py-4 px-6">
              <div className="flex-1 flex items-center gap-4">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent animate-text-glow">
                  {getPhaseTitle()}
                </h2>
                {currentPlayer && currentPhase !== "community" && currentPhase !== "busRider" && currentPhase !== "finished" && (
                  <span className="text-sm px-3 py-1 rounded-full animate-scale-in" style={{ 
                    backgroundColor: `${currentPlayer.color}20`,
                    color: currentPlayer.color,
                    border: `1px solid ${currentPlayer.color}`
                  }}>
                    {currentPlayer.name}'s Turn!
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-sm text-muted-foreground">
                  Deck: <span className="text-primary font-bold">{deckCount}</span> cards
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
            </div>
            
            {/* Progress Bar */}
            {currentPhase !== "community" && currentPhase !== "busRider" && currentPhase !== "finished" && (
              <div className="px-6 pb-3">
                <Progress value={getProgressValue()} className="h-2" />
              </div>
            )}
          </div>

          {/* Game Content */}
          <div className="flex-1 flex items-center justify-center p-8 relative">
            {/* Animated Deck */}
            <div className="absolute top-8 right-8">
              <div className="relative">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute rounded-lg shadow-lg"
                    style={{
                      width: '80px',
                      height: '112px',
                      transform: `translate(${i * 2}px, ${i * 2}px)`,
                      zIndex: 3 - i,
                    }}
                  >
                    <img 
                      src={cardBackUrl || "/card-backs/default.png"} 
                      alt="Deck" 
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                ))}
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-muted-foreground whitespace-nowrap">
                  {deckCount} cards
                </div>
              </div>
            </div>

            {currentPhase === "community" ? (
              // Community Card Phase
              <div className="text-center max-w-4xl w-full">
                <h3 className="text-3xl font-bold text-foreground mb-8 animate-scale-in">
                  Match Your Cards!
                </h3>
                <p className="text-muted-foreground mb-8">
                  Flip community cards one at a time. If the rank matches any of your 4 cards, you get a match!
                </p>
                
                <div className="grid grid-cols-4 gap-4 mb-6">
                  {communityCards.slice(0, 4).map((card, idx) => (
                    <div 
                      key={idx} 
                      className={`flex flex-col items-center ${idx === flippedCommunityCards && idx < 4 ? 'animate-card-flip' : ''}`}
                    >
                      <RideBusCard 
                        card={card} 
                        size="lg" 
                        faceDown={idx >= flippedCommunityCards}
                      />
                    </div>
                  ))}
                </div>
                
                <div className="grid grid-cols-4 gap-4 mb-8">
                  {communityCards.slice(4, 8).map((card, idx) => (
                    <div 
                      key={idx + 4} 
                      className={`flex flex-col items-center ${idx + 4 === flippedCommunityCards ? 'animate-card-flip' : ''}`}
                    >
                      <RideBusCard 
                        card={card} 
                        size="lg" 
                        faceDown={idx + 4 >= flippedCommunityCards}
                      />
                    </div>
                  ))}
                </div>
                
                <Button
                  onClick={handleFlipCommunityCard}
                  disabled={flippedCommunityCards >= communityCards.length}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-8 py-4 text-xl animate-button-pulse"
                >
                  {flippedCommunityCards >= communityCards.length ? "Determine Bus Rider" : "Flip Next Card"}
                </Button>
              </div>
            ) : currentPhase === "busRider" ? (
              // Bus Rider Phase
              <div className="text-center max-w-2xl w-full">
                <div className="mb-8 animate-scale-in">
                  <div className="text-8xl mb-4">🚍</div>
                  <h2 className="text-5xl font-bold mb-4 animate-text-glow" style={{ color: busRider?.color }}>
                    {busRider?.name}
                  </h2>
                  <h3 className="text-3xl font-bold text-foreground mb-2">
                    RIDES THE BUS!
                  </h3>
                  <p className="text-xl text-muted-foreground mb-6">
                    Most matches: {playerCards.find(pc => pc.playerId === busRider?.id)?.matches || 0}
                  </p>
                  <div 
                    className="inline-block px-8 py-4 rounded-lg text-2xl font-bold mb-8"
                    style={{ 
                      backgroundColor: `${busRider?.color}20`,
                      border: `2px solid ${busRider?.color}`,
                      color: busRider?.color
                    }}
                  >
                    Take 5 Drinks! 🍻
                  </div>
                </div>

                <div className="space-y-4">
                  <Button
                    onClick={handleRestart}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-8 py-4 text-xl"
                  >
                    <RotateCcw className="w-5 h-5 mr-2" />
                    Play Again
                  </Button>
                  <Button
                    onClick={() => navigate("/")}
                    variant="outline"
                    className="w-full border-secondary text-secondary hover:bg-secondary/10 font-bold px-8 py-4 text-xl"
                  >
                    Return to Menu
                  </Button>
                </div>
              </div>
            ) : currentPhase === "finished" ? (
              // Finished
              <div className="text-center">
                <h2 className="text-5xl font-bold text-primary mb-8 animate-scale-in">🎉 Game Over! 🎉</h2>
                <div className="space-y-4">
                  <Button
                    onClick={handleRestart}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-8 py-4 text-xl"
                  >
                    <RotateCcw className="w-5 h-5 mr-2" />
                    Play Again
                  </Button>
                  <Button
                    onClick={() => navigate("/")}
                    variant="outline"
                    className="border-secondary text-secondary hover:bg-secondary/10 font-bold px-8 py-4 text-xl"
                  >
                    Return to Menu
                  </Button>
                </div>
              </div>
            ) : (
              // Regular Rounds
              <div className="max-w-3xl w-full">
                <Card className="p-8 bg-card/95 backdrop-blur-sm border-2 transition-all" style={{
                  borderColor: currentPlayer?.color,
                  boxShadow: `0 0 30px ${currentPlayer?.color}40`
                }}>
                  {/* Current Player */}
                  <div className="text-center mb-6">
                    <div className="flex items-center justify-center gap-3 mb-3">
                      <div 
                        className="w-4 h-4 rounded-full animate-glow-pulse" 
                        style={{ backgroundColor: currentPlayer?.color }}
                      />
                      <h3 className="text-5xl font-bold animate-scale-in" style={{ color: currentPlayer?.color }}>
                        {currentPlayer?.name || "Add players to start"}
                      </h3>
                      <div 
                        className="w-4 h-4 rounded-full animate-glow-pulse" 
                        style={{ backgroundColor: currentPlayer?.color }}
                      />
                    </div>
                    <p className="text-lg text-muted-foreground">Make your choice!</p>
                  </div>

                  {/* Player's Cards - Left Side */}
                  {currentPlayerCards && currentPlayerCards.cards.length > 0 && (
                    <div className="mb-8">
                      <p className="text-sm text-muted-foreground text-center mb-3">Your Cards:</p>
                      <div className="flex gap-3 justify-center flex-wrap">
                        {currentPlayerCards.cards.map((card, idx) => (
                          <div key={idx} className="animate-scale-in" style={{ animationDelay: `${idx * 0.1}s` }}>
                            <RideBusCard card={card} size="md" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Result Display */}
                  {showResult && lastDrawnCard && (
                    <div 
                      className="mb-6 p-6 rounded-lg border-2 animate-card-flip"
                      style={{
                        backgroundColor: `${currentPlayer?.color}10`,
                        borderColor: currentPlayer?.color
                      }}
                    >
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground mb-3">Card Drawn:</p>
                        <div className="flex justify-center">
                          <RideBusCard card={lastDrawnCard} size="lg" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Choice Buttons */}
                  {!selectedChoice && !showResult && currentPlayer && (
                    <div className="space-y-3">
                      {currentPhase === "round1" && (
                        <div className="grid grid-cols-2 gap-3">
                          <Button
                            onClick={() => handleChoice("red")}
                            className="w-full bg-destructive hover:bg-destructive/90 text-destructive-foreground font-bold py-8 text-xl transition-all hover:scale-105"
                          >
                            ❤️ Red
                          </Button>
                          <Button
                            onClick={() => handleChoice("black")}
                            className="w-full bg-foreground hover:bg-foreground/90 text-background font-bold py-8 text-xl transition-all hover:scale-105"
                          >
                            ♠️ Black
                          </Button>
                        </div>
                      )}

                      {currentPhase === "round2" && (
                        <div className="grid grid-cols-2 gap-3">
                          <Button
                            onClick={() => handleChoice("higher")}
                            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-8 text-xl transition-all hover:scale-105"
                          >
                            ⬆️ Higher
                          </Button>
                          <Button
                            onClick={() => handleChoice("lower")}
                            className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold py-8 text-xl transition-all hover:scale-105"
                          >
                            ⬇️ Lower
                          </Button>
                        </div>
                      )}

                      {currentPhase === "round3" && (
                        <div className="grid grid-cols-2 gap-3">
                          <Button
                            onClick={() => handleChoice("inside")}
                            className="w-full font-bold py-8 text-xl transition-all hover:scale-105"
                            style={{ 
                              backgroundColor: 'hsl(277 85% 60%)',
                              color: 'hsl(210 40% 98%)'
                            }}
                          >
                            📍 Inside
                          </Button>
                          <Button
                            onClick={() => handleChoice("outside")}
                            className="w-full font-bold py-8 text-xl transition-all hover:scale-105"
                            style={{ 
                              backgroundColor: 'hsl(25 95% 53%)',
                              color: 'hsl(210 40% 98%)'
                            }}
                          >
                            🌐 Outside
                          </Button>
                        </div>
                      )}

                      {currentPhase === "round4" && (
                        <div className="grid grid-cols-2 gap-3">
                          <Button
                            onClick={() => handleChoice("hearts")}
                            className="w-full bg-destructive hover:bg-destructive/90 text-destructive-foreground font-bold py-6 text-lg transition-all hover:scale-105"
                          >
                            ♥️ Hearts
                          </Button>
                          <Button
                            onClick={() => handleChoice("clubs")}
                            className="w-full font-bold py-6 text-lg transition-all hover:scale-105"
                            style={{ 
                              backgroundColor: 'hsl(142 76% 35%)',
                              color: 'hsl(210 40% 98%)'
                            }}
                          >
                            ♣️ Clubs
                          </Button>
                          <Button
                            onClick={() => handleChoice("diamonds")}
                            className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold py-6 text-lg transition-all hover:scale-105"
                          >
                            ♦️ Diamonds
                          </Button>
                          <Button
                            onClick={() => handleChoice("spades")}
                            className="w-full bg-foreground hover:bg-foreground/90 text-background font-bold py-6 text-lg transition-all hover:scale-105"
                          >
                            ♠️ Spades
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  {selectedChoice && !showResult && (
                    <div 
                      className="p-6 rounded-lg border-2 text-center animate-glow-pulse"
                      style={{
                        backgroundColor: `${currentPlayer?.color}20`,
                        borderColor: currentPlayer?.color
                      }}
                    >
                      <p className="text-lg font-bold" style={{ color: currentPlayer?.color }}>
                        Drawing card...
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
