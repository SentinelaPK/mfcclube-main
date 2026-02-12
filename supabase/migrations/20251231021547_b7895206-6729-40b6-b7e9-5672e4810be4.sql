-- 1. Remover política de INSERT permissiva existente
DROP POLICY IF EXISTS "Anyone authenticated can insert cash entries" ON public.cash_entries;

-- 2. Criar política de INSERT apenas para admin
CREATE POLICY "Only admins can insert cash entries"
ON public.cash_entries
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 3. Criar política de UPDATE apenas para admin
CREATE POLICY "Only admins can update cash entries"
ON public.cash_entries
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));