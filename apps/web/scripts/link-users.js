const { sql } = require('@vercel/postgres');

async function main() {
    await sql`
    UPDATE user_roles ur
    SET employee_id = e.id
    FROM auth_users u
    JOIN employees e ON u.email = e.email
    WHERE ur.user_id = u.id AND ur.employee_id IS NULL AND ur.role IN ('planner', 'admin', 'beveiliger', 'beveiliger_extended')
  `;
    console.log('Linked existing users to employees via email');
    process.exit(0);
}
main().catch(console.error);
