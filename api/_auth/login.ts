import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectToDatabase } from '../_lib/db';
import User from '../_models/User';
import ActivityLog from '../_models/ActivityLog';
import { comparePassword, signToken } from '../_lib/auth';
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

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch (e) {
      body = {};
    }
  }

  const { username, password } = body || {};

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  try {
    const db = await connectToDatabase();
    
    if (db) {
      const user = await User.findOne({ username: username.toLowerCase().trim() });
      if (!user) {
        return res.status(401).json({ message: 'Invalid username or password' });
      }

      if (!user.isActive) {
        return res.status(403).json({ message: 'Account is disabled. Contact Admin.' });
      }

      const isMatch = await comparePassword(password, user.passwordHash);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid username or password' });
      }

      user.lastLogin = new Date();
      await user.save();

      const token = signToken({
        userId: user._id.toString(),
        username: user.username,
        fullName: user.fullName,
        role: user.role,
      });

      await ActivityLog.create({
        userId: user._id,
        userName: user.fullName,
        action: 'LOGIN',
        description: `User ${user.username} logged in successfully`,
      });

      return res.status(200).json({
        token,
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
      // In-Memory Mode
      store.init();
      const user = store.users.find(u => u.username.toLowerCase() === username.toLowerCase().trim());
      if (!user) {
        return res.status(401).json({ message: 'Invalid username or password' });
      }

      if (!user.isActive) {
        return res.status(403).json({ message: 'Account is disabled. Contact Admin.' });
      }

      const isMatch = await comparePassword(password, user.passwordHash);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid username or password' });
      }

      user.lastLogin = new Date().toISOString();

      const token = signToken({
        userId: user._id,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
      });

      store.activityLogs.push({
        _id: 'act_' + Date.now(),
        userId: user._id,
        userName: user.fullName,
        action: 'LOGIN',
        description: `User ${user.username} logged in successfully`,
        createdAt: new Date().toISOString(),
      });

      return res.status(200).json({
        token,
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
    console.error('Login error:', error);
    return res.status(500).json({ message: error.message || 'Internal server error' });
  }
}
