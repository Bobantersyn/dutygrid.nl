import sql from './src/app/api/utils/sql.js';

async function check() {
    try {
        const [user] = await sql`SELECT id, email FROM auth_users WHERE email = 'jan@dutygrid.nl'`;
        console.log('User:', user);

        if (user) {
            const roles = await sql`SELECT * FROM user_roles WHERE user_id = ${user.id}`;
            console.log('Roles:', roles);
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
