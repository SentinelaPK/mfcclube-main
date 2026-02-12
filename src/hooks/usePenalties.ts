import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Penalty } from "@/data/types";
import { sanitizeDbError } from "@/lib/errorHandling";
import { penaltySchema, getValidationErrorMessage } from "@/lib/validation";

interface DbPenalty {
  id: string;
  date: string;
  player_id: string;
  value: number;
  reason: string;
  created_at: string;
  updated_at: string;
}

const mapDbToPenalty = (db: DbPenalty): Penalty => ({
  id: db.id,
  date: db.date,
  playerId: db.player_id,
  value: db.value as Penalty["value"],
  reason: db.reason,
});

export const usePenalties = () => {
  return useQuery({
    queryKey: ["penalties"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("penalties")
        .select("*")
        .order("date", { ascending: false });

      if (error) {
        throw sanitizeDbError(error);
      }
      return (data as DbPenalty[]).map(mapDbToPenalty);
    },
  });
};

export const useAddPenalty = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (penalty: Omit<Penalty, "id">) => {
      // Validar dados antes de enviar ao banco
      const parseResult = penaltySchema.safeParse(penalty);
      if (!parseResult.success) {
        throw new Error(getValidationErrorMessage(parseResult.error));
      }
      const validatedData = parseResult.data;

      const { data, error } = await supabase
        .from("penalties")
        .insert({
          date: validatedData.date,
          player_id: validatedData.playerId,
          value: validatedData.value,
          reason: validatedData.reason.trim(),
        })
        .select()
        .single();

      if (error) {
        throw sanitizeDbError(error);
      }
      return mapDbToPenalty(data as DbPenalty);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["penalties"] });
      toast.success("Penalidade aplicada!");
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao aplicar penalidade");
    },
  });
};

export const useDeletePenalty = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("penalties")
        .delete()
        .eq("id", id);

      if (error) {
        throw sanitizeDbError(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["penalties"] });
      toast.success("Penalidade removida!");
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao remover penalidade");
    },
  });
};
