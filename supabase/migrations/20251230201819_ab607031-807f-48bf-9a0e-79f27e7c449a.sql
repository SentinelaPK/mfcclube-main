-- Create enum for roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create penalties table
CREATE TABLE public.penalties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  value INTEGER NOT NULL CHECK (value IN (-1, -2, -3)),
  reason TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on penalties
ALTER TABLE public.penalties ENABLE ROW LEVEL SECURITY;

-- RLS policies for penalties
CREATE POLICY "Anyone authenticated can view penalties"
ON public.penalties
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Anyone authenticated can insert penalties"
ON public.penalties
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Only admins can delete penalties"
ON public.penalties
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Trigger for updated_at on penalties
CREATE TRIGGER update_penalties_updated_at
BEFORE UPDATE ON public.penalties
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create cash_entries table
CREATE TABLE public.cash_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  type TEXT NOT NULL CHECK (type IN ('mensalidade', 'diarista', 'multa', 'premiacao', 'despesa', 'outros')),
  amount NUMERIC(10, 2) NOT NULL,
  movement_type TEXT NOT NULL CHECK (movement_type IN ('entrada', 'saida')),
  player_or_recipient TEXT,
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on cash_entries
ALTER TABLE public.cash_entries ENABLE ROW LEVEL SECURITY;

-- RLS policies for cash_entries
CREATE POLICY "Anyone authenticated can view cash entries"
ON public.cash_entries
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Anyone authenticated can insert cash entries"
ON public.cash_entries
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Only admins can delete cash entries"
ON public.cash_entries
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Trigger for updated_at on cash_entries
CREATE TRIGGER update_cash_entries_updated_at
BEFORE UPDATE ON public.cash_entries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add policy for admins to delete matches
CREATE POLICY "Only admins can delete matches"
ON public.matches
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));