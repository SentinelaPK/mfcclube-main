import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CashEntry } from "@/data/types";
import { sanitizeDbError } from "@/lib/errorHandling";
import { cashEntrySchema, getValidationErrorMessage } from "@/lib/validation";

interface DbCashEntry {
  id: string;
  date: string;
  type: string;
  amount: number;
  movement_type: string;
  player_or_recipient: string | null;
  comment: string | null;
  created_at: string;
  updated_at: string;
}

const mapDbToCashEntry = (db: DbCashEntry): CashEntry => ({
  id: db.id,
  date: db.date,
  type: db.type === "entrada" ? "entry" : "exit",
  amount: Number(db.amount),
  movementType: mapDbMovementType(db.movement_type),
  playerOrRecipient: db.player_or_recipient || "Outros",
  comment: db.comment || undefined,
});

const mapDbMovementType = (dbType: string): CashEntry["movementType"] => {
  const mapping: Record<string, CashEntry["movementType"]> = {
    mensalidade: "monthly_fee",
    diarista: "one_off_game",
    multa: "monthly_fee",
    premiacao: "others",
    despesa: "field_rental",
    outros: "others",
  };
  return mapping[dbType] || "others";
};

const mapMovementTypeToDb = (type: CashEntry["movementType"]): string => {
  const mapping: Record<CashEntry["movementType"], string> = {
    monthly_fee: "mensalidade",
    member_monthly: "mensalidade",
    one_off_game: "diarista",
    member_game: "diarista",
    field_rental: "despesa",
    barbecue: "despesa",
    others: "outros",
  };
  return mapping[type] || "outros";
};

export const useCashFlow = () => {
  return useQuery({
    queryKey: ["cash-entries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cash_entries")
        .select("*")
        .order("date", { ascending: false });

      if (error) {
        throw sanitizeDbError(error);
      }
      return (data as DbCashEntry[]).map(mapDbToCashEntry);
    },
  });
};

export const useAddCashEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (entry: Omit<CashEntry, "id">) => {
      // Validar dados antes de enviar ao banco
      const parseResult = cashEntrySchema.safeParse(entry);
      if (!parseResult.success) {
        throw new Error(getValidationErrorMessage(parseResult.error));
      }
      const validatedData = parseResult.data;

      const { data, error } = await supabase
        .from("cash_entries")
        .insert({
          date: validatedData.date,
          type: validatedData.type === "entry" ? "entrada" : "saida",
          amount: validatedData.amount,
          movement_type: mapMovementTypeToDb(validatedData.movementType),
          player_or_recipient: validatedData.playerOrRecipient === "Outros" ? null : validatedData.playerOrRecipient,
          comment: validatedData.comment || null,
        })
        .select()
        .single();

      if (error) {
        throw sanitizeDbError(error);
      }
      return mapDbToCashEntry(data as DbCashEntry);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cash-entries"] });
      toast.success("Lançamento registrado!");
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao registrar lançamento");
    },
  });
};

export const useDeleteCashEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("cash_entries")
        .delete()
        .eq("id", id);

      if (error) {
        throw sanitizeDbError(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cash-entries"] });
      toast.success("Lançamento removido!");
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao remover lançamento");
    },
  });
};
