import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Player } from "@/data/types";
import { toast } from "sonner";
import { sanitizeDbError } from "@/lib/errorHandling";
import { playerSchema, getValidationErrorMessage } from "@/lib/validation";

interface DbPlayer {
  id: string;
  name: string;
  membership_type: "monthly" | "guest" | "supporter";
  position: "goalkeeper" | "field";
  active: boolean;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
  numero_camisa: number | null;
  celular: string | null;
  data_nascimento: string | null;
}

const mapDbToPlayer = (db: DbPlayer): Player => ({
  id: db.id,
  name: db.name,
  membershipType: db.membership_type,
  position: db.position,
  active: db.active,
  numero_camisa: db.numero_camisa,
  celular: db.celular,
  data_nascimento: db.data_nascimento,
});

export const usePlayers = () => {
  return useQuery({
    queryKey: ["players"],
    queryFn: async (): Promise<Player[]> => {
      const { data, error } = await supabase.from("players").select("*").is("deleted_at", null).order("name");

      if (error) {
        throw sanitizeDbError(error);
      }

      return (data as DbPlayer[]).map(mapDbToPlayer);
    },
  });
};

// Fetch all players including deleted (for historical data)
export const useAllPlayers = () => {
  return useQuery({
    queryKey: ["all-players"],
    queryFn: async (): Promise<Player[]> => {
      const { data, error } = await supabase.from("players").select("*").order("name");

      if (error) {
        throw sanitizeDbError(error);
      }

      return (data as DbPlayer[]).map(mapDbToPlayer);
    },
  });
};

export const useAddPlayer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (player: Omit<Player, "id">) => {
      // Validar dados antes de enviar ao banco
      const parseResult = playerSchema.safeParse(player);
      if (!parseResult.success) {
        throw new Error(getValidationErrorMessage(parseResult.error));
      }
      const validatedData = parseResult.data;

      const { data, error } = await supabase
        .from("players")
        .insert({
          name: validatedData.name.trim(),
          membership_type: validatedData.membershipType,
          position: validatedData.position,
          active: validatedData.active,
          numero_camisa: validatedData.numero_camisa ?? null,
          celular: validatedData.celular ?? null,
          data_nascimento: validatedData.data_nascimento ?? null,
        })
        .select()
        .single();

      if (error) {
        throw sanitizeDbError(error);
      }

      return mapDbToPlayer(data as DbPlayer);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["players"] });
      toast.success("Jogador adicionado com sucesso!");
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao adicionar jogador");
    },
  });
};

export const useUpdatePlayer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Player> & { id: string }) => {
      // Validar campos se presentes
      if (updates.name !== undefined && updates.name.trim().length === 0) {
        throw new Error("Nome não pode ser vazio");
      }
      if (updates.name !== undefined && updates.name.length > 100) {
        throw new Error("Nome deve ter no máximo 100 caracteres");
      }

      const dbUpdates: Partial<DbPlayer> = {};
      if (updates.name !== undefined) dbUpdates.name = updates.name.trim();
      if (updates.membershipType !== undefined) dbUpdates.membership_type = updates.membershipType;
      if (updates.position !== undefined) dbUpdates.position = updates.position;
      if (updates.active !== undefined) dbUpdates.active = updates.active;

      const { error } = await supabase.from("players").update(dbUpdates).eq("id", id);

      if (error) {
        throw sanitizeDbError(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["players"] });
      queryClient.invalidateQueries({ queryKey: ["all-players"] });
      toast.success("Status atualizado!");
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao atualizar jogador");
    },
  });
};

export const useDeletePlayer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, hasMatches }: { id: string; hasMatches: boolean }) => {
      if (hasMatches) {
        // Soft delete - just mark as deleted
        const { error } = await supabase
          .from("players")
          .update({ deleted_at: new Date().toISOString(), active: false })
          .eq("id", id);

        if (error) {
          throw sanitizeDbError(error);
        }
      } else {
        // Hard delete - remove from database
        const { error } = await supabase.from("players").delete().eq("id", id);

        if (error) {
          throw sanitizeDbError(error);
        }
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["players"] });
      queryClient.invalidateQueries({ queryKey: ["all-players"] });
      toast.success(variables.hasMatches ? "Jogador removido (histórico preservado)" : "Jogador excluído!");
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao excluir jogador");
    },
  });
};
