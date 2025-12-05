import React, { useState, useEffect } from 'react';
import { signIn, signUp, signOut, getCurrentUser, isSupabaseConfigured, getSupabaseClient } from '../utils/supabase.js';

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
  const [username, setUsername] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [rememberEmail, setRememberEmail] = useState(false);
  const [verificationPending, setVerificationPending] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');
  const [showVerificationLogin, setShowVerificationLogin] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      // Supabase not configured, skip auth
      if (onAuthChange) onAuthChange(null);
      return;
    }

    // Handle email verification callback from URL
    const supabase = getSupabaseClient();
    if (supabase) {
      // Check for email verification tokens in URL hash
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const type = hashParams.get('type');
      const hasVerificationParams = type === 'email' || type === 'signup' || hashParams.has('access_token');
      
      if (hasVerificationParams) {
        // User clicked verification link - verify email but don't auto-login
        supabase.auth.getSession().then(async ({ data: { session } }) => {
          if (session) {
            // Email is verified, but we want user to log in manually
            // Sign out the auto-created session
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
    }

    // Load remembered email from localStorage (pre-authentication, so localStorage is appropriate)
    // After login, all user data should come from Supabase, not localStorage
    const rememberedEmail = localStorage.getItem(REMEMBERED_EMAIL_KEY);
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberEmail(true);
    }

    checkUser();
    
    // Listen for auth changes
    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user || null);
        if (onAuthChange) onAuthChange(session?.user || null);
      });

      // Cleanup subscription on unmount
      return () => {
        subscription.unsubscribe();
      };
    }
  }, [onAuthChange]);

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
        result = await signUp(email, password, username);
        
        // After sign up, show verification pending page instead of logging in
        if (!result.error) {
          setVerificationPending(true);
          setPendingEmail(email);
          // Reset form but keep email for display
          setPassword('');
          setUsername('');
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
        setUsername('');
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

  // If Supabase is not configured, don't show auth UI
  if (!isSupabaseConfigured()) {
    return null;
  }

  if (user) {
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
        {isSignUp && (
          <div>
            <label className={`block ${themeColors.textSec} mb-1`}>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={`w-full px-3 py-2 ${themeColors.bgInput} ${themeColors.textMain} rounded border ${themeColors.border}`}
              required={isSignUp}
            />
          </div>
        )}

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
    </div>
  );
};

