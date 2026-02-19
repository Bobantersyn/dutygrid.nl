import { useCallback, useEffect, useState } from 'react';

function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check session on mount
  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch('/api/custom-auth/session');
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch (error) {
        console.error('Session check failed:', error);
      } finally {
        setLoading(false);
      }
    }
    checkSession();
  }, []);

  const signInWithCredentials = useCallback(async ({ email, password }) => {
    try {
      const res = await fetch('/api/custom-auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Force a hard reload or redirect to ensure state is fresh
        window.location.href = '/';
        return { ok: true };
      } else {
        return { error: data.error || 'Login failed', ok: false };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { error: 'Network error', ok: false };
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await fetch('/api/custom-auth/logout', { method: 'POST' });
      setUser(null);
      window.location.href = '/account/signin';
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, []);

  return {
    user,
    loading,
    signInWithCredentials,
    signOut,
    // Keep these placeholders if needed for compatibility, or remove if unused
    signInWithGoogle: () => console.log('Google login not implemented yet'),
    signInWithFacebook: () => console.log('Facebook login not implemented yet'),
    signInWithTwitter: () => console.log('Twitter login not implemented yet'),
  };
}

export default useAuth;