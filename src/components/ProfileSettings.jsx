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

