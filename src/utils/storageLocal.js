/**
 * LocalStorage-based storage for Demo mode.
 * Mirrors the Supabase storage API shape used in storage.js
 * so the app works identically without any backend connection.
 */

const DEMO_KEYS = {
  DATA: 'demo_journal_data_v1',
};

const DEFAULT_DATA = {
  entries: [],
  availablePairs: [],
  motivationalImages: [],
  appTitle: 'ProTrader Journal',
  accountBalance: 0,
  currentTheme: 'slate_blue',
  initialized: false,
  challengeSettings: {
    enabled: false,
    phase1TargetPercent: 8,
    phase2TargetPercent: 12,
    dailyLossLimitPercent: 5,
    totalLossLimitPercent: 5,
    startingBalance: null,
    challengeStartDate: null,
  },
  challengeState: {
    phase1PassedAt: null,
    phase2PassedAt: null,
    highWaterMark: null,
    dayStartBalance: null,
    dayStartDate: null,
    referenceBalance: null,
  },
};

/**
 * Save all journal data to localStorage (demo mode)
 * @param {Object} data
 * @returns {{ success: boolean, error: Error|null }}
 */
export const saveJournalDataToLocal = (data) => {
  try {
    const toSave = { ...DEFAULT_DATA, ...data };
    localStorage.setItem(DEMO_KEYS.DATA, JSON.stringify(toSave));
    return { success: true, error: null };
  } catch (err) {
    console.error('[Demo] Error saving to localStorage:', err);
    return { success: false, error: err };
  }
};

/**
 * Load all journal data from localStorage (demo mode)
 * @returns {{ data: Object|null, error: Error|null }}
 */
export const loadJournalDataFromLocal = () => {
  try {
    const raw = localStorage.getItem(DEMO_KEYS.DATA);
    if (!raw) {
      return { data: { ...DEFAULT_DATA }, error: null };
    }
    const parsed = JSON.parse(raw);
    // Merge with defaults to handle schema upgrades
    const merged = {
      ...DEFAULT_DATA,
      ...parsed,
      challengeSettings: { ...DEFAULT_DATA.challengeSettings, ...(parsed.challengeSettings || {}) },
      challengeState: { ...DEFAULT_DATA.challengeState, ...(parsed.challengeState || {}) },
    };
    return { data: merged, error: null };
  } catch (err) {
    console.error('[Demo] Error loading from localStorage:', err);
    return { data: { ...DEFAULT_DATA }, error: err };
  }
};

/**
 * Clear all demo journal data from localStorage
 * @returns {{ success: boolean, error: Error|null }}
 */
export const clearJournalDataFromLocal = () => {
  try {
    localStorage.removeItem(DEMO_KEYS.DATA);
    return { success: true, error: null };
  } catch (err) {
    console.error('[Demo] Error clearing localStorage:', err);
    return { success: false, error: err };
  }
};
