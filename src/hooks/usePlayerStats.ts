import { useMemo } from "react";
import { useMatches } from "./useMatches";
import { usePenalties } from "./usePenalties";
import { Match, Penalty } from "@/data/types";

export interface PlayerStats {
  playerId: string;
  matches: number;
  wins: number;
  draws: number;
  losses: number;
  aproveitamento: number;
  goalsFor: number;
  goalsAgainst: number;
  history: {
    matchId: string;
    date: string;
    result: "V" | "E" | "D";
    goalsFor: number;
    goalsAgainst: number;
  }[];
}

export const usePlayerStats = (playerId: string | null) => {
  const { matches = [], isLoading: matchesLoading } = useMatches();
  const { data: penalties = [], isLoading: penaltiesLoading } = usePenalties();

  const stats = useMemo<PlayerStats | null>(() => {
    if (!playerId) return null;

    let wins = 0;
    let draws = 0;
    let losses = 0;
    let goalsFor = 0;
    let goalsAgainst = 0;

    const history: PlayerStats["history"] = [];

    matches.forEach((match: Match) => {
      const inTeamA = match.teamA.includes(playerId);
      const inTeamB = match.teamB.includes(playerId);
      if (!inTeamA && !inTeamB) return;

      const gf = inTeamA ? match.goalsTeamA : match.goalsTeamB;
      const ga = inTeamA ? match.goalsTeamB : match.goalsTeamA;

      goalsFor += gf;
      goalsAgainst += ga;

      let result: "V" | "E" | "D" = "E";
      if (gf > ga) {
        wins++;
        result = "V";
      } else if (gf < ga) {
        losses++;
        result = "D";
      } else {
        draws++;
        result = "E";
      }

      history.push({
        matchId: match.id,
        date: match.date,
        result,
        goalsFor: gf,
        goalsAgainst: ga,
      });
    });

    const totalMatches = wins + draws + losses;
    const aproveitamento = totalMatches > 0 ? ((wins * 3 + draws) / (totalMatches * 3)) * 100 : 0;

    return {
      playerId,
      matches: totalMatches,
      wins,
      draws,
      losses,
      aproveitamento,
      goalsFor,
      goalsAgainst,
      history: history.sort((a, b) => b.date.localeCompare(a.date)),
    };
  }, [playerId, matches]);

  return {
    stats,
    isLoading: matchesLoading || penaltiesLoading,
  };
};
