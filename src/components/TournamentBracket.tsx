import { BracketMatch } from "@/types/beerPong";

interface TournamentBracketProps {
  matches: BracketMatch[];
  currentRound: number;
}

export const TournamentBracket = ({ matches, currentRound }: TournamentBracketProps) => {
  const rounds = matches.reduce((acc, match) => {
    if (!acc[match.round]) {
      acc[match.round] = [];
    }
    acc[match.round].push(match);
    return acc;
  }, {} as Record<number, BracketMatch[]>);

  const maxRound = Math.max(...Object.keys(rounds).map(Number));

  return (
    <div className="w-full overflow-x-auto pb-4">
      <div className="flex gap-8 min-w-max p-4">
        {Object.entries(rounds)
          .sort(([a], [b]) => Number(a) - Number(b))
          .map(([round, roundMatches]) => (
            <div key={round} className="flex flex-col gap-4 min-w-[200px]">
              <h3 className="text-center font-bold text-primary mb-2">
                {Number(round) === maxRound ? 'Final' : `Round ${round}`}
              </h3>
              {roundMatches.map((match) => (
                <div
                  key={match.id}
                  className={`p-4 rounded-lg border ${
                    Number(round) === currentRound
                      ? 'border-primary bg-primary/10 shadow-glow-cyan'
                      : 'border-primary/20 bg-background/50'
                  }`}
                >
                  <div className="space-y-2">
                    <div
                      className={`flex justify-between items-center p-2 rounded ${
                        match.winner === match.team1
                          ? 'bg-primary/20 font-bold'
                          : 'bg-background/50'
                      }`}
                    >
                      <span>{match.team1 || 'TBD'}</span>
                      {match.score && <span>{match.score.team1}</span>}
                    </div>
                    <div className="text-center text-xs text-muted-foreground">vs</div>
                    <div
                      className={`flex justify-between items-center p-2 rounded ${
                        match.winner === match.team2
                          ? 'bg-primary/20 font-bold'
                          : 'bg-background/50'
                      }`}
                    >
                      <span>{match.team2 || 'TBD'}</span>
                      {match.score && <span>{match.score.team2}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
      </div>
    </div>
  );
};
