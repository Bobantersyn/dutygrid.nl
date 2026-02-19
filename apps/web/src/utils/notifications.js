import sql from '@/app/api/utils/sql';

/**
 * Send a notification to a specific User ID.
 */
export async function sendNotification({ userId, type = 'info', title, message, link = null }) {
    try {
        if (!userId) return;

        await sql`
      INSERT INTO notifications (user_id, type, title, message, link, created_at)
      VALUES (${userId}, ${type}, ${title}, ${message}, ${link}, NOW())
    `;
        console.log(`[Notification] Sent to User ${userId}: ${title}`);
    } catch (error) {
        console.error('[Notification] Error sending to User:', error);
    }
}

/**
 * Send a notification to an Employee (resolves Employee ID -> User ID).
 */
export async function notifyEmployee({ employeeId, type = 'info', title, message, link = null }) {
    try {
        if (!employeeId) return;

        // Resolve User ID via Employee Email
        // 1. Get Employee Email
        const [employee] = await sql`SELECT email FROM employees WHERE id = ${employeeId}`;
        if (!employee || !employee.email) {
            console.warn(`[Notification] Employee ${employeeId} has no email.`);
            return;
        }

        // 2. Get User ID
        const [user] = await sql`SELECT id FROM auth_users WHERE email = ${employee.email}`;
        if (!user) {
            console.warn(`[Notification] Employee ${employeeId} (${employee.email}) has no Auth User account.`);
            return;
        }

        // 3. Send
        await sendNotification({ userId: user.id, type, title, message, link });
    } catch (error) {
        console.error('[Notification] Error notifying Employee:', error);
    }
}

/**
 * Notify all Planners/Admins (e.g. for Swap Requests).
 */
export async function notifyPlanners({ type = 'info', title, message, link = null }) {
    try {
        // Find all users with role 'planner' or 'admin'
        // We need to join with user_roles
        const users = await sql`
      SELECT u.id 
      FROM auth_users u
      JOIN user_roles r ON u.id = r.user_id
      WHERE r.role IN ('planner', 'admin')
    `;

        for (const user of users) {
            await sendNotification({ userId: user.id, type, title, message, link });
        }
    } catch (error) {
        console.error('[Notification] Error notifying Planners:', error);
    }
}
