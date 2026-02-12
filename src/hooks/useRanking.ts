import { useMemo } from "react";
import { usePlayers, useAllPlayers } from "./usePlayers";
import { useMatches } from "./useMatches";
import { usePenalties } from "./usePenalties";
import { RankingEntry, Player, Penalty } from "@/data/types";

interface Match {
  id: string;
  date: string;
  teamA: string[];
  teamB: string[];
  goalsTeamA: number;
  goalsTeamB: number;
}

export const useRanking = () => {
  const { data: players = [], isLoading: playersLoading } = usePlayers();
  const { data: allPlayers = [], isLoading: allPlayersLoading } = useAllPlayers();
  const { matches = [], isLoading: matchesLoading } = useMatches();
  const { data: penalties = [], isLoading: penaltiesLoading } = usePenalties();

  /**
   * 🧮 Calcula ranking atual (sem histórico, sem setas)
   */
  const ranking = useMemo(() => {
    return calculateRanking(players, allPlayers, matches, penalties);
  }, [players, allPlayers, matches, penalties]);

  return {
    ranking,
    isLoading: playersLoading || matchesLoading || allPlayersLoading || penaltiesLoading,
  };
};

function calculateRanking(
  activePlayers: Player[],
  allPlayers: Player[],
  matches: Match[],
  penalties: Penalty[],
): RankingEntry[] {
  const activeMonthlyPlayers = activePlayers.filter((p) => p.active && p.membershipType === "monthly");

  const rankingMap = new Map<
    string,
    {
      points: number;
      penaltyPoints: number;
      matches: number;
      wins: number;
      blowoutWins: number;
      draws: number;
      losses: number;
    }
  >();

  activeMonthlyPlayers.forEach((player) => {
    rankingMap.set(player.id, {
      points: 0,
      penaltyPoints: 0,
      matches: 0,
      wins: 0,
      blowoutWins: 0,
      draws: 0,
      losses: 0,
    });
  });

  /**
   * 🎮 Processa partidas
   */
  matches.forEach((match) => {
    const matchPlayers = [...match.teamA, ...match.teamB];
    const goalDiff = Math.abs(match.goalsTeamA - match.goalsTeamB);

    matchPlayers.forEach((playerId) => {
      const entry = rankingMap.get(playerId);
      if (!entry) return;

      const isTeamA = match.teamA.includes(playerId);
      const won = isTeamA ? match.goalsTeamA > match.goalsTeamB : match.goalsTeamB > match.goalsTeamA;

      const draw = match.goalsTeamA === match.goalsTeamB;

      entry.matches++;

      let points = 1;

      if (won) {
        points += goalDiff >= 5 ? 3 : 2;
        entry.wins++;
        if (goalDiff >= 5) entry.blowoutWins++;
      } else if (draw) {
        points += 1;
        entry.draws++;
      } else {
        entry.losses++;
      }

      entry.points += points;
    });
  });

  /**
   * 🚫 Penalidades
   */
  penalties.forEach((penalty) => {
    const entry = rankingMap.get(penalty.playerId);
    if (entry) {
      entry.points += penalty.value;
      entry.penaltyPoints += penalty.value;
    }
  });

  /**
   * 🏆 Monta ranking final
   */
  const ranking = Array.from(rankingMap.entries()).map(([playerId, stats]): RankingEntry => {
    const player = allPlayers.find((p) => p.id === playerId);

    const aproveitamento = stats.matches > 0 ? ((stats.wins * 3 + stats.draws) / (stats.matches * 3)) * 100 : 0;

    return {
      playerId,
      playerName: player?.name || "Desconhecido",
      points: Math.max(0, stats.points),
      penaltyPoints: stats.penaltyPoints,
      matches: stats.matches,
      wins: stats.wins,
      blowoutWins: stats.blowoutWins,
      draws: stats.draws,
      losses: stats.losses,
      aproveitamento,
      position: 0,
    };
  });

  ranking.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.aproveitamento !== a.aproveitamento) return b.aproveitamento - a.aproveitamento;
    return a.playerName.localeCompare(b.playerName);
  });

  /**
   * 📊 Define posições finais
   */
  ranking.forEach((entry, index) => {
    entry.position = index + 1;
  });

  return ranking;
}
