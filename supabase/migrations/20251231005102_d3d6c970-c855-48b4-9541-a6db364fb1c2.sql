-- Admin inicial do sistema (documentado: única inserção inicial)
-- Usuário: richardd.dutra@gmail.com
INSERT INTO public.user_roles (user_id, role)
VALUES ('2985af81-21e7-497c-99d6-39cbc31b33f5', 'admin');

-- Atualizar RLS para tabela players
DROP POLICY IF EXISTS "Allow all access to players" ON public.players;

CREATE POLICY "Anyone authenticated can view players"
ON public.players FOR SELECT TO authenticated USING (true);

CREATE POLICY "Only admins can insert players"
ON public.players FOR INSERT TO authenticated 
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update players"
ON public.players FOR UPDATE TO authenticated 
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete players"
ON public.players FOR DELETE TO authenticated 
USING (has_role(auth.uid(), 'admin'));

-- Atualizar RLS para tabela matches
DROP POLICY IF EXISTS "Allow all access to matches" ON public.matches;

CREATE POLICY "Anyone authenticated can view matches"
ON public.matches FOR SELECT TO authenticated USING (true);

CREATE POLICY "Only admins can insert matches"
ON public.matches FOR INSERT TO authenticated 
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update matches"
ON public.matches FOR UPDATE TO authenticated 
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));