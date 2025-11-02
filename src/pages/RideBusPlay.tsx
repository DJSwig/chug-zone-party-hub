import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { Player } from "@/types/game";
import { PageTransition } from "@/components/PageTransition";
import { RideBusCard } from "@/components/RideBusCard";
import { useCardBack } from "@/hooks/useCardBack";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

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

type GamePhase = "round1" | "round2" | "round3" | "round4" | "community" | "busRider" | "ridingBus" | "finished";

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
  const [newPlayerName, setNewPlayerName] = useState("");
  const [giveCardModalOpen, setGiveCardModalOpen] = useState(false);
  const [currentMatchingPlayer, setCurrentMatchingPlayer] = useState<string | null>(null);
  const [currentMatchingCard, setCurrentMatchingCard] = useState<string | null>(null);
  const giveCardTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Deck ref to allow synchronous draws without state race conditions
  const deckRef = useRef<string[]>([]);
  
  // Bus riding phase state
  const [busCards, setBusCards] = useState<string[]>([]);
  const [busDrinkCount, setBusDrinkCount] = useState(0);
  const [busGuessing, setBusGuessing] = useState(false);

  // Initialize a shuffled deck with proper randomization
  const initializeDeck = (): string[] => {
    const newDeck: string[] = [];
    for (const suit of SUITS) {
      for (const rank of RANKS) {
        newDeck.push(`${rank}-${suit}`);
      }
    }
    // Fisher-Yates shuffle - truly random
    for (let i = newDeck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
    }
    return newDeck;
  };

  useEffect(() => {
    const initialDeck = initializeDeck();
    deckRef.current = initialDeck;
    setDeck(initialDeck);
    setDeckCount(initialDeck.length);
  }, []);

  // Draw a single card synchronously from deckRef
  const drawCard = (): string => {
    if (deckRef.current.length === 0) {
      const newDeck = initializeDeck();
      deckRef.current = newDeck;
    }
    const card = deckRef.current.shift() as string;
    setDeck([...deckRef.current]);
    setDeckCount(deckRef.current.length);
    return card;
  };

  // Draw multiple cards at once to avoid duplicate pulls within same tick
  const drawCards = (count: number): string[] => {
    const result: string[] = [];
    for (let i = 0; i < count; i++) {
      result.push(drawCard());
    }
    return result;
  };

  const handleAddPlayer = () => {
    if (!newPlayerName.trim()) {
      return;
    }
    if (players.length >= 8) {
      toast.error("Maximum 8 players allowed");
      return;
    }

    const newPlayer: ExtendedPlayer = {
      id: Date.now().toString(),
      name: newPlayerName.trim(),
      color: PLAYER_COLORS[players.length % PLAYER_COLORS.length],
    };

    setPlayers([...players, newPlayer]);
    
    // If game is active, catch up the player
    if (currentPhase !== "round1" || playerCards.length > 0) {
      const cardsNeeded = currentRound;
      const catchUpCards: string[] = [];
      
      for (let i = 0; i < cardsNeeded; i++) {
        catchUpCards.push(drawCard());
      }
      
      const newPlayerCards: PlayerCards = {
        playerId: newPlayer.id,
        cards: catchUpCards,
        drinksGiven: 0,
        drinksTaken: 0,
        matches: 0,
      };
      
      setPlayerCards([...playerCards, newPlayerCards]);
      toast.success(`${newPlayer.name} joined and caught up!`);
    } else {
      toast.success(`${newPlayer.name} joined!`);
    }
    
    setNewPlayerName("");
  };

  const handleRemovePlayer = (playerId: string) => {
    setPlayers(players.filter(p => p.id !== playerId));
    setPlayerCards(playerCards.filter(pc => pc.playerId !== playerId));
    toast.success("Player removed");
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
            const newCommunityCards = drawCards(8);
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
      const matchingPlayers: string[] = [];
      
      playerCards.forEach((pc) => {
        const player = players.find(p => p.id === pc.playerId);
        if (!player) return;

        const hasMatch = pc.cards.some(card => card.split("-")[0] === flippedRank);
        if (hasMatch) {
          matchingPlayers.push(pc.playerId);
        }
      });

      // Process matches one at a time
      if (matchingPlayers.length > 0) {
        const playerId = matchingPlayers[0];
        const player = players.find(p => p.id === playerId);
        if (player) {
          setCurrentMatchingPlayer(playerId);
          setCurrentMatchingCard(flippedRank);
          setGiveCardModalOpen(true);
          
          // Auto-default to "Take" after 5 seconds
          giveCardTimeoutRef.current = setTimeout(() => {
            handleTakeCard();
          }, 5000);
        }
      }
    }, 600);
  };

  const handleGiveCard = (recipientId: string) => {
    if (giveCardTimeoutRef.current) {
      clearTimeout(giveCardTimeoutRef.current);
    }

    const giver = players.find(p => p.id === currentMatchingPlayer);
    const recipient = players.find(p => p.id === recipientId);
    
    if (giver && recipient && currentMatchingCard) {
      // Transfer card
      const updatedPlayerCards = playerCards.map(pc => {
        if (pc.playerId === currentMatchingPlayer) {
          // Remove the matching card from giver
          const cardToRemove = pc.cards.find(c => c.split("-")[0] === currentMatchingCard);
          return {
            ...pc,
            cards: pc.cards.filter(c => c !== cardToRemove),
            matches: pc.matches + 1,
          };
        }
        if (pc.playerId === recipientId) {
          // Add card to recipient
          const cardToAdd = playerCards
            .find(p => p.playerId === currentMatchingPlayer)
            ?.cards.find(c => c.split("-")[0] === currentMatchingCard);
          
          return {
            ...pc,
            cards: cardToAdd ? [...pc.cards, cardToAdd] : pc.cards,
          };
        }
        return pc;
      });
      
      setPlayerCards(updatedPlayerCards);
      toast.success(`${giver.name} gave a ${currentMatchingCard} to ${recipient.name}!`);
    }
    
    setGiveCardModalOpen(false);
    setCurrentMatchingPlayer(null);
    setCurrentMatchingCard(null);

    // Continue automatically
    if (flippedCommunityCards < communityCards.length) {
      setTimeout(() => handleFlipCommunityCard(), 400);
    } else {
      setTimeout(() => determineBusRider(), 400);
    }
  };

  const handleTakeCard = () => {
    if (giveCardTimeoutRef.current) {
      clearTimeout(giveCardTimeoutRef.current);
    }

    const player = players.find(p => p.id === currentMatchingPlayer);
    
    if (player && currentMatchingCard) {
      // Increment matches only
      const updatedPlayerCards = playerCards.map(pc => {
        if (pc.playerId === currentMatchingPlayer) {
          return { ...pc, matches: pc.matches + 1 };
        }
        return pc;
      });
      
      setPlayerCards(updatedPlayerCards);
      toast(`${player.name} took the ${currentMatchingCard}!`, {
        style: { background: player.color, color: 'hsl(210 40% 98%)' }
      });
    }
    
    setGiveCardModalOpen(false);
    setCurrentMatchingPlayer(null);
    setCurrentMatchingCard(null);

    // Continue automatically
    if (flippedCommunityCards < communityCards.length) {
      setTimeout(() => handleFlipCommunityCard(), 400);
    } else {
      setTimeout(() => determineBusRider(), 400);
    }
  };

  const determineBusRider = () => {
    // Count total cards per player
    const playerCardCounts = playerCards.map(pc => ({
      playerId: pc.playerId,
      totalCards: pc.cards.length,
    }));

    const maxCards = Math.max(...playerCardCounts.map(p => p.totalCards));
    const riderData = playerCardCounts.find(p => p.totalCards === maxCards);
    
    if (riderData) {
      const rider = players.find(p => p.id === riderData.playerId);
      if (rider) {
        setBusRider(rider);
        setCurrentPhase("busRider");
        // Show announcement for 3 seconds then start bus riding
        setTimeout(() => {
          setCurrentPhase("ridingBus");
          startBusRiding();
        }, 3000);
      }
    } else {
      // Fallback: no one rides
      setCurrentPhase("finished");
    }
  };

  const startBusRiding = () => {
    // Start with first card
    const firstCard = drawCard();
    setBusCards([firstCard]);
    setBusDrinkCount(0);
    setBusGuessing(false);
  };

  const handleBusGuess = async (guess: "higher" | "lower") => {
    if (busGuessing) return;
    setBusGuessing(true);

    const lastCard = busCards[busCards.length - 1];
    const lastRank = RANKS.indexOf(lastCard.split("-")[0]);
    
    const nextCard = drawCard();
    const nextRank = RANKS.indexOf(nextCard.split("-")[0]);

    // Show the card
    setTimeout(() => {
      setBusCards([...busCards, nextCard]);
      
      const isCorrect = 
        (guess === "higher" && nextRank > lastRank) || 
        (guess === "lower" && nextRank < lastRank);

      if (!isCorrect) {
        // Wrong guess - restart and add drinks
        const newDrinkCount = busDrinkCount + busCards.length;
        setBusDrinkCount(newDrinkCount);
        
        toast.error(`Wrong! Take ${busCards.length} drinks! 🍻`, {
          style: { background: 'hsl(0 84% 60%)', color: 'hsl(210 40% 98%)' }
        });

        setTimeout(() => {
          // Restart the sequence
          const firstCard = drawCard();
          setBusCards([firstCard]);
          setBusGuessing(false);
        }, 2000);
      } else {
        // Correct guess
        toast.success(`Correct! Keep going! ✅`, {
          style: { background: 'hsl(142 76% 45%)', color: 'hsl(222 47% 11%)' }
        });

        // Check if they've made it through 4 cards
        if (busCards.length >= 4) {
          // They won!
          setTimeout(() => {
            toast.success(`${busRider?.name} made it through! Total drinks: ${busDrinkCount}`, {
              style: { background: 'hsl(142 76% 45%)', color: 'hsl(222 47% 11%)' }
            });
            setCurrentPhase("finished");
          }, 1500);
        } else {
          setBusGuessing(false);
        }
      }
    }, 600);
  };

  const handleRestart = () => {
    setCurrentPlayerIndex(0);
    setCurrentPhase("round1");
    setCurrentRound(1);
    setPlayerCards([]);
    const newDeck = initializeDeck();
    setDeck(newDeck);
    setDeckCount(newDeck.length);
    setCommunityCards([]);
    setFlippedCommunityCards(0);
    setSelectedChoice(null);
    setLastDrawnCard(null);
    setShowResult(false);
    setBusRider(null);
    setIsAnimating(false);
    setBusCards([]);
    setBusDrinkCount(0);
    setBusGuessing(false);
    toast.success("Game restarted!");
  };

  const currentPlayer = players[currentPlayerIndex];
  const currentPlayerCards = playerCards.find(pc => pc.playerId === currentPlayer?.id);
  
  const getPhaseTitle = () => {
    switch (currentPhase) {
      case "round1": return "Red or Black?";
      case "round2": return "Higher or Lower?";
      case "round3": return "Inside or Outside?";
      case "round4": return "Pick a Suit";
      case "community": return "Community Cards";
      case "busRider": return "Bus Rider!";
      case "ridingBus": return "Ride the Bus!";
      case "finished": return "Game Over";
      default: return "";
    }
  };

  const getRoundNumber = () => {
    if (currentPhase === "round1") return 1;
    if (currentPhase === "round2") return 2;
    if (currentPhase === "round3") return 3;
    if (currentPhase === "round4") return 4;
    return 0;
  };


  return (
    <PageTransition>
      {/* Bus Rider Announcement Overlay */}
      {currentPhase === "busRider" && busRider && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center">
          <div className="text-center space-y-8 max-w-2xl px-6 animate-scale-in">
            <div 
              className="text-7xl font-black animate-text-glow"
              style={{ color: busRider.color }}
            >
              🚍 BUS RIDER 🚍
            </div>
            
            <div className="text-5xl font-bold text-foreground">
              {busRider.name}
            </div>
            
            <div className="text-xl text-muted-foreground">
              Most cards = Rides the Bus!
              <br />
              Guess higher or lower to get off the bus...
            </div>
          </div>
        </div>
      )}

      {/* Finished Overlay */}
      {currentPhase === "finished" && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center">
          <div className="text-center space-y-8 max-w-2xl px-6 animate-scale-in">
            <div className="text-7xl font-black bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              🎉 Game Over! 🎉
            </div>
            
            {busRider && (
              <div className="text-2xl text-muted-foreground">
                {busRider.name} survived the bus!
                <br />
                Total drinks: {busDrinkCount} 🍻
              </div>
            )}
            
            <div className="flex gap-4 justify-center pt-8">
              <Button 
                size="lg"
                onClick={handleRestart}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-8 py-6 text-lg"
              >
                🔁 Play Again
              </Button>
              <Button 
                size="lg"
                variant="outline"
                onClick={() => navigate("/")}
                className="border-secondary text-secondary hover:bg-secondary/10 font-bold px-8 py-6 text-lg"
              >
                🏠 Back to Menu
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-background flex overflow-hidden">
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

          {/* Player List */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-3">
              <div className="mb-3">
                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wide mb-2">
                  Players ({players.length})
                </h3>
                <Input
                  value={newPlayerName}
                  onChange={(e) => setNewPlayerName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddPlayer()}
                  placeholder="Add player..."
                  className="h-8 text-sm"
                />
              </div>

              {players.map((player) => {
                const pc = playerCards.find(p => p.playerId === player.id);
                const isActive = player.id === currentPlayer?.id && 
                                currentPhase !== "community" && 
                                currentPhase !== "busRider" && 
                                currentPhase !== "ridingBus" && 
                                currentPhase !== "finished";

                return (
                  <Card
                    key={player.id}
                    className={`p-3 transition-all duration-300 ${
                      isActive 
                        ? 'border-2 shadow-[0_0_20px_var(--glow)]' 
                        : 'border border-border'
                    }`}
                    style={{
                      '--glow': isActive ? `${player.color}50` : 'transparent',
                      borderColor: isActive ? player.color : undefined,
                    } as React.CSSProperties}
                  >
                    <div className="mb-2">
                      <div className={`font-bold text-sm ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {player.name}
                      </div>
                      {isActive && (
                        <div className="text-xs animate-glow-pulse mt-1" style={{ color: player.color }}>
                          Your Turn!
                        </div>
                      )}
                    </div>

                    {/* Player's Cards */}
                    {pc && pc.cards.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {pc.cards.map((card, idx) => (
                          <div 
                            key={idx}
                            className="w-9 h-12 animate-scale-in"
                            style={{ animationDelay: `${idx * 0.05}s` }}
                          >
                            <RideBusCard card={card} size="sm" />
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>
                );
              })}

              {players.length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  <p>No players yet.</p>
                  <p className="mt-1">Click Add to start!</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Main Game Area */}
        <div className="flex-1 flex flex-col">
          {/* Top Bar - Current Phase */}
          <div className="flex items-center justify-center py-4 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
            <Card className="px-8 py-3 bg-card border-primary shadow-[0_0_30px_hsl(var(--primary)/0.5)]">
              <div className="text-center">
                <div className="text-sm text-muted-foreground mb-1">
                  {getRoundNumber() > 0 && `Round ${getRoundNumber()} of 4`}
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                  {getPhaseTitle()}
                </h1>
              </div>
            </Card>
          </div>

          {/* Center Stage Area */}
          <div className="flex-1 flex items-center justify-center p-8 relative overflow-hidden">
            {/* Ambient background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-spotlight" />
              <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl animate-spotlight" style={{ animationDelay: '5s' }} />
            </div>

            {currentPhase === "ridingBus" && busRider ? (
              // Bus Riding Phase - Higher or Lower
              <div className="relative z-10 flex flex-col items-center gap-8">
                <div className="text-center mb-4">
                  <h2 className="text-3xl font-bold mb-2" style={{ color: busRider.color }}>
                    {busRider.name} is Riding the Bus!
                  </h2>
                  <p className="text-muted-foreground">
                    Get through 4 cards in a row without missing
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Drinks so far: {busDrinkCount} 🍻
                  </p>
                </div>

                {/* Bus Cards Display */}
                <div className="flex gap-3 items-center min-h-[180px]">
                  {busCards.map((card, idx) => (
                    <div 
                      key={idx}
                      className="w-28 h-40 animate-scale-in"
                      style={{ animationDelay: `${idx * 0.1}s` }}
                    >
                      <RideBusCard card={card} size="lg" />
                    </div>
                  ))}
                </div>

                {/* Fixed Control Container - Never moves */}
                <div className="w-full max-w-md">
                  <div 
                    className="bg-card/90 backdrop-blur-md rounded-2xl p-6 border-2"
                    style={{
                      borderColor: busRider.color,
                      boxShadow: `0 0 40px ${busRider.color}30`,
                      minHeight: '180px'
                    }}
                  >
                    <div className="text-center mb-4">
                      <div className="text-sm text-muted-foreground mb-1">Card {busCards.length} of 4</div>
                      <div 
                        className="text-xl font-bold"
                        style={{ color: busRider.color }}
                      >
                        Will the next card be...
                      </div>
                    </div>

                    {!busGuessing ? (
                      <div className="grid grid-cols-2 gap-3">
                        <Button
                          onClick={() => handleBusGuess("higher")}
                          size="lg"
                          className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-8 text-xl hover:scale-105 transition-all"
                          disabled={busGuessing}
                        >
                          ⬆️ Higher
                        </Button>
                        <Button
                          onClick={() => handleBusGuess("lower")}
                          size="lg"
                          className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold py-8 text-xl hover:scale-105 transition-all"
                          disabled={busGuessing}
                        >
                          ⬇️ Lower
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div 
                          className="text-lg font-bold animate-glow-pulse"
                          style={{ color: busRider.color }}
                        >
                          Drawing card...
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : currentPhase === "community" ? (
              // Community Card Phase
              <div className="relative z-10 flex items-start gap-10">
                {/* Deck + Flip control column */}
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-xl blur-2xl opacity-50 transition-all duration-500" />
                    <div className="relative">
                      {[0, 1, 2].map((i) => (
                        <div
                          key={i}
                          className="absolute rounded-xl shadow-2xl"
                          style={{
                            width: '120px',
                            height: '168px',
                            transform: `translate(${i * 3}px, ${i * 3}px)`,
                            zIndex: 3 - i,
                            boxShadow: `0 ${8 + i * 4}px ${24 + i * 8}px rgba(0, 0, 0, 0.6)`,
                          }}
                        >
                          {cardBackUrl ? (
                            <img 
                              src={cardBackUrl} 
                              alt="Deck" 
                              className="w-full h-full object-cover rounded-xl"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-primary via-secondary to-accent rounded-xl flex items-center justify-center">
                              <div className="text-foreground text-3xl font-bold opacity-70">♠♥♦♣</div>
                            </div>
                          )}
                        </div>
                      ))}
                      <div 
                        className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm border"
                        style={{ backgroundColor: 'hsl(var(--primary)/0.2)' }}
                      >
                        {deckCount} cards
                      </div>
                      <div style={{ width: '120px', height: '168px', transform: 'translate(6px, 6px)' }} />
                    </div>
                  </div>
                  {/* Fixed Flip Button Container */}
                  <div className="w-[140px]">
                    <Button
                      onClick={handleFlipCommunityCard}
                      disabled={flippedCommunityCards >= communityCards.length}
                      size="lg"
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
                    >
                      {flippedCommunityCards >= communityCards.length 
                        ? 'Determining…' 
                        : `Flip ${flippedCommunityCards + 1}`}
                    </Button>
                  </div>
                </div>

                {/* Community Cards Grid */}
                <div className="flex-1">
                  <div className="text-left mb-4">
                    <h2 className="text-2xl font-bold text-primary mb-2">Community Cards</h2>
                    <p className="text-muted-foreground">Flip cards to find matches with your hand</p>
                  </div>
                  <div className="grid grid-cols-4 gap-4">
                    {communityCards.map((card, idx) => {
                      const isFlipped = idx < flippedCommunityCards;
                      
                      return (
                        <div
                          key={idx}
                          className={`w-24 h-32 transition-all duration-300 ${
                            idx === flippedCommunityCards ? 'animate-card-flip scale-110' : ''
                          }`}
                        >
                          <RideBusCard 
                            card={card} 
                            size="md" 
                            faceDown={!isFlipped}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              // Regular Rounds - Deck and Choices
              <div className="relative z-10 flex flex-col items-center gap-8">
                {/* Center Deck */}
                <div className="relative">
                  <div 
                    className="absolute inset-0 rounded-xl blur-2xl opacity-50 transition-all duration-500"
                    style={{ 
                      backgroundColor: currentPlayer?.color || 'hsl(var(--primary))',
                      animation: isAnimating ? 'pulse 1s infinite' : 'none'
                    }}
                  />
                  
                  <div className="relative">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="absolute rounded-xl shadow-2xl"
                        style={{
                          width: '120px',
                          height: '168px',
                          transform: `translate(${i * 3}px, ${i * 3}px)`,
                          zIndex: 3 - i,
                          boxShadow: `0 ${8 + i * 4}px ${24 + i * 8}px rgba(0, 0, 0, 0.6)`,
                        }}
                      >
                        {cardBackUrl ? (
                          <img 
                            src={cardBackUrl} 
                            alt="Deck" 
                            className="w-full h-full object-cover rounded-xl"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary via-secondary to-accent rounded-xl flex items-center justify-center">
                            <div className="text-foreground text-3xl font-bold opacity-70">♠♥♦♣</div>
                          </div>
                        )}
                      </div>
                    ))}
                    
                    <div 
                      className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm border"
                      style={{ 
                        backgroundColor: `${currentPlayer?.color || 'hsl(var(--primary))'}20`,
                        borderColor: currentPlayer?.color || 'hsl(var(--primary))',
                        color: currentPlayer?.color || 'hsl(var(--primary))'
                      }}
                    >
                      {deckCount} cards
                    </div>
                    
                    <div style={{ width: '120px', height: '168px', transform: 'translate(6px, 6px)' }} />
                  </div>
                </div>

                {/* Current card being revealed */}
                {showResult && lastDrawnCard && (
                  <div className="animate-card-flip">
                    <RideBusCard card={lastDrawnCard} size="lg" />
                  </div>
                )}

                {/* Fixed Choice Button Container - Always present */}
                <div 
                  className="bg-card/90 backdrop-blur-md rounded-2xl p-6 border-2"
                  style={{
                    borderColor: currentPlayer?.color || 'hsl(var(--primary))',
                    boxShadow: `0 0 40px ${currentPlayer?.color || 'hsl(var(--primary))'}30`,
                    minWidth: '420px',
                    minHeight: '280px'
                  }}
                >
                  {!showResult && currentPlayer && players.length > 0 ? (
                    <>
                      <div className="text-center mb-4">
                        <div className="text-sm text-muted-foreground mb-1">Current Player</div>
                        <div 
                          className="text-xl font-bold animate-glow-pulse"
                          style={{ color: currentPlayer.color }}
                        >
                          {currentPlayer.name}
                        </div>
                      </div>

                      {!selectedChoice ? (
                      <div className="space-y-3">
                        {currentPhase === "round1" && (
                          <div className="grid grid-cols-2 gap-3">
                            <Button
                              onClick={() => handleChoice("red")}
                              size="lg"
                              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground font-bold py-8 text-xl hover:scale-105 transition-all"
                            >
                              ❤️ Red
                            </Button>
                            <Button
                              onClick={() => handleChoice("black")}
                              size="lg"
                              className="bg-foreground hover:bg-foreground/90 text-background font-bold py-8 text-xl hover:scale-105 transition-all"
                            >
                              ♠️ Black
                            </Button>
                          </div>
                        )}

                        {currentPhase === "round2" && (
                          <div className="grid grid-cols-2 gap-3">
                            <Button
                              onClick={() => handleChoice("higher")}
                              size="lg"
                              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-8 text-xl hover:scale-105 transition-all"
                            >
                              ⬆️ Higher
                            </Button>
                            <Button
                              onClick={() => handleChoice("lower")}
                              size="lg"
                              className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold py-8 text-xl hover:scale-105 transition-all"
                            >
                              ⬇️ Lower
                            </Button>
                          </div>
                        )}

                        {currentPhase === "round3" && (
                          <div className="grid grid-cols-2 gap-3">
                            <Button
                              onClick={() => handleChoice("inside")}
                              size="lg"
                              className="font-bold py-8 text-xl hover:scale-105 transition-all"
                              style={{ 
                                backgroundColor: 'hsl(277 85% 60%)',
                                color: 'hsl(210 40% 98%)'
                              }}
                            >
                              📍 Inside
                            </Button>
                            <Button
                              onClick={() => handleChoice("outside")}
                              size="lg"
                              className="font-bold py-8 text-xl hover:scale-105 transition-all"
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
                              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground font-bold py-6 text-lg hover:scale-105 transition-all"
                            >
                              ♥️ Hearts
                            </Button>
                            <Button
                              onClick={() => handleChoice("clubs")}
                              className="font-bold py-6 text-lg hover:scale-105 transition-all"
                              style={{ 
                                backgroundColor: 'hsl(142 76% 35%)',
                                color: 'hsl(210 40% 98%)'
                              }}
                            >
                              ♣️ Clubs
                            </Button>
                            <Button
                              onClick={() => handleChoice("diamonds")}
                              className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold py-6 text-lg hover:scale-105 transition-all"
                            >
                              ♦️ Diamonds
                            </Button>
                            <Button
                              onClick={() => handleChoice("spades")}
                              className="bg-foreground hover:bg-foreground/90 text-background font-bold py-6 text-lg hover:scale-105 transition-all"
                            >
                              ♠️ Spades
                            </Button>
                          </div>
                        )}
                      </div>
                      ) : (
                        <div className="text-center py-8">
                          <div 
                            className="text-lg font-bold animate-glow-pulse"
                            style={{ color: currentPlayer.color }}
                          >
                            Drawing card...
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-lg text-muted-foreground">
                        {players.length === 0 ? 'Add players to start' : 'Waiting for turn...'}
                      </div>
                    </div>
                  )}
                </div>

                {players.length === 0 && (
                  <div className="text-center p-8 bg-card/50 backdrop-blur-sm rounded-xl">
                    <p className="text-xl text-muted-foreground">Add players from the sidebar to start!</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Bottom Controls */}
          <div className="sticky bottom-0 border-t border-border bg-card/95 backdrop-blur-sm p-3 z-10">
            <div className="max-w-4xl mx-auto flex items-center justify-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRestart}
                className="border-secondary text-secondary hover:bg-secondary/10 hover:scale-105 transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                Restart Game
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Give Card Modal */}
      <Dialog open={giveCardModalOpen} onOpenChange={setGiveCardModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>You Matched a {currentMatchingCard}!</DialogTitle>
            <DialogDescription>
              Choose a player to give this card to, or it will default to "Take" in 5 seconds.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {players
              .filter(p => p.id !== currentMatchingPlayer)
              .map((player) => (
                <Button
                  key={player.id}
                  onClick={() => handleGiveCard(player.id)}
                  variant="outline"
                  className="w-full justify-start"
                  style={{
                    borderColor: player.color,
                    color: player.color,
                  }}
                >
                  Give to {player.name}
                </Button>
              ))}
            <Button
              onClick={handleTakeCard}
              variant="secondary"
              className="w-full"
            >
              Take It Yourself
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </PageTransition>
  );
}
