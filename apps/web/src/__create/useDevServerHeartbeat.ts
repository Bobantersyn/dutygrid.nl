'use client';

export function useDevServerHeartbeat() {
  if (import.meta.env?.PROD) return;
  // We disable the idle timer for now because it causes Vercel 500 errors
  // due to ESM interop issues on Edge.
}
