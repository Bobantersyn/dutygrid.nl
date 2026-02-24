import { useCallback, useEffect, useState } from 'react';
import { useAuthContext } from "@/providers/AuthProvider";

function useAuth() {
  const context = useAuthContext();

  return {
    user: context.user,
    loading: context.userLoading,
    signInWithCredentials: context.signInWithCredentials,
    signOut: context.signOut,
    // Keep these placeholders if needed for compatibility, or remove if unused
    signInWithGoogle: () => console.log('Google login not implemented yet'),
    signInWithFacebook: () => console.log('Facebook login not implemented yet'),
    signInWithTwitter: () => console.log('Twitter login not implemented yet'),
  };
}

export default useAuth;