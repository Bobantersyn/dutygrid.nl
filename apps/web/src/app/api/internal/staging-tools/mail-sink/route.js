import sql from '@/app/api/utils/sql';
import { requireStagingEnvironment } from '../guard.js';

export async function GET(request) {
    try {
        requireStagingEnvironment();

        // Fetch last 50 caught emails
        const emails = await sql`
            SELECT 
                id, 
                recipient_email AS to_email, 
                subject, 
                body_text AS body, 
                created_at AS sent_at 
            FROM staging_mail_sink
            ORDER BY created_at DESC
            LIMIT 50
        `;

        return Response.json({ success: true, emails });

    } catch (error) {
        console.error('[MailSink API] Error:', error);
        return Response.json({ error: 'Fout bij ophalen emails.' }, { status: 500 });
    }
}
