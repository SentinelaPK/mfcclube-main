export interface Player {
  id: string;
  name: string;
  membershipType: "monthly" | "guest" | "supporter";
  position: "goalkeeper" | "field";
  active: boolean;

  numero_camisa?: number | null;
  celular?: string | null;
  data_nascimento?: string | null;
}

export interface Match {
  id: string;
  date: string;
  teamA: string[];
  teamB: string[];
  goalsTeamA: number;
  goalsTeamB: number;
}

export interface Penalty {
  id: string;
  date: string;
  playerId: string;
  value: -1 | -2 | -3;
  reason: string;
}

export interface CashEntry {
  id: string;
  date: string;
  type: "entry" | "exit";
  amount: number;
  movementType:
    | "monthly_fee"
    | "member_monthly"
    | "one_off_game"
    | "member_game"
    | "field_rental"
    | "barbecue"
    | "others";
  playerOrRecipient: string;
  comment?: string;
}

/**
 * 🏆 Ranking estável (sem setas / sem histórico por enquanto)
 */
export interface RankingEntry {
  playerId: string;
  playerName: string;
  points: number;
  penaltyPoints: number;
  matches: number;
  wins: number;
  blowoutWins: number;
  draws: number;
  losses: number;
  aproveitamento: number;
  position: number;
}

export const movementTypeLabels: Record<CashEntry["movementType"], string> = {
  monthly_fee: "Mensalidade",
  member_monthly: "Mensalista",
  one_off_game: "Jogo Avulso",
  member_game: "Jogo Sócio",
  field_rental: "Aluguel Campo",
  barbecue: "Churrasco",
  others: "Outros",
};

export const positionLabels: Record<Player["position"], string> = {
  goalkeeper: "Goleiro",
  field: "Linha",
};

export const membershipLabels: Record<Player["membershipType"], string> = {
  monthly: "Mensalista",
  guest: "Convidado",
  supporter: "Sócio-torcedor",
};
