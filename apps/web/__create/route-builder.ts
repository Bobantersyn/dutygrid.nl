import { Hono } from 'hono';
import type { Handler } from 'hono/types';
import updatedFetch from '../src/__create/fetch';
import { API_BASENAME } from './route-builder';

// Re-export const locally for consistency
const API_BASENAME_LOCAL = '/api';
const api = new Hono();

if (globalThis.fetch) {
  globalThis.fetch = updatedFetch;
}

// Use import.meta.glob to find routes (works in Dev and Prod)
// The path is relative to this file (__create/route-builder.ts)
const routeModules = import.meta.glob('../src/app/api/**/route.js');

function getHonoPath(filePath: string): string {
  // filePath is like "../src/app/api/availability/patterns/route.js"
  // remove prefix "../src/app/api"
  let relativePath = filePath.replace('../src/app/api', '');
  // remove suffix "/route.js" (or "route.js" if at root)
  relativePath = relativePath.replace(/\/route\.js$/, '');

  if (!relativePath) {
    return '/';
  }

  const segments = relativePath.split('/').filter(Boolean);

  const transformedSegments = segments.map((segment) => {
    // Handle [param] and [...param]
    const match = segment.match(/^\[(\.{3})?([^\]]+)\]$/);
    if (match) {
      const [_, dots, param] = match;
      return dots === '...' ? `:${param}{.+}` : `:${param}`;
    }
    return segment;
  });

  const path = '/' + transformedSegments.join('/');
  return path;
}

async function registerRoutes() {
  const routePaths = Object.keys(routeModules);

  // Sort by path length descending (same logic as before)
  // so nested routes are checked before parent routes?
  // Actually, simple string length sort usually puts longer paths first.
  routePaths.sort((a, b) => b.length - a.length);

  for (const filePath of routePaths) {
    try {
      // Import the module
      const routeImport = routeModules[filePath];
      const route: any = await routeImport();

      const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
      for (const method of methods) {
        if (route[method]) {
          const honoPath = getHonoPath(filePath);

          // Create handler
          const handler: Handler = async (c) => {
            const params = c.req.param();
            // We directly call the route handler
            return await route[method](c.req.raw, { params });
          };

          const methodLower = method.toLowerCase();

          switch (methodLower) {
            case 'get': api.get(honoPath, handler); break;
            case 'post': api.post(honoPath, handler); break;
            case 'put': api.put(honoPath, handler); break;
            case 'delete': api.delete(honoPath, handler); break;
            case 'patch': api.patch(honoPath, handler); break;
          }
        }
      }
    } catch (error) {
      console.error(`Error registering route ${filePath}:`, error);
    }
  }
}

// Execute registration
await registerRoutes();

// HMR logic for Dev (optional, Vite handles basic module reloading)
if (import.meta.env.DEV && import.meta.hot) {
  import.meta.hot.accept((newModule) => {
    // Simple reload logic if needed
    // Since we await at top level, full reload might happen anyway, which is fine.
  });
}

export { api, API_BASENAME_LOCAL as API_BASENAME };
