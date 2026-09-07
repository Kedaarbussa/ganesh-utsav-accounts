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

  const { id } = req.query;
  const userId = Array.isArray(id) ? id[0] : id;

  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  const db = await connectToDatabase();

  if (req.method === 'PUT') {
    const { fullName, role, isActive, newPassword } = req.body || {};

    try {
      if (db) {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (fullName) user.fullName = fullName.trim();
        if (role) user.role = role;
        if (typeof isActive === 'boolean') user.isActive = isActive;
        if (newPassword) {
          user.passwordHash = await hashPassword(newPassword);
        }

        await user.save();

        await ActivityLog.create({
          userId: payload.userId,
          userName: payload.fullName,
          action: 'UPDATE_USER',
          entityType: 'USER',
          entityId: userId,
          description: `Updated user ${user.username}`,
        });

        return res.status(200).json({
          id: user._id.toString(),
          fullName: user.fullName,
          username: user.username,
          role: user.role,
          isActive: user.isActive,
        });
      } else {
        await store.init();
        const user = store.users.find((u) => u._id === userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (fullName) user.fullName = fullName.trim();
        if (role) user.role = role;
        if (typeof isActive === 'boolean') user.isActive = isActive;
        if (newPassword) {
          user.passwordHash = await hashPassword(newPassword);
        }

        user.updatedAt = new Date().toISOString();

        store.activityLogs.push({
          _id: 'act_' + Date.now(),
          userId: payload.userId,
          userName: payload.fullName,
          action: 'UPDATE_USER',
          entityType: 'USER',
          entityId: userId,
          description: `Updated user ${user.username}`,
          createdAt: new Date().toISOString(),
        });

        const { passwordHash, ...rest } = user;
        return res.status(200).json(rest);
      }
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  if (req.method === 'DELETE') {
    try {
      if (db) {
        const adminCount = await User.countDocuments({ role: 'ADMIN', isActive: true });
        const userToDelete = await User.findById(userId);

        if (!userToDelete) return res.status(404).json({ message: 'User not found' });

        if (userToDelete.role === 'ADMIN' && adminCount <= 1) {
          return res.status(400).json({ message: 'Cannot delete the last active Admin account.' });
        }

        await User.findByIdAndDelete(userId);

        await ActivityLog.create({
          userId: payload.userId,
          userName: payload.fullName,
          action: 'DELETE_USER',
          entityType: 'USER',
          entityId: userId,
          description: `Deleted user ${userToDelete.username}`,
        });

        return res.status(200).json({ message: 'User deleted successfully' });
      } else {
        await store.init();
        const activeAdmins = store.users.filter((u) => u.role === 'ADMIN' && u.isActive);
        const index = store.users.findIndex((u) => u._id === userId);

        if (index === -1) return res.status(404).json({ message: 'User not found' });
        const userToDelete = store.users[index];

        if (userToDelete.role === 'ADMIN' && activeAdmins.length <= 1) {
          return res.status(400).json({ message: 'Cannot delete the last active Admin account.' });
        }

        store.users.splice(index, 1);

        store.activityLogs.push({
          _id: 'act_' + Date.now(),
          userId: payload.userId,
          userName: payload.fullName,
          action: 'DELETE_USER',
          entityType: 'USER',
          entityId: userId,
          description: `Deleted user ${userToDelete.username}`,
          createdAt: new Date().toISOString(),
        });

        return res.status(200).json({ message: 'User deleted successfully' });
      }
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
