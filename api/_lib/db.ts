import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

import User from '../_models/User';
import Festival from '../_models/Festival';
import CommitteeMember from '../_models/CommitteeMember';
import Fund from '../_models/Fund';
import Sponsorship from '../_models/Sponsorship';
import Expense from '../_models/Expense';
import ActivityLog from '../_models/ActivityLog';

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongooseCache: MongooseCache;
}

let cached = global.mongooseCache;

if (!cached) {
  cached = global.mongooseCache = { conn: null, promise: null };
}

let hasSeeded = false;
let dbConnectionFailed = false;
let lastFailureTime = 0;

async function seedDatabaseIfEmpty() {
  if (hasSeeded) return;
  try {
    const existingAdmin = await User.findOne({ username: 'admin' });
    if (existingAdmin) {
      hasSeeded = true;
      return;
    }

    console.log('MongoDB Atlas database empty. Auto-seeding initial credentials and festival data...');

    const adminPasswordHash = await bcrypt.hash('admin123', 10);
    const memberPasswordHash = await bcrypt.hash('member123', 10);

    const adminUser = await User.create({
      fullName: 'Admin User',
      username: 'admin',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      isActive: true,
    });

    const memberUser = await User.create({
      fullName: 'Ravinder Committee',
      username: 'ravinder',
      passwordHash: memberPasswordHash,
      role: 'COMMITTEE_MEMBER',
      isActive: true,
    });

    const fest = await Festival.create({
      apartmentName: 'CHANAKYA RESIDENCY',
      festivalName: 'GANESH UTSAV',
      year: 2026,
      isActive: true,
    });

    await CommitteeMember.create([
      { festivalId: fest._id, name: 'B. RAVINDER', position: 'President' },
      { festivalId: fest._id, name: 'ANAND JAYA BABU', position: 'Treasurer' },
    ]);

    await Fund.create([
      {
        festivalId: fest._id,
        flatNumber: '101',
        residentName: 'Ravi Kumar',
        amount: 3000,
        paymentMode: 'CASH',
        date: new Date('2026-09-01T10:00:00.000Z'),
        description: 'Festival Contribution',
        createdBy: adminUser._id,
        createdByName: adminUser.fullName,
      },
      {
        festivalId: fest._id,
        flatNumber: '102',
        residentName: 'Arun Sharma',
        amount: 2500,
        paymentMode: 'ONLINE',
        date: new Date('2026-09-02T11:30:00.000Z'),
        description: 'Festival Contribution',
        transactionReference: 'UPI/981273981273',
        createdBy: adminUser._id,
        createdByName: adminUser.fullName,
      },
      {
        festivalId: fest._id,
        flatNumber: '103',
        residentName: 'John Doe',
        amount: 3000,
        paymentMode: 'CASH',
        date: new Date('2026-09-03T14:15:00.000Z'),
        description: 'Festival Contribution',
        createdBy: memberUser._id,
        createdByName: memberUser.fullName,
      },
    ]);

    await Sponsorship.create([
      {
        festivalId: fest._id,
        flatNumber: '503',
        residentName: 'Anand Jaya Babu',
        sponsoredItem: 'Lunch',
        amount: 8000,
        paymentMode: 'ONLINE',
        date: new Date('2026-09-03T09:00:00.000Z'),
        description: 'Grand Mahaprasadam Lunch Sponsorship',
        paymentReference: 'UPI/44129837192',
        createdBy: adminUser._id,
        createdByName: adminUser.fullName,
      },
      {
        festivalId: fest._id,
        flatNumber: '504',
        residentName: 'V. Krishna Mohan',
        sponsoredItem: 'Laddoo',
        amount: 2500,
        paymentMode: 'CASH',
        date: new Date('2026-09-04T16:00:00.000Z'),
        description: 'Special 21KG Laddoo Prasadam',
        createdBy: adminUser._id,
        createdByName: adminUser.fullName,
      },
    ]);

    await Expense.create([
      {
        festivalId: fest._id,
        expenseDescription: 'Ganesh Idol',
        amount: 5500,
        spentBy: 'Ravinder',
        paymentMode: 'CASH',
        date: new Date('2026-08-28T10:00:00.000Z'),
        notes: 'Clay Eco-friendly 5ft Idol from Dhoolpet',
        createdBy: adminUser._id,
        createdByName: adminUser.fullName,
      },
      {
        festivalId: fest._id,
        expenseDescription: 'Decoration',
        amount: 8000,
        spentBy: 'Anand Jaya Babu',
        paymentMode: 'ONLINE',
        date: new Date('2026-08-30T12:00:00.000Z'),
        notes: 'Mandap lights and floral backdrop setup',
        createdBy: adminUser._id,
        createdByName: adminUser.fullName,
      },
      {
        festivalId: fest._id,
        expenseDescription: 'Flowers & Mala',
        amount: 2500,
        spentBy: 'Ravinder',
        paymentMode: 'CASH',
        date: new Date('2026-09-01T07:00:00.000Z'),
        createdBy: memberUser._id,
        createdByName: memberUser.fullName,
      },
    ]);

    await ActivityLog.create({
      festivalId: fest._id,
      userId: adminUser._id,
      userName: adminUser.fullName,
      action: 'SYSTEM_INIT',
      description: 'Initialized Ganesh Utsav 2026 accounting database',
    });

    hasSeeded = true;
    console.log('MongoDB Atlas database auto-seeding completed successfully.');
  } catch (err) {
    console.error('Error auto-seeding database:', err);
  }
}

export async function connectToDatabase() {
  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    return null;
  }

  if (dbConnectionFailed && Date.now() - lastFailureTime < 60000) {
    return null;
  }

  if (!cached.promise) {
    try {
      cached.promise = mongoose
        .connect(MONGODB_URI, {
          serverSelectionTimeoutMS: 2000,
          connectTimeoutMS: 2000,
        })
        .then((instance) => instance)
        .catch((err) => {
          console.error('MongoDB Atlas Connection Error (falling back to in-memory store):', err?.message || err);
          dbConnectionFailed = true;
          lastFailureTime = Date.now();
          return null as any;
        });
    } catch (err: any) {
      console.error('Synchronous Mongoose connection error (falling back to in-memory store):', err?.message || err);
      dbConnectionFailed = true;
      lastFailureTime = Date.now();
      cached.promise = Promise.resolve(null as any);
    }
  }

  try {
    const conn = await cached.promise;
    if (conn && mongoose.connection.readyState === 1) {
      cached.conn = conn;
      dbConnectionFailed = false;
      await seedDatabaseIfEmpty();
      return cached.conn;
    }
    cached.promise = null;
    cached.conn = null;
    dbConnectionFailed = true;
    lastFailureTime = Date.now();
    return null;
  } catch (e: any) {
    cached.promise = null;
    cached.conn = null;
    dbConnectionFailed = true;
    lastFailureTime = Date.now();
    console.error('Failed to connect to MongoDB Atlas (falling back to in-memory store):', e?.message || e);
    return null;
  }
}


