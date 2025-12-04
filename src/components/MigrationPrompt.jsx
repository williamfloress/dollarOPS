import React, { useState, useEffect } from 'react';
import { migrateLocalStorageToSupabase } from '../utils/supabase.js';
import { loadJournalData } from '../utils/storage.js';
import { AlertTriangle, CheckCircle, X, Loader } from 'lucide-react';

/**
 * MigrationPrompt Component
 * Prompts user to migrate localStorage data to Supabase when they first sign in
 * 
 * @param {Object} props
 * @param {Object|null} props.user - Current authenticated user
 * @param {Function} props.onMigrationComplete - Callback when migration completes
 * @param {Function} props.onDismiss - Callback to dismiss the prompt
 */
export const MigrationPrompt = ({ user, onMigrationComplete, onDismiss }) => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationStatus, setMigrationStatus] = useState(null); // 'success' | 'error' | null
  const [errorMessage, setErrorMessage] = useState('');
  const [hasLocalData, setHasLocalData] = useState(false);
  const [hasBeenDismissed, setHasBeenDismissed] = useState(false);

  // Check for localStorage data when user signs in
  useEffect(() => {
    const checkForLocalData = async () => {
      if (!user) {
        setShowPrompt(false);
        setIsChecking(false);
        return;
      }

      // Check if user has already dismissed migration for this session
      const dismissedKey = `migration_dismissed_${user.id}`;
      if (sessionStorage.getItem(dismissedKey)) {
        setHasBeenDismissed(true);
        setIsChecking(false);
        return;
      }

      // Check if user has already migrated (check localStorage flag)
      const migratedKey = `migration_completed_${user.id}`;
      if (localStorage.getItem(migratedKey)) {
        setIsChecking(false);
        return;
      }

      try {
        // Load data from localStorage (synchronous version for checking)
        const localData = await loadJournalData();
        
        // Check if there's meaningful data to migrate
        const hasData = localData && (
          (localData.entries && localData.entries.length > 0) ||
          (localData.availablePairs && localData.availablePairs.length > 0) ||
          (localData.motivationalImages && localData.motivationalImages.length > 0) ||
          localData.appTitle !== 'ProTrader Journal' ||
          localData.accountBalance !== 0
        );

        setHasLocalData(hasData);
        setShowPrompt(hasData);
      } catch (error) {
        console.error('Error checking for local data:', error);
        setHasLocalData(false);
        setShowPrompt(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkForLocalData();
  }, [user]);

  const handleMigrate = async () => {
    if (!user) return;

    setIsMigrating(true);
    setMigrationStatus(null);
    setErrorMessage('');

    try {
      const { success, error } = await migrateLocalStorageToSupabase(user.id);
      
      if (success) {
        setMigrationStatus('success');
        // Mark migration as completed
        const migratedKey = `migration_completed_${user.id}`;
        localStorage.setItem(migratedKey, 'true');
        
        // Call completion callback after a short delay
        setTimeout(() => {
          if (onMigrationComplete) {
            onMigrationComplete();
          }
          setShowPrompt(false);
        }, 2000);
      } else {
        setMigrationStatus('error');
        setErrorMessage(error?.message || 'Unknown error occurred during migration');
      }
    } catch (error) {
      setMigrationStatus('error');
      setErrorMessage(error.message || 'Failed to migrate data');
    } finally {
      setIsMigrating(false);
    }
  };

  const handleDismiss = () => {
    if (user) {
      // Mark as dismissed for this session
      const dismissedKey = `migration_dismissed_${user.id}`;
      sessionStorage.setItem(dismissedKey, 'true');
    }
    setHasBeenDismissed(true);
    setShowPrompt(false);
    if (onDismiss) {
      onDismiss();
    }
  };

  // Don't show if no user, already dismissed, or no local data
  if (!user || hasBeenDismissed || !showPrompt || isChecking) {
    return null;
  }

  // If migration was successful, show success message briefly
  if (migrationStatus === 'success') {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-slate-800 rounded-lg p-6 max-w-md w-full border border-green-500/50">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle className="w-6 h-6 text-green-500" />
            <h3 className="text-xl font-bold text-slate-200">Migration Successful!</h3>
          </div>
          <p className="text-slate-300 mb-4">
            Your local data has been successfully migrated to your cloud account.
          </p>
          <div className="flex justify-end">
            <button
              onClick={() => setShowPrompt(false)}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main migration prompt
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg p-6 max-w-md w-full border border-slate-700">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-yellow-500" />
            <h3 className="text-xl font-bold text-slate-200">Migrate Local Data?</h3>
          </div>
          <button
            onClick={handleDismiss}
            className="text-slate-400 hover:text-slate-200 transition-colors"
            disabled={isMigrating}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-slate-300 mb-4">
          We found local data in your browser. Would you like to migrate it to your cloud account? 
          This will make your data accessible across all your devices.
        </p>

        {migrationStatus === 'error' && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-500/50 rounded text-red-200 text-sm">
            <p className="font-semibold mb-1">Migration Failed</p>
            <p>{errorMessage}</p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleDismiss}
            disabled={isMigrating}
            className="flex-1 px-4 py-2 bg-slate-700 text-slate-200 rounded hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Not Now
          </button>
          <button
            onClick={handleMigrate}
            disabled={isMigrating}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isMigrating ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Migrating...
              </>
            ) : (
              'Migrate Data'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

