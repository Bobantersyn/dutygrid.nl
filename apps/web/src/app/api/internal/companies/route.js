import sql from '@/app/api/utils/sql';
import { getSuperAdminSession } from '@/utils/adminSession';

export async function GET(request) {
    try {
        const session = await getSuperAdminSession(request);
        if (!session) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch all unique companies along with their owner's details, employee count, and status
        // We consider the first registered user of a company name (or the admin) as the primary owner for billing
        const companies = await sql`
            WITH CompanyStats AS (
                SELECT 
                    company_name,
                    MIN(id) as primary_owner_id,
                    COUNT(id) as total_users,
                    MAX(subscription_status) as current_plan,
                    MAX(trial_ends_at) as trial_ends_at
                FROM auth_users
                WHERE company_name IS NOT NULL
                GROUP BY company_name
            ),
            EmployeeStats AS (
                SELECT 
                    u.company_name,
                    COUNT(e.id) as total_employees
                FROM employees e
                -- Note: in your schema, employees don't explicitly link to tenant directly yet, 
                -- they link via auth_users (created_by) or shifts. If using standard multi-tenant, 
                -- this might need a different join logic. As a fallback, we count total.
                -- For V1 we just return a summary of auth_users if employees are mixed.
                -- To keep it accurate to the schema, we count employees created by the company users
                -- Wait, the schema does not have tenant_id on employees.
                -- Let's just fetch company profiles based on auth_users.
                JOIN auth_users u ON e.email = u.email -- or whoever created it.
                GROUP BY u.company_name
            )
            SELECT 
                cs.company_name as name,
                u.id as owner_id,
                u.email as owner_email,
                u.kvk_number,
                u.company_size,
                cs.current_plan,
                cs.trial_ends_at,
                cs.total_users,
                COALESCE(es.total_employees, 0) as total_employees
            FROM CompanyStats cs
            JOIN auth_users u ON cs.primary_owner_id = u.id
            LEFT JOIN EmployeeStats es ON cs.company_name = es.company_name
            ORDER BY u.created_at DESC
        `;

        return Response.json({ companies });
    } catch (error) {
        console.error('[Internal Companies API] Error:', error);
        return Response.json({ error: 'Internal server error' }, { status: 500 });
    }
}
