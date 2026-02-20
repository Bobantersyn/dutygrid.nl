'use client';

import * as idleTimerPkg from 'react-idle-timer';

export function useDevServerHeartbeat() {
  const useIdleTimer = idleTimerPkg.useIdleTimer || (idleTimerPkg as any).default?.useIdleTimer || (idleTimerPkg as any);

  if (typeof useIdleTimer !== 'function') return;

  useIdleTimer({
    throttle: 60_000 * 3,
    timeout: 60_000,
    onAction: () => {
      // HACK: at time of writing, we run the dev server on a proxy url that
      // when requested, ensures that the dev server's life is extended. If
      // the user is using a page or is active in it in the app, but when the
      // user has popped out their preview, they no longer can rely on the
      // app to do this. This hook ensures it stays alive.
      fetch('/', {
        method: 'GET',
      }).catch((error) => {
        // this is a no-op, we just want to keep the dev server alive
      });
    },
  });
}
