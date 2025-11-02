import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Settings, RotateCcw } from "lucide-react";
import { Player } from "@/types/game";
import { PageTransition } from "@/components/PageTransition";
import { RideBusCard } from "@/components/RideBusCard";
import { useCardBack } from "@/hooks/useCardBack";
import { toast } from "sonner";
import { CenterDeck } from "@/components/ride-bus/CenterDeck";
import { PlayerArea } from "@/components/ride-bus/PlayerArea";
import { CommunityCardGrid } from "@/components/ride-bus/CommunityCardGrid";
import { BusRiderAnnouncement } from "@/components/ride-bus/BusRiderAnnouncement";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
  const [newPlayerName, setNewPlayerName] = useState("");
  const [isAddPlayerOpen, setIsAddPlayerOpen] = useState(false);

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

  const handleAddPlayer = () => {
    if (!newPlayerName.trim()) {
      toast.error("Please enter a player name");
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
    setNewPlayerName("");
    setIsAddPlayerOpen(false);
    toast.success(`${newPlayer.name} joined the game!`);
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
      case "round1": return "Red or Black?";
      case "round2": return "Higher or Lower?";
      case "round3": return "Inside or Outside?";
      case "round4": return "Pick a Suit";
      case "community": return "Community Cards";
      case "busRider": return "Bus Rider!";
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

  const getPlayerPosition = (index: number, total: number): "top" | "right" | "bottom" | "left" => {
    if (total <= 2) return index === 0 ? "bottom" : "top";
    if (total === 3) {
      if (index === 0) return "bottom";
      if (index === 1) return "left";
      return "right";
    }
    if (total === 4) {
      if (index === 0) return "bottom";
      if (index === 1) return "left";
      if (index === 2) return "top";
      return "right";
    }
    // For 5+ players, distribute around
    const positions: ("top" | "right" | "bottom" | "left")[] = ["bottom", "left", "top", "top", "right", "right", "bottom", "left"];
    return positions[index % positions.length];
  };

  return (
    <PageTransition>
      {/* Bus Rider Announcement Overlay */}
      {currentPhase === "busRider" && busRider && (
        <BusRiderAnnouncement
          playerName={busRider.name}
          playerColor={busRider.color}
          matchCount={playerCards.find(pc => pc.playerId === busRider.id)?.matches || 0}
          onPlayAgain={handleRestart}
          onBackToMenu={() => navigate("/")}
        />
      )}

      <div className="min-h-screen bg-background relative overflow-hidden">
        {/* Ambient background particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-spotlight" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl animate-spotlight" style={{ animationDelay: '5s' }} />
        </div>

        {/* Top Navigation Bar */}
        <div className="relative z-30 border-b border-border bg-card/50 backdrop-blur-md">
          <div className="flex items-center justify-between px-6 py-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/game/ride-bus/setup")}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            <div className="text-center">
              <div className="text-sm text-muted-foreground mb-1">
                {getRoundNumber() > 0 && `Round ${getRoundNumber()}`}
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                {getPhaseTitle()}
              </h1>
            </div>

            <Dialog open={isAddPlayerOpen} onOpenChange={setIsAddPlayerOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="border-primary text-primary hover:bg-primary/10">
                  <Settings className="w-4 h-4 mr-2" />
                  Players ({players.length})
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Manage Players</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="playerName">Add New Player</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        id="playerName"
                        value={newPlayerName}
                        onChange={(e) => setNewPlayerName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleAddPlayer()}
                        placeholder="Player name"
                      />
                      <Button onClick={handleAddPlayer}>Add</Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Current Players</Label>
                    {players.map((player) => (
                      <div key={player.id} className="flex items-center justify-between p-2 rounded border border-border">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: player.color }} />
                          <span>{player.name}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemovePlayer(player.id)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>


        {/* Main Game Stage */}
        <div className="relative flex-1 flex items-center justify-center p-8">
          {/* Player Areas - Positioned around the stage */}
          {players.map((player, idx) => {
            const position = getPlayerPosition(idx, players.length);
            const pc = playerCards.find(p => p.playerId === player.id);
            const isActive = player.id === currentPlayer?.id && currentPhase !== "community" && currentPhase !== "busRider";
            
            const positionStyles = {
              top: "absolute top-8 left-1/2 -translate-x-1/2",
              right: "absolute right-8 top-1/2 -translate-y-1/2",
              bottom: "absolute bottom-8 left-1/2 -translate-x-1/2",
              left: "absolute left-8 top-1/2 -translate-y-1/2",
            };

            return (
              <div key={player.id} className={positionStyles[position]}>
                <PlayerArea
                  name={player.name}
                  color={player.color}
                  cards={pc?.cards || []}
                  isActive={isActive}
                  position={position}
                />
              </div>
            );
          })}

          {/* Center Stage Content */}
          <div className="relative z-10">
            {currentPhase === "community" ? (
              // Community Card Phase
              <CommunityCardGrid
                cards={communityCards}
                flippedCount={flippedCommunityCards}
                onFlipNext={handleFlipCommunityCard}
              />
            ) : (
              // Regular Rounds - Center deck with choices
              <div className="flex flex-col items-center gap-8">
                {/* Center Deck */}
                <CenterDeck 
                  cardCount={deckCount}
                  glowColor={currentPlayer?.color}
                  isAnimating={isAnimating}
                />

                {/* Current card being shown */}
                {showResult && lastDrawnCard && (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 animate-card-flip">
                    <RideBusCard card={lastDrawnCard} size="lg" />
                  </div>
                )}

                {/* Choice Interface */}
                {!showResult && currentPlayer && players.length > 0 && (

                  <div className="bg-card/90 backdrop-blur-md rounded-2xl p-6 border-2 min-w-[400px]" style={{
                    borderColor: currentPlayer.color,
                    boxShadow: `0 0 40px ${currentPlayer.color}30`
                  }}>
                    {!selectedChoice ? (
                      <div className="space-y-4">
                        {currentPhase === "round1" && (
                          <div className="grid grid-cols-2 gap-3">
                            <Button
                              onClick={() => handleChoice("red")}
                              size="lg"
                              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground font-bold py-8 text-xl transition-all hover:scale-105 shadow-[0_0_20px_hsl(var(--destructive)/0.4)]"
                            >
                              ❤️ Red
                            </Button>
                            <Button
                              onClick={() => handleChoice("black")}
                              size="lg"
                              className="bg-foreground hover:bg-foreground/90 text-background font-bold py-8 text-xl transition-all hover:scale-105"
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
                              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-8 text-xl transition-all hover:scale-105 shadow-[0_0_20px_hsl(var(--primary)/0.4)]"
                            >
                              ⬆️ Higher
                            </Button>
                            <Button
                              onClick={() => handleChoice("lower")}
                              size="lg"
                              className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold py-8 text-xl transition-all hover:scale-105 shadow-[0_0_20px_hsl(var(--secondary)/0.4)]"
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
                              className="font-bold py-8 text-xl transition-all hover:scale-105"
                              style={{ 
                                backgroundColor: 'hsl(277 85% 60%)',
                                color: 'hsl(210 40% 98%)',
                                boxShadow: '0 0 20px hsl(277 85% 60% / 0.4)'
                              }}
                            >
                              📍 Inside
                            </Button>
                            <Button
                              onClick={() => handleChoice("outside")}
                              size="lg"
                              className="font-bold py-8 text-xl transition-all hover:scale-105"
                              style={{ 
                                backgroundColor: 'hsl(25 95% 53%)',
                                color: 'hsl(210 40% 98%)',
                                boxShadow: '0 0 20px hsl(25 95% 53% / 0.4)'
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
                              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground font-bold py-6 text-lg transition-all hover:scale-105"
                            >
                              ♥️ Hearts
                            </Button>
                            <Button
                              onClick={() => handleChoice("clubs")}
                              className="font-bold py-6 text-lg transition-all hover:scale-105"
                              style={{ 
                                backgroundColor: 'hsl(142 76% 35%)',
                                color: 'hsl(210 40% 98%)'
                              }}
                            >
                              ♣️ Clubs
                            </Button>
                            <Button
                              onClick={() => handleChoice("diamonds")}
                              className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold py-6 text-lg transition-all hover:scale-105"
                            >
                              ♦️ Diamonds
                            </Button>
                            <Button
                              onClick={() => handleChoice("spades")}
                              className="bg-foreground hover:bg-foreground/90 text-background font-bold py-6 text-lg transition-all hover:scale-105"
                            >
                              ♠️ Spades
                            </Button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="text-lg font-bold animate-glow-pulse" style={{ color: currentPlayer.color }}>
                          Drawing card...
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Empty state */}
                {players.length === 0 && (
                  <div className="text-center p-8 bg-card/50 backdrop-blur-sm rounded-xl">
                    <p className="text-xl text-muted-foreground">Add players to start the game</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
