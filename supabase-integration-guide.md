# Supabase Integration Guide

This guide provides step-by-step instructions for integrating Supabase into your Trading Journal application, with proper error handling to ensure the website doesn't crash during the integration process.

> **Reference:** See `database-schema-with-users.md` for the complete database schema and `localStorage-schema.md` for localStorage structure.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [x] [Step 1: Create Supabase Project](#step-1-create-supabase-project)
- [x] [Step 2: Install Supabase Client](#step-2-install-supabase-client)
- [x] [Step 3: Set Up Environment Variables](#step-3-set-up-environment-variables)
- [x] [Step 4: Create Database Tables](#step-4-create-database-tables)
- [x] [Step 5: Set Up Row Level Security (RLS)](#step-5-set-up-row-level-security-rls)
- [x] [Step 6: Create Supabase Utility Module](#step-6-create-supabase-utility-module)
- [x] [Step 7: Update Storage Utility with Fallback](#step-7-update-storage-utility-with-fallback)
- [x] [Step 8: Integrate Authentication](#step-8-integrate-authentication)
- [x] [Step 9: Migration Strategy](#step-9-migration-strategy)
- [ ] [Step 10: Testing and Error Handling](#step-10-testing-and-error-handling)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

- Node.js installed (v18 or higher)
- A Supabase account (free tier is sufficient)
- Basic understanding of React and async/await
- Your existing Trading Journal application

---

## [x] Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in to your account
3. Click **"New Project"**
4. Fill in the project details:
   - **Name:** `tjournal` (or your preferred name)
   - **Database Password:** Create a strong password (save it securely)
   - **Region:** Choose the closest region to your users
5. Click **"Create new project"**
6. Wait for the project to be provisioned (2-3 minutes)

---

## [x] Step 2: Install Supabase Client

Open your terminal in the project root and run:

```bash
npm install @supabase/supabase-js
```

This installs the official Supabase JavaScript client library.

---

## [x] Step 3: Set Up Environment Variables

1. Create a `.env` file in your project root (if it doesn't exist)
2. Go to your Supabase project dashboard
3. Navigate to **Settings** → **API**
4. Copy the following values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)
5. Add them to your `.env` file:

```env
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

**Important:** 
- Never commit `.env` to version control
- Add `.env` to your `.gitignore` file
- The `VITE_` prefix is required for Vite to expose these variables to the client

---

## [x] Step 4: Create Database Tables

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Click **"New query"**
4. Copy and paste the following SQL script:

```sql
-- ============================================
-- Trading Journal Database Schema for Supabase
-- Multi-User Support with UUID
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (Supabase Auth handles authentication, this is for additional user data)
-- Note: Supabase Auth provides auth.users table automatically
CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    last_login TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE
);

-- User preferences (one-to-one with users)
CREATE TABLE public.user_preferences (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    app_title VARCHAR(255) NOT NULL DEFAULT 'ProTrader Journal',
    account_balance DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    current_theme VARCHAR(50) NOT NULL DEFAULT 'slate_blue',
    initialized BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Journal entries (trading, thoughts, day offs)
CREATE TABLE public.entries (
    id BIGINT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    entry_type VARCHAR(20), -- NULL for trading entries, 'thought' or 'dayoff' for others
    pair VARCHAR(20), -- NULL for non-trading entries
    type VARCHAR(10), -- 'BUY' or 'SELL', NULL for non-trading entries
    rr VARCHAR(10), -- Risk/Reward ratio, NULL for non-trading entries
    pnl DECIMAL(10, 2), -- NULL for non-trading entries
    notes TEXT,
    screenshot_url TEXT,
    message TEXT, -- For thought and dayoff entries
    trading_view_url TEXT, -- For thought entries
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Trading pairs (user-specific)
CREATE TABLE public.trading_pairs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    pair VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id, pair) -- Each user can have unique pairs
);

-- Motivational images (user-specific)
CREATE TABLE public.motivational_images (
    id DECIMAL(20, 6) PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    image_data TEXT NOT NULL, -- Base64 encoded image data
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX idx_entries_user_id ON public.entries(user_id);
CREATE INDEX idx_entries_date ON public.entries(date);
CREATE INDEX idx_entries_entry_type ON public.entries(entry_type);
CREATE INDEX idx_entries_pair ON public.entries(pair);
CREATE INDEX idx_entries_user_date ON public.entries(user_id, date);
CREATE INDEX idx_trading_pairs_user_id ON public.trading_pairs(user_id);
CREATE INDEX idx_motivational_images_user_id ON public.motivational_images(user_id);
CREATE INDEX idx_user_preferences_user_id ON public.user_preferences(id);
CREATE INDEX idx_user_profiles_user_id ON public.user_profiles(id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON public.user_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_entries_updated_at BEFORE UPDATE ON public.entries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

5. Click **"Run"** to execute the script
6. Verify tables are created by going to **Table Editor**

---

## [x] Step 5: Set Up Row Level Security (RLS)

1. Go to **Authentication** → **Policies** in your Supabase dashboard
2. For each table, enable RLS and create policies:

### Enable RLS on all tables:

```sql
-- Enable RLS on all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trading_pairs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.motivational_images ENABLE ROW LEVEL SECURITY;
```

### Create RLS Policies:

```sql
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
```

Run these SQL commands in the SQL Editor.

---

## [x] Step 6: Create Supabase Utility Module

Create a new file `src/utils/supabase.js`:

```javascript
/**
 * Supabase client initialization and utility functions
 * Includes error handling and fallback mechanisms
 */

import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if Supabase is configured
export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey);
};

// Initialize Supabase client (only if configured)
let supabaseClient = null;

if (isSupabaseConfigured()) {
  try {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error);
    supabaseClient = null;
  }
}

export const getSupabaseClient = () => {
  if (!isSupabaseConfigured()) {
    return null;
  }
  return supabaseClient;
};

/**
 * Get current authenticated user
 * @returns {Promise<{user: Object|null, error: Error|null}>}
 */
export const getCurrentUser = async () => {
  if (!supabaseClient) {
    return { user: null, error: new Error('Supabase not configured') };
  }

  try {
    const { data: { user }, error } = await supabaseClient.auth.getUser();
    return { user, error };
  } catch (error) {
    console.error('Error getting current user:', error);
    return { user: null, error };
  }
};

/**
 * Sign up a new user
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} username - Username
 * @returns {Promise<{user: Object|null, error: Error|null}>}
 */
export const signUp = async (email, password, username) => {
  if (!supabaseClient) {
    return { user: null, error: new Error('Supabase not configured') };
  }

  try {
    // Sign up with email and password
    const { data: authData, error: authError } = await supabaseClient.auth.signUp({
      email,
      password,
    });

    if (authError) {
      return { user: null, error: authError };
    }

    // Create user profile
    if (authData.user) {
      const { error: profileError } = await supabaseClient
        .from('user_profiles')
        .insert({
          id: authData.user.id,
          username: username || email.split('@')[0],
        });

      if (profileError) {
        console.error('Error creating user profile:', profileError);
        // Don't fail signup if profile creation fails
      }

      // Create default preferences
      const { error: prefsError } = await supabaseClient
        .from('user_preferences')
        .insert({
          id: authData.user.id,
        });

      if (prefsError) {
        console.error('Error creating user preferences:', prefsError);
      }
    }

    return { user: authData.user, error: null };
  } catch (error) {
    console.error('Error signing up:', error);
    return { user: null, error };
  }
};

/**
 * Sign in a user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<{user: Object|null, error: Error|null}>}
 */
export const signIn = async (email, password) => {
  if (!supabaseClient) {
    return { user: null, error: new Error('Supabase not configured') };
  }

  try {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { user: null, error };
    }

    // Update last login
    if (data.user) {
      await supabaseClient
        .from('user_profiles')
        .update({ last_login: new Date().toISOString() })
        .eq('id', data.user.id);
    }

    return { user: data.user, error: null };
  } catch (error) {
    console.error('Error signing in:', error);
    return { user: null, error };
  }
};

/**
 * Sign out current user
 * @returns {Promise<{error: Error|null}>}
 */
export const signOut = async () => {
  if (!supabaseClient) {
    return { error: new Error('Supabase not configured') };
  }

  try {
    const { error } = await supabaseClient.auth.signOut();
    return { error };
  } catch (error) {
    console.error('Error signing out:', error);
    return { error };
  }
};

/**
 * Load all journal data from Supabase
 * @param {string} userId - User ID
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export const loadJournalDataFromSupabase = async (userId) => {
  if (!supabaseClient || !userId) {
    return { data: null, error: new Error('Supabase not configured or no user ID') };
  }

  try {
    // Load entries
    const { data: entries, error: entriesError } = await supabaseClient
      .from('entries')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (entriesError) {
      console.error('Error loading entries:', entriesError);
    }

    // Load trading pairs
    const { data: pairs, error: pairsError } = await supabaseClient
      .from('trading_pairs')
      .select('pair')
      .eq('user_id', userId)
      .order('pair', { ascending: true });

    if (pairsError) {
      console.error('Error loading trading pairs:', pairsError);
    }

    // Load motivational images
    const { data: images, error: imagesError } = await supabaseClient
      .from('motivational_images')
      .select('id, image_data')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (imagesError) {
      console.error('Error loading images:', imagesError);
    }

    // Load user preferences
    const { data: preferences, error: prefsError } = await supabaseClient
      .from('user_preferences')
      .select('*')
      .eq('id', userId)
      .single();

    if (prefsError) {
      console.error('Error loading preferences:', prefsError);
    }

    // Transform data to match localStorage format
    const data = {
      entries: (entries || []).map(entry => ({
        id: entry.id,
        date: entry.date,
        entryType: entry.entry_type || undefined,
        pair: entry.pair || undefined,
        type: entry.type || undefined,
        rr: entry.rr || undefined,
        pnl: entry.pnl || undefined,
        notes: entry.notes || undefined,
        screenshotUrl: entry.screenshot_url || undefined,
        message: entry.message || undefined,
        tradingViewUrl: entry.trading_view_url || undefined,
      })),
      availablePairs: (pairs || []).map(p => p.pair),
      motivationalImages: (images || []).map(img => ({
        id: parseFloat(img.id),
        src: img.image_data,
      })),
      appTitle: preferences?.app_title || 'ProTrader Journal',
      accountBalance: parseFloat(preferences?.account_balance || 0),
      currentTheme: preferences?.current_theme || 'slate_blue',
      initialized: preferences?.initialized || false,
    };

    return { data, error: null };
  } catch (error) {
    console.error('Error loading journal data from Supabase:', error);
    return { data: null, error };
  }
};

/**
 * Save journal data to Supabase
 * @param {string} userId - User ID
 * @param {Object} journalData - Journal data object
 * @returns {Promise<{success: boolean, error: Error|null}>}
 */
export const saveJournalDataToSupabase = async (userId, journalData) => {
  if (!supabaseClient || !userId) {
    return { success: false, error: new Error('Supabase not configured or no user ID') };
  }

  try {
    // Save entries
    if (journalData.entries && Array.isArray(journalData.entries)) {
      // Delete all existing entries and re-insert (simple approach)
      // For production, consider upsert logic
      await supabaseClient
        .from('entries')
        .delete()
        .eq('user_id', userId);

      const entriesToInsert = journalData.entries.map(entry => ({
        id: entry.id,
        user_id: userId,
        date: entry.date,
        entry_type: entry.entryType || null,
        pair: entry.pair || null,
        type: entry.type || null,
        rr: entry.rr || null,
        pnl: entry.pnl || null,
        notes: entry.notes || null,
        screenshot_url: entry.screenshotUrl || null,
        message: entry.message || null,
        trading_view_url: entry.tradingViewUrl || null,
      }));

      if (entriesToInsert.length > 0) {
        const { error: entriesError } = await supabaseClient
          .from('entries')
          .insert(entriesToInsert);

        if (entriesError) {
          console.error('Error saving entries:', entriesError);
        }
      }
    }

    // Save trading pairs
    if (journalData.availablePairs && Array.isArray(journalData.availablePairs)) {
      await supabaseClient
        .from('trading_pairs')
        .delete()
        .eq('user_id', userId);

      const pairsToInsert = journalData.availablePairs.map(pair => ({
        user_id: userId,
        pair: pair.toUpperCase(),
      }));

      if (pairsToInsert.length > 0) {
        const { error: pairsError } = await supabaseClient
          .from('trading_pairs')
          .insert(pairsToInsert);

        if (pairsError) {
          console.error('Error saving trading pairs:', pairsError);
        }
      }
    }

    // Save motivational images
    if (journalData.motivationalImages && Array.isArray(journalData.motivationalImages)) {
      await supabaseClient
        .from('motivational_images')
        .delete()
        .eq('user_id', userId);

      const imagesToInsert = journalData.motivationalImages.map(image => ({
        id: image.id.toString(),
        user_id: userId,
        image_data: image.src,
      }));

      if (imagesToInsert.length > 0) {
        const { error: imagesError } = await supabaseClient
          .from('motivational_images')
          .insert(imagesToInsert);

        if (imagesError) {
          console.error('Error saving images:', imagesError);
        }
      }
    }

    // Save user preferences
    if (journalData.appTitle !== undefined || 
        journalData.accountBalance !== undefined || 
        journalData.currentTheme !== undefined || 
        journalData.initialized !== undefined) {
      const { error: prefsError } = await supabaseClient
        .from('user_preferences')
        .upsert({
          id: userId,
          app_title: journalData.appTitle,
          account_balance: journalData.accountBalance,
          current_theme: journalData.currentTheme,
          initialized: journalData.initialized,
        }, {
          onConflict: 'id'
        });

      if (prefsError) {
        console.error('Error saving preferences:', prefsError);
      }
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Error saving journal data to Supabase:', error);
    return { success: false, error };
  }
};

/**
 * Migrate localStorage data to Supabase
 * @param {string} userId - User ID
 * @returns {Promise<{success: boolean, error: Error|null}>}
 */
export const migrateLocalStorageToSupabase = async (userId) => {
  if (!supabaseClient || !userId) {
    return { success: false, error: new Error('Supabase not configured or no user ID') };
  }

  try {
    // Import loadJournalData from storage utility
    const { loadJournalData } = await import('./storage.js');
    const localData = loadJournalData();

    if (!localData) {
      return { success: false, error: new Error('No localStorage data to migrate') };
    }

    // Save to Supabase
    const result = await saveJournalDataToSupabase(userId, localData);
    return result;
  } catch (error) {
    console.error('Error migrating localStorage to Supabase:', error);
    return { success: false, error };
  }
};
```

---

## [x] Step 7: Update Storage Utility with Fallback

Update `src/utils/storage.js` to include Supabase integration with localStorage fallback:

```javascript
/**
 * Centralized storage utility with Supabase integration and localStorage fallback
 * Automatically falls back to localStorage if Supabase is unavailable
 */

import { 
  isSupabaseConfigured, 
  getCurrentUser, 
  loadJournalDataFromSupabase, 
  saveJournalDataToSupabase 
} from './supabase.js';

// ... existing code ...

// Storage keys (keep existing)
const STORAGE_KEYS = {
  ENTRIES: 'journal_entries_v1',
  PAIRS: 'journal_pairs_v1',
  IMAGES: 'journal_images_v1',
  TITLE: 'journal_title_v1',
  BALANCE: 'journal_balance_v1',
  THEME: 'journal_theme_v1',
  INITIALIZED: 'journal_initialized_v1'
};

/**
 * Determine if we should use Supabase or localStorage
 * @returns {Promise<{useSupabase: boolean, userId: string|null}>}
 */
const getStorageMode = async () => {
  if (!isSupabaseConfigured()) {
    return { useSupabase: false, userId: null };
  }

  try {
    const { user, error } = await getCurrentUser();
    if (error || !user) {
      return { useSupabase: false, userId: null };
    }
    return { useSupabase: true, userId: user.id };
  } catch (error) {
    console.warn('Error checking Supabase auth, falling back to localStorage:', error);
    return { useSupabase: false, userId: null };
  }
};

/**
 * Save all journal data (with Supabase fallback to localStorage)
 * @param {Object} data - Journal data object
 * @returns {Promise<boolean>} Success status
 */
export const saveJournalData = async (data) => {
  try {
    const { useSupabase, userId } = await getStorageMode();

    if (useSupabase && userId) {
      // Try Supabase first
      const { success, error } = await saveJournalDataToSupabase(userId, data);
      if (success) {
        // Also save to localStorage as backup
        saveJournalDataToLocalStorage(data);
        return true;
      } else {
        console.warn('Supabase save failed, falling back to localStorage:', error);
        // Fall through to localStorage
      }
    }

    // Fallback to localStorage
    return saveJournalDataToLocalStorage(data);
  } catch (error) {
    console.error('Error saving journal data:', error);
    // Final fallback to localStorage
    return saveJournalDataToLocalStorage(data);
  }
};

/**
 * Save to localStorage (internal helper)
 */
const saveJournalDataToLocalStorage = (data) => {
  try {
    if (data.entries !== undefined) {
      localStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify(data.entries));
    }
    if (data.availablePairs !== undefined) {
      localStorage.setItem(STORAGE_KEYS.PAIRS, JSON.stringify(data.availablePairs));
    }
    if (data.motivationalImages !== undefined) {
      localStorage.setItem(STORAGE_KEYS.IMAGES, JSON.stringify(data.motivationalImages));
    }
    if (data.appTitle !== undefined) {
      localStorage.setItem(STORAGE_KEYS.TITLE, JSON.stringify(data.appTitle));
    }
    if (data.accountBalance !== undefined) {
      localStorage.setItem(STORAGE_KEYS.BALANCE, JSON.stringify(data.accountBalance));
    }
    if (data.currentTheme !== undefined) {
      localStorage.setItem(STORAGE_KEYS.THEME, JSON.stringify(data.currentTheme));
    }
    if (data.initialized !== undefined) {
      localStorage.setItem(STORAGE_KEYS.INITIALIZED, data.initialized ? 'true' : 'false');
    }
    return true;
  } catch (error) {
    console.error('Error saving to localStorage:', error);
    return false;
  }
};

/**
 * Load all journal data (with Supabase fallback to localStorage)
 * @returns {Promise<Object|null>} Journal data object or null if not found
 */
export const loadJournalData = async () => {
  try {
    const { useSupabase, userId } = await getStorageMode();

    if (useSupabase && userId) {
      // Try Supabase first
      const { data, error } = await loadJournalDataFromSupabase(userId);
      if (data && !error) {
        // Also sync to localStorage as backup
        saveJournalDataToLocalStorage(data);
        return data;
      } else {
        console.warn('Supabase load failed, falling back to localStorage:', error);
        // Fall through to localStorage
      }
    }

    // Fallback to localStorage
    return loadJournalDataFromLocalStorage();
  } catch (error) {
    console.error('Error loading journal data:', error);
    // Final fallback to localStorage
    return loadJournalDataFromLocalStorage();
  }
};

/**
 * Load from localStorage (internal helper)
 */
const loadJournalDataFromLocalStorage = () => {
  try {
    const entries = localStorage.getItem(STORAGE_KEYS.ENTRIES);
    const pairs = localStorage.getItem(STORAGE_KEYS.PAIRS);
    const images = localStorage.getItem(STORAGE_KEYS.IMAGES);
    const title = localStorage.getItem(STORAGE_KEYS.TITLE);
    const balance = localStorage.getItem(STORAGE_KEYS.BALANCE);
    const theme = localStorage.getItem(STORAGE_KEYS.THEME);
    const initialized = localStorage.getItem(STORAGE_KEYS.INITIALIZED);

    const data = {};
    
    if (entries !== null) {
      data.entries = JSON.parse(entries);
    }
    if (pairs !== null) {
      data.availablePairs = JSON.parse(pairs);
    }
    if (images !== null) {
      data.motivationalImages = JSON.parse(images);
    }
    if (title !== null) {
      data.appTitle = JSON.parse(title);
    }
    if (balance !== null) {
      data.accountBalance = JSON.parse(balance);
    }
    if (theme !== null) {
      data.currentTheme = JSON.parse(theme);
    }
    if (initialized !== null) {
      data.initialized = initialized === 'true';
    }

    if (Object.keys(data).length === 0) {
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    return null;
  }
};

// ... keep all other existing functions (clearJournalData, exportJournalData, etc.) ...
// They can remain synchronous and work with localStorage only
// Or update them similarly if needed

// Export storage keys
export { STORAGE_KEYS };
```

**Important:** Since `loadJournalData` and `saveJournalData` are now async, you'll need to update your `App.jsx` to use `await` when calling these functions.

---

## [x] Step 8: Integrate Authentication

Create a simple authentication component `src/components/Auth.jsx`:

```javascript
import React, { useState, useEffect } from 'react';
import { signIn, signUp, signOut, getCurrentUser, isSupabaseConfigured, getSupabaseClient } from '../utils/supabase.js';

export const Auth = ({ onAuthChange }) => {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      // Supabase not configured, skip auth
      if (onAuthChange) onAuthChange(null);
      return;
    }

    checkUser();
    
    // Listen for auth changes
    const supabase = getSupabaseClient();
    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user || null);
        if (onAuthChange) onAuthChange(session?.user || null);
      });

      // Cleanup subscription on unmount
      return () => {
        subscription.unsubscribe();
      };
    }
  }, [onAuthChange]);

  const checkUser = async () => {
    try {
      const { user: currentUser } = await getCurrentUser();
      setUser(currentUser);
      if (onAuthChange) onAuthChange(currentUser);
    } catch (err) {
      console.error('Error checking user:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let result;
      if (isSignUp) {
        result = await signUp(email, password, username);
      } else {
        result = await signIn(email, password);
      }

      if (result.error) {
        setError(result.error.message);
      } else {
        setUser(result.user);
        if (onAuthChange) onAuthChange(result.user);
        // Reset form
        setEmail('');
        setPassword('');
        setUsername('');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOut();
      setUser(null);
      if (onAuthChange) onAuthChange(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // If Supabase is not configured, don't show auth UI
  if (!isSupabaseConfigured()) {
    return null;
  }

  if (user) {
    return (
      <div className="p-4 bg-slate-800 rounded-lg">
        <p className="text-slate-200 mb-2">Signed in as: {user.email}</p>
        <button
          onClick={handleSignOut}
          disabled={loading}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
        >
          {loading ? 'Signing out...' : 'Sign Out'}
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 bg-slate-800 rounded-lg max-w-md mx-auto">
      <h2 className="text-xl font-bold text-slate-200 mb-4">
        {isSignUp ? 'Sign Up' : 'Sign In'}
      </h2>
      
      {error && (
        <div className="mb-4 p-2 bg-red-900/50 text-red-200 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {isSignUp && (
          <div>
            <label className="block text-slate-300 mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 text-slate-200 rounded border border-slate-700"
              required={isSignUp}
            />
          </div>
        )}

        <div>
          <label className="block text-slate-300 mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 bg-slate-900 text-slate-200 rounded border border-slate-700"
            required
          />
        </div>

        <div>
          <label className="block text-slate-300 mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 bg-slate-900 text-slate-200 rounded border border-slate-700"
            required
            minLength={6}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Sign In')}
        </button>

        <button
          type="button"
          onClick={() => {
            setIsSignUp(!isSignUp);
            setError(null);
          }}
          className="w-full text-slate-400 hover:text-slate-200 text-sm"
        >
          {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
        </button>
      </form>
    </div>
  );
};
```

---

## [x] Step 9: Migration Strategy

When a user first signs in, you can offer to migrate their localStorage data to Supabase. A reusable migration component has been created to handle this.

### Option 1: Using the MigrationPrompt Component (Recommended)

Create a migration component `src/components/MigrationPrompt.jsx` that automatically detects and prompts for migration:

```javascript
// In your App.jsx
import { MigrationPrompt } from './components/MigrationPrompt';
import { Auth } from './components/Auth';

export default function TradingJournalApp() {
  const [user, setUser] = useState(null);

  const handleAuthChange = (newUser) => {
    setUser(newUser);
  };

  const handleMigrationComplete = () => {
    // Optionally reload data from Supabase after migration
    // This will be handled automatically by the storage utility
  };

  return (
    <>
      <Auth onAuthChange={handleAuthChange} />
      <MigrationPrompt 
        user={user}
        onMigrationComplete={handleMigrationComplete}
        onDismiss={() => {}}
      />
      {/* Rest of your app */}
    </>
  );
}
```

The `MigrationPrompt` component:
- Automatically checks for localStorage data when a user signs in
- Only shows once per user (tracks dismissal and completion)
- Provides a user-friendly UI with loading states
- Handles errors gracefully
- Marks migration as complete to prevent re-prompting

### Option 2: Simple Function Approach

For a simpler implementation, you can use a function-based approach:

```javascript
// In your App.jsx or a migration component
import { migrateLocalStorageToSupabase } from './utils/supabase';
import { loadJournalData } from './utils/storage';

const handleUserSignIn = async (user) => {
  if (!user) return;

  // Check if user has localStorage data
  const localData = await loadJournalData();
  
  if (localData && (localData.entries?.length > 0 || localData.availablePairs?.length > 0)) {
    // Ask user if they want to migrate
    const shouldMigrate = window.confirm(
      'We found local data. Would you like to migrate it to your cloud account?'
    );

    if (shouldMigrate) {
      const { success, error } = await migrateLocalStorageToSupabase(user.id);
      if (success) {
        alert('Data migrated successfully!');
      } else {
        alert('Migration failed: ' + (error?.message || 'Unknown error'));
      }
    }
  }
};
```

**Note:** The component approach is recommended as it provides better UX and handles edge cases more gracefully.

---

## [ ] Step 10: Testing and Error Handling

### Test Checklist

1. **Without Supabase configured:**
   - App should work normally with localStorage
   - No errors in console
   - No authentication UI shown

2. **With Supabase configured but not signed in:**
   - App should work with localStorage
   - Authentication UI should be visible
   - Can sign up/sign in

3. **With Supabase and signed in:**
   - Data should sync to Supabase
   - localStorage should be used as backup
   - Data persists across sessions

4. **Error scenarios:**
   - Network failure → falls back to localStorage
   - Supabase error → falls back to localStorage
   - Invalid credentials → shows error message
   - No crash in any scenario

### Error Handling Best Practices

- Always wrap Supabase calls in try-catch
- Always provide localStorage fallback
- Log errors but don't crash the app
- Show user-friendly error messages
- Use `isSupabaseConfigured()` checks before using Supabase

---

## Troubleshooting

### Issue: "Supabase not configured" error

**Solution:** 
- Check that `.env` file exists and has `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Restart your dev server after adding environment variables
- Verify the values are correct in Supabase dashboard

### Issue: RLS policies blocking queries

**Solution:**
- Ensure user is authenticated before making queries
- Check that RLS policies are correctly set up
- Verify `user_id` matches `auth.uid()` in queries

### Issue: Data not syncing

**Solution:**
- Check browser console for errors
- Verify user is signed in
- Check network tab for failed requests
- Ensure tables exist and have correct schema

### Issue: App crashes on load

**Solution:**
- Ensure all async functions are properly awaited
- Check that `loadJournalData()` calls use `await`
- Verify error handling is in place
- Check that Supabase client initialization is wrapped in try-catch

### Issue: Migration fails

**Solution:**
- Check that user is authenticated
- Verify localStorage has data to migrate
- Check Supabase logs for errors
- Ensure RLS policies allow INSERT operations

---

## Next Steps

1. **Add real-time subscriptions** for multi-device sync
2. **Implement offline support** with service workers
3. **Add data export/import** functionality
4. **Implement image storage** in Supabase Storage instead of base64
5. **Add user profile management**
6. **Implement password reset** functionality
7. **Add email verification**

---

## Security Notes

- Never expose your Supabase service role key in the client
- Always use RLS policies to protect user data
- Validate all user inputs before saving
- Use HTTPS in production
- Regularly update dependencies
- Monitor Supabase dashboard for suspicious activity

---

## Support

For issues or questions:
- Supabase Documentation: https://supabase.com/docs
- Supabase Discord: https://discord.supabase.com
- Check your Supabase project logs in the dashboard

---

**Last Updated:** 2024-01-20

