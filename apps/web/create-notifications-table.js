import sql from './src/app/api/utils/sql.js';

async function up() {
    try {
        console.log('📦 Creating notifications table...');

        await sql`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL DEFAULT 'info', -- info, success, warning, error
        title TEXT NOT NULL,
        message TEXT,
        link TEXT, -- Optional URL to navigate to
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

        // Index for faster queries
        await sql`CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id) WHERE is_read = FALSE`;

        console.log('✅ Success: Notifications table created.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }
}

up();
