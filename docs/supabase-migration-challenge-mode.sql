-- ============================================
-- Migration: Challenge mode columns on user_preferences
-- Run this in Supabase SQL Editor if you have an existing database.
-- Safe to run multiple times (uses IF NOT EXISTS where supported).
-- ============================================

-- Challenge mode settings
ALTER TABLE public.user_preferences
  ADD COLUMN IF NOT EXISTS challenge_mode_enabled BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE public.user_preferences
  ADD COLUMN IF NOT EXISTS challenge_phase1_target_percent DECIMAL(5,2) NOT NULL DEFAULT 8.00;

ALTER TABLE public.user_preferences
  ADD COLUMN IF NOT EXISTS challenge_phase2_target_percent DECIMAL(5,2) NOT NULL DEFAULT 12.00;

ALTER TABLE public.user_preferences
  ADD COLUMN IF NOT EXISTS challenge_daily_loss_limit_percent DECIMAL(5,2) NOT NULL DEFAULT 5.00;

ALTER TABLE public.user_preferences
  ADD COLUMN IF NOT EXISTS challenge_total_loss_limit_percent DECIMAL(5,2) NOT NULL DEFAULT 5.00;

ALTER TABLE public.user_preferences
  ADD COLUMN IF NOT EXISTS challenge_starting_balance DECIMAL(12,2) NULL;

ALTER TABLE public.user_preferences
  ADD COLUMN IF NOT EXISTS challenge_start_date DATE NULL;

-- Challenge state (per run)
ALTER TABLE public.user_preferences
  ADD COLUMN IF NOT EXISTS challenge_phase1_passed_at TIMESTAMP WITH TIME ZONE NULL;

ALTER TABLE public.user_preferences
  ADD COLUMN IF NOT EXISTS challenge_phase2_passed_at TIMESTAMP WITH TIME ZONE NULL;

ALTER TABLE public.user_preferences
  ADD COLUMN IF NOT EXISTS challenge_high_water_mark DECIMAL(12,2) NULL;

ALTER TABLE public.user_preferences
  ADD COLUMN IF NOT EXISTS challenge_day_start_balance DECIMAL(12,2) NULL;

ALTER TABLE public.user_preferences
  ADD COLUMN IF NOT EXISTS challenge_day_start_date DATE NULL;

ALTER TABLE public.user_preferences
  ADD COLUMN IF NOT EXISTS challenge_reference_balance DECIMAL(12,2) NULL;

-- Comments
COMMENT ON COLUMN public.user_preferences.challenge_mode_enabled IS 'Whether Challenge (prop firm) mode is enabled';
COMMENT ON COLUMN public.user_preferences.challenge_phase1_target_percent IS 'Profit % needed to pass Phase 1 (e.g. 8)';
COMMENT ON COLUMN public.user_preferences.challenge_phase2_target_percent IS 'Total profit % for Phase 2 / funded (e.g. 12)';
COMMENT ON COLUMN public.user_preferences.challenge_daily_loss_limit_percent IS 'Max allowed daily loss %';
COMMENT ON COLUMN public.user_preferences.challenge_total_loss_limit_percent IS 'Max allowed total drawdown %';
COMMENT ON COLUMN public.user_preferences.challenge_starting_balance IS 'Reference balance for %; NULL = use balance when challenge started';
COMMENT ON COLUMN public.user_preferences.challenge_start_date IS 'Challenge start date (optional)';
COMMENT ON COLUMN public.user_preferences.challenge_phase1_passed_at IS 'When Phase 1 was passed (once per run)';
COMMENT ON COLUMN public.user_preferences.challenge_phase2_passed_at IS 'When Phase 2 was passed (once per run)';
COMMENT ON COLUMN public.user_preferences.challenge_high_water_mark IS 'Peak balance for total drawdown calculation';
COMMENT ON COLUMN public.user_preferences.challenge_day_start_balance IS 'Balance at start of current trading day (for daily loss)';
COMMENT ON COLUMN public.user_preferences.challenge_day_start_date IS 'Date of day_start_balance for daily reset';
COMMENT ON COLUMN public.user_preferences.challenge_reference_balance IS 'Reference balance when using "current balance at start" (for profit % calculation)';