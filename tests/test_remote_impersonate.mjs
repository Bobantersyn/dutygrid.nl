import { SignJWT } from 'jose';
import https from 'https';

const JWT_SECRET = new TextEncoder().encode(
    'dutygrid-secret-key-change-in-production'
);

async function run() {
    // Replicate what the Super Admin Login route does
    const token = await new SignJWT({
        userId: 24, // Assuming the owner is id 24 from my earlier test
        email: 'roland@dutygrid.nl',
        name: 'Roland Antersyn',
        is_super_admin: true,
    })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('12h')
        .sign(JWT_SECRET);

    console.log('Generated token:', token);

    const body = JSON.stringify({ target_user_id: 27 });

    const req = https.request('https://www.dutygrid.nl/api/internal/impersonate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Cookie': `admin_session=${token}`,
            'Content-Length': Buffer.byteLength(body)
        }
    }, (res) => {
        let dat = '';
        res.on('data', d => dat += d);
        res.on('end', () => {
            console.log('Status:', res.statusCode);
            console.log('Response:', dat);
        });
    });

    req.on('error', e => console.error('Error:', e));
    req.write(body);
    req.end();
}

run();
