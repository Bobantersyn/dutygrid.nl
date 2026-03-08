import { SignJWT } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
    'dutygrid-secret-key-change-in-production'
);

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

console.log(token);
