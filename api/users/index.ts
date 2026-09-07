import type { VercelRequest, VercelResponse } from '@vercel/node';
import { extractTokenFromHeader, hashPassword, verifyToken } from '../_lib/auth';
import { connectToDatabase } from '../_lib/db';
import User from '../_models/User';
import ActivityLog from '../_models/ActivityLog';
import { store } from '../_lib/inMemoryStore';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const token = extractTokenFromHeader(req.headers.authorization);
  const payload = verifyToken(token || '');

  if (!payload || payload.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Forbidden. Admin access required.' });
  }

  const db = await connectToDatabase();

  if (req.method === 'GET') {
    try {
      if (db) {
        const users = await User.find().select('-passwordHash').sort({ createdAt: -1 });
        return res.status(200).json(users);
      } else {
        await store.init();
        const users = store.users.map(({ passwordHash, ...rest }) => rest);
        return res.status(200).json(users);
      }
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  if (req.method === 'POST') {
    const { fullName, username, password, role } = req.body || {};

    if (!fullName || !username || !password) {
      return res.status(400).json({ message: 'Full name, username, and password are required' });
    }

    try {
      const userRole: 'ADMIN' | 'COMMITTEE_MEMBER' = role === 'ADMIN' ? 'ADMIN' : 'COMMITTEE_MEMBER';
      const pHash = await hashPassword(password);
      const cleanUsername = username.toLowerCase().trim();

      if (db) {
        const existing = await User.findOne({ username: cleanUsername });
        if (existing) {
          return res.status(400).json({ message: 'Username is already taken' });
        }

        const newUser = await User.create({
          fullName: fullName.trim(),
          username: cleanUsername,
          passwordHash: pHash,
          role: userRole,
          isActive: true,
        });

        await ActivityLog.create({
          userId: payload.userId,
          userName: payload.fullName,
          action: 'CREATE_USER',
          entityType: 'USER',
          entityId: newUser._id.toString(),
          description: `Created user ${newUser.username} (${userRole})`,
        });

        return res.status(201).json({
          id: newUser._id.toString(),
          fullName: newUser.fullName,
          username: newUser.username,
          role: newUser.role,
          isActive: newUser.isActive,
          createdAt: newUser.createdAt,
        });
      } else {
        await store.init();
        const existing = store.users.find(u => u.username.toLowerCase() === cleanUsername);
        if (existing) {
          return res.status(400).json({ message: 'Username is already taken' });
        }

        const newUser = {
          _id: 'usr_' + Date.now(),
          fullName: fullName.trim(),
          username: cleanUsername,
          passwordHash: pHash,
          role: userRole,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        store.users.unshift(newUser);

        store.activityLogs.push({
          _id: 'act_' + Date.now(),
          userId: payload.userId,
          userName: payload.fullName,
          action: 'CREATE_USER',
          entityType: 'USER',
          entityId: newUser._id,
          description: `Created user ${newUser.username} (${userRole})`,
          createdAt: new Date().toISOString(),
        });

        const { passwordHash, ...rest } = newUser;
        return res.status(201).json(rest);
      }
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
