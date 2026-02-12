import { z } from "zod";

/**
 * Schema de validação para jogadores
 */
export const playerSchema = z.object({
  name: z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100, "Nome deve ter no máximo 100 caracteres")
    .refine((val) => val.trim().length > 0, "Nome não pode ser vazio"),

  membershipType: z.enum(["monthly", "guest", "supporter"], {
    errorMap: () => ({ message: "Tipo de associação inválido" }),
  }),

  position: z.enum(["goalkeeper", "field"], {
    errorMap: () => ({ message: "Posição inválida" }),
  }),

  active: z.boolean(),

  // NOVOS CAMPOS
  numero_camisa: z.number().nullable().optional(),
  celular: z.string().nullable().optional(),
  data_nascimento: z.string().nullable().optional(),
});

export type PlayerInput = z.infer<typeof playerSchema>;

/**
 * Schema de validação para partidas
 */
export const matchSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data deve estar no formato AAAA-MM-DD"),
  teamA: z
    .array(z.string().uuid("ID de jogador inválido"))
    .min(1, "Time A deve ter pelo menos 1 jogador")
    .max(15, "Time A deve ter no máximo 15 jogadores"),
  teamB: z
    .array(z.string().uuid("ID de jogador inválido"))
    .min(1, "Time B deve ter pelo menos 1 jogador")
    .max(15, "Time B deve ter no máximo 15 jogadores"),
  goalsTeamA: z
    .number()
    .int("Gols devem ser números inteiros")
    .min(0, "Gols não podem ser negativos")
    .max(50, "Número de gols muito alto"),
  goalsTeamB: z
    .number()
    .int("Gols devem ser números inteiros")
    .min(0, "Gols não podem ser negativos")
    .max(50, "Número de gols muito alto"),
});

export type MatchInput = z.infer<typeof matchSchema>;

/**
 * Schema de validação para lançamentos de caixa
 */
export const cashEntrySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data deve estar no formato AAAA-MM-DD"),
  type: z.enum(["entry", "exit"], {
    errorMap: () => ({ message: "Tipo de lançamento inválido" }),
  }),
  amount: z.number().positive("Valor deve ser maior que zero").max(1000000, "Valor muito alto"),
  movementType: z.enum(
    ["monthly_fee", "member_monthly", "one_off_game", "member_game", "field_rental", "barbecue", "others"],
    {
      errorMap: () => ({ message: "Tipo de movimentação inválido" }),
    },
  ),
  playerOrRecipient: z.string().max(200, "Nome/descrição muito longo"),
  comment: z.string().max(500, "Comentário muito longo").optional(),
});

export type CashEntryInput = z.infer<typeof cashEntrySchema>;

/**
 * Schema de validação para penalidades
 */
export const penaltySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data deve estar no formato AAAA-MM-DD"),
  playerId: z.string().uuid("ID de jogador inválido"),
  value: z
    .number()
    .int()
    .refine((val) => [-1, -2, -3].includes(val), "Valor de penalidade inválido"),
  reason: z
    .string()
    .min(3, "Motivo deve ter pelo menos 3 caracteres")
    .max(500, "Motivo muito longo")
    .refine((val) => val.trim().length > 0, "Motivo não pode ser vazio"),
});

export type PenaltyInput = z.infer<typeof penaltySchema>;

/**
 * Função helper para extrair mensagens de erro do Zod
 */
export const getValidationErrorMessage = (error: z.ZodError): string => {
  const firstError = error.errors[0];
  return firstError?.message || "Dados inválidos";
};

/**
 * Função helper para validar dados e retornar resultado tipado
 */
export const validateData = <T,>(
  schema: z.ZodSchema<T>,
  data: unknown,
): { success: true; data: T } | { success: false; error: string } => {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: getValidationErrorMessage(result.error) };
};
