-- Add builder_config JSONB column to couples table to support the custom builder state
ALTER TABLE couples
ADD COLUMN IF NOT EXISTS builder_config jsonb DEFAULT null;
