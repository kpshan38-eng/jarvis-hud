-- Add additional settings columns to user_settings table
ALTER TABLE public.user_settings 
ADD COLUMN IF NOT EXISTS voice_enabled boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS speech_rate numeric DEFAULT 1,
ADD COLUMN IF NOT EXISTS show_weather boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS show_stocks boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS show_calendar boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS show_world_map boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS compact_mode boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS sound_effects_enabled boolean DEFAULT true;