import sql from '@/app/api/utils/sql';
import { getSession } from '@/utils/session';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

/**
 * POST /api/migrations/run
 * 
 * Run database migrations (alleen voor admin)
 * 
 * Body:
 * {
 *   "migration": "001_week1_security" // Migration naam (zonder .sql)
 * }
 */
export async function POST(request) {
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

        const { migration } = await request.json();

        if (!migration) {
            return Response.json(
                { error: 'Migration name required' },
                { status: 400 }
            );
        }

        // Read migration file
        const migrationPath = join(process.cwd(), '..', '..', 'migrations', `${migration}.sql`);

        let migrationSQL;
        try {
            migrationSQL = await readFile(migrationPath, 'utf-8');
        } catch (error) {
            return Response.json(
                { error: `Migration file not found: ${migration}.sql` },
                { status: 404 }
            );
        }

        // Split SQL into individual statements (split on semicolon, but not in strings)
        const statements = migrationSQL
            .split(';')
            .map(s => s?.trim())
            .filter(s => s && s.length > 0 && !s.startsWith('--'));

        console.log(`[Migration] Running ${migration} (${statements.length} statements)`);

        const results = [];
        let successCount = 0;
        let errorCount = 0;

        // Execute each statement
        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];

            // Skip comments
            if (statement.startsWith('--')) continue;

            try {
                await sql.unsafe(statement);
                successCount++;
                results.push({
                    index: i + 1,
                    success: true,
                    preview: statement.substring(0, 100) + (statement.length > 100 ? '...' : '')
                });
                console.log(`[Migration] ✓ Statement ${i + 1} executed`);
            } catch (error) {
                errorCount++;
                results.push({
                    index: i + 1,
                    success: false,
                    error: error.message,
                    preview: statement.substring(0, 100) + (statement.length > 100 ? '...' : '')
                });
                console.error(`[Migration] ✗ Statement ${i + 1} failed:`, error.message);

                // Continue with other statements even if one fails
                // (some might fail if tables already exist, etc.)
            }
        }

        return Response.json({
            migration,
            success: errorCount === 0,
            totalStatements: statements.length,
            successCount,
            errorCount,
            results
        });
    } catch (error) {
        console.error('Error running migration:', error);
        return Response.json(
            { error: 'Failed to run migration', details: error.message },
            { status: 500 }
        );
    }
}

/**
 * GET /api/migrations/run
 * 
 * List available migrations
 */
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

        // List migration files
        const { readdir } = await import('fs/promises');
        const migrationsDir = join(process.cwd(), '..', '..', 'migrations');

        let files;
        try {
            files = await readdir(migrationsDir);
        } catch (error) {
            return Response.json({
                migrations: [],
                message: 'No migrations directory found'
            });
        }

        const migrations = files
            .filter(f => f.endsWith('.sql'))
            .map(f => f.replace('.sql', ''))
            .sort();

        return Response.json({ migrations });
    } catch (error) {
        console.error('Error listing migrations:', error);
        return Response.json(
            { error: 'Failed to list migrations' },
            { status: 500 }
        );
    }
}
