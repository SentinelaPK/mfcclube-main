-- Add deleted_at column for soft delete
ALTER TABLE public.players 
ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Create index for performance on deleted_at queries
CREATE INDEX idx_players_deleted_at ON public.players(deleted_at);

-- Add comment explaining the column
COMMENT ON COLUMN public.players.deleted_at IS 'When set, indicates the player was soft deleted. NULL means active.';