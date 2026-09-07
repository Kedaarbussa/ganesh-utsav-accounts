import type { VercelRequest, VercelResponse } from '@vercel/node';
import { extractTokenFromHeader, verifyToken } from '../_lib/auth';
import { connectToDatabase } from '../_lib/db';
import User from '../_models/User';
import { store } from '../_lib/inMemoryStore';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const token = extractTokenFromHeader(req.headers.authorization);
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized. No token provided.' });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ message: 'Unauthorized. Invalid or expired token.' });
  }

  try {
    const db = await connectToDatabase();

    if (db) {
      const user = await User.findById(payload.userId).select('-passwordHash');
      if (!user || !user.isActive) {
        return res.status(401).json({ message: 'User account disabled or not found' });
      }
      return res.status(200).json({
        user: {
          id: user._id.toString(),
          username: user.username,
          fullName: user.fullName,
          role: user.role,
          isActive: user.isActive,
          lastLogin: user.lastLogin,
        },
      });
    } else {
      store.init();
      const user = store.users.find((u) => u._id === payload.userId);
      if (!user || !user.isActive) {
        return res.status(401).json({ message: 'User account disabled or not found' });
      }
      return res.status(200).json({
        user: {
          id: user._id,
          username: user.username,
          fullName: user.fullName,
          role: user.role,
          isActive: user.isActive,
          lastLogin: user.lastLogin,
        },
      });
    }
  } catch (error: any) {
    return res.status(500).json({ message: error.message || 'Internal server error' });
  }
}
