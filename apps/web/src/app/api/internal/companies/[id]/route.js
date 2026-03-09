import sql from '@/app/api/utils/sql';
import { getSuperAdminSession } from '@/utils/adminSession';

export async function GET(request, { params }) {
    try {
        const session = await getSuperAdminSession(request);
        if (!session) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const companyId = params.id; // Here id refers to the primary owner's user_id

        const owners = await sql`
            SELECT id, email, name, company_name as name, kvk_number, company_size, subscription_status, trial_ends_at, created_at 
            FROM auth_users 
            WHERE id = ${companyId}
            LIMIT 1
        `;

        if (owners.length === 0) {
            return Response.json({ error: 'Company not found' }, { status: 404 });
        }

        // Fetch other users in this company + staging child users
        const stagingDomainSuffix = `@${companyId}.dutygrid-staging.local`;
        const users = await sql`
            SELECT id, email, name, created_at, subscription_status
            FROM auth_users 
            WHERE company_name = ${owners[0].name}
               OR email LIKE '%' || ${stagingDomainSuffix}
        `;

        // Fetch activity logs (gracefully handle if table doesn't exist yet)
        let activity = [];
        try {
            activity = await sql`
                SELECT * FROM activity_log WHERE tenant_id = ${companyId} ORDER BY created_at DESC LIMIT 50
            `;
        } catch (err) {
            console.warn('[Internal Company Detail API] activity_log query failed (table might not exist yet).');
        }

        return Response.json({
            company: owners[0],
            users,
            activity
        });

    } catch (error) {
        console.error('[Internal Company Detail API] Error:', error);
        return Response.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PATCH(request, { params }) {
    try {
        const session = await getSuperAdminSession(request);
        if (!session) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const companyId = params.id;
        const body = await request.json();
        const { action, plan, trial_ends_at, manual_override_active } = body;

        let query;

        if (action === 'update_plan') {
            query = sql`UPDATE auth_users SET subscription_status = ${plan} WHERE id = ${companyId} OR company_name = (SELECT company_name FROM auth_users WHERE id = ${companyId})`;

            // Log the subscription event
            await sql`
                INSERT INTO subscription_events (tenant_id, admin_id, new_plan, action)
                VALUES (${companyId}, ${session.user.id}, ${plan}, 'SUPER_ADMIN_UPDATE')
            `;
        } else if (action === 'extend_trial') {
            query = sql`UPDATE auth_users SET trial_ends_at = ${trial_ends_at} WHERE id = ${companyId} OR company_name = (SELECT company_name FROM auth_users WHERE id = ${companyId})`;
        } else if (action === 'override_limits') {
            // If we add columns for limit overrides later
            // query = sql`UPDATE auth_users SET max_employees_override = ...`
            return Response.json({ message: 'Override not implemented in DB schema yet' });
        }

        if (query) {
            await query;

            // Log audit
            await sql`
                INSERT INTO audit_log (admin_id, tenant_id, action, target_table, target_id)
                VALUES (${session.user.id}, ${companyId}, ${action}, 'auth_users', ${companyId})
            `;
        }

        return Response.json({ success: true });
    } catch (error) {
        console.error('[Internal Company Update API] Error:', error);
        return Response.json({ error: 'Internal server error' }, { status: 500 });
    }
}
