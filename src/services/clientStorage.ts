import { User, Festival, Fund, Sponsorship, Expense, CommitteeMember, ActivityLog, DashboardSummary, FinalReportData } from '../types';

const STORAGE_KEY = 'ganesh_utsav_accounts_db_v2';

interface StorageSchema {
  users: User[];
  festivals: Festival[];
  committeeMembers: CommitteeMember[];
  funds: Fund[];
  sponsorships: Sponsorship[];
  expenses: Expense[];
  activityLogs: ActivityLog[];
}

// Initial seed dataset
function getInitialData(): StorageSchema {
  const adminId = 'usr_admin_001';
  const memberId = 'usr_member_002';
  const festId = 'fest_2026_001';

  return {
    users: [
      {
        id: adminId,
        _id: adminId,
        fullName: 'Admin User',
        username: 'admin',
        role: 'ADMIN',
        isActive: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: memberId,
        _id: memberId,
        fullName: 'Ravinder Committee',
        username: 'ravinder',
        role: 'COMMITTEE_MEMBER',
        isActive: true,
        createdAt: new Date().toISOString(),
      },
    ],
    festivals: [
      {
        _id: festId,
        apartmentName: 'CHANAKYA RESIDENCY',
        festivalName: 'GANESH UTSAV',
        year: 2026,
        isActive: true,
        createdAt: new Date().toISOString(),
      },
      {
        _id: 'fest_2025_002',
        apartmentName: 'CHANAKYA RESIDENCY',
        festivalName: 'GANESH UTSAV',
        year: 2025,
        isActive: false,
        createdAt: new Date().toISOString(),
      },
    ],
    committeeMembers: [
      {
        _id: 'cm_001',
        festivalId: festId,
        name: 'B. RAVINDER',
        position: 'President',
      },
      {
        _id: 'cm_002',
        festivalId: festId,
        name: 'ANAND JAYA BABU',
        position: 'Treasurer',
      },
    ],
    funds: [
      {
        _id: 'fnd_001',
        festivalId: festId,
        flatNumber: '101',
        residentName: 'Ravi Kumar',
        amount: 3000,
        paymentMode: 'CASH',
        date: '2026-09-01T10:00:00.000Z',
        description: 'Festival Contribution',
        createdBy: adminId,
        createdByName: 'Admin User',
        createdAt: new Date().toISOString(),
      },
      {
        _id: 'fnd_002',
        festivalId: festId,
        flatNumber: '102',
        residentName: 'Arun Sharma',
        amount: 2500,
        paymentMode: 'ONLINE',
        date: '2026-09-02T11:30:00.000Z',
        description: 'Festival Contribution',
        transactionReference: 'UPI/981273981273',
        createdBy: adminId,
        createdByName: 'Admin User',
        createdAt: new Date().toISOString(),
      },
      {
        _id: 'fnd_003',
        festivalId: festId,
        flatNumber: '103',
        residentName: 'John Doe',
        amount: 3000,
        paymentMode: 'CASH',
        date: '2026-09-03T14:15:00.000Z',
        description: 'Festival Contribution',
        createdBy: memberId,
        createdByName: 'Ravinder Committee',
        createdAt: new Date().toISOString(),
      },
    ],
    sponsorships: [
      {
        _id: 'spn_001',
        festivalId: festId,
        flatNumber: '503',
        residentName: 'Anand Jaya Babu',
        sponsoredItem: 'Lunch',
        amount: 8000,
        paymentMode: 'ONLINE',
        date: '2026-09-03T09:00:00.000Z',
        description: 'Grand Mahaprasadam Lunch Sponsorship',
        paymentReference: 'UPI/44129837192',
        createdBy: adminId,
        createdByName: 'Admin User',
        createdAt: new Date().toISOString(),
      },
      {
        _id: 'spn_002',
        festivalId: festId,
        flatNumber: '504',
        residentName: 'V. Krishna Mohan',
        sponsoredItem: 'Laddoo',
        amount: 2500,
        paymentMode: 'CASH',
        date: '2026-09-04T16:00:00.000Z',
        description: 'Special 21KG Laddoo Prasadam',
        createdBy: adminId,
        createdByName: 'Admin User',
        createdAt: new Date().toISOString(),
      },
    ],
    expenses: [
      {
        _id: 'exp_001',
        festivalId: festId,
        expenseDescription: 'Ganesh Idol',
        amount: 5500,
        spentBy: 'Ravinder',
        paymentMode: 'CASH',
        date: '2026-08-28T10:00:00.000Z',
        notes: 'Clay Eco-friendly 5ft Idol from Dhoolpet',
        createdBy: adminId,
        createdByName: 'Admin User',
        createdAt: new Date().toISOString(),
      },
      {
        _id: 'exp_002',
        festivalId: festId,
        expenseDescription: 'Decoration',
        amount: 8000,
        spentBy: 'Anand Jaya Babu',
        paymentMode: 'ONLINE',
        date: '2026-08-30T12:00:00.000Z',
        notes: 'Mandap lights and floral backdrop setup',
        createdBy: adminId,
        createdByName: 'Admin User',
        createdAt: new Date().toISOString(),
      },
      {
        _id: 'exp_003',
        festivalId: festId,
        expenseDescription: 'Flowers & Mala',
        amount: 2500,
        spentBy: 'Ravinder',
        paymentMode: 'CASH',
        date: '2026-09-01T07:00:00.000Z',
        createdBy: memberId,
        createdByName: 'Ravinder Committee',
        createdAt: new Date().toISOString(),
      },
      {
        _id: 'exp_004',
        festivalId: festId,
        expenseDescription: 'Water Cans',
        amount: 600,
        spentBy: 'Anand',
        paymentMode: 'CASH',
        date: '2026-09-02T08:00:00.000Z',
        createdBy: adminId,
        createdByName: 'Admin User',
        createdAt: new Date().toISOString(),
      },
    ],
    activityLogs: [
      {
        _id: 'act_001',
        festivalId: festId,
        userId: adminId,
        userName: 'Admin User',
        action: 'SYSTEM_INIT',
        description: 'Initialized Ganesh Utsav 2026 accounting system',
        createdAt: new Date().toISOString(),
      },
    ],
  };
}

class ClientStorageEngine {
  private db: StorageSchema;

  constructor() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        this.db = JSON.parse(raw);
      } catch (e) {
        this.db = getInitialData();
        this.save();
      }
    } else {
      this.db = getInitialData();
      this.save();
    }
  }

  private save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.db));
  }

  // --- AUTH ---
  login(username: string, password: string): { token: string; user: User } {
    const u = username.toLowerCase().trim();
    const user = this.db.users.find((x) => x.username.toLowerCase() === u);

    if (!user) {
      throw new Error('Invalid username or password');
    }

    if (!user.isActive) {
      throw new Error('Account is disabled. Contact Admin.');
    }

    // Password verification for demo accounts
    if (u === 'admin' && password !== 'admin123') {
      throw new Error('Invalid username or password');
    }
    if (u === 'ravinder' && password !== 'member123') {
      throw new Error('Invalid username or password');
    }

    user.lastLogin = new Date().toISOString();
    this.save();

    // Create client token
    const tokenPayload = {
      userId: user.id || user._id,
      username: user.username,
      fullName: user.fullName,
      role: user.role,
      exp: Date.now() + 7 * 86400 * 1000,
    };
    const token = 'client_jwt_' + btoa(JSON.stringify(tokenPayload));

    this.addActivityLog(user.id || user._id || '', user.fullName, 'LOGIN', `User ${user.username} logged in successfully`);

    return { token, user };
  }

  getMe(token: string): { user: User } {
    if (!token) throw new Error('Unauthorized');
    try {
      const raw = atob(token.replace('client_jwt_', ''));
      const payload = JSON.parse(raw);
      const user = this.db.users.find((u) => u.id === payload.userId || u._id === payload.userId);
      if (!user || !user.isActive) throw new Error('User not found or account disabled');
      return { user };
    } catch (e) {
      throw new Error('Invalid token');
    }
  }

  // --- USERS ---
  getUsers(): User[] {
    return this.db.users;
  }

  createUser(userData: Partial<User>): User {
    const newUser: User = {
      id: 'usr_' + Date.now(),
      _id: 'usr_' + Date.now(),
      fullName: userData.fullName || '',
      username: userData.username?.toLowerCase().trim() || '',
      role: userData.role || 'COMMITTEE_MEMBER',
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    this.db.users.push(newUser);
    this.save();
    return newUser;
  }

  updateUser(id: string, userData: Partial<User>): User {
    const u = this.db.users.find((x) => x.id === id || x._id === id);
    if (!u) throw new Error('User not found');
    Object.assign(u, userData);
    this.save();
    return u;
  }

  deleteUser(id: string) {
    this.db.users = this.db.users.filter((x) => x.id !== id && x._id !== id);
    this.save();
  }

  // --- FESTIVALS ---
  getFestivals(): Festival[] {
    return this.db.festivals;
  }

  createFestival(festData: Partial<Festival>): Festival {
    const newFest: Festival = {
      _id: 'fest_' + Date.now(),
      apartmentName: festData.apartmentName || 'CHANAKYA RESIDENCY',
      festivalName: festData.festivalName || 'GANESH UTSAV',
      year: festData.year || new Date().getFullYear(),
      isActive: festData.isActive ?? true,
      createdAt: new Date().toISOString(),
    };
    if (newFest.isActive) {
      this.db.festivals.forEach((f) => (f.isActive = false));
    }
    this.db.festivals.push(newFest);
    this.save();
    return newFest;
  }

  updateFestival(id: string, festData: Partial<Festival>): Festival {
    const fest = this.db.festivals.find((x) => x._id === id);
    if (!fest) throw new Error('Festival not found');
    if (festData.isActive) {
      this.db.festivals.forEach((f) => (f.isActive = false));
    }
    Object.assign(fest, festData);
    this.save();
    return fest;
  }

  deleteFestival(id: string) {
    this.db.festivals = this.db.festivals.filter((x) => x._id !== id);
    this.save();
  }

  // --- FUNDS ---
  getFunds(festivalId?: string): Fund[] {
    if (!festivalId) return this.db.funds;
    return this.db.funds.filter((f) => f.festivalId === festivalId);
  }

  createFund(fundData: Partial<Fund>, userId: string, userName: string): Fund {
    const newFund: Fund = {
      _id: 'fnd_' + Date.now(),
      festivalId: fundData.festivalId || 'fest_2026_001',
      flatNumber: fundData.flatNumber || '',
      residentName: fundData.residentName || '',
      amount: Number(fundData.amount) || 0,
      paymentMode: fundData.paymentMode || 'CASH',
      date: fundData.date || new Date().toISOString(),
      description: fundData.description || 'Festival Contribution',
      notes: fundData.notes,
      transactionReference: fundData.transactionReference,
      proofUrl: fundData.proofUrl,
      createdBy: userId,
      createdByName: userName,
      createdAt: new Date().toISOString(),
    };
    this.db.funds.push(newFund);
    this.addActivityLog(userId, userName, 'CREATE_FUND', `Added contribution of ₹${newFund.amount} for Flat ${newFund.flatNumber}`, newFund.festivalId);
    this.save();
    return newFund;
  }

  updateFund(id: string, fundData: Partial<Fund>): Fund {
    const f = this.db.funds.find((x) => x._id === id);
    if (!f) throw new Error('Fund record not found');
    Object.assign(f, fundData, { updatedAt: new Date().toISOString() });
    this.save();
    return f;
  }

  deleteFund(id: string) {
    this.db.funds = this.db.funds.filter((x) => x._id !== id);
    this.save();
  }

  // --- SPONSORSHIPS ---
  getSponsorships(festivalId?: string): Sponsorship[] {
    if (!festivalId) return this.db.sponsorships;
    return this.db.sponsorships.filter((s) => s.festivalId === festivalId);
  }

  createSponsorship(sponsorshipData: Partial<Sponsorship>, userId: string, userName: string): Sponsorship {
    const newSponsorship: Sponsorship = {
      _id: 'spn_' + Date.now(),
      festivalId: sponsorshipData.festivalId || 'fest_2026_001',
      flatNumber: sponsorshipData.flatNumber || '',
      residentName: sponsorshipData.residentName || '',
      sponsoredItem: sponsorshipData.sponsoredItem || '',
      amount: Number(sponsorshipData.amount) || 0,
      paymentMode: sponsorshipData.paymentMode || 'CASH',
      date: sponsorshipData.date || new Date().toISOString(),
      description: sponsorshipData.description,
      notes: sponsorshipData.notes,
      paymentReference: sponsorshipData.paymentReference,
      proofUrl: sponsorshipData.proofUrl,
      createdBy: userId,
      createdByName: userName,
      createdAt: new Date().toISOString(),
    };
    this.db.sponsorships.push(newSponsorship);
    this.addActivityLog(userId, userName, 'CREATE_SPONSORSHIP', `Added sponsorship of ₹${newSponsorship.amount} (${newSponsorship.sponsoredItem}) by Flat ${newSponsorship.flatNumber}`, newSponsorship.festivalId);
    this.save();
    return newSponsorship;
  }

  updateSponsorship(id: string, sponsorshipData: Partial<Sponsorship>): Sponsorship {
    const s = this.db.sponsorships.find((x) => x._id === id);
    if (!s) throw new Error('Sponsorship record not found');
    Object.assign(s, sponsorshipData, { updatedAt: new Date().toISOString() });
    this.save();
    return s;
  }

  deleteSponsorship(id: string) {
    this.db.sponsorships = this.db.sponsorships.filter((x) => x._id !== id);
    this.save();
  }

  // --- EXPENSES ---
  getExpenses(festivalId?: string): Expense[] {
    if (!festivalId) return this.db.expenses;
    return this.db.expenses.filter((e) => e.festivalId === festivalId);
  }

  getExpenseSuggestions(): string[] {
    const descriptions = this.db.expenses.map((e) => e.expenseDescription);
    const defaults = ['Ganesh Idol', 'Decoration', 'Flowers & Mala', 'Water Cans', 'Sound System', 'Puja Samagri', 'Pandit Ji Dakshina', 'Prasadam Lunch', 'Immersion Procession', 'Tent & Chairs'];
    return Array.from(new Set([...defaults, ...descriptions]));
  }

  createExpense(expenseData: Partial<Expense>, userId: string, userName: string): Expense {
    const newExpense: Expense = {
      _id: 'exp_' + Date.now(),
      festivalId: expenseData.festivalId || 'fest_2026_001',
      expenseDescription: expenseData.expenseDescription || '',
      amount: Number(expenseData.amount) || 0,
      spentBy: expenseData.spentBy || userName,
      paymentMode: expenseData.paymentMode || 'CASH',
      date: expenseData.date || new Date().toISOString(),
      notes: expenseData.notes,
      receiptUrl: expenseData.receiptUrl,
      createdBy: userId,
      createdByName: userName,
      createdAt: new Date().toISOString(),
    };
    this.db.expenses.push(newExpense);
    this.addActivityLog(userId, userName, 'CREATE_EXPENSE', `Added expense of ₹${newExpense.amount} for ${newExpense.expenseDescription}`, newExpense.festivalId);
    this.save();
    return newExpense;
  }

  updateExpense(id: string, expenseData: Partial<Expense>): Expense {
    const e = this.db.expenses.find((x) => x._id === id);
    if (!e) throw new Error('Expense record not found');
    Object.assign(e, expenseData, { updatedAt: new Date().toISOString() });
    this.save();
    return e;
  }

  deleteExpense(id: string) {
    this.db.expenses = this.db.expenses.filter((x) => x._id !== id);
    this.save();
  }

  // --- COMMITTEE MEMBERS ---
  getCommitteeMembers(festivalId?: string): CommitteeMember[] {
    if (!festivalId) return this.db.committeeMembers;
    return this.db.committeeMembers.filter((m) => m.festivalId === festivalId);
  }

  createCommitteeMember(data: Partial<CommitteeMember>): CommitteeMember {
    const member: CommitteeMember = {
      _id: 'cm_' + Date.now(),
      festivalId: data.festivalId || 'fest_2026_001',
      name: data.name || '',
      position: data.position || '',
    };
    this.db.committeeMembers.push(member);
    this.save();
    return member;
  }

  deleteCommitteeMember(id: string) {
    this.db.committeeMembers = this.db.committeeMembers.filter((m) => m._id !== id);
    this.save();
  }

  // --- ACTIVITY LOGS ---
  getActivityLogs(festivalId?: string): ActivityLog[] {
    let logs = this.db.activityLogs;
    if (festivalId) {
      logs = logs.filter((l) => !l.festivalId || l.festivalId === festivalId);
    }
    return [...logs].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  private addActivityLog(userId: string, userName: string, action: string, description: string, festivalId?: string) {
    this.db.activityLogs.push({
      _id: 'act_' + Date.now(),
      festivalId,
      userId,
      userName,
      action,
      description,
      createdAt: new Date().toISOString(),
    });
  }

  // --- DASHBOARD SUMMARY ---
  getDashboardSummary(festivalId: string): DashboardSummary {
    const funds = this.getFunds(festivalId);
    const sponsorships = this.getSponsorships(festivalId);
    const expenses = this.getExpenses(festivalId);

    const totalRegular = funds.reduce((acc, curr) => acc + (curr.amount || 0), 0);
    const totalSponsorship = sponsorships.reduce((acc, curr) => acc + (curr.amount || 0), 0);
    const totalFundsReceived = totalRegular + totalSponsorship;
    const totalExpenses = expenses.reduce((acc, curr) => acc + (curr.amount || 0), 0);
    const currentBalance = totalFundsReceived - totalExpenses;

    const cashReceived =
      funds.filter((f) => f.paymentMode === 'CASH').reduce((acc, curr) => acc + curr.amount, 0) +
      sponsorships.filter((s) => s.paymentMode === 'CASH').reduce((acc, curr) => acc + curr.amount, 0);

    const cashSpent = expenses.filter((e) => e.paymentMode === 'CASH').reduce((acc, curr) => acc + curr.amount, 0);
    const cashBalance = cashReceived - cashSpent;

    const onlineReceived =
      funds.filter((f) => f.paymentMode === 'ONLINE').reduce((acc, curr) => acc + curr.amount, 0) +
      sponsorships.filter((s) => s.paymentMode === 'ONLINE').reduce((acc, curr) => acc + curr.amount, 0);

    const onlineSpent = expenses.filter((e) => e.paymentMode === 'ONLINE').reduce((acc, curr) => acc + curr.amount, 0);
    const onlineBalance = onlineReceived - onlineSpent;

    const flatsSet = new Set([
      ...funds.map((f) => f.flatNumber),
      ...sponsorships.map((s) => s.flatNumber),
    ]);

    return {
      totalRegular,
      totalSponsorship,
      totalFundsReceived,
      totalExpenses,
      currentBalance,
      cashReceived,
      cashSpent,
      cashBalance,
      onlineReceived,
      onlineSpent,
      onlineBalance,
      contributingFlatsCount: flatsSet.size,
    };
  }

  // --- FINAL REPORT ---
  getFinalReport(festivalId: string): FinalReportData {
    const festival = this.db.festivals.find((f) => f._id === festivalId) || {
      apartmentName: 'CHANAKYA RESIDENCY',
      festivalName: 'GANESH UTSAV',
      year: 2026,
    };

    const funds = this.getFunds(festivalId);
    const sponsorships = this.getSponsorships(festivalId);
    const expenses = this.getExpenses(festivalId);
    const committeeMembers = this.getCommitteeMembers(festivalId);

    // Group received funds by flat
    const flatMap = new Map<string, { flatNumber: string; residentName: string; regularAmount: number; sponsorshipAmount: number; totalAmount: number }>();

    funds.forEach((f) => {
      const key = f.flatNumber.trim();
      const existing = flatMap.get(key) || {
        flatNumber: key,
        residentName: f.residentName,
        regularAmount: 0,
        sponsorshipAmount: 0,
        totalAmount: 0,
      };
      existing.regularAmount += f.amount;
      existing.totalAmount += f.amount;
      if (f.residentName && !existing.residentName) existing.residentName = f.residentName;
      flatMap.set(key, existing);
    });

    sponsorships.forEach((s) => {
      const key = s.flatNumber.trim();
      const existing = flatMap.get(key) || {
        flatNumber: key,
        residentName: s.residentName,
        regularAmount: 0,
        sponsorshipAmount: 0,
        totalAmount: 0,
      };
      existing.sponsorshipAmount += s.amount;
      existing.totalAmount += s.amount;
      if (s.residentName && !existing.residentName) existing.residentName = s.residentName;
      flatMap.set(key, existing);
    });

    const amountReceived = Array.from(flatMap.values()).sort((a, b) => a.flatNumber.localeCompare(b.flatNumber, undefined, { numeric: true }));

    // Group expenses by particular
    const expMap = new Map<string, { particular: string; count: number; totalAmount: number }>();
    expenses.forEach((e) => {
      const desc = e.expenseDescription.trim();
      const existing = expMap.get(desc) || { particular: desc, count: 0, totalAmount: 0 };
      existing.count += 1;
      existing.totalAmount += e.amount;
      expMap.set(desc, existing);
    });
    const paymentsMade = Array.from(expMap.values()).sort((a, b) => b.totalAmount - a.totalAmount);

    const eventContributions = sponsorships.map((s) => ({
      _id: s._id,
      flatNumber: s.flatNumber,
      residentName: s.residentName,
      sponsoredItem: s.sponsoredItem,
      amount: s.amount,
      paymentMode: s.paymentMode,
      date: s.date,
    }));

    const totalRegular = funds.reduce((a, b) => a + b.amount, 0);
    const totalSponsorship = sponsorships.reduce((a, b) => a + b.amount, 0);
    const totalFundsReceived = totalRegular + totalSponsorship;
    const totalPaymentsMade = expenses.reduce((a, b) => a + b.amount, 0);
    const remainingBalance = totalFundsReceived - totalPaymentsMade;

    return {
      header: {
        apartmentName: festival.apartmentName,
        festivalName: festival.festivalName,
        year: festival.year,
      },
      amountReceived,
      paymentsMade,
      eventContributions,
      committeeMembers,
      totals: {
        totalRegular,
        totalSponsorship,
        totalFundsReceived,
        totalPaymentsMade,
        remainingBalance,
      },
    };
  }
}

export const clientStorage = new ClientStorageEngine();
