/**
 * Centralized localStorage utility for journal data persistence
 * Handles all data storage, retrieval, export, and import operations
 */

// Storage keys
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
 * Save all journal data to localStorage
 * @param {Object} data - Journal data object
 * @returns {boolean} Success status
 */
export const saveJournalData = (data) => {
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
    console.error('Error saving journal data to localStorage:', error);
    return false;
  }
};

/**
 * Load all journal data from localStorage
 * @returns {Object|null} Journal data object or null if not found
 */
export const loadJournalData = () => {
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

    // Return null if no data found
    if (Object.keys(data).length === 0) {
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error loading journal data from localStorage:', error);
    return null;
  }
};

/**
 * Clear all journal data from localStorage
 */
export const clearJournalData = () => {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    return true;
  } catch (error) {
    console.error('Error clearing journal data from localStorage:', error);
    return false;
  }
};

/**
 * Export all journal data as JSON string
 * @returns {string} JSON string of journal data
 */
export const exportJournalData = () => {
  try {
    const data = loadJournalData();
    if (!data) {
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
 */
export const downloadJournalData = () => {
  const jsonData = exportJournalData();
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
 * @returns {{success: boolean, data: Object|null, errors: string[]}} Import result
 */
export const importJournalData = (jsonString, merge = false) => {
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
      const existingData = loadJournalData() || {};
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

    // Save imported data
    const saveSuccess = saveJournalData(data);
    
    return {
      success: saveSuccess,
      data: saveSuccess ? data : null,
      errors: []
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

// Export storage keys for direct access if needed
export { STORAGE_KEYS };

