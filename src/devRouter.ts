import type { IncomingMessage, ServerResponse } from 'http';
import app from '../api/index';

export function handleDevApiRequest(req: IncomingMessage, res: ServerResponse) {
  return (app as any)(req, res);
}
