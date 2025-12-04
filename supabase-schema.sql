-- ============================================
-- Trading Journal Database Schema for Supabase
-- Multi-User Support with UUID
-- ============================================
-- 
-- This script is idempotent - safe to run multiple times
-- It will drop existing tables and recreate them
--
-- Usage: Copy and paste this entire script into Supabase SQL Editor
-- ============================================

-- ============================================
-- STEP 1: Drop existing objects (in reverse dependency order)
-- ============================================

-- Drop triggers first (only if tables exist)
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'entries') THEN
        DROP TRIGGER IF EXISTS update_entries_updated_at ON public.entries;
    END IF;
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_preferences') THEN
        DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON public.user_preferences;
    END IF;
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_profiles') THEN
        DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
    END IF;
END $$;

-- Drop functions
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Drop tables (in reverse dependency order to handle foreign keys)
DROP TABLE IF EXISTS public.motivational_images CASCADE;
DROP TABLE IF EXISTS public.trading_pairs CASCADE;
DROP TABLE IF EXISTS public.entries CASCADE;
DROP TABLE IF EXISTS public.user_preferences CASCADE;
DROP TABLE IF EXISTS public.user_profiles CASCADE;

-- ============================================
-- STEP 2: Enable required extensions
-- ============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- STEP 3: Create tables
-- ============================================

-- User Profiles table
-- Note: Supabase Auth provides auth.users table automatically
-- This table stores additional user profile information
CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    last_login TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE
);

-- User Preferences table (one-to-one with users)
CREATE TABLE public.user_preferences (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    app_title VARCHAR(255) NOT NULL DEFAULT 'ProTrader Journal',
    account_balance DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    current_theme VARCHAR(50) NOT NULL DEFAULT 'slate_blue',
    initialized BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Journal Entries table (trading operations, thoughts, day offs)
CREATE TABLE public.entries (
    id BIGINT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    entry_type VARCHAR(20) NOT NULL DEFAULT 'operation', -- 'operation' for trading entries, 'thought' or 'dayoff' for others
    pair VARCHAR(20), -- NULL for non-trading entries
    type VARCHAR(10), -- 'BUY' or 'SELL', NULL for non-trading entries
    rr VARCHAR(10), -- Risk/Reward ratio, NULL for non-trading entries
    pnl DECIMAL(10, 2), -- NULL for non-trading entries
    notes TEXT,
    screenshot_url TEXT,
    message TEXT, -- For thought and dayoff entries
    trading_view_url TEXT, -- For thought entries
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT check_entry_type CHECK (entry_type IN ('operation', 'thought', 'dayoff'))
);

-- Trading Pairs table (user-specific)
CREATE TABLE public.trading_pairs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    pair VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id, pair) -- Each user can have unique pairs
);

-- Motivational Images table (user-specific)
CREATE TABLE public.motivational_images (
    id DECIMAL(20, 6) PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    image_data TEXT NOT NULL, -- Base64 encoded image data
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================
-- STEP 4: Create indexes for better performance
-- ============================================

-- User Profiles indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON public.user_profiles(username);

-- User Preferences indexes
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON public.user_preferences(id);

-- Entries indexes
CREATE INDEX IF NOT EXISTS idx_entries_user_id ON public.entries(user_id);
CREATE INDEX IF NOT EXISTS idx_entries_date ON public.entries(date);
CREATE INDEX IF NOT EXISTS idx_entries_entry_type ON public.entries(entry_type);
CREATE INDEX IF NOT EXISTS idx_entries_pair ON public.entries(pair);
CREATE INDEX IF NOT EXISTS idx_entries_user_date ON public.entries(user_id, date); -- Composite index for user-specific date queries

-- Trading Pairs indexes
CREATE INDEX IF NOT EXISTS idx_trading_pairs_user_id ON public.trading_pairs(user_id);
CREATE INDEX IF NOT EXISTS idx_trading_pairs_pair ON public.trading_pairs(pair);

-- Motivational Images indexes
CREATE INDEX IF NOT EXISTS idx_motivational_images_user_id ON public.motivational_images(user_id);
CREATE INDEX IF NOT EXISTS idx_motivational_images_created_at ON public.motivational_images(created_at);

-- ============================================
-- STEP 5: Create trigger function for updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ============================================
-- STEP 6: Create triggers for updated_at
-- ============================================

CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at 
    BEFORE UPDATE ON public.user_preferences
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_entries_updated_at 
    BEFORE UPDATE ON public.entries
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- STEP 7: Enable Row Level Security (RLS)
-- ============================================

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trading_pairs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.motivational_images ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 8: Drop existing policies (if any)
-- ============================================

-- User Profiles Policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON public.user_profiles;

-- User Preferences Policies
DROP POLICY IF EXISTS "Users can view own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Users can update own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Users can insert own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Users can delete own preferences" ON public.user_preferences;

-- Entries Policies
DROP POLICY IF EXISTS "Users can view own entries" ON public.entries;
DROP POLICY IF EXISTS "Users can insert own entries" ON public.entries;
DROP POLICY IF EXISTS "Users can update own entries" ON public.entries;
DROP POLICY IF EXISTS "Users can delete own entries" ON public.entries;

-- Trading Pairs Policies
DROP POLICY IF EXISTS "Users can view own trading pairs" ON public.trading_pairs;
DROP POLICY IF EXISTS "Users can insert own trading pairs" ON public.trading_pairs;
DROP POLICY IF EXISTS "Users can update own trading pairs" ON public.trading_pairs;
DROP POLICY IF EXISTS "Users can delete own trading pairs" ON public.trading_pairs;

-- Motivational Images Policies
DROP POLICY IF EXISTS "Users can view own images" ON public.motivational_images;
DROP POLICY IF EXISTS "Users can insert own images" ON public.motivational_images;
DROP POLICY IF EXISTS "Users can update own images" ON public.motivational_images;
DROP POLICY IF EXISTS "Users can delete own images" ON public.motivational_images;

-- ============================================
-- STEP 9: Create Row Level Security (RLS) Policies
-- ============================================

-- User Profiles Policies
CREATE POLICY "Users can view own profile"
    ON public.user_profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.user_profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON public.user_profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can delete own profile"
    ON public.user_profiles FOR DELETE
    USING (auth.uid() = id);

-- User Preferences Policies
CREATE POLICY "Users can view own preferences"
    ON public.user_preferences FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own preferences"
    ON public.user_preferences FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own preferences"
    ON public.user_preferences FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can delete own preferences"
    ON public.user_preferences FOR DELETE
    USING (auth.uid() = id);

-- Entries Policies
CREATE POLICY "Users can view own entries"
    ON public.entries FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own entries"
    ON public.entries FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own entries"
    ON public.entries FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own entries"
    ON public.entries FOR DELETE
    USING (auth.uid() = user_id);

-- Trading Pairs Policies
CREATE POLICY "Users can view own trading pairs"
    ON public.trading_pairs FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own trading pairs"
    ON public.trading_pairs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own trading pairs"
    ON public.trading_pairs FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own trading pairs"
    ON public.trading_pairs FOR DELETE
    USING (auth.uid() = user_id);

-- Motivational Images Policies
CREATE POLICY "Users can view own images"
    ON public.motivational_images FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own images"
    ON public.motivational_images FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own images"
    ON public.motivational_images FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own images"
    ON public.motivational_images FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================
-- STEP 10: Add helpful comments
-- ============================================

COMMENT ON TABLE public.user_profiles IS 'Additional user profile information linked to auth.users';
COMMENT ON TABLE public.user_preferences IS 'User-specific application preferences (one-to-one with users)';
COMMENT ON TABLE public.entries IS 'Journal entries: trading operations, thoughts, and day offs';
COMMENT ON TABLE public.trading_pairs IS 'Available trading pairs per user';
COMMENT ON TABLE public.motivational_images IS 'Motivational images for vision board (base64 encoded)';

COMMENT ON COLUMN public.entries.entry_type IS '''operation'' for trading entries, ''thought'' or ''dayoff'' for others';
COMMENT ON COLUMN public.entries.pair IS 'Trading pair (e.g., EURUSD), NULL for non-trading entries';
COMMENT ON COLUMN public.entries.type IS 'Trade direction: ''BUY'' or ''SELL'', NULL for non-trading entries';
COMMENT ON COLUMN public.entries.pnl IS 'Profit and Loss amount, NULL for non-trading entries';

-- ============================================
-- MIGRATION: Update existing NULL entry_type to 'operation'
-- ============================================
-- If you have existing entries with NULL entry_type, run this to update them:
-- UPDATE public.entries 
-- SET entry_type = 'operation' 
-- WHERE entry_type IS NULL;

-- ============================================
-- Verification Queries (optional - uncomment to run)
-- ============================================

-- Verify tables were created
-- SELECT table_name, table_type 
-- FROM information_schema.tables 
-- WHERE table_schema = 'public' 
-- AND table_name IN ('user_profiles', 'user_preferences', 'entries', 'trading_pairs', 'motivational_images')
-- ORDER BY table_name;

-- Verify indexes were created
-- SELECT indexname, tablename 
-- FROM pg_indexes 
-- WHERE schemaname = 'public' 
-- AND tablename IN ('user_profiles', 'user_preferences', 'entries', 'trading_pairs', 'motivational_images')
-- ORDER BY tablename, indexname;

-- Verify RLS is enabled
-- SELECT tablename, rowsecurity 
-- FROM pg_tables 
-- WHERE schemaname = 'public' 
-- AND tablename IN ('user_profiles', 'user_preferences', 'entries', 'trading_pairs', 'motivational_images')
-- ORDER BY tablename;

-- Verify policies were created
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
-- FROM pg_policies 
-- WHERE schemaname = 'public' 
-- AND tablename IN ('user_profiles', 'user_preferences', 'entries', 'trading_pairs', 'motivational_images')
-- ORDER BY tablename, policyname;

-- ============================================
-- Script completed successfully!
-- ============================================
-- 
-- Next steps:
-- 1. Verify tables in Supabase Table Editor
-- 2. Test authentication and RLS policies
-- 3. Run your application and test data operations
-- 
-- ============================================

