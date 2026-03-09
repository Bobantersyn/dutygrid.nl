import { sendEmail } from './src/app/api/utils/mailer.js';

async function run() {
    try {
        await sendEmail({
            to: "mailtest1@123.dutygrid-staging.local",
            subject: "Test Subject",
            bodyText: "Test Body",
            tenantId: 1
        });
        console.log("Email sent and hopefully intercepted.");
    } catch(e) {
        console.error(e);
    }
}
run();
