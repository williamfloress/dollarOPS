/**
 * Centralized storage utility with Supabase integration
 * Requires Supabase to be configured and user to be authenticated
 */

import { 
  isSupabaseConfigured, 
  getCurrentUser, 
  loadJournalDataFromSupabase, 
  saveJournalDataToSupabase 
} from './supabase.js';

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
 * Get current user ID for Supabase storage
 * @returns {Promise<{userId: string|null, error: Error|null}>}
 */
export const getStorageMode = async () => {
  if (!isSupabaseConfigured()) {
    return { userId: null, error: new Error('Supabase is not configured') };
  }

  try {
    const { user, error } = await getCurrentUser();
    if (error || !user) {
      return { userId: null, error: error || new Error('User not authenticated') };
    }
    return { userId: user.id, error: null };
  } catch (error) {
    return { userId: null, error };
  }
};


/**
 * Save all journal data to Supabase
 * @param {Object} data - Journal data object
 * @returns {Promise<{success: boolean, error: Error|null}>} Success status
 */
export const saveJournalData = async (data) => {
  try {
    const { userId, error: modeError } = await getStorageMode();

    if (modeError || !userId) {
      return { success: false, error: modeError || new Error('User not authenticated') };
    }

    const { success, error } = await saveJournalDataToSupabase(userId, data);
    return { success, error };
  } catch (error) {
    console.error('Error saving journal data:', error);
    return { success: false, error };
  }
};

/**
 * Load all journal data from Supabase
 * @returns {Promise<{data: Object|null, error: Error|null}>} Journal data object or error
 */
export const loadJournalData = async () => {
  try {
    const { userId, error: modeError } = await getStorageMode();

    if (modeError || !userId) {
      return { 
        data: null, 
        error: modeError || new Error('User not authenticated') 
      };
    }

    const { data, error } = await loadJournalDataFromSupabase(userId);
    
    if (error) {
      return { data: null, error };
    }

    // Return Supabase data (even if empty for new users)
    return { 
      data: data || {
        entries: [],
        availablePairs: [],
        motivationalImages: [],
        appTitle: 'ProTrader Journal',
        accountBalance: 0,
        currentTheme: 'slate_blue',
        initialized: false
      }, 
      error: null 
    };
  } catch (error) {
    console.error('Error loading journal data:', error);
    return { data: null, error };
  }
};

/**
 * Clear all journal data from Supabase
 * @returns {Promise<{success: boolean, error: Error|null}>}
 */
export const clearJournalData = async () => {
  try {
    const { userId, error: modeError } = await getStorageMode();

    if (modeError || !userId) {
      return { success: false, error: modeError || new Error('User not authenticated') };
    }

    // Clear all data by saving empty structure
    const emptyData = {
      entries: [],
      availablePairs: [],
      motivationalImages: [],
      appTitle: 'ProTrader Journal',
      accountBalance: 0,
      currentTheme: 'slate_blue',
      initialized: false
    };

    const { success, error } = await saveJournalDataToSupabase(userId, emptyData);
    return { success, error };
  } catch (error) {
    console.error('Error clearing journal data:', error);
    return { success: false, error };
  }
};

/**
 * Export all journal data as JSON string
 * @returns {Promise<string|null>} JSON string of journal data
 */
export const exportJournalData = async () => {
  try {
    const { data, error } = await loadJournalData();
    
    if (error || !data) {
      console.error('Error loading data for export:', error);
      return null;
    }
    
    // Add metadata
    const exportData = {
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      ...data
    };
    
    return JSON.stringify(exportData, null, 2);
  } catch (error) {
    console.error('Error exporting journal data:', error);
    return null;
  }
};

/**
 * Download journal data as JSON file
 * @returns {Promise<boolean>} Success status
 */
export const downloadJournalData = async () => {
  const jsonData = await exportJournalData();
  if (!jsonData) {
    console.error('No data to export');
    return false;
  }

  try {
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `journal-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return true;
  } catch (error) {
    console.error('Error downloading journal data:', error);
    return false;
  }
};

/**
 * Schema validation for imported data
 * @param {Object} data - Data to validate
 * @returns {{valid: boolean, errors: string[]}} Validation result
 */
const validateJournalSchema = (data) => {
  const errors = [];

  // Check if data is an object
  if (!data || typeof data !== 'object') {
    errors.push('Invalid data format: must be an object');
    return { valid: false, errors };
  }

  // Validate entries (array of objects with required fields)
  if (data.entries !== undefined) {
    if (!Array.isArray(data.entries)) {
      errors.push('Invalid entries: must be an array');
    } else {
      data.entries.forEach((entry, index) => {
        if (!entry || typeof entry !== 'object') {
          errors.push(`Invalid entry at index ${index}: must be an object`);
        } else {
          if (entry.id === undefined) {
            errors.push(`Entry at index ${index}: missing required field "id"`);
          }
          if (entry.date === undefined) {
            errors.push(`Entry at index ${index}: missing required field "date"`);
          }
        }
      });
    }
  }

  // Validate availablePairs (array)
  if (data.availablePairs !== undefined && !Array.isArray(data.availablePairs)) {
    errors.push('Invalid availablePairs: must be an array');
  }

  // Validate motivationalImages (array)
  if (data.motivationalImages !== undefined && !Array.isArray(data.motivationalImages)) {
    errors.push('Invalid motivationalImages: must be an array');
  }

  // Validate appTitle (string)
  if (data.appTitle !== undefined && typeof data.appTitle !== 'string') {
    errors.push('Invalid appTitle: must be a string');
  }

  // Validate accountBalance (number)
  if (data.accountBalance !== undefined && typeof data.accountBalance !== 'number') {
    errors.push('Invalid accountBalance: must be a number');
  }

  // Validate currentTheme (string)
  if (data.currentTheme !== undefined && typeof data.currentTheme !== 'string') {
    errors.push('Invalid currentTheme: must be a string');
  }

  // Validate initialized (boolean)
  if (data.initialized !== undefined && typeof data.initialized !== 'boolean') {
    errors.push('Invalid initialized: must be a boolean');
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Import journal data from JSON string with schema validation
 * @param {string} jsonString - JSON string to import
 * @param {boolean} merge - If true, merge with existing data; if false, replace
 * @returns {Promise<{success: boolean, data: Object|null, errors: string[]}>} Import result
 */
export const importJournalData = async (jsonString, merge = false) => {
  try {
    const parsedData = JSON.parse(jsonString);
    
    // Remove metadata fields if present
    const { version, exportDate, ...data } = parsedData;
    
    // Validate schema
    const validation = validateJournalSchema(data);
    if (!validation.valid) {
      return {
        success: false,
        data: null,
        errors: validation.errors
      };
    }

    // If merge mode, load existing data and merge
    if (merge) {
      const { data: existingData } = await loadJournalData();
      if (existingData) {
        // Merge arrays by combining unique items
        if (data.entries && existingData.entries) {
          const existingIds = new Set(existingData.entries.map(e => e.id));
          const newEntries = data.entries.filter(e => !existingIds.has(e.id));
          data.entries = [...existingData.entries, ...newEntries];
        }
        if (data.availablePairs && existingData.availablePairs) {
          data.availablePairs = [...new Set([...existingData.availablePairs, ...data.availablePairs])];
        }
        if (data.motivationalImages && existingData.motivationalImages) {
          data.motivationalImages = [...new Set([...existingData.motivationalImages, ...data.motivationalImages])];
        }
        // For other fields, prefer existing if both exist
        if (existingData.appTitle && !data.appTitle) data.appTitle = existingData.appTitle;
        if (existingData.accountBalance !== undefined && data.accountBalance === undefined) {
          data.accountBalance = existingData.accountBalance;
        }
        if (existingData.currentTheme && !data.currentTheme) data.currentTheme = existingData.currentTheme;
        if (existingData.initialized !== undefined && data.initialized === undefined) {
          data.initialized = existingData.initialized;
        }
      }
    }

    // Save imported data to Supabase
    const { success, error } = await saveJournalData(data);
    
    return {
      success,
      data: success ? data : null,
      errors: error ? [error.message] : []
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      errors: [`Parse error: ${error.message}`]
    };
  }
};

/**
 * Import journal data from file input
 * @param {File} file - File object from input
 * @param {boolean} merge - If true, merge with existing data; if false, replace
 * @returns {Promise<{success: boolean, data: Object|null, errors: string[]}>} Import result
 */
export const importJournalDataFromFile = async (file, merge = false) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const result = importJournalData(e.target.result, merge);
        resolve(result);
      } catch (error) {
        resolve({
          success: false,
          data: null,
          errors: [`File read error: ${error.message}`]
        });
      }
    };
    
    reader.onerror = () => {
      resolve({
        success: false,
        data: null,
        errors: ['Failed to read file']
      });
    };
    
    reader.readAsText(file);
  });
};

// Note: STORAGE_KEYS are no longer used but kept for reference
// All data is now stored in Supabase only

