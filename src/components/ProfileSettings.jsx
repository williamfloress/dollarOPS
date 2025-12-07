import { useState, useEffect } from 'react';
import { getUserProfile, updateUserProfile, updateUserEmail, getCurrentUser, getSupabaseClient } from '../utils/supabase.js';
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
  const [isEmailChangeInProgress, setIsEmailChangeInProgress] = useState(false);

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
        // Refresh user to get latest email (in case it was updated)
        const { user: refreshedUser } = await getCurrentUser();
        const currentUser = refreshedUser || user;
        
        const { profile: userProfile, error: profileError } = await getUserProfile(currentUser.id);
        if (profileError) {
          setError(profileError.message);
        } else {
          setProfile(userProfile);
          setUsername(userProfile?.username || '');
          setEmail(currentUser.email || '');
          setNewEmail(currentUser.email || '');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  // Helper function to mask email for security
  const maskEmail = (email) => {
    if (!email) return '';
    const [localPart, domain] = email.split('@');
    if (!domain) return email;
    
    // Show first 2 characters and last character of local part, mask the rest
    if (localPart.length <= 3) {
      return `${localPart[0]}***@${domain}`;
    }
    const maskedLocal = `${localPart.substring(0, 2)}***${localPart[localPart.length - 1]}`;
    return `${maskedLocal}@${domain}`;
  };

  // Listen for auth state changes to detect email confirmation
  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Check URL for email_change type or confirmation message
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const urlType = hashParams.get('type');
      const message = hashParams.get('message');
      const isEmailChangeInUrl = urlType === 'email_change';
      const isConfirmationMessage = message && message.includes('Confirmation link accepted');
      
      // When email is confirmed, USER_UPDATED, TOKEN_REFRESHED, SIGNED_IN event is fired
      // or when URL has type=email_change or confirmation message
      // BUT: Don't process if we're in the middle of initiating an email change
      if ((event === 'USER_UPDATED' || event === 'TOKEN_REFRESHED' || isEmailChangeInUrl || isConfirmationMessage) && session?.user && !isEmailChangeInProgress) {
        // Wait a bit for Supabase to process
        await new Promise(resolve => setTimeout(resolve, 500));
        // Refresh user data to get updated email
        const { user: updatedUser } = await getCurrentUser();
        if (updatedUser) {
          // Only update if email actually changed
          if (updatedUser.email !== email) {
            setEmail(updatedUser.email || '');
            setNewEmail(updatedUser.email || '');
            setIsEmailChangeInProgress(false); // Reset flag
            // Only set success if we don't already have a message about confirming both emails
            // Use a function to check current state without adding it to dependencies
            setSuccess(prevSuccess => {
              if (prevSuccess && (prevSuccess.includes('AMBOS correos') || prevSuccess.includes('confirmar en AMBOS'))) {
                // Don't overwrite the "confirm both emails" message
                return prevSuccess;
              }
              return '¡Correo actualizado exitosamente!';
            });
            // Clear success message after 5 seconds (only if it's the "updated successfully" message)
            setTimeout(() => {
              setSuccess(prevSuccess => {
                if (prevSuccess && (prevSuccess.includes('AMBOS correos') || prevSuccess.includes('confirmar en AMBOS'))) {
                  return prevSuccess; // Keep the "confirm both emails" message
                }
                return null;
              });
            }, 5000);
          }
          // Clear URL hash
          if (window.location.hash) {
            window.history.replaceState(null, '', window.location.pathname);
          }
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [email, isEmailChangeInProgress]); // Include isEmailChangeInProgress to prevent interference

  const handleSave = async () => {
    if (!user) {
      setSaving(false);
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const updates = {};
      let emailUpdated = false;
      
      // Update username if changed
      if (username !== profile?.username) {
        updates.username = username;
      }

      // Update profile first
      if (Object.keys(updates).length > 0) {
        const { success: profileSuccess, error: profileError } = await updateUserProfile(user.id, updates);
        if (profileError) {
          setError(profileError.message);
          setSaving(false);
          return;
        }
      }

      // Update email if changed
      if (newEmail !== email && newEmail && newEmail.trim() !== '') {
        // Set flag to prevent listener from interfering
        setIsEmailChangeInProgress(true);
        
        const { success: emailSuccess, error: emailError } = await updateUserEmail(newEmail);
        if (emailError) {
          setError(emailError.message);
          setIsEmailChangeInProgress(false);
          setSaving(false);
          return;
        }
        emailUpdated = true;
        // Show success message immediately - don't wait for profile reload
        // Don't update local email state yet - wait for confirmation
        // The email will be updated after user confirms via email link
        const maskedCurrentEmail = maskEmail(email);
        const maskedNewEmail = maskEmail(newEmail);
        const successMessage = `¡Solicitud de cambio de correo enviada!\n\nPara completar el cambio, debes confirmar en AMBOS correos electrónicos:\n\n1️⃣ Revisa tu correo actual (${maskedCurrentEmail}) y haz clic en el enlace de confirmación\n2️⃣ Revisa tu nuevo correo (${maskedNewEmail}) y haz clic en el enlace de confirmación\n\n⚠️ Importante: El cambio de correo solo se completará después de confirmar ambos enlaces.`;
        
        // Set success message FIRST
        setSuccess(successMessage);
        
        // Reset flag after a delay to allow the message to persist
        // The flag prevents the listener from interfering for 2 seconds
        setTimeout(() => {
          setIsEmailChangeInProgress(false);
        }, 2000);
        
        // Exit early - don't update email state until confirmation
        // Don't reload profile here to avoid clearing the message
        setSaving(false);
        console.log('📧 Saving state set to false, returning early');
        return;
      } else {
        setSuccess('¡Perfil actualizado exitosamente!');
      }

      // Reload profile only if email wasn't changed
      const { profile: updatedProfile } = await getUserProfile(user.id);
      setProfile(updatedProfile);
      
      // Update local state if email wasn't changed
      const { user: refreshedUser } = await getCurrentUser();
      if (refreshedUser) {
        setEmail(refreshedUser.email || '');
        setNewEmail(refreshedUser.email || '');
      }
    } catch (err) {
      console.error('Error saving profile:', err);
      setError(err.message || 'An error occurred while saving the profile');
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

      {success && typeof success === 'string' && success.length > 0 && (
        <div className={`mb-4 p-4 rounded-lg text-sm whitespace-pre-line ${
          success.includes('confirmar en AMBOS') || success.includes('AMBOS correos')
            ? 'bg-blue-900/50 text-blue-200 border border-blue-700' 
            : 'bg-green-900/50 text-green-200'
        }`}>
          {(success.includes('confirmar en AMBOS') || success.includes('AMBOS correos')) && (
            <div className="flex items-start gap-2 mb-3">
              <svg className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-semibold text-base text-blue-100">Importante: Confirmación requerida</span>
            </div>
          )}
          <div className={(success.includes('confirmar en AMBOS') || success.includes('AMBOS correos')) ? 'text-blue-100' : 'text-green-100'}>
            {success}
          </div>
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

