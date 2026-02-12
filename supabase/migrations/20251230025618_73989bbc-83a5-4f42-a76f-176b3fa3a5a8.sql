-- Create players table
CREATE TABLE public.players (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  membership_type TEXT NOT NULL DEFAULT 'monthly' CHECK (membership_type IN ('monthly', 'guest')),
  position TEXT NOT NULL DEFAULT 'field' CHECK (position IN ('goalkeeper', 'field')),
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (public access for now - no auth implemented)
CREATE POLICY "Allow all access to players" 
ON public.players 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_players_updated_at
BEFORE UPDATE ON public.players
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample data
INSERT INTO public.players (name, membership_type, position, active) VALUES
  ('Carlos Silva', 'monthly', 'goalkeeper', true),
  ('João Santos', 'monthly', 'field', true),
  ('Pedro Oliveira', 'monthly', 'field', true),
  ('Lucas Ferreira', 'monthly', 'field', true),
  ('Marcos Lima', 'monthly', 'field', true),
  ('Rafael Costa', 'monthly', 'field', true),
  ('André Souza', 'monthly', 'goalkeeper', true),
  ('Bruno Almeida', 'guest', 'field', true),
  ('Diego Martins', 'monthly', 'field', false),
  ('Felipe Rocha', 'monthly', 'field', true);