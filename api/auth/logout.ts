import type { VercelRequest, VercelResponse } from '@vercel/node';

async function handler(req: VercelRequest, res: VercelResponse) {
  return res.status(200).json({ message: 'Logged out successfully' });
}

module.exports = handler;
export default handler;
