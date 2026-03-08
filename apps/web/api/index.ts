import { handle } from '@hono/node-server/vercel';
import appPromise from '../__create/server';

export default async function (req: any, res: any) {
  const app = await appPromise;
  const handler = handle(app);
  return handler(req, res);
}
