import { serve } from '@hono/node-server';
import { app } from './apps/web/__create/index';

serve({ fetch: app.fetch, port: 4000 }, () => {
    console.log('Listening on 4000');
});
