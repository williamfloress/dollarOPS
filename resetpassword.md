# Solución al Flujo de Reset Password en Supabase

Este documento detalla la implementación del flujo de recuperación de contraseña en este proyecto, que soluciona el problema común donde el link de recuperación loguea al usuario y lo redirige al Home, en lugar de mostrar el formulario de cambio de contraseña.

## 🧠 El Problema: "Magic Link" Implícito

Supabase trata el enlace de recuperación como un **Magic Link**. Al hacer clic, el usuario obtiene una sesión válida automáticamente. Si tu aplicación tiene lógica que detecta un usuario autenticado y lo redirige automáticamente, interceptará al usuario antes de que pueda cambiar su clave.

---

## ✅ Implementación Actual (SPA sin Routing)

Este proyecto es una **Single Page Application (SPA)** sin React Router. La solución implementada utiliza:

1. **Detección de parámetros de hash en la URL**: Supabase añade `#access_token=...&type=recovery` cuando el usuario hace clic en el enlace de recuperación.
2. **SessionStorage para estado de recuperación**: Se marca un flag en `sessionStorage` cuando se detecta el flujo de recuperación.
3. **Listener de eventos de autenticación**: Se escucha el evento `PASSWORD_RECOVERY` de Supabase.

### Configuración en Supabase Dashboard

1. **Configurar la URL permitida en Supabase:**
   - Ve a `Authentication` > `URL Configuration` > `Redirect URLs`.
   - Añade las siguientes URLs (sin el hash `#`, Supabase lo añadirá automáticamente):
   
   **Para desarrollo:**
   - `http://localhost:5173/` (puerto por defecto de Vite)
   - Si usas otro puerto, añade: `http://localhost:TU_PUERTO/`
   
   **Para producción:**
   - `https://tu-dominio.com/` (reemplaza con tu dominio real)
   - Si tu app está en un subdirectorio: `https://tu-dominio.com/ruta/`
   
   **Ejemplo de URLs a configurar:**
   ```
   http://localhost:5173/
   https://mijournal.com/
   ```
   
   ⚠️ **Importante:** 
   - No incluyas el hash `#` en las URLs del dashboard
   - Asegúrate de incluir la barra final `/` al final de la URL
   - El código usa `${window.location.origin}${window.location.pathname}`, que normalmente resulta en la URL raíz de tu aplicación
   
   **Cómo verificar tu URL actual:**
   - Abre la consola del navegador en tu app
   - Ejecuta: `console.log(window.location.origin + window.location.pathname)`
   - Esa es la URL exacta que debes añadir en Supabase Dashboard

### Implementación en el Código

#### 1. Función `requestPasswordReset` en `src/utils/supabase.js`

```246:267:src/utils/supabase.js
export const requestPasswordReset = async (email) => {
  if (!supabaseClient) {
    return { success: false, error: new Error('Supabase not configured') };
  }

  try {
    // Use explicit redirect URL - Supabase will append access_token and type=recovery to the hash
    // This ensures the app can properly detect and handle the recovery flow
    // The redirectTo must be registered in Supabase Dashboard > Authentication > URL Configuration > Redirect URLs
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

**Puntos clave:**
- Usa la URL base de la aplicación (sin hash)
- Supabase automáticamente añadirá `#access_token=...&type=recovery` cuando el usuario haga clic en el enlace
- La URL debe estar registrada en Supabase Dashboard

#### 2. Detección del Flujo de Recuperación en `src/components/Auth.jsx`

El componente `Auth` detecta el flujo de recuperación de múltiples formas:

**a) Detección inmediata del hash en la URL:**
```55:121:src/components/Auth.jsx
    // CRITICAL: Check for recovery token IMMEDIATELY and synchronously
    // This must happen before Supabase processes the hash
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const type = hashParams.get('type');
    const accessToken = hashParams.get('access_token');
    const isRecoveryFlow = type === 'recovery';
    
    // Set up auth state listener FIRST to catch any session creation
    // This must be set up before Supabase processes the hash
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔐 Auth state change:', event, session ? 'Session exists' : 'No session');
      
      // CRITICAL: Check for PASSWORD_RECOVERY event - this is the key indicator
      // Supabase fires this event when a password recovery token is processed
      if (event === 'PASSWORD_RECOVERY') {
        console.log('🔐 PASSWORD_RECOVERY event detected - marking recovery mode');
        // Mark recovery mode in sessionStorage - this is the single source of truth
        sessionStorage.setItem('password_recovery_mode', 'true');
        setShowPasswordUpdate(true);
        // Don't set user or call onAuthChange - we want to keep the session but not show as logged in
        // Clear URL hash after a short delay
        setTimeout(() => {
          if (window.location.hash) {
            window.history.replaceState(null, '', window.location.pathname);
          }
        }, 500);
        return; // Don't process this auth state change normally
      }
      
      // Check if we're in recovery mode (from sessionStorage or hash)
      const isRecoveryInStorage = sessionStorage.getItem('password_recovery_mode') === 'true';
      const currentHashParams = new URLSearchParams(window.location.hash.substring(1));
      const isCurrentlyRecovery = currentHashParams.get('type') === 'recovery' || currentHashParams.has('access_token');
      
      // If we're in recovery mode, don't process normal auth flow
      if (isRecoveryInStorage || isCurrentlyRecovery) {
        console.log('🔐 Recovery mode active - keeping session but not showing as logged in');
        // Ensure recovery mode is marked
        if (!isRecoveryInStorage) {
          sessionStorage.setItem('password_recovery_mode', 'true');
        }
        setShowPasswordUpdate(true);
        // Don't set user or call onAuthChange - keep session for password update but don't show as logged in
        return;
      }
      
      // Normal auth flow - only process if NOT in recovery mode
      console.log('🔐 Normal auth flow: Setting user');
      setUser(session?.user || null);
      if (onAuthChange) onAuthChange(session?.user || null);
    });
    
    // If recovery token detected in URL, mark recovery mode immediately
    // Also check for access_token (Supabase may add this when processing recovery token)
    const hasAccessToken = hashParams.has('access_token');
    if (isRecoveryFlow || hasAccessToken) {
      console.log('🔐 Recovery token detected in URL - marking recovery mode', { isRecoveryFlow, hasAccessToken });
      // Mark recovery mode in sessionStorage - this is the single source of truth
      sessionStorage.setItem('password_recovery_mode', 'true');
      setShowPasswordUpdate(true);
      // Don't set user or call onAuthChange - let Supabase create the session, we'll handle it in the listener
      // Don't check user or load remembered email in recovery mode
      // The auth state listener will handle the session when it's created
      return () => {
        subscription.unsubscribe();
      };
    }
```

**b) Renderizado condicional basado en sessionStorage:**
```351:410:src/components/Auth.jsx
  // CRITICAL: Always check for recovery mode FIRST in render
  // sessionStorage is the single source of truth for recovery mode
  const isRecoveryMode = sessionStorage.getItem('password_recovery_mode') === 'true';

  // Show password update form if password reset token is detected
  // This must be checked BEFORE checking if user is logged in,
  // because Supabase may auto-create a session when recovery link is clicked
  if (isRecoveryMode) {
    // Get current hash params for debugging
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const urlRecoveryType = hashParams.get('type');
    
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
```

#### 3. Actualización de Contraseña

Después de que el usuario ingresa la nueva contraseña:

```276:344:src/components/Auth.jsx
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
        
        // Clear recovery mode flag FIRST
        sessionStorage.removeItem('password_recovery_mode');
        
        // Sign out the recovery session after password is updated
        // This allows the user to log in with their new password
        if (supabase) {
          await supabase.auth.signOut();
        }
        
        setError(null);
        setShowPasswordUpdate(false);
        setNewPassword('');
        setConfirmPassword('');
        setUser(null);
        if (onAuthChange) onAuthChange(null);
        
        // Show success message - user will see the login form
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
```

**Puntos clave:**
- Verifica que existe una sesión de recuperación antes de actualizar
- Limpia el flag `password_recovery_mode` de sessionStorage
- Cierra la sesión de recuperación después de actualizar la contraseña
- Muestra el formulario de login para que el usuario inicie sesión con la nueva contraseña

---

## 🔑 Puntos Clave de la Implementación

1. **SessionStorage como fuente de verdad**: El flag `password_recovery_mode` en sessionStorage previene que el usuario sea mostrado como "logueado" durante el flujo de recuperación.

2. **Detección temprana**: Se verifica el hash de la URL **antes** de que Supabase procese la sesión, evitando redirecciones automáticas.

3. **Evento PASSWORD_RECOVERY**: Se escucha el evento específico de Supabase que se dispara cuando se procesa un token de recuperación.

4. **Sesión temporal**: La sesión creada por el enlace de recuperación se mantiene solo para actualizar la contraseña, luego se cierra automáticamente.

5. **Sin routing necesario**: Esta solución funciona perfectamente en una SPA sin necesidad de rutas adicionales.

---

## 🧪 Flujo Completo

1. Usuario hace clic en "Forgot Password?" y ingresa su email
2. Se llama a `requestPasswordReset` con `redirectTo` configurado
3. Usuario recibe email con enlace de recuperación
4. Usuario hace clic en el enlace → Supabase redirige a la app con `#access_token=...&type=recovery`
5. `Auth.jsx` detecta el hash y marca `password_recovery_mode` en sessionStorage
6. Se muestra el formulario de "Set New Password" (incluso si hay una sesión activa)
7. Usuario ingresa nueva contraseña y confirma
8. Se actualiza la contraseña usando la sesión de recuperación
9. Se limpia sessionStorage y se cierra la sesión
10. Usuario ve el formulario de login para iniciar sesión con la nueva contraseña

---

## 📝 Notas Adicionales

- **URLs permitidas**: Asegúrate de registrar todas las URLs de redirección en Supabase Dashboard
- **Producción**: Actualiza la URL de producción cuando despliegues la aplicación
- **Debugging**: Los console.log con prefijo `🔐` ayudan a rastrear el flujo de autenticación
- **Seguridad**: La sesión de recuperación es temporal y solo permite actualizar la contraseña
