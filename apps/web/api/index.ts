import { handle } from 'hono/vercel';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { bodyLimit } from 'hono/body-limit';
import { requestId } from 'hono/request-id';
import { contextStorage } from 'hono/context-storage';
import { serializeError } from 'serialize-error';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { skipCSRFCheck } from '@auth/core';
import Credentials from '@auth/core/providers/credentials';
import { authHandler, initAuthConfig } from '@hono/auth-js';
import { hash, verify } from 'argon2';
import ws from 'ws';
import NeonAdapter from '../__create/adapter';
import { getHTMLForErrorPage } from '../__create/get-html-for-error-page';
import { isAuthAction } from '../__create/is-auth-action';
import { API_BASENAME, api } from '../__create/route-builder';
import { AsyncLocalStorage } from 'node:async_hooks';

neonConfig.webSocketConstructor = ws;

const als = new AsyncLocalStorage<{ requestId: string }>();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = NeonAdapter(pool);

const app = new Hono();

app.use('*', requestId());
app.use('*', (c, next) => {
    const requestId = c.get('requestId');
    return als.run({ requestId }, () => next());
});
app.use(contextStorage());

app.onError((err, c) => {
    if (c.req.method !== 'GET') {
        return c.json({ error: 'An error occurred in your app', details: serializeError(err) }, 500);
    }
    return c.html(getHTMLForErrorPage(err), 200);
});

if (process.env.CORS_ORIGINS) {
    app.use('/*', cors({ origin: process.env.CORS_ORIGINS.split(',').map((origin) => origin.trim()) }));
}

for (const method of ['post', 'put', 'patch'] as const) {
    app[method](
        '*',
        bodyLimit({ maxSize: 4.5 * 1024 * 1024, onError: (c) => c.json({ error: 'Body size limit exceeded' }, 413) })
    );
}

if (process.env.AUTH_SECRET) {
    app.use(
        '*',
        initAuthConfig((c) => ({
            secret: c.env.AUTH_SECRET,
            pages: { signIn: '/account/signin', signOut: '/account/logout' },
            skipCSRFCheck,
            session: { strategy: 'jwt' },
            callbacks: {
                session({ session, token }) {
                    if (token.sub) session.user.id = token.sub;
                    return session;
                },
            },
            cookies: {
                csrfToken: { options: { secure: true, sameSite: 'none' } },
                sessionToken: { options: { secure: true, sameSite: 'none' } },
                callbackUrl: { options: { secure: true, sameSite: 'none' } },
            },
            providers: [
                Credentials({
                    id: 'credentials-signin',
                    name: 'Credentials Sign in',
                    credentials: { email: { label: 'Email', type: 'email' }, password: { label: 'Password', type: 'password' } },
                    authorize: async (credentials) => {
                        const { email, password } = credentials;
                        if (!email || !password || typeof email !== 'string' || typeof password !== 'string') return null;
                        const user = await adapter.getUserByEmail(email);
                        if (!user) return null;
                        const matchingAccount = user.accounts.find((account) => account.provider === 'credentials');
                        const accountPassword = matchingAccount?.password;
                        if (!accountPassword) return null;
                        const isValid = await verify(accountPassword, password);
                        if (!isValid) return null;
                        return user;
                    },
                }),
                Credentials({
                    id: 'credentials-signup',
                    name: 'Credentials Sign up',
                    credentials: {
                        email: { label: 'Email', type: 'email' },
                        password: { label: 'Password', type: 'password' },
                        name: { label: 'Name', type: 'text' },
                        image: { label: 'Image', type: 'text', required: false },
                    },
                    authorize: async (credentials) => {
                        const { email, password, name, image } = credentials;
                        if (!email || !password || typeof email !== 'string' || typeof password !== 'string') return null;
                        const user = await adapter.getUserByEmail(email);
                        if (!user) {
                            const newUser = await adapter.createUser({
                                id: crypto.randomUUID(),
                                emailVerified: null,
                                email,
                                name: typeof name === 'string' && name.length > 0 ? name : undefined,
                                image: typeof image === 'string' && image.length > 0 ? image : undefined,
                            });
                            await adapter.linkAccount({
                                extraData: { password: await hash(password) },
                                type: 'credentials',
                                userId: newUser.id,
                                providerAccountId: newUser.id,
                                provider: 'credentials',
                            });
                            return newUser;
                        }
                        return null;
                    },
                }),
            ],
        }))
    );
}

app.use('/api/auth/*', async (c, next) => {
    if (isAuthAction(c.req.path)) {
        return authHandler()(c, next);
    }
    return next();
});

app.route(API_BASENAME, api);

const vApp = handle(app);
export const GET = vApp;
export const POST = vApp;
export const PUT = vApp;
export const PATCH = vApp;
export const DELETE = vApp;
export const OPTIONS = vApp;
