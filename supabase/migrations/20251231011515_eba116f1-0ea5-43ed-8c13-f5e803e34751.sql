-- Remover constraints incorretos
ALTER TABLE public.cash_entries DROP CONSTRAINT IF EXISTS cash_entries_type_check;
ALTER TABLE public.cash_entries DROP CONSTRAINT IF EXISTS cash_entries_movement_type_check;

-- type deve aceitar: 'entrada' ou 'saida'
ALTER TABLE public.cash_entries 
ADD CONSTRAINT cash_entries_type_check 
CHECK (type IN ('entrada', 'saida'));

-- movement_type deve aceitar as categorias
ALTER TABLE public.cash_entries 
ADD CONSTRAINT cash_entries_movement_type_check 
CHECK (movement_type IN ('mensalidade', 'diarista', 'multa', 'premiacao', 'despesa', 'outros'));