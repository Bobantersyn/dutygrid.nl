import { hash } from 'argon2';
import sql from './src/app/api/utils/sql.js';

async function createTestUser() {
  const email = 'test@dutygrid.nl';
  const password = 'password123';
  const name = 'Test Beveiliger';
  const role = 'security_guard';

  console.log(`Creating test user: ${email} / ${password} ...`);

  try {
    // 1. Create/Get User
    const [user] = await sql`
      INSERT INTO auth_users (email, name, "emailVerified")
      VALUES (${email}, ${name}, NOW())
      ON CONFLICT (email) DO UPDATE SET name = ${name}
      RETURNING id, email
    `;
    console.log('User ID:', user.id);

    // 2. Create/Update Account (Password)
    const hashedPassword = await hash(password);
    await sql`
      INSERT INTO auth_accounts ("userId", type, provider, "providerAccountId", password)
      VALUES (${user.id}, 'credentials', 'credentials', ${email}, ${hashedPassword})
      ON CONFLICT ("provider", "providerAccountId") 
      DO UPDATE SET password = ${hashedPassword}
    `;
    console.log('Account/Password set.');

    // 3. Create/Get Employee
    const [employee] = await sql`
      INSERT INTO employees (name, email, status, max_hours_per_week, max_hours_per_day)
      VALUES (${name}, ${email}, 'active', 40, 8)
      ON CONFLICT (email) DO UPDATE SET status = 'active'
      RETURNING id
    `;
    console.log('Employee ID:', employee.id);

    // 4. Assign Role
    const roles = await sql`SELECT id FROM user_roles WHERE user_id = ${user.id} AND role = ${role}`;
    if (roles.length === 0) {
      await sql`
        INSERT INTO user_roles (user_id, employee_id, role)
        VALUES (${user.id}, ${employee.id}, ${role})
        `;
      console.log(`Role '${role}' assigned.`);
    } else {
      await sql`UPDATE user_roles SET employee_id = ${employee.id} WHERE id = ${roles[0].id}`;
      console.log(`Role '${role}' updated.`);
    }

    console.log('✅ Success! You can now login.');
    process.exit(0);

  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

createTestUser();
