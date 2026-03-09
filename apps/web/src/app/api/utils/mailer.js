import sql from '@/app/api/utils/sql';

/**
 * Universal internal mail sender.
 * 
 * If NODE_ENV is staging or VERCEL_ENV is preview, it dynamically routes all emails
 * to the `staging_mail_sink` database table instead of actually emailing people.
 * This ensures testers can read welcome emails without receiving actual spam.
 */
export async function sendEmail({ to, subject, bodyText, bodyHtml, tenantId = null }) {
    const isStaging = process.env.NODE_ENV === 'staging' || process.env.STAGING === 'true' || process.env.VERCEL_ENV !== 'production';

    if (isStaging) {
        console.log(`[Staging Mailer] Intercepted email to ${to}: ${subject}`);
        try {
            await sql`
                INSERT INTO staging_mail_sink (tenant_id, recipient_email, subject, body_text, body_html, metadata)
                VALUES (${tenantId}, ${to}, ${subject}, ${bodyText}, ${bodyHtml || null}, ${JSON.stringify({ interceptTime: new Date().toISOString() })})
            `;
            return { success: true, intercepted: true };
        } catch (e) {
            console.error('[Staging Mailer] Failed to write to mail sink:', e);
            throw e;
        }
    }

    // --- production email sending logic would go here (e.g. Resend, Sendgrid) ---
    // For now, DutyGrid might not have a production mailer physically wired in this repo
    console.log(`[Production Mailer - DRY RUN] Would send email to ${to}: ${subject}`);

    return { success: true, intercepted: false };
}
