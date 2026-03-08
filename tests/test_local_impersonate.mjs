import { SignJWT } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
    'dutygrid-secret-key-change-in-production'
);

async function run() {
    const token = await new SignJWT({
        userId: 24,
        email: 'roland@dutygrid.nl',
        name: 'Roland Antersyn',
        is_super_admin: true,
    })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('12h')
        .sign(JWT_SECRET);

    const body = JSON.stringify({ target_user_id: 27 });

    try {
        const res = await fetch('http://127.0.0.1:5005/api/internal/impersonate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': `admin_session=${token}`,
            },
            body: body
        });
        
        console.log('Status:', res.status);
        console.log('Response:', await res.text());
    } catch(e) {
        console.error('Error:', e);
    }
}
run();
