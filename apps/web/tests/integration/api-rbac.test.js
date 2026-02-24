import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET as getShifts } from '@/app/api/shifts/route';
import { POST as generatePlanning } from '@/app/api/planning/generate/route';
import sql from '@/app/api/utils/sql';
import * as sessionModule from '@/utils/session';

vi.mock('@/app/api/utils/sql', () => ({
    default: vi.fn()
}));

vi.mock('@/utils/session', () => ({
    getSession: vi.fn()
}));

// Mock Next.js Request
class MockRequest {
    constructor(url, method = 'GET', body = null) {
        this.url = url;
        this.method = method;
        this._body = body;
    }
    async json() {
        return this._body;
    }
}

describe('API Integration - RBAC Enforcement', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('GET /api/shifts', () => {
        it('should return 401 if user is not authenticated', async () => {
            sessionModule.getSession.mockResolvedValueOnce(null);

            const req = new MockRequest('http://localhost/api/shifts');
            const res = await getShifts(req);

            expect(res.status).toBe(401);
        });

        it('should return 403 if user has no assigned role', async () => {
            sessionModule.getSession.mockResolvedValueOnce({ user: { id: 1 } });
            sql.mockResolvedValueOnce([]); // No role found in DB

            const req = new MockRequest('http://localhost/api/shifts');
            const res = await getShifts(req);

            expect(res.status).toBe(403);
            const data = await res.json();
            expect(data.error).toContain('User role not found');
        });

        it('should fetch all shifts if user is admin', async () => {
            sessionModule.getSession.mockResolvedValueOnce({ user: { id: 1 } });
            sql.mockResolvedValueOnce([{ role: 'admin', employee_id: 1 }]); // User is admin
            sql.mockResolvedValueOnce([{ id: 100, assignment_id: 1 }]); // Dummy shift response

            const req = new MockRequest('http://localhost/api/shifts');
            const res = await getShifts(req);

            expect(res.status).toBe(200);
            const data = await res.json();
            expect(data.shifts).toHaveLength(1);
        });
    });

    describe('POST /api/planning/generate', () => {
        it('should return 403 if user is a standard employee', async () => {
            sessionModule.getSession.mockResolvedValueOnce({ user: { id: 1 } });
            sql.mockResolvedValueOnce([{ role: 'beveiliger', employee_id: 1 }]); // User is beveiliger

            const req = new MockRequest('http://localhost/api/planning/generate', 'POST', { start_date: '2026-03-01', end_date: '2026-03-07' });
            const res = await generatePlanning(req);

            expect(res.status).toBe(403);
            const data = await res.json();
            expect(data.error).toContain('Insufficient permissions');
        });
    });
});
