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

  const errors = [];

  try {
    // Save entries
    if (journalData.entries && Array.isArray(journalData.entries)) {
      // Delete all existing entries and re-insert (simple approach)
      // For production, consider upsert logic
      const { error: deleteError } = await supabaseClient
        .from('entries')
        .delete()
        .eq('user_id', userId);

      if (deleteError) {
        console.error('Error deleting existing entries:', deleteError);
        errors.push(`Failed to delete existing entries: ${deleteError.message}`);
      }

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
          errors.push(`Failed to save entries: ${entriesError.message}`);
        } else {
          console.log(`Successfully saved ${entriesToInsert.length} entries`);
        }
      }
    }

    // Save trading pairs
    if (journalData.availablePairs && Array.isArray(journalData.availablePairs)) {
      const { error: deletePairsError } = await supabaseClient
        .from('trading_pairs')
        .delete()
        .eq('user_id', userId);

      if (deletePairsError) {
        console.error('Error deleting existing trading pairs:', deletePairsError);
        errors.push(`Failed to delete existing trading pairs: ${deletePairsError.message}`);
      }

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
          errors.push(`Failed to save trading pairs: ${pairsError.message}`);
        } else {
          console.log(`Successfully saved ${pairsToInsert.length} trading pairs`);
        }
      }
    }

    // Save motivational images
    if (journalData.motivationalImages && Array.isArray(journalData.motivationalImages)) {
      const { error: deleteImagesError } = await supabaseClient
        .from('motivational_images')
        .delete()
        .eq('user_id', userId);

      if (deleteImagesError) {
        console.error('Error deleting existing images:', deleteImagesError);
        errors.push(`Failed to delete existing images: ${deleteImagesError.message}`);
      }

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
          errors.push(`Failed to save images: ${imagesError.message}`);
        } else {
          console.log(`Successfully saved ${imagesToInsert.length} motivational images`);
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
        errors.push(`Failed to save preferences: ${prefsError.message}`);
      } else {
        console.log('Successfully saved user preferences');
      }
    }

    // Return success only if no errors occurred, or partial success with error details
    if (errors.length > 0) {
      return { 
        success: false, 
        error: new Error(`Migration completed with errors: ${errors.join('; ')}`) 
      };
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
    // Import loadJournalDataFromLocalStorage to directly load from localStorage
    // This bypasses the smart loader which would try Supabase first
    const { loadJournalDataFromLocalStorage } = await import('./storage.js');
    const localData = loadJournalDataFromLocalStorage();

    if (!localData) {
      return { success: false, error: new Error('No localStorage data to migrate') };
    }

    // Log what we're migrating for debugging
    console.log('Migrating localStorage data to Supabase:', {
      entriesCount: localData.entries?.length || 0,
      pairsCount: localData.availablePairs?.length || 0,
      imagesCount: localData.motivationalImages?.length || 0,
      hasTitle: !!localData.appTitle,
      hasBalance: localData.accountBalance !== undefined,
      hasTheme: !!localData.currentTheme,
      initialized: localData.initialized
    });

    // Save to Supabase
    const result = await saveJournalDataToSupabase(userId, localData);
    
    if (result.success) {
      console.log('Migration successful - data saved to Supabase');
    } else {
      console.error('Migration failed:', result.error);
    }
    
    return result;
  } catch (error) {
    console.error('Error migrating localStorage to Supabase:', error);
    return { success: false, error };
  }
};

