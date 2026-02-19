import sql from '@/app/api/utils/sql';
import { getSession } from '@/utils/session';
import { searchAuditLogs, getRecentAuditLogs } from '@/app/api/utils/audit-logger';

// ... (comments)

export async function GET(request) {
    try {
        // Check authentication
        const session = await getSession(request);
        if (!session?.user?.id) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if user is admin
        const userRoleRows = await sql`
      SELECT role FROM user_roles WHERE user_id = ${session.user.id} LIMIT 1
    `;
        const userRole = userRoleRows[0]?.role;

        if (userRole !== 'admin') {
            return Response.json(
                { error: 'Insufficient permissions. Admin access required.' },
                { status: 403 }
            );
        }

        // Parse query params
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('user_id');
        const action = searchParams.get('action');
        const entityType = searchParams.get('entity_type');
        const startDate = searchParams.get('start_date');
        const endDate = searchParams.get('end_date');
        const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 500);

        // Build filters
        const filters = {};
        if (userId) filters.userId = userId;
        if (action) filters.action = action;
        if (entityType) filters.entityType = entityType;
        if (startDate) filters.startDate = new Date(startDate);
        if (endDate) filters.endDate = new Date(endDate);

        // Get logs
        const logs = Object.keys(filters).length > 0
            ? await searchAuditLogs(filters, limit)
            : await getRecentAuditLogs(limit);

        return Response.json({
            logs,
            count: logs.length,
            filters: Object.keys(filters).length > 0 ? filters : null
        });
    } catch (error) {
        console.error('Error fetching audit logs:', error);
        return Response.json(
            { error: 'Failed to fetch audit logs' },
            { status: 500 }
        );
    }
}
