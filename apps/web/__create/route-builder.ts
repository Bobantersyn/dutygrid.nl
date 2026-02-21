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

const routeModules: Record<string, () => Promise<any>> = {
  "../src/app/api/assignments/route.js": () => import("../src/app/api/assignments/route.js"),
  "../src/app/api/audit/route.js": () => import("../src/app/api/audit/route.js"),
  "../src/app/api/cao-types/route.js": () => import("../src/app/api/cao-types/route.js"),
  "../src/app/api/clients/route.js": () => import("../src/app/api/clients/route.js"),
  "../src/app/api/debug-constraints/route.js": () => import("../src/app/api/debug-constraints/route.js"),
  "../src/app/api/debug-schema/route.js": () => import("../src/app/api/debug-schema/route.js"),
  "../src/app/api/employees/route.js": () => import("../src/app/api/employees/route.js"),
  "../src/app/api/hours/route.js": () => import("../src/app/api/hours/route.js"),
  "../src/app/api/leave/route.js": () => import("../src/app/api/leave/route.js"),
  "../src/app/api/notifications/route.js": () => import("../src/app/api/notifications/route.js"),
  "../src/app/api/planning-gaps/route.js": () => import("../src/app/api/planning-gaps/route.js"),
  "../src/app/api/quick-login/route.js": () => import("../src/app/api/quick-login/route.js"),
  "../src/app/api/shift-swaps/route.js": () => import("../src/app/api/shift-swaps/route.js"),
  "../src/app/api/shifts/route.js": () => import("../src/app/api/shifts/route.js"),
  "../src/app/api/system-settings/route.js": () => import("../src/app/api/system-settings/route.js"),
  "../src/app/api/test-create-beveiliger/route.js": () => import("../src/app/api/test-create-beveiliger/route.js"),
  "../src/app/api/user-role/route.js": () => import("../src/app/api/user-role/route.js"),
  "../src/app/api/admin/users/route.js": () => import("../src/app/api/admin/users/route.js"),
  "../src/app/api/assignments/[id]/route.js": () => import("../src/app/api/assignments/[id]/route.js"),
  "../src/app/api/availability/check/route.js": () => import("../src/app/api/availability/check/route.js"),
  "../src/app/api/availability/exceptions/route.js": () => import("../src/app/api/availability/exceptions/route.js"),
  "../src/app/api/availability/patterns/route.js": () => import("../src/app/api/availability/patterns/route.js"),
  "../src/app/api/availability/saved-patterns/route.js": () => import("../src/app/api/availability/saved-patterns/route.js"),
  "../src/app/api/availability/week-overview/route.js": () => import("../src/app/api/availability/week-overview/route.js"),
  "../src/app/api/cao-types/[id]/route.js": () => import("../src/app/api/cao-types/[id]/route.js"),
  "../src/app/api/clients/[id]/route.js": () => import("../src/app/api/clients/[id]/route.js"),
  "../src/app/api/custom-auth/login/route.js": () => import("../src/app/api/custom-auth/login/route.js"),
  "../src/app/api/custom-auth/logout/route.js": () => import("../src/app/api/custom-auth/logout/route.js"),
  "../src/app/api/custom-auth/session/route.js": () => import("../src/app/api/custom-auth/session/route.js"),
  "../src/app/api/employees/[id]/route.js": () => import("../src/app/api/employees/[id]/route.js"),
  "../src/app/api/employees/availability-overview/route.js": () => import("../src/app/api/employees/availability-overview/route.js"),
  "../src/app/api/hours/export/route.js": () => import("../src/app/api/hours/export/route.js"),
  "../src/app/api/leave/[id]/route.js": () => import("../src/app/api/leave/[id]/route.js"),
  "../src/app/api/migrations/run/route.js": () => import("../src/app/api/migrations/run/route.js"),
  "../src/app/api/notifications/unread-count/route.js": () => import("../src/app/api/notifications/unread-count/route.js"),
  "../src/app/api/planning/availability-check/route.js": () => import("../src/app/api/planning/availability-check/route.js"),
  "../src/app/api/planning/suggest/route.js": () => import("../src/app/api/planning/suggest/route.js"),
  "../src/app/api/reports/hours/route.js": () => import("../src/app/api/reports/hours/route.js"),
  "../src/app/api/shift-swaps/[id]/route.js": () => import("../src/app/api/shift-swaps/[id]/route.js"),
  "../src/app/api/shifts/[id]/route.js": () => import("../src/app/api/shifts/[id]/route.js"),
  "../src/app/api/availability/exceptions/batch/route.js": () => import("../src/app/api/availability/exceptions/batch/route.js"),
  "../src/app/api/reports/hours/export/route.js": () => import("../src/app/api/reports/hours/export/route.js"),
  "../src/app/api/shift-swaps/suggestions/[shift_id]/route.js": () => import("../src/app/api/shift-swaps/suggestions/[shift_id]/route.js"),
  "../src/app/api/shifts/[id]/approve-override/route.js": () => import("../src/app/api/shifts/[id]/approve-override/route.js"),
  "../src/app/api/availability/exceptions/batch/delete/route.js": () => import("../src/app/api/availability/exceptions/batch/delete/route.js"),
  "../src/app/api/reports/billing/route.js": () => import("../src/app/api/reports/billing/route.js"),
  "../src/app/api/reports/billing/export/route.js": () => import("../src/app/api/reports/billing/export/route.js")
};

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
