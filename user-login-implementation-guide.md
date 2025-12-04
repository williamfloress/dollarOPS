# User Login Implementation Guide

This guide provides step-by-step checkpoints for implementing user authentication and making the journal work with user accounts. Check off each item as you complete it.

> **Reference:** See `supabase-integration-guide.md` for Supabase setup and `database-schema-with-users.md` for the database schema.

---

## Prerequisites Checklist

Before starting, verify you have completed these prerequisites:

- [ ] Supabase project created and configured
- [ ] Environment variables set up (`.env` file with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`)
- [ ] Database tables created (see `supabase-integration-guide.md` Step 4)
- [ ] RLS policies configured (see `supabase-integration-guide-guide.md` Step 5)
- [ ] `src/utils/supabase.js` file exists with auth functions
- [ ] `src/components/Auth.jsx` component exists
- [ ] `src/utils/storage.js` updated with Supabase integration

---

## Checkpoint 1: Verify Supabase Configuration

Before starting, verify that your Supabase setup is correct.

- [ ] **1.1** Check that `.env` file exists in project root
- [ ] **1.2** Verify `.env` contains `VITE_SUPABASE_URL` with your project URL
- [ ] **1.3** Verify `.env` contains `VITE_SUPABASE_ANON_KEY` with your anon key
- [ ] **1.4** Restart dev server (required after adding/changing `.env`)
- [ ] **1.5** Add temporary test in `App.jsx` to verify configuration:

```javascript
import { isSupabaseConfigured } from './utils/supabase.js';

// Add this temporarily in your component
console.log('Supabase configured:', isSupabaseConfigured());
```

- [ ] **1.6** Check browser console - should see `Supabase configured: true`
- [ ] **1.7** Remove the test console.log after verification

**✅ Checkpoint 1 Complete:** Supabase is configured and ready to use.

---

## Checkpoint 2: Add Authentication State Management

**Goal:** Add user state and authentication checking to your app.

- [ ] **2.1** Open `src/App.jsx`
- [ ] **2.2** Add imports at the top:

```javascript
import { Auth } from './components/Auth';
import { isSupabaseConfigured, getCurrentUser } from './utils/supabase.js';
```

- [ ] **2.3** Add user state variables in your main component:

```javascript
const [user, setUser] = useState(null);
const [isCheckingAuth, setIsCheckingAuth] = useState(true);
```

- [ ] **2.4** Add `useEffect` to check auth on mount (add after your existing state declarations):

```javascript
// Check authentication status on mount
useEffect(() => {
  const checkAuth = async () => {
    if (!isSupabaseConfigured()) {
      setIsCheckingAuth(false);
      return;
    }
    
    try {
      const { user: currentUser } = await getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Error checking auth:', error);
    } finally {
      setIsCheckingAuth(false);
    }
  };
  
  checkAuth();
}, []);
```

- [ ] **2.5** Add auth change handler function:

```javascript
const handleAuthChange = (newUser) => {
  setUser(newUser);
  if (newUser) {
    console.log('User signed in:', newUser.email);
  } else {
    console.log('User signed out');
  }
};
```

**✅ Checkpoint 2 Complete:** App now tracks authentication state.

---

## Checkpoint 3: Implement Authentication UI Flow

**Goal:** Show login screen when not authenticated, journal when authenticated.

- [ ] **3.1** Find the main `return` statement in your component
- [ ] **3.2** Add loading state check at the very top of return (before any other UI):

```javascript
// At the top of your return statement
if (isCheckingAuth) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="text-slate-200">Loading...</div>
    </div>
  );
}
```

- [ ] **3.3** Add authentication check (right after loading check):

```javascript
// If Supabase is configured, show auth if not logged in
if (isSupabaseConfigured() && !user) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
      <Auth onAuthChange={handleAuthChange} />
    </div>
  );
}
```

- [ ] **3.4** Verify the rest of your journal UI renders after these checks
- [ ] **3.5** Test: App should show Auth component when Supabase is configured and user is not logged in
- [ ] **3.6** Test: App should show journal when user is logged in or Supabase is not configured

**✅ Checkpoint 3 Complete:** Authentication UI flow is working.

---

## Checkpoint 4: Update Data Loading for User Context

**Goal:** Load data from Supabase when user is authenticated, localStorage otherwise.

- [ ] **4.1** Find where you currently load journal data (likely in a `useEffect` or on mount)
- [ ] **4.2** Replace synchronous `loadJournalData()` calls with async version
- [ ] **4.3** Add or update data loading `useEffect`:

```javascript
// Replace synchronous localStorage loading with async
useEffect(() => {
  const loadData = async () => {
    try {
      const data = await loadJournalData();
      
      if (data) {
        if (data.entries) setEntries(data.entries);
        if (data.availablePairs) setAvailablePairs(data.availablePairs);
        if (data.motivationalImages) setMotivationalImages(data.motivationalImages);
        if (data.appTitle) setAppTitle(data.appTitle);
        if (data.accountBalance !== undefined) setAccountBalance(data.accountBalance);
        if (data.currentTheme) setCurrentTheme(data.currentTheme);
      }
    } catch (error) {
      console.error('Error loading journal data:', error);
    }
  };

  // Only load if user is authenticated OR Supabase is not configured
  if (!isSupabaseConfigured() || user) {
    loadData();
  }
}, [user]); // Reload when user changes
```

- [ ] **4.4** Verify `loadJournalData` is imported from `'./utils/storage'` (should already be imported)
- [ ] **4.5** Test: Sign in and verify data loads from Supabase
- [ ] **4.6** Test: Sign out and verify app still works (falls back to localStorage)

**✅ Checkpoint 4 Complete:** Data loading works with user authentication.

---

## Checkpoint 5: Create Data Migration Component

**Goal:** Create component to migrate localStorage data to Supabase on first login.

- [ ] **5.1** Create new file `src/components/MigrationPrompt.jsx`
- [ ] **5.2** Add imports:

```javascript
import { useState, useEffect } from 'react';
import { migrateLocalStorageToSupabase } from '../utils/supabase.js';
import { loadJournalData } from '../utils/storage.js';
```

- [ ] **5.3** Create the component with this code:

```javascript
export const MigrationPrompt = ({ user, onMigrationComplete, onDismiss }) => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationStatus, setMigrationStatus] = useState(null);

  useEffect(() => {
    if (!user) {
      setShowPrompt(false);
      return;
    }

    const checkForLocalData = async () => {
      // Check if migration was already done
      const migrationKey = `migration_complete_${user.id}`;
      if (localStorage.getItem(migrationKey)) {
        return;
      }

      // Check if there's local data to migrate
      const localData = await loadJournalData();
      const hasLocalData = localData && (
        (localData.entries && localData.entries.length > 0) ||
        (localData.availablePairs && localData.availablePairs.length > 0) ||
        (localData.motivationalImages && localData.motivationalImages.length > 0)
      );

      if (hasLocalData) {
        setShowPrompt(true);
      }
    };

    checkForLocalData();
  }, [user]);

  const handleMigrate = async () => {
    setIsMigrating(true);
    setMigrationStatus('Migrating...');

    try {
      const { success, error } = await migrateLocalStorageToSupabase(user.id);
      
      if (success) {
        setMigrationStatus('Migration completed successfully!');
        const migrationKey = `migration_complete_${user.id}`;
        localStorage.setItem(migrationKey, 'true');
        
        setTimeout(() => {
          setShowPrompt(false);
          if (onMigrationComplete) onMigrationComplete();
        }, 2000);
      } else {
        setMigrationStatus(`Migration failed: ${error?.message || 'Unknown error'}`);
      }
    } catch (error) {
      setMigrationStatus(`Migration error: ${error.message}`);
    } finally {
      setIsMigrating(false);
    }
  };

  const handleDismiss = () => {
    const migrationKey = `migration_complete_${user.id}`;
    localStorage.setItem(migrationKey, 'skipped');
    setShowPrompt(false);
    if (onDismiss) onDismiss();
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-bold text-slate-200 mb-4">
          Migrate Your Data?
        </h2>
        <p className="text-slate-300 mb-6">
          We found local data on this device. Would you like to migrate it to your cloud account?
        </p>
        
        {migrationStatus && (
          <div className={`mb-4 p-3 rounded ${
            migrationStatus.includes('failed') || migrationStatus.includes('error')
              ? 'bg-red-900/50 text-red-200'
              : 'bg-green-900/50 text-green-200'
          }`}>
            {migrationStatus}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleMigrate}
            disabled={isMigrating}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isMigrating ? 'Migrating...' : 'Yes, Migrate'}
          </button>
          <button
            onClick={handleDismiss}
            disabled={isMigrating}
            className="flex-1 px-4 py-2 bg-slate-700 text-slate-200 rounded hover:bg-slate-600 disabled:opacity-50"
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  );
};
```

- [ ] **5.4** Import MigrationPrompt in `App.jsx`:

```javascript
import { MigrationPrompt } from './components/MigrationPrompt';
```

- [ ] **5.5** Add MigrationPrompt component to your render (after Auth check, before main journal UI):

```javascript
<MigrationPrompt 
  user={user}
  onMigrationComplete={() => {
    // Reload data after migration
    window.location.reload();
  }}
  onDismiss={() => {}}
/>
```

- [ ] **5.6** Test: Create some local data, sign up, verify migration prompt appears

**✅ Checkpoint 5 Complete:** Data migration component is ready.

---

## Checkpoint 6: Create Save Helper Function

**Goal:** Create a reusable function to save all journal data.

- [ ] **6.1** In `App.jsx`, add a helper function to save all journal data:

```javascript
const saveAllJournalData = async () => {
  try {
    await saveJournalData({
      entries,
      availablePairs,
      motivationalImages,
      appTitle,
      accountBalance,
      currentTheme,
      initialized: true
    });
  } catch (error) {
    console.error('Error saving journal data:', error);
  }
};
```

- [ ] **6.2** Verify `saveJournalData` is imported from `'./utils/storage'` (should already be imported)

**✅ Checkpoint 6 Complete:** Save helper function is ready to use.

---

## Checkpoint 7: Update Entry Operations to Save

**Goal:** Ensure all entry operations (add, delete, update) save to Supabase.

- [ ] **7.1** Find `handleAddEntry` or similar function that adds entries
- [ ] **7.2** Update it to be async and call `saveAllJournalData()`:

```javascript
// Example: When adding a new entry
const handleAddEntry = async (newEntry) => {
  const updatedEntries = [...entries, newEntry];
  setEntries(updatedEntries);
  await saveAllJournalData();
};
```

- [ ] **7.3** Find function that deletes entries
- [ ] **7.4** Update it to be async and call `saveAllJournalData()`:

```javascript
// Example: When deleting an entry
const handleDeleteEntry = async (id) => {
  const updatedEntries = entries.filter(e => e.id !== id);
  setEntries(updatedEntries);
  await saveAllJournalData();
};
```

- [ ] **7.5** Find function that updates entries (if exists)
- [ ] **7.6** Update it to be async and call `saveAllJournalData()`:

```javascript
// Example: When updating an entry
const handleUpdateEntry = async (updatedEntry) => {
  const updatedEntries = entries.map(e => 
    e.id === updatedEntry.id ? updatedEntry : e
  );
  setEntries(updatedEntries);
  await saveAllJournalData();
};
```

- [ ] **7.7** Test: Add an entry, verify it saves to Supabase
- [ ] **7.8** Test: Delete an entry, verify it saves to Supabase

**✅ Checkpoint 7 Complete:** Entry operations save to Supabase.

---

## Checkpoint 8: Update Settings Operations to Save

**Goal:** Ensure all settings changes (pairs, images, title, balance, theme) save to Supabase.

- [ ] **8.1** Find function that adds/removes trading pairs
- [ ] **8.2** Update it to call `saveAllJournalData()` after `setAvailablePairs`
- [ ] **8.3** Find function that adds/deletes motivational images
- [ ] **8.4** Update it to call `saveAllJournalData()` after `setMotivationalImages`
- [ ] **8.5** Find function that updates app title
- [ ] **8.6** Update it to call `saveAllJournalData()` after `setAppTitle`
- [ ] **8.7** Find function that updates account balance
- [ ] **8.8** Update it to call `saveAllJournalData()` after `setAccountBalance`
- [ ] **8.9** Find function that changes theme
- [ ] **8.10** Update it to call `saveAllJournalData()` after `setCurrentTheme`
- [ ] **8.11** Test: Change each setting and verify it saves to Supabase

**✅ Checkpoint 8 Complete:** All settings operations save to Supabase.

---

## Checkpoint 9: Improve Loading States

**Goal:** Add better loading indicators during authentication and data operations.

- [ ] **9.1** Update loading state UI to match your app theme:

```javascript
if (isCheckingAuth) {
  return (
    <div className={`min-h-screen flex items-center justify-center ${THEMES[currentTheme].colors.bgMain}`}>
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <div className={THEMES[currentTheme].colors.textMain}>Loading...</div>
      </div>
    </div>
  );
}
```

- [ ] **9.2** (Optional) Add loading state for save operations:

```javascript
const [isSaving, setIsSaving] = useState(false);

const saveAllJournalData = async () => {
  setIsSaving(true);
  try {
    await saveJournalData({...});
  } finally {
    setIsSaving(false);
  }
};
```

- [ ] **9.3** (Optional) Show saving indicator in UI when `isSaving` is true

**✅ Checkpoint 9 Complete:** Loading states are improved.

---

## Checkpoint 10: Style Auth Component to Match Theme

**Goal:** Make Auth component match your app's theme system.

- [ ] **10.1** Open `src/components/Auth.jsx`
- [ ] **10.2** Update component signature to accept theme prop:

```javascript
export const Auth = ({ onAuthChange, theme }) => {
```

- [ ] **10.3** Add theme fallback at the start of component:

```javascript
const currentTheme = theme || {
  colors: {
    bgMain: 'bg-slate-950',
    bgCard: 'bg-slate-800',
    bgInput: 'bg-slate-900',
    textMain: 'text-slate-200',
    textSec: 'text-slate-400',
    border: 'border-slate-700',
    accentBg: 'bg-blue-600',
    accentHover: 'hover:bg-blue-700',
  }
};
```

- [ ] **10.4** Update all hardcoded className values to use `currentTheme.colors`
- [ ] **10.5** In `App.jsx`, pass theme to Auth component:

```javascript
<Auth onAuthChange={handleAuthChange} theme={THEMES[currentTheme]} />
```

- [ ] **10.6** Test: Auth component should match your app's theme

**✅ Checkpoint 10 Complete:** Auth component matches app theme.

---

## Checkpoint 11: Add Sign Out Functionality

**Goal:** Allow users to sign out from the journal.

- [ ] **11.1** Import `signOut` in `App.jsx`:

```javascript
import { signOut } from './utils/supabase.js';
```

- [ ] **11.2** Create sign out handler:

```javascript
const handleSignOut = async () => {
  const { error } = await signOut();
  if (!error) {
    setUser(null);
  }
};
```

- [ ] **11.3** Add sign out button in your settings menu or header:

```javascript
<button onClick={handleSignOut} className="...">
  Sign Out
</button>
```

- [ ] **11.4** Test: Click sign out, verify user is logged out and redirected to auth screen

**✅ Checkpoint 11 Complete:** Sign out functionality is working.

---

## Checkpoint 12: Final Testing

**Goal:** Verify all authentication features work correctly.

### Test 1: Without Supabase Configured
- [ ] App loads normally
- [ ] No auth UI shown
- [ ] localStorage works as before

### Test 2: With Supabase, Not Signed In
- [ ] Auth UI is displayed
- [ ] Can switch between Sign In and Sign Up
- [ ] Form validation works
- [ ] Error messages display correctly

### Test 3: Sign Up Flow
- [ ] Can create new account
- [ ] User profile created in database (check Supabase dashboard)
- [ ] User preferences created (check Supabase dashboard)
- [ ] Redirected to journal after signup
- [ ] Migration prompt appears if local data exists

### Test 4: Sign In Flow
- [ ] Can sign in with existing account
- [ ] Last login timestamp updated (check Supabase dashboard)
- [ ] Redirected to journal
- [ ] Data loads from Supabase

### Test 5: Data Persistence
- [ ] Data saves to Supabase when authenticated
- [ ] Data loads from Supabase on login
- [ ] Falls back to localStorage if Supabase unavailable
- [ ] Data persists across browser sessions (close and reopen browser)

### Test 6: Sign Out
- [ ] Can sign out
- [ ] Redirected to auth screen
- [ ] Can sign back in and data is still there

### Test 7: Migration
- [ ] Create some entries in localStorage (without auth)
- [ ] Sign up/sign in
- [ ] Verify migration prompt appears
- [ ] Complete migration
- [ ] Verify data appears in journal
- [ ] Verify data persists after refresh

**✅ Checkpoint 12 Complete:** All tests pass, authentication is fully functional!

---

## Troubleshooting

### Issue: Auth component not showing

**Check:**
- [ ] `isSupabaseConfigured()` returns `true`
- [ ] Environment variables are set correctly
- [ ] Dev server was restarted after adding `.env`
- [ ] No errors in browser console

### Issue: "User not authenticated" errors

**Check:**
- [ ] User is signed in before making Supabase queries
- [ ] RLS policies are correctly configured
- [ ] `auth.uid()` matches `user_id` in queries

### Issue: Data not saving to Supabase

**Check:**
- [ ] User is authenticated
- [ ] `saveJournalData` is being called with `await`
- [ ] No errors in browser console
- [ ] Network tab shows successful requests
- [ ] RLS policies allow INSERT/UPDATE operations

### Issue: Migration not working

**Check:**
- [ ] localStorage has data to migrate
- [ ] User is authenticated before migration
- [ ] Supabase logs show no errors
- [ ] RLS policies allow INSERT operations

### Issue: Data not loading on login

**Check:**
- [ ] `loadJournalData` is called after user signs in
- [ ] `useEffect` dependency includes `user`
- [ ] Data exists in Supabase (check Table Editor)
- [ ] No errors in browser console

### Issue: App crashes on load

**Check:**
- [ ] All async functions use `await`
- [ ] `loadJournalData` calls are awaited
- [ ] Error handling is in place
- [ ] No null/undefined errors

---

## Next Steps

After completing all checkpoints:

- [ ] **Add password reset functionality** - Allow users to reset forgotten passwords
- [ ] **Add email verification** - Verify user emails on signup
- [ ] **Add social auth** - Google, GitHub, etc. (Supabase supports this)
- [ ] **Add user profile management** - Edit username, email, etc.
- [ ] **Add session persistence** - Remember user across browser restarts
- [ ] **Add multi-device sync** - Real-time updates across devices
- [ ] **Add offline support** - Queue changes when offline, sync when online

---

## Security Notes

- Never expose service role key in client code
- Always use RLS policies to protect user data
- Validate all user inputs before saving
- Use HTTPS in production
- Regularly update dependencies
- Monitor Supabase dashboard for suspicious activity

---

**Last Updated:** 2024-01-20
