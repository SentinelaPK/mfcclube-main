-- Jogadores: nome não pode ser vazio
ALTER TABLE public.players
ADD CONSTRAINT players_name_not_empty
CHECK (char_length(trim(name)) > 0);

-- Caixa: valor deve ser maior que zero
ALTER TABLE public.cash_entries
ADD CONSTRAINT cash_entries_amount_positive
CHECK (amount > 0);

-- Penalidades: motivo obrigatório
ALTER TABLE public.penalties
ADD CONSTRAINT penalties_reason_not_empty
CHECK (char_length(trim(reason)) > 0);