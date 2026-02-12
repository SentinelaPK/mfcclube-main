import { Player, Match, Penalty, CashEntry, RankingEntry } from "./types";

// Sample Players
export const mockPlayers: Player[] = [
  { id: "1", name: "Carlos Silva", membershipType: "monthly", position: "goalkeeper", active: true },
  { id: "2", name: "João Santos", membershipType: "monthly", position: "field", active: true },
  { id: "3", name: "Pedro Oliveira", membershipType: "monthly", position: "field", active: true },
  { id: "4", name: "Lucas Ferreira", membershipType: "monthly", position: "field", active: true },
  { id: "5", name: "Marcos Lima", membershipType: "monthly", position: "field", active: true },
  { id: "6", name: "Rafael Costa", membershipType: "monthly", position: "field", active: true },
  { id: "7", name: "André Souza", membershipType: "monthly", position: "goalkeeper", active: true },
  { id: "8", name: "Bruno Almeida", membershipType: "guest", position: "field", active: true },
  { id: "9", name: "Diego Martins", membershipType: "monthly", position: "field", active: false },
  { id: "10", name: "Felipe Rocha", membershipType: "monthly", position: "field", active: true },
];

// Sample Matches
export const mockMatches: Match[] = [
  {
    id: "1",
    date: "2024-01-20",
    teamA: ["1", "2", "3", "4", "5"],
    teamB: ["7", "6", "8", "10", "4"],
    goalsTeamA: 5,
    goalsTeamB: 2,
  },
  {
    id: "2",
    date: "2024-01-13",
    teamA: ["7", "2", "5", "6", "10"],
    teamB: ["1", "3", "4", "8", "9"],
    goalsTeamA: 3,
    goalsTeamB: 3,
  },
  {
    id: "3",
    date: "2024-01-06",
    teamA: ["1", "3", "6", "8", "10"],
    teamB: ["7", "2", "4", "5", "9"],
    goalsTeamA: 4,
    goalsTeamB: 6,
  },
];

// Sample Penalties
export const mockPenalties: Penalty[] = [
  { id: "1", date: "2024-01-20", playerId: "2", value: -1, reason: "Atraso na chegada" },
  { id: "2", date: "2024-01-13", playerId: "6", value: -2, reason: "Atraso na chegada (segunda vez)" },
  { id: "3", date: "2024-01-06", playerId: "4", value: -1, reason: "Saiu antes do final" },
];

// Sample Cash Flow
export const mockCashFlow: CashEntry[] = [
  {
    id: "1",
    date: "2024-01-20",
    type: "entry",
    amount: 50,
    movementType: "monthly_fee",
    playerOrRecipient: "Carlos Silva",
    comment: "Mensalidade janeiro",
  },
  {
    id: "2",
    date: "2024-01-20",
    type: "entry",
    amount: 50,
    movementType: "monthly_fee",
    playerOrRecipient: "João Santos",
  },
  {
    id: "3",
    date: "2024-01-20",
    type: "entry",
    amount: 25,
    movementType: "one_off_game",
    playerOrRecipient: "Bruno Almeida",
    comment: "Participação como convidado",
  },
  {
    id: "4",
    date: "2024-01-20",
    type: "exit",
    amount: 200,
    movementType: "field_rental",
    playerOrRecipient: "Campo Society Central",
  },
  {
    id: "5",
    date: "2024-01-13",
    type: "entry",
    amount: 50,
    movementType: "monthly_fee",
    playerOrRecipient: "Pedro Oliveira",
  },
  {
    id: "6",
    date: "2024-01-13",
    type: "exit",
    amount: 150,
    movementType: "barbecue",
    playerOrRecipient: "Churrasqueira do Zé",
  },
];

// Calculate Ranking (mock / demo)
export function calculateRanking(players: Player[], matches: Match[], penalties: Penalty[]): RankingEntry[] {
  const activeMonthlyPlayers = players.filter((p) => p.active && p.membershipType === "monthly");

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

  matches.forEach((match) => {
    const allPlayers = [...match.teamA, ...match.teamB];
    const goalDiff = Math.abs(match.goalsTeamA - match.goalsTeamB);

    allPlayers.forEach((playerId) => {
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

  penalties.forEach((penalty) => {
    const entry = rankingMap.get(penalty.playerId);
    if (entry) {
      entry.points += penalty.value;
      entry.penaltyPoints += penalty.value;
    }
  });

  const ranking: RankingEntry[] = Array.from(rankingMap.entries())
    .map(([playerId, stats]) => {
      const player = players.find((p) => p.id === playerId);

      const aproveitamento = stats.matches > 0 ? (stats.wins / stats.matches) * 100 : 0;

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
    })
    .sort((a, b) => b.points - a.points);

  ranking.forEach((entry, index) => {
    entry.position = index + 1;
  });

  return ranking;
}
