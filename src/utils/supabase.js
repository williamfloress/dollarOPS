/**
 * Supabase client initialization and utility functions
 * Includes error handling and fallback mechanisms
 */

import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Storage bucket name
const STORAGE_BUCKET = 'motivational-images';

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
    // Get the current origin for redirect URL
    const redirectUrl = `${window.location.origin}${window.location.pathname}`;
    
    // Sign up with email and password
    // Note: Email confirmation is required (configured in Supabase dashboard)
    // The user will receive an email with a verification link
    const { data: authData, error: authError } = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
      },
    });

    if (authError) {
      return { user: null, error: authError };
    }

    // Create user profile (only if user exists - might not exist if email confirmation is required)
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

    // Return user data (user might not be confirmed yet)
    // The user will need to verify their email before they can sign in
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
        // Convert 'operation' to undefined for backward compatibility with UI code
        // UI code checks !entry.entryType to identify trading entries
        entryType: entry.entry_type === 'operation' ? undefined : (entry.entry_type || undefined),
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
        // Default to 'operation' for trading entries (when entryType is undefined/null)
        entry_type: entry.entryType || 'operation',
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
        error: new Error(`Save completed with errors: ${errors.join('; ')}`) 
      };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Error saving journal data to Supabase:', error);
    return { success: false, error };
  }
};

/**
 * Upload an image file to Supabase Storage
 * @param {File} file - Image file to upload
 * @param {string} userId - User ID (for folder organization)
 * @returns {Promise<{url: string|null, error: Error|null}>}
 */
export const uploadImageToStorage = async (file, userId) => {
  if (!supabaseClient || !userId) {
    return { url: null, error: new Error('Supabase not configured or no user ID') };
  }

  try {
    // Generate unique filename: userId/timestamp-random.ext
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = fileName;

    // Upload file to storage
    const { data, error } = await supabaseClient.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Error uploading image:', error);
      return { url: null, error };
    }

    // Get public URL
    const { data: urlData } = supabaseClient.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(filePath);

    return { url: urlData.publicUrl, error: null };
  } catch (error) {
    console.error('Error uploading image to storage:', error);
    return { url: null, error };
  }
};

/**
 * Delete an image from Supabase Storage
 * @param {string} imageUrl - Public URL of the image
 * @param {string} userId - User ID
 * @returns {Promise<{success: boolean, error: Error|null}>}
 */
export const deleteImageFromStorage = async (imageUrl, userId) => {
  if (!supabaseClient || !userId) {
    return { success: false, error: new Error('Supabase not configured or no user ID') };
  }

  try {
    // Extract file path from URL
    // URL format: https://[project].supabase.co/storage/v1/object/public/motivational-images/userId/filename.ext
    const urlParts = imageUrl.split('/');
    const bucketIndex = urlParts.findIndex(part => part === STORAGE_BUCKET);
    
    if (bucketIndex === -1) {
      return { success: false, error: new Error('Invalid image URL format') };
    }

    // Get path after bucket name: userId/filename.ext
    const filePath = urlParts.slice(bucketIndex + 1).join('/');

    // Delete file from storage
    const { error } = await supabaseClient.storage
      .from(STORAGE_BUCKET)
      .remove([filePath]);

    if (error) {
      console.error('Error deleting image:', error);
      return { success: false, error };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Error deleting image from storage:', error);
    return { success: false, error };
  }
};

/**
 * Migrate a base64 image to Supabase Storage
 * @param {string} base64Data - Base64 data URL (data:image/...;base64,...)
 * @param {string} userId - User ID
 * @returns {Promise<{url: string|null, error: Error|null}>}
 */
export const migrateBase64ToStorage = async (base64Data, userId) => {
  if (!supabaseClient || !userId) {
    return { url: null, error: new Error('Supabase not configured or no user ID') };
  }

  try {
    // Parse base64 data URL
    const matches = base64Data.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!matches) {
      return { url: null, error: new Error('Invalid base64 image format') };
    }

    const mimeType = matches[1];
    const base64String = matches[2];
    const fileExt = mimeType === 'jpeg' ? 'jpg' : mimeType;

    // Convert base64 to blob
    const byteCharacters = atob(base64String);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: `image/${mimeType}` });

    // Generate filename
    const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    // Upload to storage
    const { data, error } = await supabaseClient.storage
      .from(STORAGE_BUCKET)
      .upload(fileName, blob, {
        cacheControl: '3600',
        upsert: false,
        contentType: `image/${mimeType}`
      });

    if (error) {
      console.error('Error migrating image:', error);
      return { url: null, error };
    }

    // Get public URL
    const { data: urlData } = supabaseClient.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(fileName);

    return { url: urlData.publicUrl, error: null };
  } catch (error) {
    console.error('Error migrating base64 image:', error);
    return { url: null, error };
  }
};

