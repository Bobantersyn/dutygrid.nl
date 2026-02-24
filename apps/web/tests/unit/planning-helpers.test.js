import { describe, it, expect, vi, beforeEach } from 'vitest';
import { checkRestTimeViolation, checkWeeklyHours } from '@/app/api/utils/planning-helpers';
import sql from '@/app/api/utils/sql';

// Mock the sql helper
vi.mock('@/app/api/utils/sql', () => {
    return {
        default: vi.fn()
    };
});

describe('planning-helpers.js', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('checkRestTimeViolation', () => {
        it('should return valid: true if there are no existing shifts', async () => {
            sql.mockResolvedValueOnce([]); // No shifts found

            const result = await checkRestTimeViolation(1, '2026-03-01', '08:00', '16:00');
            expect(result.valid).toBe(true);
            expect(result.violation).toBeNull();
        });

        it('should return valid: false if rest time is less than 12 hours from previous shift', async () => {
            // Mock a previous shift ending at 23:00 the day before
            sql.mockResolvedValueOnce([
                {
                    id: 10,
                    employee_id: 1,
                    shift_date: '2026-02-28',
                    start_time: '2026-02-28T15:00:00',
                    end_time: '2026-02-28T23:00:00'
                }
            ]);

            // Attempting a shift at 08:00 next day gives only 9 hours of rest
            const result = await checkRestTimeViolation(1, '2026-03-01', '08:00', '16:00');
            expect(result.valid).toBe(false);
            expect(result.violation.message).toContain('minder dan de verplichte 12 uur');
        });

        it('should return valid: true if rest time is exactly or more than 12 hours', async () => {
            // Mock a previous shift ending at 20:00 the day before
            sql.mockResolvedValueOnce([
                {
                    id: 11,
                    employee_id: 1,
                    shift_date: '2026-02-28',
                    start_time: '2026-02-28T12:00:00',
                    end_time: '2026-02-28T20:00:00'
                }
            ]);

            // Attempting a shift at 08:00 next day gives exactly 12 hours
            const result = await checkRestTimeViolation(1, '2026-03-01', '08:00', '16:00');
            expect(result.valid).toBe(true);
        });
    });

    describe('checkWeeklyHours', () => {
        it('should return valid if weekly hours are within limit', async () => {
            // Mock existing shifts for the week: 3 shifts of 8 hours = 24 hours
            sql.mockResolvedValueOnce([
                { start_time: '2026-03-02T08:00:00Z', end_time: '2026-03-02T16:00:00Z', break_minutes: 30 },
                { start_time: '2026-03-03T08:00:00Z', end_time: '2026-03-03T16:00:00Z', break_minutes: 30 },
                { start_time: '2026-03-04T08:00:00Z', end_time: '2026-03-04T16:00:00Z', break_minutes: 30 }
            ]);

            const maxHours = 36;
            const additionalHours = 8; // Requesting an 8-hour shift

            const result = await checkWeeklyHours(1, '2026-03-05', maxHours, additionalHours);
            // 3 * 7.5 = 22.5 hours existing + 8 = 30.5
            expect(result.valid).toBe(true);
            expect(result.currentHours).toBe(30.5);
            expect(result.maxHours).toBe(36);
        });

        it('should return invalid if weekly hours exceed limit', async () => {
            // Mock existing shifts: 4 shifts of 8 hours = 32 hours existing
            sql.mockResolvedValueOnce([
                { start_time: '2026-03-02T08:00:00Z', end_time: '2026-03-02T16:00:00Z', break_minutes: 0 },
                { start_time: '2026-03-03T08:00:00Z', end_time: '2026-03-03T16:00:00Z', break_minutes: 0 },
                { start_time: '2026-03-04T08:00:00Z', end_time: '2026-03-04T16:00:00Z', break_minutes: 0 },
                { start_time: '2026-03-05T08:00:00Z', end_time: '2026-03-05T16:00:00Z', break_minutes: 0 }
            ]);

            const maxHours = 36;
            const additionalHours = 8; // Requesting another shift -> 40 hours total

            const result = await checkWeeklyHours(1, '2026-03-06', maxHours, additionalHours);
            expect(result.valid).toBe(false);
            expect(result.currentHours).toBe(40);
        });
    });
});
