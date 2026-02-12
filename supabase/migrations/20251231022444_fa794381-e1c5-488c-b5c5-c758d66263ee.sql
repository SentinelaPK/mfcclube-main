-- 1. Remover política de INSERT permissiva existente
DROP POLICY IF EXISTS "Anyone authenticated can insert penalties" ON public.penalties;

-- 2. Criar política de INSERT apenas para admin
CREATE POLICY "Only admins can insert penalties"
ON public.penalties
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 3. Criar política de UPDATE apenas para admin
CREATE POLICY "Only admins can update penalties"
ON public.penalties
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));