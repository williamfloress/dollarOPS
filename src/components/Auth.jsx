import React, { useState, useEffect } from 'react';
import { signIn, signUp, signOut, getCurrentUser, isSupabaseConfigured, getSupabaseClient, requestPasswordReset, updatePassword } from '../utils/supabase.js';

/**
 * Storage key for remembered email (pre-authentication data)
 * NOTE: This uses localStorage because it's pre-login data.
 * After login, all user data should be stored in Supabase (not localStorage).
 */
const REMEMBERED_EMAIL_KEY = 'remembered_email';

export const Auth = ({ onAuthChange, theme }) => {
  // Theme fallback - use provided theme or default dark theme
  // If theme is passed, it's the full theme object with colors property
  const themeColors = theme?.colors || {
    bgMain: 'bg-slate-950',
    bgCard: 'bg-slate-800',
    bgInput: 'bg-slate-900',
    textMain: 'text-slate-200',
    textSec: 'text-slate-400',
    textMuted: 'text-slate-500',
    border: 'border-slate-700',
    accentBg: 'bg-blue-600',
    accentHover: 'hover:bg-blue-700',
    accentText: 'text-blue-500',
    accentBorder: 'border-blue-500',
    accentRing: 'ring-blue-500',
  };
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [rememberEmail, setRememberEmail] = useState(false);
  const [verificationPending, setVerificationPending] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');
  const [showVerificationLogin, setShowVerificationLogin] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [showPasswordUpdate, setShowPasswordUpdate] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      // Supabase not configured, skip auth
      if (onAuthChange) onAuthChange(null);
      return;
    }

    const supabase = getSupabaseClient();
    if (!supabase) return;

    // CRITICAL: Check for recovery token IMMEDIATELY and synchronously
    // This must happen before Supabase processes the hash
    // We need to check the hash BEFORE Supabase's onAuthStateChange fires
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const type = hashParams.get('type');
    const isRecoveryFlow = type === 'recovery';
    
    // If recovery token detected, set flag immediately to prevent any auto-login
    if (isRecoveryFlow) {
      console.log('🔐 Recovery token detected - setting recovery mode immediately');
      setShowPasswordUpdate(true);
      setUser(null);
      if (onAuthChange) onAuthChange(null);
      // Clear hash immediately to prevent Supabase from processing it
      window.history.replaceState(null, '', window.location.pathname);
    }

    // Set up auth state listener FIRST to catch any session creation
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔐 Auth state change:', event, session ? 'Session exists' : 'No session');
      
      // Always check URL hash first (before it's cleared)
      const currentHashParams = new URLSearchParams(window.location.hash.substring(1));
      const currentType = currentHashParams.get('type');
      const isCurrentlyRecovery = currentType === 'recovery';
      
      // CRITICAL: If we're in recovery mode, prevent any auto-login
      if (isCurrentlyRecovery || showPasswordUpdate) {
        console.log('🔐 Recovery: Preventing auto-login, keeping session for password update');
        
        // IMPORTANT: Don't sign out the session - we need it to update the password!
        // The session will be used by updatePassword() function
        // We just prevent showing the user as logged in
        
        // Ensure password update form is shown
        setShowPasswordUpdate(true);
        
        // CRITICAL: Don't set user state - keep it null so user doesn't appear logged in
        // Don't call onAuthChange with user - this prevents the app from showing user data
        setUser(null);
        if (onAuthChange) onAuthChange(null);
        
        // Clear URL hash if not already cleared
        if (window.location.hash.includes('type=recovery')) {
          window.history.replaceState(null, '', window.location.pathname);
        }
        return; // Don't process this auth state change normally
      }
      
      console.log('🔐 Normal auth flow: Setting user');
      setUser(session?.user || null);
      if (onAuthChange) onAuthChange(session?.user || null);
    });

    // Handle recovery flow - MUST be handled before Supabase processes the hash
    if (isRecoveryFlow) {
      console.log('🔐 Password recovery token detected in URL - setting up recovery flow');
      
      // Set state immediately to show password form
      setShowPasswordUpdate(true);
      
      // CRITICAL: Set user to null immediately to prevent app from showing user data
      setUser(null);
      if (onAuthChange) onAuthChange(null);
      
      // Clear URL hash immediately to prevent Supabase from processing it
      window.history.replaceState(null, '', window.location.pathname);
      
      // Don't check user or load remembered email in recovery mode
      // The auth state listener will handle the session when it's created
      return () => {
        subscription.unsubscribe();
      };
    }

    // Handle email verification flow
    const hasVerificationParams = type === 'email' || type === 'signup' || hashParams.has('access_token');
    if (hasVerificationParams) {
      console.log('🔐 Email verification token detected');
      supabase.auth.getSession().then(async ({ data: { session } }) => {
        if (session) {
          // Email is verified, but we want user to log in manually
          await supabase.auth.signOut();
          setUser(null);
          if (onAuthChange) onAuthChange(null);
        }
        // Show login form with verification success message
        setShowVerificationLogin(true);
        // Clear URL hash
        window.history.replaceState(null, '', window.location.pathname);
      });
    } else {
      // Normal flow - check for existing session
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          setUser(session.user);
          if (onAuthChange) onAuthChange(session.user);
        }
      });
    }

    // Load remembered email from localStorage (pre-authentication, so localStorage is appropriate)
    const rememberedEmail = localStorage.getItem(REMEMBERED_EMAIL_KEY);
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberEmail(true);
    }

    // Check user in normal flow
    checkUser();

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [onAuthChange, showPasswordUpdate]);

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
        result = await signUp(email, password);
        
        // After sign up, show verification pending page instead of logging in
        if (!result.error) {
          setVerificationPending(true);
          setPendingEmail(email);
          // Reset form but keep email for display
          setPassword('');
          setLoading(false);
          return;
        }
      } else {
        result = await signIn(email, password);
      }

      if (result.error) {
        setError(result.error.message);
      } else {
        setUser(result.user);
        if (onAuthChange) onAuthChange(result.user);
        
        // Handle remember email functionality (pre-authentication data, so localStorage is appropriate)
        // NOTE: After login, all user data should be stored in Supabase, not localStorage
        if (!isSignUp && rememberEmail) {
          localStorage.setItem(REMEMBERED_EMAIL_KEY, email);
        } else if (!isSignUp && !rememberEmail) {
          localStorage.removeItem(REMEMBERED_EMAIL_KEY);
        }
        
        // Reset form
        setEmail('');
        setPassword('');
        setShowVerificationLogin(false);
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

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    console.log('🔐 Password update: Starting password update process');

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
      // Verify we have a session (the recovery session)
      const supabase = getSupabaseClient();
      if (supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        console.log('🔐 Password update: Session check before update:', session ? 'Session exists' : 'No session');
        
        if (!session) {
          setError('No valid recovery session. Please request a new password reset link.');
          setLoading(false);
          return;
        }
      }

      console.log('🔐 Password update: Calling updatePassword function');
      const { success, error } = await updatePassword(newPassword);
      
      if (error) {
        console.error('🔐 Password update: Error updating password', error);
        setError(error.message);
      } else if (success) {
        console.log('🔐 Password update: Password updated successfully');
        
        // Sign out the recovery session after password is updated
        if (supabase) {
          await supabase.auth.signOut();
          setUser(null);
          if (onAuthChange) onAuthChange(null);
        }
        
        setError(null);
        setShowPasswordUpdate(false);
        setNewPassword('');
        setConfirmPassword('');
        // Show success message and redirect to sign in
        alert('Password updated successfully! Please sign in with your new password.');
        setIsSignUp(false);
      }
    } catch (err) {
      console.error('🔐 Password update: Exception updating password', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // If Supabase is not configured, don't show auth UI
  if (!isSupabaseConfigured()) {
    return null;
  }

  // CRITICAL: Always check for recovery mode FIRST in render
  // Check both URL hash (in case state hasn't updated) and state
  const hashParams = new URLSearchParams(window.location.hash.substring(1));
  const urlRecoveryType = hashParams.get('type') === 'recovery';
  const isRecoveryMode = urlRecoveryType || showPasswordUpdate;

  // Show password update form if password reset token is detected
  // This must be checked BEFORE checking if user is logged in,
  // because Supabase may auto-create a session when recovery link is clicked
  if (isRecoveryMode) {
    console.log('🔐 Render: Showing password update form (recovery mode detected)', {
      urlRecoveryType,
      showPasswordUpdate,
      user: user ? 'exists' : 'null'
    });
    
    // CRITICAL: Even if user exists (from recovery session), don't show user as logged in
    // The recovery session is temporary and only for password update
    return (
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
    );
  }

  if (user && !isRecoveryMode) {
    console.log('🔐 Render: User is logged in, showing user info');
    return (
      <div className={`p-4 ${themeColors.bgCard} rounded-lg`}>
        <p className={`${themeColors.textMain} mb-2`}>Signed in as: {user.email}</p>
        <button
          onClick={handleSignOut}
          disabled={loading}
          className={`px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50`}
        >
          {loading ? 'Signing out...' : 'Sign Out'}
        </button>
      </div>
    );
  }

  // Show verification pending page after sign up
  if (verificationPending) {
    return (
      <div className={`p-6 ${themeColors.bgCard} rounded-lg max-w-md mx-auto`}>
        <div className="text-center mb-6">
          <div className={`mx-auto w-16 h-16 ${themeColors.accentBg} rounded-full flex items-center justify-center mb-4`}>
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className={`text-2xl font-bold ${themeColors.textMain} mb-2`}>Check Your Email</h2>
          <p className={`${themeColors.textSec} mb-4`}>
            We've sent a verification email to <span className={`font-semibold ${themeColors.textMain}`}>{pendingEmail}</span>
          </p>
          <p className={`text-sm ${themeColors.textMuted} mb-6`}>
            Please check your email and click on the verification link to activate your account. 
            After clicking the link, you'll be asked to sign in with your email and password.
          </p>
        </div>
        <div className="space-y-3">
          <button
            onClick={() => {
              setVerificationPending(false);
              setPendingEmail('');
              setIsSignUp(false);
            }}
            className={`w-full px-4 py-2 ${themeColors.accentBg} text-white rounded ${themeColors.accentHover}`}
          >
            Back to Sign In
          </button>
          <p className={`text-xs text-center ${themeColors.textMuted}`}>
            Didn't receive the email? Check your spam folder or try signing up again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-4 ${themeColors.bgCard} rounded-lg max-w-md mx-auto`}>
      {showVerificationLogin && (
        <div className={`mb-4 p-3 ${themeColors.accentBg}/50 border ${themeColors.accentBorder} rounded ${themeColors.accentText} text-sm`}>
          <p className="font-semibold mb-1">Email Verified!</p>
          <p>Please sign in with your email and password to continue.</p>
        </div>
      )}
      <h2 className={`text-xl font-bold ${themeColors.textMain} mb-4`}>
        {isSignUp ? 'Sign Up' : 'Sign In'}
      </h2>
      
      {error && (
        <div className="mb-4 p-2 bg-red-900/50 text-red-200 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={`block ${themeColors.textSec} mb-1`}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`w-full px-3 py-2 ${themeColors.bgInput} ${themeColors.textMain} rounded border ${themeColors.border}`}
            required
          />
        </div>

        <div>
          <label className={`block ${themeColors.textSec} mb-1`}>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`w-full px-3 py-2 ${themeColors.bgInput} ${themeColors.textMain} rounded border ${themeColors.border}`}
            required
            minLength={6}
          />
        </div>

        {!isSignUp && (
          <div className="flex items-center">
            <input
              type="checkbox"
              id="rememberEmail"
              checked={rememberEmail}
              onChange={(e) => {
                const checked = e.target.checked;
                setRememberEmail(checked);
                // If unchecking, clear the stored email immediately (pre-auth data, localStorage is fine)
                if (!checked) {
                  localStorage.removeItem(REMEMBERED_EMAIL_KEY);
                }
              }}
              className={`w-4 h-4 ${themeColors.accentText} ${themeColors.bgInput} ${themeColors.border} border rounded focus:ring-2 ${themeColors.accentRing}`}
            />
            <label htmlFor="rememberEmail" className={`ml-2 text-sm ${themeColors.textSec} cursor-pointer`}>
              Remember email
            </label>
          </div>
        )}

        {!isSignUp && !showPasswordReset && (
          <button
            type="button"
            onClick={() => setShowPasswordReset(true)}
            className={`text-sm ${themeColors.accentText} hover:underline`}
          >
            Forgot Password?
          </button>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`w-full px-4 py-2 ${themeColors.accentBg} text-white rounded ${themeColors.accentHover} disabled:opacity-50`}
        >
          {loading ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Sign In')}
        </button>

        <button
          type="button"
          onClick={() => {
            setIsSignUp(!isSignUp);
            setError(null);
          }}
          className={`w-full ${themeColors.textSec} hover:${themeColors.textMain} text-sm`}
        >
          {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
        </button>
      </form>

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

    </div>
  );
};

