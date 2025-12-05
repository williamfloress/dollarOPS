# Advanced Authentication Features Implementation Guide

This guide provides step-by-step checkpoints for implementing advanced authentication features beyond basic login. Check off each item as you complete it.

> **Reference:** See `user-login-implementation-guide.md` for basic authentication setup and `supabase-integration-guide.md` for Supabase configuration.

---

## Prerequisites Checklist

Before starting, verify you have completed these prerequisites:

- [x] Basic authentication is working (see `user-login-implementation-guide.md`)
- [x] Supabase project configured with email provider enabled
- [x] Environment variables set up (`.env` file with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`)
- [x] Database tables created (user_profiles, user_preferences)
- [x] RLS policies configured for user data
- [x] `src/utils/supabase.js` file exists with auth functions
- [x] `src/components/Auth.jsx` component exists

---

## Feature 1: Password Reset Functionality

**Goal:** Allow users to reset forgotten passwords via email.

### Checkpoint 1.1: Add Password Reset Function to Supabase Utils

- [x] **1.1.1** Open `src/utils/supabase.js`
- [x] **1.1.2** Add password reset request function:

```javascript
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
```

- [x] **1.1.3** Add password update function:

```javascript
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
```

**✅ Checkpoint 1.1 Complete:** Password reset functions are ready.

---

### Checkpoint 1.2: Add Password Reset UI to Auth Component

- [x] **1.2.1** Open `src/components/Auth.jsx`
- [x] **1.2.2** Import password reset functions:

```javascript
import { requestPasswordReset, updatePassword } from '../utils/supabase.js';
```

- [x] **1.2.3** Add state variables for password reset flow:

```javascript
const [showPasswordReset, setShowPasswordReset] = useState(false);
const [resetEmail, setResetEmail] = useState('');
const [resetSent, setResetSent] = useState(false);
const [showPasswordUpdate, setShowPasswordUpdate] = useState(false);
const [newPassword, setNewPassword] = useState('');
const [confirmPassword, setConfirmPassword] = useState('');
```

- [x] **1.2.4** Add useEffect to check for password reset token in URL:

```javascript
useEffect(() => {
  const supabase = getSupabaseClient();
  if (supabase) {
    // Check for password reset token in URL hash
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const type = hashParams.get('type');
    
    if (type === 'recovery') {
      // User clicked password reset link
      setShowPasswordUpdate(true);
      // Clear URL hash
      window.history.replaceState(null, '', window.location.pathname);
    }
  }
}, []);
```

- [x] **1.2.5** Add password reset request handler:

```javascript
const handlePasswordResetRequest = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError(null);

  try {
    const { success, error } = await requestPasswordReset(resetEmail);
    
    if (error) {
      setError(error.message);
    } else if (success) {
      setResetSent(true);
      setError(null);
    }
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
```

- [x] **1.2.6** Add password update handler:

```javascript
const handlePasswordUpdate = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError(null);

  if (newPassword !== confirmPassword) {
    setError('Passwords do not match');
    setLoading(false);
    return;
  }

  if (newPassword.length < 6) {
    setError('Password must be at least 6 characters');
    setLoading(false);
    return;
  }

  try {
    const { success, error } = await updatePassword(newPassword);
    
    if (error) {
      setError(error.message);
    } else if (success) {
      setError(null);
      setShowPasswordUpdate(false);
      setNewPassword('');
      setConfirmPassword('');
      // Show success message and redirect to sign in
      alert('Password updated successfully! Please sign in with your new password.');
      setIsSignUp(false);
    }
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
```

- [x] **1.2.7** Add "Forgot Password?" link in sign in form (before the submit button):

```javascript
{!isSignUp && !showPasswordReset && (
  <button
    type="button"
    onClick={() => setShowPasswordReset(true)}
    className={`text-sm ${themeColors.accentText} hover:underline`}
  >
    Forgot Password?
  </button>
)}
```

- [x] **1.2.8** Add password reset request form (after the main form, before closing div):

```javascript
{showPasswordReset && !resetSent && (
  <div className="mt-4 p-4 border-t border-slate-700">
    <h3 className={`text-lg font-semibold ${themeColors.textMain} mb-2`}>
      Reset Password
    </h3>
    <form onSubmit={handlePasswordResetRequest} className="space-y-4">
      <div>
        <label className={`block ${themeColors.textSec} mb-1`}>Email</label>
        <input
          type="email"
          value={resetEmail}
          onChange={(e) => setResetEmail(e.target.value)}
          className={`w-full px-3 py-2 ${themeColors.bgInput} ${themeColors.textMain} rounded border ${themeColors.border}`}
          required
        />
      </div>
      {error && (
        <div className="p-2 bg-red-900/50 text-red-200 rounded text-sm">
          {error}
        </div>
      )}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className={`flex-1 px-4 py-2 ${themeColors.accentBg} text-white rounded ${themeColors.accentHover} disabled:opacity-50`}
        >
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>
        <button
          type="button"
          onClick={() => {
            setShowPasswordReset(false);
            setResetEmail('');
            setError(null);
          }}
          className={`px-4 py-2 ${themeColors.bgInput} ${themeColors.textMain} rounded border ${themeColors.border}`}
        >
          Cancel
        </button>
      </div>
    </form>
  </div>
)}

{resetSent && (
  <div className={`mt-4 p-4 ${themeColors.accentBg}/50 border ${themeColors.accentBorder} rounded`}>
    <p className={`${themeColors.textMain} mb-2`}>
      Password reset email sent!
    </p>
    <p className={`text-sm ${themeColors.textSec}`}>
      Check your email for a password reset link. Click the link to reset your password.
    </p>
    <button
      onClick={() => {
        setResetSent(false);
        setShowPasswordReset(false);
        setResetEmail('');
      }}
      className={`mt-3 text-sm ${themeColors.accentText} hover:underline`}
    >
      Back to Sign In
    </button>
  </div>
)}
```

- [x] **1.2.9** Add password update form (show when password reset token is detected):

```javascript
{showPasswordUpdate && (
  <div className={`p-4 ${themeColors.bgCard} rounded-lg max-w-md mx-auto`}>
    <h2 className={`text-xl font-bold ${themeColors.textMain} mb-4`}>
      Set New Password
    </h2>
    <form onSubmit={handlePasswordUpdate} className="space-y-4">
      <div>
        <label className={`block ${themeColors.textSec} mb-1`}>New Password</label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className={`w-full px-3 py-2 ${themeColors.bgInput} ${themeColors.textMain} rounded border ${themeColors.border}`}
          required
          minLength={6}
        />
      </div>
      <div>
        <label className={`block ${themeColors.textSec} mb-1`}>Confirm Password</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className={`w-full px-3 py-2 ${themeColors.bgInput} ${themeColors.textMain} rounded border ${themeColors.border}`}
          required
          minLength={6}
        />
      </div>
      {error && (
        <div className="p-2 bg-red-900/50 text-red-200 rounded text-sm">
          {error}
        </div>
      )}
      <button
        type="submit"
        disabled={loading}
        className={`w-full px-4 py-2 ${themeColors.accentBg} text-white rounded ${themeColors.accentHover} disabled:opacity-50`}
      >
        {loading ? 'Updating...' : 'Update Password'}
      </button>
    </form>
  </div>
)}
```

- [ ] **1.2.10** Test: Request password reset, check email, click link, update password

**✅ Checkpoint 1.2 Complete:** Password reset UI is working.

---

### Checkpoint 1.3: Configure Supabase Email Templates

- [ ] **1.3.1** Go to Supabase Dashboard → Authentication → Email Templates
- [ ] **1.3.2** Customize "Reset Password" email template (optional)
- [ ] **1.3.3** Verify redirect URL is set correctly in Supabase project settings
- [ ] **1.3.4** Test: Send password reset email and verify it arrives

**✅ Checkpoint 1.3 Complete:** Email templates are configured.

---

## Feature 2: Email Verification

**Goal:** Verify user emails on signup and allow resending verification emails.

> **Note:** Basic email verification is already implemented. This checkpoint adds resend functionality.

### Checkpoint 2.1: Add Resend Verification Email Function

- [ ] **2.1.1** Open `src/utils/supabase.js`
- [ ] **2.1.2** Add resend verification email function:

```javascript
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
```

**✅ Checkpoint 2.1 Complete:** Resend verification function is ready.

---

### Checkpoint 2.2: Add Resend Button to Auth Component

- [ ] **2.2.1** Open `src/components/Auth.jsx`
- [ ] **2.2.2** Import resend function:

```javascript
import { resendVerificationEmail } from '../utils/supabase.js';
```

- [ ] **2.2.3** Add state for resend functionality:

```javascript
const [resendCooldown, setResendCooldown] = useState(0);
```

- [ ] **2.2.4** Add resend handler:

```javascript
const handleResendVerification = async () => {
  setLoading(true);
  setError(null);

  try {
    const { success, error } = await resendVerificationEmail(pendingEmail);
    
    if (error) {
      setError(error.message);
    } else if (success) {
      setError(null);
      // Set cooldown timer (60 seconds)
      setResendCooldown(60);
      const timer = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
```

- [ ] **2.2.5** Update verification pending UI to include resend button:

```javascript
// In the verificationPending section, add after the "Back to Sign In" button:
<div className="mt-4 pt-4 border-t border-slate-700">
  <p className={`text-sm ${themeColors.textSec} mb-3`}>
    Didn't receive the email?
  </p>
  <button
    onClick={handleResendVerification}
    disabled={loading || resendCooldown > 0}
    className={`w-full px-4 py-2 ${themeColors.bgInput} ${themeColors.textMain} rounded border ${themeColors.border} hover:${themeColors.accentBg} disabled:opacity-50`}
  >
    {loading
      ? 'Sending...'
      : resendCooldown > 0
      ? `Resend in ${resendCooldown}s`
      : 'Resend Verification Email'}
  </button>
</div>
```

- [ ] **2.2.6** Test: Sign up, verify resend button works, check email

**✅ Checkpoint 2.2 Complete:** Email verification resend is working.

---

## Feature 3: Social Authentication

**Goal:** Allow users to sign in with Google, GitHub, or other OAuth providers.

### Checkpoint 3.1: Configure OAuth Providers in Supabase

- [ ] **3.1.1** Go to Supabase Dashboard → Authentication → Providers
- [ ] **3.1.2** Enable Google provider:
  - [ ] Click "Google"
  - [ ] Toggle "Enable Google provider"
  - [ ] Add Google OAuth credentials (Client ID and Client Secret)
  - [ ] Add authorized redirect URLs: `https://[your-project].supabase.co/auth/v1/callback`
- [ ] **3.1.3** Enable GitHub provider (optional):
  - [ ] Click "GitHub"
  - [ ] Toggle "Enable GitHub provider"
  - [ ] Create GitHub OAuth App and add credentials
  - [ ] Add authorized redirect URLs
- [ ] **3.1.4** Note: You'll need to create OAuth apps with Google/GitHub first

**✅ Checkpoint 3.1 Complete:** OAuth providers are configured in Supabase.

---

### Checkpoint 3.2: Add Social Auth Functions to Supabase Utils

- [ ] **3.2.1** Open `src/utils/supabase.js`
- [ ] **3.2.2** Add social auth function:

```javascript
/**
 * Sign in with OAuth provider
 * @param {string} provider - OAuth provider (e.g., 'google', 'github')
 * @returns {Promise<{error: Error|null}>}
 */
export const signInWithOAuth = async (provider) => {
  if (!supabaseClient) {
    return { error: new Error('Supabase not configured') };
  }

  try {
    const redirectUrl = `${window.location.origin}${window.location.pathname}`;
    
    const { error } = await supabaseClient.auth.signInWithOAuth({
      provider: provider,
      options: {
        redirectTo: redirectUrl,
      },
    });

    if (error) {
      return { error };
    }

    // Note: User will be redirected to OAuth provider, then back to app
    return { error: null };
  } catch (error) {
    console.error(`Error signing in with ${provider}:`, error);
    return { error };
  }
};
```

**✅ Checkpoint 3.2 Complete:** Social auth function is ready.

---

### Checkpoint 3.3: Add Social Auth Buttons to Auth Component

- [ ] **3.3.1** Open `src/components/Auth.jsx`
- [ ] **3.3.2** Import social auth function:

```javascript
import { signInWithOAuth } from '../utils/supabase.js';
```

- [ ] **3.3.3** Add social auth handler:

```javascript
const handleSocialAuth = async (provider) => {
  setLoading(true);
  setError(null);

  try {
    const { error } = await signInWithOAuth(provider);
    if (error) {
      setError(error.message);
      setLoading(false);
    }
    // Note: User will be redirected, so we don't need to handle success here
  } catch (err) {
    setError(err.message);
    setLoading(false);
  }
};
```

- [ ] **3.3.4** Add social auth buttons in the main form (after password field, before submit button):

```javascript
{/* Social Auth Section */}
<div className="relative my-4">
  <div className="absolute inset-0 flex items-center">
    <div className={`w-full border-t ${themeColors.border}`}></div>
  </div>
  <div className="relative flex justify-center text-sm">
    <span className={`px-2 ${themeColors.bgCard} ${themeColors.textSec}`}>
      Or continue with
    </span>
  </div>
</div>

<div className="grid grid-cols-2 gap-3">
  <button
    type="button"
    onClick={() => handleSocialAuth('google')}
    disabled={loading}
    className={`flex items-center justify-center gap-2 px-4 py-2 ${themeColors.bgInput} ${themeColors.textMain} rounded border ${themeColors.border} hover:${themeColors.accentBg} disabled:opacity-50`}
  >
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
    Google
  </button>
  <button
    type="button"
    onClick={() => handleSocialAuth('github')}
    disabled={loading}
    className={`flex items-center justify-center gap-2 px-4 py-2 ${themeColors.bgInput} ${themeColors.textMain} rounded border ${themeColors.border} hover:${themeColors.accentBg} disabled:opacity-50`}
  >
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23 1.957-.538 4.04-.538 5.998 0 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
    </svg>
    GitHub
  </button>
</div>
```

- [ ] **3.3.5** Test: Click Google/GitHub button, complete OAuth flow, verify sign in

**✅ Checkpoint 3.3 Complete:** Social authentication is working.

---

## Feature 4: User Profile Management

**Goal:** Allow users to edit their profile information (username, email, etc.).

### Checkpoint 4.1: Add Profile Management Functions

- [ ] **4.1.1** Open `src/utils/supabase.js`
- [ ] **4.1.2** Add get user profile function:

```javascript
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
```

- [ ] **4.1.3** Add update user profile function:

```javascript
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
```

- [ ] **4.1.4** Add update email function:

```javascript
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
```

**✅ Checkpoint 4.1 Complete:** Profile management functions are ready.

---

### Checkpoint 4.2: Create Profile Management Component

- [ ] **4.2.1** Create new file `src/components/ProfileSettings.jsx`
- [ ] **4.2.2** Add component code:

```javascript
import { useState, useEffect } from 'react';
import { getUserProfile, updateUserProfile, updateUserEmail, getCurrentUser } from '../utils/supabase.js';
import { User, Mail, Save, X } from 'lucide-react';

export const ProfileSettings = ({ user, theme, onClose }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [newEmail, setNewEmail] = useState('');

  const themeColors = theme?.colors || {
    bgMain: 'bg-slate-950',
    bgCard: 'bg-slate-800',
    bgInput: 'bg-slate-900',
    textMain: 'text-slate-200',
    textSec: 'text-slate-400',
    border: 'border-slate-700',
    accentBg: 'bg-blue-600',
    accentHover: 'hover:bg-blue-700',
    accentText: 'text-blue-500',
  };

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        const { profile: userProfile, error: profileError } = await getUserProfile(user.id);
        if (profileError) {
          setError(profileError.message);
        } else {
          setProfile(userProfile);
          setUsername(userProfile?.username || '');
          setEmail(user.email || '');
          setNewEmail(user.email || '');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const updates = {};
      
      // Update username if changed
      if (username !== profile?.username) {
        updates.username = username;
      }

      // Update profile
      if (Object.keys(updates).length > 0) {
        const { success: profileSuccess, error: profileError } = await updateUserProfile(user.id, updates);
        if (profileError) {
          setError(profileError.message);
          setSaving(false);
          return;
        }
      }

      // Update email if changed
      if (newEmail !== email && newEmail) {
        const { success: emailSuccess, error: emailError } = await updateUserEmail(newEmail);
        if (emailError) {
          setError(emailError.message);
          setSaving(false);
          return;
        }
        setEmail(newEmail);
        setSuccess('Profile updated! Please check your email to verify the new address.');
      } else {
        setSuccess('Profile updated successfully!');
      }

      // Reload profile
      const { profile: updatedProfile } = await getUserProfile(user.id);
      setProfile(updatedProfile);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={`p-6 ${themeColors.bgCard} rounded-lg`}>
        <div className="text-center">
          <div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${themeColors.accentText} mx-auto mb-2`}></div>
          <p className={themeColors.textSec}>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 ${themeColors.bgCard} rounded-lg max-w-md mx-auto`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className={`text-2xl font-bold ${themeColors.textMain}`}>Profile Settings</h2>
        {onClose && (
          <button
            onClick={onClose}
            className={`p-2 ${themeColors.bgInput} rounded hover:${themeColors.accentBg}`}
          >
            <X size={20} className={themeColors.textMain} />
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-900/50 text-red-200 rounded text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-900/50 text-green-200 rounded text-sm">
          {success}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className={`block ${themeColors.textSec} mb-2 flex items-center gap-2`}>
            <User size={16} />
            Username
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={`w-full px-3 py-2 ${themeColors.bgInput} ${themeColors.textMain} rounded border ${themeColors.border}`}
            placeholder="Enter username"
          />
        </div>

        <div>
          <label className={`block ${themeColors.textSec} mb-2 flex items-center gap-2`}>
            <Mail size={16} />
            Email
          </label>
          <input
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            className={`w-full px-3 py-2 ${themeColors.bgInput} ${themeColors.textMain} rounded border ${themeColors.border}`}
            placeholder="Enter email"
          />
          <p className={`mt-1 text-xs ${themeColors.textSec}`}>
            You'll need to verify your new email address
          </p>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className={`flex-1 px-4 py-2 ${themeColors.accentBg} text-white rounded ${themeColors.accentHover} disabled:opacity-50 flex items-center justify-center gap-2`}
          >
            <Save size={16} />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className={`px-4 py-2 ${themeColors.bgInput} ${themeColors.textMain} rounded border ${themeColors.border}`}
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
```

**✅ Checkpoint 4.2 Complete:** Profile settings component is ready.

---

### Checkpoint 4.3: Integrate Profile Settings into App

- [ ] **4.3.1** Open `src/App.jsx`
- [ ] **4.3.2** Import ProfileSettings component:

```javascript
import { ProfileSettings } from './components/ProfileSettings';
```

- [ ] **4.3.3** Add state for profile settings modal:

```javascript
const [showProfileSettings, setShowProfileSettings] = useState(false);
```

- [ ] **4.3.4** Add button to open profile settings (in settings menu or header):

```javascript
{user && (
  <button
    onClick={() => setShowProfileSettings(true)}
    className={`px-4 py-2 ${theme.bgSec} ${theme.textMain} rounded border ${theme.border} hover:${theme.accentBg}`}
  >
    <User size={16} className="inline mr-2" />
    Profile Settings
  </button>
)}
```

- [ ] **4.3.5** Add ProfileSettings modal (in render, similar to other modals):

```javascript
{showProfileSettings && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <ProfileSettings
      user={user}
      theme={THEMES[currentTheme]}
      onClose={() => setShowProfileSettings(false)}
    />
  </div>
)}
```

- [ ] **4.3.6** Test: Open profile settings, update username/email, verify changes save

**✅ Checkpoint 4.3 Complete:** Profile management is integrated.

---

## Feature 5: Session Persistence

**Goal:** Remember user across browser restarts using Supabase session management.

> **Note:** Supabase automatically handles session persistence via localStorage. This checkpoint ensures it's working correctly.

### Checkpoint 5.1: Verify Session Persistence

- [ ] **5.1.1** Open `src/components/Auth.jsx`
- [ ] **5.1.2** Verify `onAuthStateChange` listener is set up (should already exist)
- [ ] **5.1.3** Verify `getSession()` is called on mount (should already exist)
- [ ] **5.1.4** Test: Sign in, close browser, reopen, verify user is still signed in

**✅ Checkpoint 5.1 Complete:** Session persistence is working.

---

### Checkpoint 5.2: Add Session Refresh Handling

- [ ] **5.2.1** Open `src/utils/supabase.js`
- [ ] **5.2.2** Add session refresh function:

```javascript
/**
 * Refresh user session
 * @returns {Promise<{session: Object|null, error: Error|null}>}
 */
export const refreshSession = async () => {
  if (!supabaseClient) {
    return { session: null, error: new Error('Supabase not configured') };
  }

  try {
    const { data: { session }, error } = await supabaseClient.auth.refreshSession();
    
    if (error) {
      return { session: null, error };
    }

    return { session, error: null };
  } catch (error) {
    console.error('Error refreshing session:', error);
    return { session: null, error };
  }
};
```

- [ ] **5.2.3** Open `src/components/Auth.jsx`
- [ ] **5.2.4** Add automatic session refresh on mount (optional, Supabase handles this automatically):

```javascript
// In useEffect, after checking session:
if (supabase) {
  // Refresh session if it exists but is expired
  supabase.auth.getSession().then(async ({ data: { session } }) => {
    if (session) {
      // Check if session is about to expire (within 5 minutes)
      const expiresAt = session.expires_at;
      const now = Math.floor(Date.now() / 1000);
      if (expiresAt && expiresAt - now < 300) {
        // Refresh session
        await supabase.auth.refreshSession();
      }
    }
  });
}
```

**✅ Checkpoint 5.2 Complete:** Session refresh is handled.

---

## Feature 6: Multi-Device Sync

**Goal:** Real-time updates across devices using Supabase Realtime.

### Checkpoint 6.1: Enable Realtime in Supabase

- [ ] **6.1.1** Go to Supabase Dashboard → Database → Replication
- [ ] **6.1.2** Enable replication for tables:
  - [ ] `entries`
  - [ ] `trading_pairs`
  - [ ] `motivational_images`
  - [ ] `user_preferences`
- [ ] **6.1.3** Note: Realtime is enabled by default for new tables, but verify it's on

**✅ Checkpoint 6.1 Complete:** Realtime is enabled.

---

### Checkpoint 6.2: Add Realtime Subscriptions

- [ ] **6.2.1** Open `src/utils/supabase.js`
- [ ] **6.2.2** Add function to subscribe to journal data changes:

```javascript
/**
 * Subscribe to journal data changes
 * @param {string} userId - User ID
 * @param {Function} callback - Callback function for changes
 * @returns {Function} Unsubscribe function
 */
export const subscribeToJournalChanges = (userId, callback) => {
  if (!supabaseClient || !userId) {
    return () => {}; // Return no-op unsubscribe
  }

  // Subscribe to entries changes
  const entriesChannel = supabaseClient
    .channel('entries-changes')
    .on(
      'postgres_changes',
      {
        event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
        schema: 'public',
        table: 'entries',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        callback({ type: 'entries', payload });
      }
    )
    .subscribe();

  // Subscribe to trading pairs changes
  const pairsChannel = supabaseClient
    .channel('pairs-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'trading_pairs',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        callback({ type: 'pairs', payload });
      }
    )
    .subscribe();

  // Subscribe to images changes
  const imagesChannel = supabaseClient
    .channel('images-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'motivational_images',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        callback({ type: 'images', payload });
      }
    )
    .subscribe();

  // Subscribe to preferences changes
  const prefsChannel = supabaseClient
    .channel('prefs-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'user_preferences',
        filter: `id=eq.${userId}`,
      },
      (payload) => {
        callback({ type: 'preferences', payload });
      }
    )
    .subscribe();

  // Return unsubscribe function
  return () => {
    entriesChannel.unsubscribe();
    pairsChannel.unsubscribe();
    imagesChannel.unsubscribe();
    prefsChannel.unsubscribe();
  };
};
```

**✅ Checkpoint 6.2 Complete:** Realtime subscription function is ready.

---

### Checkpoint 6.3: Integrate Realtime Sync in App

- [ ] **6.3.1** Open `src/App.jsx`
- [ ] **6.3.2** Import subscription function:

```javascript
import { subscribeToJournalChanges } from './utils/supabase.js';
```

- [ ] **6.3.3** Add useEffect to set up realtime subscription:

```javascript
// Add after data loading useEffect
useEffect(() => {
  if (!isSupabaseConfigured() || !user) {
    return;
  }

  // Subscribe to realtime changes
  const unsubscribe = subscribeToJournalChanges(user.id, async ({ type, payload }) => {
    console.log('Realtime update:', type, payload);
    
    // Reload data when changes are detected
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
      console.error('Error reloading data after realtime update:', error);
    }
  });

  // Cleanup subscription on unmount or user change
  return () => {
    unsubscribe();
  };
}, [user]);
```

- [ ] **6.3.4** Test: Open app on two devices, make change on one, verify it appears on the other

**✅ Checkpoint 6.3 Complete:** Multi-device sync is working.

---

## Feature 7: Offline Support

**Goal:** Queue changes when offline, sync when online.

### Checkpoint 7.1: Create Offline Queue Utility

- [ ] **7.1.1** Create new file `src/utils/offlineQueue.js`
- [ ] **7.1.2** Add offline queue implementation:

```javascript
/**
 * Offline queue utility for queuing operations when offline
 */

const QUEUE_KEY = 'offline_queue_v1';
const MAX_QUEUE_SIZE = 100;

/**
 * Add operation to offline queue
 * @param {string} operation - Operation type (e.g., 'save_entry', 'delete_entry')
 * @param {Object} data - Operation data
 */
export const addToOfflineQueue = (operation, data) => {
  try {
    const queue = getOfflineQueue();
    
    // Prevent queue from growing too large
    if (queue.length >= MAX_QUEUE_SIZE) {
      console.warn('Offline queue is full, removing oldest items');
      queue.shift();
    }
    
    queue.push({
      id: Date.now() + Math.random(),
      operation,
      data,
      timestamp: Date.now(),
    });
    
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    return true;
  } catch (error) {
    console.error('Error adding to offline queue:', error);
    return false;
  }
};

/**
 * Get offline queue
 * @returns {Array} Queue of operations
 */
export const getOfflineQueue = () => {
  try {
    const queueStr = localStorage.getItem(QUEUE_KEY);
    return queueStr ? JSON.parse(queueStr) : [];
  } catch (error) {
    console.error('Error getting offline queue:', error);
    return [];
  }
};

/**
 * Clear offline queue
 */
export const clearOfflineQueue = () => {
  try {
    localStorage.removeItem(QUEUE_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing offline queue:', error);
    return false;
  }
};

/**
 * Remove item from queue
 * @param {string} id - Item ID
 */
export const removeFromOfflineQueue = (id) => {
  try {
    const queue = getOfflineQueue();
    const filtered = queue.filter(item => item.id !== id);
    localStorage.setItem(QUEUE_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Error removing from offline queue:', error);
    return false;
  }
};

/**
 * Check if device is online
 * @returns {boolean}
 */
export const isOnline = () => {
  return navigator.onLine;
};
```

**✅ Checkpoint 7.1 Complete:** Offline queue utility is ready.

---

### Checkpoint 7.2: Integrate Offline Queue with Storage

- [ ] **7.2.1** Open `src/utils/storage.js`
- [ ] **7.2.2** Import offline queue functions:

```javascript
import { addToOfflineQueue, isOnline, getOfflineQueue, clearOfflineQueue, removeFromOfflineQueue } from './offlineQueue.js';
```

- [ ] **7.2.3** Update `saveJournalData` to queue operations when offline:

```javascript
// In saveJournalData function, before attempting to save:
if (!isOnline()) {
  // Queue the operation for later
  addToOfflineQueue('save_journal_data', journalData);
  console.log('Device is offline, operation queued');
  return { success: true, error: null }; // Return success to not block UI
}
```

- [ ] **7.2.4** Add function to process offline queue:

```javascript
/**
 * Process offline queue when coming back online
 * @returns {Promise<{processed: number, errors: number}>}
 */
export const processOfflineQueue = async () => {
  if (!isOnline()) {
    return { processed: 0, errors: 0 };
  }

  const queue = getOfflineQueue();
  if (queue.length === 0) {
    return { processed: 0, errors: 0 };
  }

  let processed = 0;
  let errors = 0;

  for (const item of queue) {
    try {
      if (item.operation === 'save_journal_data') {
        const { useSupabase, userId } = await getStorageMode();
        if (useSupabase && userId) {
          const { success, error } = await saveJournalDataToSupabase(userId, item.data);
          if (success) {
            removeFromOfflineQueue(item.id);
            processed++;
          } else {
            console.error('Error processing queued operation:', error);
            errors++;
          }
        } else {
          // Fallback to localStorage
          saveJournalDataToLocalStorage(item.data);
          removeFromOfflineQueue(item.id);
          processed++;
        }
      }
    } catch (error) {
      console.error('Error processing queued operation:', error);
      errors++;
    }
  }

  return { processed, errors };
};
```

**✅ Checkpoint 7.2 Complete:** Offline queue is integrated with storage.

---

### Checkpoint 7.3: Add Online/Offline Detection in App

- [ ] **7.3.1** Open `src/App.jsx`
- [ ] **7.3.2** Import offline utilities:

```javascript
import { processOfflineQueue, isOnline } from './utils/offlineQueue.js';
```

- [ ] **7.3.3** Add state for online status:

```javascript
const [isOnlineStatus, setIsOnlineStatus] = useState(navigator.onLine);
```

- [ ] **7.3.4** Add useEffect to detect online/offline changes:

```javascript
// Add online/offline detection
useEffect(() => {
  const handleOnline = async () => {
    setIsOnlineStatus(true);
    console.log('Device is online, processing queued operations...');
    
    // Process offline queue when coming back online
    if (isSupabaseConfigured() && user) {
      const { processed, errors } = await processOfflineQueue();
      if (processed > 0) {
        console.log(`Processed ${processed} queued operations`);
        // Reload data to sync with server
        const data = await loadJournalData();
        if (data) {
          if (data.entries) setEntries(data.entries);
          if (data.availablePairs) setAvailablePairs(data.availablePairs);
          if (data.motivationalImages) setMotivationalImages(data.motivationalImages);
          if (data.appTitle) setAppTitle(data.appTitle);
          if (data.accountBalance !== undefined) setAccountBalance(data.accountBalance);
          if (data.currentTheme) setCurrentTheme(data.currentTheme);
        }
      }
      if (errors > 0) {
        console.warn(`${errors} operations failed to process`);
      }
    }
  };

  const handleOffline = () => {
    setIsOnlineStatus(false);
    console.log('Device is offline, operations will be queued');
  };

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  // Process queue on mount if online
  if (isOnlineStatus && isSupabaseConfigured() && user) {
    processOfflineQueue();
  }

  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}, [user]);
```

- [ ] **7.3.5** Add offline indicator in UI (optional):

```javascript
{!isOnlineStatus && (
  <div className="fixed top-4 right-4 bg-yellow-600 text-white px-4 py-2 rounded shadow-lg z-50">
    <p className="text-sm">You're offline. Changes will sync when you're back online.</p>
  </div>
)}
```

- [ ] **7.3.6** Test: Go offline, make changes, go online, verify changes sync

**✅ Checkpoint 7.3 Complete:** Offline support is working.

---

## Final Testing

**Goal:** Verify all advanced features work correctly.

### Test 1: Password Reset
- [ ] Can request password reset
- [ ] Email arrives with reset link
- [ ] Can update password via link
- [ ] Can sign in with new password

### Test 2: Email Verification
- [ ] Verification email sent on signup
- [ ] Can resend verification email
- [ ] Resend cooldown works
- [ ] Can verify email and sign in

### Test 3: Social Authentication
- [ ] Google sign in works
- [ ] GitHub sign in works (if enabled)
- [ ] User profile created on first social sign in
- [ ] Can sign out and sign back in

### Test 4: Profile Management
- [ ] Can view profile settings
- [ ] Can update username
- [ ] Can update email
- [ ] Email verification required for new email
- [ ] Changes persist after refresh

### Test 5: Session Persistence
- [ ] User stays signed in after browser restart
- [ ] Session refreshes automatically
- [ ] Can sign out successfully

### Test 6: Multi-Device Sync
- [ ] Changes on device A appear on device B
- [ ] Real-time updates work
- [ ] No conflicts or data loss

### Test 7: Offline Support
- [ ] Changes queue when offline
- [ ] Queue processes when coming online
- [ ] Offline indicator shows correctly
- [ ] No data loss when offline

**✅ All Tests Complete:** Advanced authentication features are fully functional!

---

## Troubleshooting

### Issue: Password reset email not arriving

**Check:**
- [ ] Email provider is configured in Supabase
- [ ] Check spam folder
- [ ] Verify redirect URL in Supabase settings
- [ ] Check Supabase logs for errors

### Issue: Social auth redirect not working

**Check:**
- [ ] OAuth app redirect URLs match Supabase callback URL
- [ ] Provider is enabled in Supabase dashboard
- [ ] Client ID and secret are correct
- [ ] Check browser console for errors

### Issue: Realtime updates not working

**Check:**
- [ ] Realtime is enabled for tables in Supabase
- [ ] RLS policies allow SELECT for user
- [ ] User is authenticated
- [ ] Check browser console for subscription errors

### Issue: Offline queue not processing

**Check:**
- [ ] Device is actually online (check `navigator.onLine`)
- [ ] User is authenticated
- [ ] Queue has items
- [ ] Check browser console for errors

---

## Security Notes

- Always validate user inputs before saving
- Use RLS policies to protect user data
- Never expose service role key in client code
- Use HTTPS in production
- Regularly update dependencies
- Monitor Supabase dashboard for suspicious activity
- Implement rate limiting for password reset requests
- Use strong password requirements
- Consider implementing 2FA for sensitive accounts

---

**Last Updated:** 2024-01-20

