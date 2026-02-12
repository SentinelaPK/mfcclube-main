import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { sanitizeDbError } from "@/lib/errorHandling";
import { matchSchema, getValidationErrorMessage } from "@/lib/validation";
import { RankingEntry } from "@/data/types";

export interface MatchDB {
  id: string;
  date: string;
  team_a: string[];
  team_b: string[];
  goals_team_a: number;
  goals_team_b: number;
  created_at: string;
  updated_at: string;
}

export interface MatchInput {
  date: string;
  teamA: string[];
  teamB: string[];
  goalsTeamA: number;
  goalsTeamB: number;
}

// Convert DB format to app format
export const dbToAppMatch = (match: MatchDB) => ({
  id: match.id,
  date: match.date,
  teamA: match.team_a,
  teamB: match.team_b,
  goalsTeamA: match.goals_team_a,
  goalsTeamB: match.goals_team_b,
});

export const useMatches = () => {
  const queryClient = useQueryClient();

  const {
    data: matches = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["matches"],
    queryFn: async () => {
      const { data, error } = await supabase.from("matches").select("*").order("date", { ascending: false });

      if (error) {
        throw sanitizeDbError(error);
      }

      return (data as MatchDB[]).map(dbToAppMatch);
    },
  });

  const addMatch = useMutation({
    mutationFn: async (match: MatchInput) => {
      const parseResult = matchSchema.safeParse(match);
      if (!parseResult.success) {
        throw new Error(getValidationErrorMessage(parseResult.error));
      }

      const validatedData = parseResult.data;

      const { data, error } = await supabase
        .from("matches")
        .insert({
          date: validatedData.date,
          team_a: validatedData.teamA,
          team_b: validatedData.teamB,
          goals_team_a: validatedData.goalsTeamA,
          goals_team_b: validatedData.goalsTeamB,
        })
        .select()
        .single();

      if (error) {
        throw sanitizeDbError(error);
      }

      return dbToAppMatch(data as MatchDB);
    },

    onSuccess: async () => {
      // Atualiza partidas
      queryClient.invalidateQueries({ queryKey: ["matches"] });

      // Atualiza ranking
      queryClient.invalidateQueries({ queryKey: ["ranking"] });

      // Pega ranking atual calculado
      const ranking = queryClient.getQueryData<RankingEntry[]>(["ranking"]);

      // Salva snapshot no Supabase
      if (ranking && ranking.length > 0) {
        const { error } = await supabase.rpc("save_ranking_snapshot", {
          ranking_data: ranking,
        });

        if (error) {
          console.error("Erro ao salvar ranking:", error.message);
        }
      }

      toast.success("Partida registrada com sucesso!");
    },

    onError: (error) => {
      toast.error(error.message || "Erro ao salvar partida");
    },
  });

  const deleteMatch = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("matches").delete().eq("id", id);

      if (error) {
        throw sanitizeDbError(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["matches"] });
      toast.success("Partida removida!");
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao remover partida");
    },
  });

  return {
    matches,
    isLoading,
    error,
    addMatch,
    deleteMatch,
  };
};
