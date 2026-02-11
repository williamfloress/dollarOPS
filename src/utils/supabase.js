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
 * Ensure user profile exists, create if it doesn't
 * @param {string} userId - User ID
 * @param {string} email - User email (username is derived from email prefix)
 * @returns {Promise<{success: boolean, error: Error|null}>}
 */
const ensureUserProfileExists = async (userId, email) => {
  if (!supabaseClient || !userId) {
    return { success: false, error: new Error('Supabase not configured or no user ID') };
  }

  try {
    // Check if profile exists
    const { data: existingProfile, error: checkError } = await supabaseClient
      .from('user_profiles')
      .select('id')
      .eq('id', userId)
      .single();

    // If profile doesn't exist, create it
    if (!existingProfile || checkError) {
      // Always use email prefix as username
      const username = email.split('@')[0];
      
      const { error: insertError } = await supabaseClient
        .from('user_profiles')
        .insert({
          id: userId,
          username: username,
        });

      if (insertError) {
        // If insert fails, check if it's because profile already exists (race condition)
        if (insertError.code !== '23505') { // 23505 is unique_violation in PostgreSQL
          console.error('Error creating user profile:', insertError);
          return { success: false, error: insertError };
        }
        // Profile was created by another request, that's fine
      } else {
        console.log('User profile created for user:', userId);
      }
    }

    // Ensure user preferences exist
    const { data: existingPrefs, error: prefsCheckError } = await supabaseClient
      .from('user_preferences')
      .select('id')
      .eq('id', userId)
      .single();

    if (!existingPrefs || prefsCheckError) {
      const { error: prefsError } = await supabaseClient
        .from('user_preferences')
        .insert({
          id: userId,
        });

      if (prefsError) {
        // If insert fails, check if it's because preferences already exist
        if (prefsError.code !== '23505') {
          console.error('Error creating user preferences:', prefsError);
          // Don't fail if preferences creation fails, it's not critical
        }
      } else {
        console.log('User preferences created for user:', userId);
      }
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Error ensuring user profile exists:', error);
    return { success: false, error };
  }
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
    
    // Ensure profile exists if user is authenticated
    if (user && !error) {
      await ensureUserProfileExists(user.id, user.email);
    }
    
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
 * @returns {Promise<{user: Object|null, error: Error|null}>}
 */
export const signUp = async (email, password) => {
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

    // Ensure user profile exists (only if user exists - might not exist if email confirmation is required)
    // Username will be automatically set to the email prefix
    if (authData.user) {
      await ensureUserProfileExists(authData.user.id, email);
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

    // Ensure profile exists and update last login
    if (data.user) {
      // Ensure profile exists first (in case it wasn't created during signup)
      await ensureUserProfileExists(data.user.id, data.user.email);
      
      // Update last login
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
 * Request password reset email
 * @param {string} email - User email
 * @returns {Promise<{success: boolean, error: Error|null}>}
 */
export const requestPasswordReset = async (email) => {
  if (!supabaseClient) {
    return { success: false, error: new Error('Supabase not configured') };
  }

  try {
    // Use explicit redirect URL - Supabase will append access_token and type=recovery to the hash
    // This ensures the app can properly detect and handle the recovery flow
    // The redirectTo must be registered in Supabase Dashboard > Authentication > URL Configuration > Redirect URLs
    const redirectUrl = `${window.location.origin}${window.location.pathname}`;
    
    const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });

    if (error) {
      return { success: false, error };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Error requesting password reset:', error);
    return { success: false, error };
  }
};

/**
 * Update user password (after password reset)
 * @param {string} newPassword - New password
 * @returns {Promise<{success: boolean, error: Error|null}>}
 */
export const updatePassword = async (newPassword) => {
  if (!supabaseClient) {
    return { success: false, error: new Error('Supabase not configured') };
  }

  try {
    const { error } = await supabaseClient.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      return { success: false, error };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Error updating password:', error);
    return { success: false, error };
  }
};

/**
 * Resend verification email
 * @param {string} email - User email
 * @returns {Promise<{success: boolean, error: Error|null}>}
 */
export const resendVerificationEmail = async (email) => {
  if (!supabaseClient) {
    return { success: false, error: new Error('Supabase not configured') };
  }

  try {
    const redirectUrl = `${window.location.origin}${window.location.pathname}`;
    
    const { error } = await supabaseClient.auth.resend({
      type: 'signup',
      email: email,
      options: {
        emailRedirectTo: redirectUrl,
      },
    });

    if (error) {
      return { success: false, error };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Error resending verification email:', error);
    return { success: false, error };
  }
};

/**
 * Get user profile
 * @param {string} userId - User ID
 * @returns {Promise<{profile: Object|null, error: Error|null}>}
 */
export const getUserProfile = async (userId) => {
  if (!supabaseClient || !userId) {
    return { profile: null, error: new Error('Supabase not configured or no user ID') };
  }

  try {
    const { data, error } = await supabaseClient
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      return { profile: null, error };
    }

    return { profile: data, error: null };
  } catch (error) {
    console.error('Error getting user profile:', error);
    return { profile: null, error };
  }
};

/**
 * Update user profile
 * @param {string} userId - User ID
 * @param {Object} updates - Profile updates (username, etc.)
 * @returns {Promise<{success: boolean, error: Error|null}>}
 */
export const updateUserProfile = async (userId, updates) => {
  if (!supabaseClient || !userId) {
    return { success: false, error: new Error('Supabase not configured or no user ID') };
  }

  try {
    const { error } = await supabaseClient
      .from('user_profiles')
      .update(updates)
      .eq('id', userId);

    if (error) {
      return { success: false, error };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Error updating user profile:', error);
    return { success: false, error };
  }
};

/**
 * Update user email
 * @param {string} newEmail - New email address
 * @returns {Promise<{success: boolean, error: Error|null}>}
 */
export const updateUserEmail = async (newEmail) => {
  if (!supabaseClient) {
    return { success: false, error: new Error('Supabase not configured') };
  }

  try {
    // Update email - Supabase will send a confirmation email
    // The redirect URL should be configured in Supabase Dashboard > Authentication > URL Configuration
    // When user clicks the confirmation link, they'll be redirected back to the app
    // The onAuthStateChange listener will detect USER_UPDATED or TOKEN_REFRESHED event
    // and refresh the user session with the new email
    const { error } = await supabaseClient.auth.updateUser({
      email: newEmail,
    });

    if (error) {
      return { success: false, error };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Error updating email:', error);
    return { success: false, error };
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
      .select('id, image_url, image_data') // Load both for migration
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

    // Transform data to match expected format
    const data = {
      entries: (entries || []).map(entry => {
        // Determine if this is a trading entry (has pair, type, rr) vs non-trading (thought, dayoff)
        const isTradingEntry = entry.entry_type === 'operation' || 
                               (!entry.entry_type && (entry.pair || entry.type || entry.rr));
        
        // For trading entries with null pnl, assume break even (0)
        // This fixes existing entries that lost their 0 value
        let pnlValue = entry.pnl;
        if (isTradingEntry && (entry.pnl === null || entry.pnl === undefined)) {
          pnlValue = 0;
        } else if (entry.pnl != null) {
          pnlValue = entry.pnl;
        } else {
          pnlValue = undefined;
        }
        
        return {
          id: entry.id,
          date: entry.date,
          // Convert 'operation' to undefined for backward compatibility with UI code
          // UI code checks !entry.entryType to identify trading entries
          entryType: entry.entry_type === 'operation' ? undefined : (entry.entry_type || undefined),
          pair: entry.pair || undefined,
          type: entry.type || undefined,
          rr: entry.rr || undefined,
          // Preserve 0 values for break even trades, and fix null values for trading entries
          pnl: pnlValue,
          notes: entry.notes || undefined,
          screenshotUrl: entry.screenshot_url || undefined,
          message: entry.message || undefined,
          tradingViewUrl: entry.trading_view_url || undefined,
        };
      }),
      availablePairs: (pairs || []).map(p => p.pair),
      motivationalImages: (images || []).map(img => ({
        id: parseFloat(img.id),
        src: img.image_url || img.image_data, // Use URL if available, else base64
        needsMigration: !img.image_url && img.image_data // Flag for migration
      })),
      appTitle: preferences?.app_title || 'ProTrader Journal',
      accountBalance: parseFloat(preferences?.account_balance || 0),
      currentTheme: preferences?.current_theme || 'slate_blue',
      initialized: preferences?.initialized || false,
      // Challenge mode settings and state (columns may be missing before migration)
      challengeSettings: {
        enabled: preferences?.challenge_mode_enabled ?? false,
        phase1TargetPercent: parseFloat(preferences?.challenge_phase1_target_percent ?? 8),
        phase2TargetPercent: parseFloat(preferences?.challenge_phase2_target_percent ?? 12),
        dailyLossLimitPercent: parseFloat(preferences?.challenge_daily_loss_limit_percent ?? 5),
        totalLossLimitPercent: parseFloat(preferences?.challenge_total_loss_limit_percent ?? 5),
        startingBalance: preferences?.challenge_starting_balance != null ? parseFloat(preferences.challenge_starting_balance) : null,
        challengeStartDate: preferences?.challenge_start_date || null,
      },
      challengeState: {
        phase1PassedAt: preferences?.challenge_phase1_passed_at || null,
        phase2PassedAt: preferences?.challenge_phase2_passed_at || null,
        highWaterMark: preferences?.challenge_high_water_mark != null ? parseFloat(preferences.challenge_high_water_mark) : null,
        dayStartBalance: preferences?.challenge_day_start_balance != null ? parseFloat(preferences.challenge_day_start_balance) : null,
        dayStartDate: preferences?.challenge_day_start_date || null,
        referenceBalance: preferences?.challenge_reference_balance != null ? parseFloat(preferences.challenge_reference_balance) : null,
      },
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
        // Preserve 0 values for break even trades (0 is falsy, so use != null check)
        pnl: entry.pnl != null ? entry.pnl : null,
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

      const imagesToInsert = journalData.motivationalImages.map(image => {
        const isBase64 = image.src && image.src.startsWith('data:');
        return {
          id: image.id.toString(),
          user_id: userId,
          image_url: isBase64 ? null : image.src, // Store URL if not base64
          image_data: isBase64 ? image.src : null, // Store base64 only if URL not available
        };
      });

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

    // Save user preferences (including challenge mode settings and state)
    const hasPrefs = journalData.appTitle !== undefined ||
        journalData.accountBalance !== undefined ||
        journalData.currentTheme !== undefined ||
        journalData.initialized !== undefined;
    const cs = journalData.challengeSettings;
    const cst = journalData.challengeState;
    const hasChallenge = (cs && typeof cs === 'object') || (cst && typeof cst === 'object');

    if (hasPrefs || hasChallenge) {
      const prefsPayload = {
        id: userId,
        ...(journalData.appTitle !== undefined && { app_title: journalData.appTitle }),
        ...(journalData.accountBalance !== undefined && { account_balance: journalData.accountBalance }),
        ...(journalData.currentTheme !== undefined && { current_theme: journalData.currentTheme }),
        ...(journalData.initialized !== undefined && { initialized: journalData.initialized }),
      };
      if (cs && typeof cs === 'object') {
        if (cs.enabled !== undefined) prefsPayload.challenge_mode_enabled = cs.enabled;
        if (cs.phase1TargetPercent !== undefined) prefsPayload.challenge_phase1_target_percent = cs.phase1TargetPercent;
        if (cs.phase2TargetPercent !== undefined) prefsPayload.challenge_phase2_target_percent = cs.phase2TargetPercent;
        if (cs.dailyLossLimitPercent !== undefined) prefsPayload.challenge_daily_loss_limit_percent = cs.dailyLossLimitPercent;
        if (cs.totalLossLimitPercent !== undefined) prefsPayload.challenge_total_loss_limit_percent = cs.totalLossLimitPercent;
        if (cs.startingBalance !== undefined) prefsPayload.challenge_starting_balance = cs.startingBalance;
        if (cs.challengeStartDate !== undefined) prefsPayload.challenge_start_date = cs.challengeStartDate || null;
      }
      if (cst && typeof cst === 'object') {
        if (cst.phase1PassedAt !== undefined) prefsPayload.challenge_phase1_passed_at = cst.phase1PassedAt || null;
        if (cst.phase2PassedAt !== undefined) prefsPayload.challenge_phase2_passed_at = cst.phase2PassedAt || null;
        if (cst.highWaterMark !== undefined) prefsPayload.challenge_high_water_mark = cst.highWaterMark != null ? cst.highWaterMark : null;
        if (cst.dayStartBalance !== undefined) prefsPayload.challenge_day_start_balance = cst.dayStartBalance != null ? cst.dayStartBalance : null;
        if (cst.dayStartDate !== undefined) prefsPayload.challenge_day_start_date = cst.dayStartDate || null;
        if (cst.referenceBalance !== undefined) prefsPayload.challenge_reference_balance = cst.referenceBalance != null ? cst.referenceBalance : null;
      }

      const { error: prefsError } = await supabaseClient
        .from('user_preferences')
        .upsert(prefsPayload, {
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

