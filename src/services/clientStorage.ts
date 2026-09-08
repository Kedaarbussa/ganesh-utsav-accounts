import { User, Festival, Fund, Sponsorship, Expense, CommitteeMember, ActivityLog, DashboardSummary, FinalReportData, Flat } from '../types';
import { supabase } from './supabase';

const STORAGE_KEY = 'ganesh_utsav_accounts_db_v2';
const STORE_ROW_ID = 'main_store';

export const DEFAULT_FLATS: Flat[] = [
  { flatNumber: '101', residentName: 'C.R.K. Mallinath' },
  { flatNumber: '102', residentName: 'I. Narasimha Reddy' },
  { flatNumber: '103', residentName: 'T.S.N. Murthy' },
  { flatNumber: '104', residentName: 'V.R.A.Srinivas' },
  { flatNumber: '105', residentName: 'Dr. A Kashipathi' },
  { flatNumber: '106', residentName: 'G. Rajani Asha Latha' },
  { flatNumber: '107', residentName: 'K.S. Subbarao' },
  { flatNumber: '108', residentName: 'Murali Krishna' },
  { flatNumber: '201', residentName: 'Nagaraj' },
  { flatNumber: '202', residentName: 'Lingamaiah Yadav' },
  { flatNumber: '203', residentName: 'K.S. Bhushan' },
  { flatNumber: '204', residentName: 'N.S. Nagaraju' },
  { flatNumber: '205', residentName: 'V.V. Ramana Murthy' },
  { flatNumber: '206', residentName: 'I. Siva Sarma' },
  { flatNumber: '207', residentName: 'V.N.K. Srinivas' },
  { flatNumber: '208', residentName: 'M.T.C. Sekhar Rao' },
  { flatNumber: '301', residentName: 'A.V. Narasimha Rao' },
  { flatNumber: '302', residentName: 'V. Satyavathi' },
  { flatNumber: '303', residentName: 'S. Deepika' },
  { flatNumber: '304', residentName: 'Rajesh Agarwal' },
  { flatNumber: '305', residentName: 'K. Jyothi' },
  { flatNumber: '306', residentName: 'D. Vardhini Sastry' },
  { flatNumber: '307', residentName: 'Debajit Chakraborthy' },
  { flatNumber: '308', residentName: 'Ravi Shankar B' },
  { flatNumber: '401', residentName: 'R. Ravindranath' },
  { flatNumber: '402', residentName: 'G.S. Murthy' },
  { flatNumber: '403', residentName: 'A.S.K. Reddy' },
  { flatNumber: '404', residentName: 'S. Kaushik' },
  { flatNumber: '405', residentName: 'Y. Ajay Raj' },
  { flatNumber: '406', residentName: 'G. Arun Kumar' },
  { flatNumber: '407', residentName: 'Lavanya Prabha A' },
  { flatNumber: '408', residentName: 'M. Srinivas' },
  { flatNumber: '501', residentName: 'R. Anuradha' },
  { flatNumber: '502', residentName: 'B. Ravinder' },
  { flatNumber: '503', residentName: 'Seema Gaur' },
  { flatNumber: '504', residentName: 'V. Krishna Mohan' },
  { flatNumber: '505', residentName: 'V.M. Prakash' },
  { flatNumber: '506', residentName: 'C. Sasikala Reddy' },
  { flatNumber: '507', residentName: 'M. Jagadeeshwar Reddy' },
  { flatNumber: '508', residentName: 'K. Kameswara Rao' },
];

interface StorageSchema {
  users: User[];
  festivals: Festival[];
  flats: Flat[];
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
    flats: [...DEFAULT_FLATS],
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
    funds: [],
    sponsorships: [],
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
  private isSyncing = false;

  constructor() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        this.db = JSON.parse(raw);
        if (!this.db.flats || this.db.flats.length === 0) {
          this.db.flats = [...DEFAULT_FLATS];
        }
      } catch (e) {
        this.db = getInitialData();
        this.saveLocal();
      }
    } else {
      this.db = getInitialData();
      this.saveLocal();
    }

    // Try initial background pull from Supabase
    this.pullFromCloud().catch(() => {});
  }

  private saveLocal() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.db));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }

  async pullFromCloud(): Promise<void> {
    if (this.isSyncing) return;
    this.isSyncing = true;
    try {
      const { data, error } = await supabase
        .from('app_store')
        .select('data')
        .eq('id', STORE_ROW_ID)
        .single();

      if (data && data.data) {
        this.db = data.data;
        if (!this.db.flats || this.db.flats.length === 0) {
          this.db.flats = [...DEFAULT_FLATS];
        }
        this.saveLocal();
      } else if (error && error.code === 'PGRST116') {
        // Row does not exist yet; initialize cloud store
        await this.pushToCloud();
      }
    } catch (err) {
      console.warn('Cloud sync pull notice:', err);
    } finally {
      this.isSyncing = false;
    }
  }

  async pushToCloud(): Promise<void> {
    this.saveLocal();
    try {
      await supabase
        .from('app_store')
        .upsert({
          id: STORE_ROW_ID,
          data: this.db,
          updated_at: new Date().toISOString(),
        });
    } catch (err) {
      console.warn('Cloud sync push notice:', err);
    }
  }

  // --- AUTH ---
  async login(username: string, password: string): Promise<{ token: string; user: User }> {
    await this.pullFromCloud();
    const u = username.toLowerCase().trim();
    const user = this.db.users.find((x) => x.username.toLowerCase() === u);

    if (!user) {
      throw new Error('Invalid username or password');
    }

    if (!user.isActive) {
      throw new Error('Account is disabled. Contact Admin.');
    }

    // Password verification
    if (u === 'admin' && password !== '0904') {
      throw new Error('Invalid username or password');
    }
    if (u === 'ravinder' && password !== 'member123') {
      throw new Error('Invalid username or password');
    }

    user.lastLogin = new Date().toISOString();
    await this.pushToCloud();

    // Create client token
    const tokenPayload = {
      userId: user.id || user._id,
      username: user.username,
      fullName: user.fullName,
      role: user.role,
      exp: Date.now() + 7 * 86400 * 1000,
    };
    const token = 'client_jwt_' + btoa(encodeURIComponent(JSON.stringify(tokenPayload)));

    await this.addActivityLog(user.id || user._id || '', user.fullName, 'LOGIN', `User ${user.username} logged in successfully`);

    return { token, user };
  }

  getMe(token: string): { user: User } {
    if (!token) throw new Error('Unauthorized');
    try {
      const raw = decodeURIComponent(atob(token.replace('client_jwt_', '')));
      const payload = JSON.parse(raw);
      const user = this.db.users.find((u) => u.id === payload.userId || u._id === payload.userId);
      if (!user || !user.isActive) throw new Error('User not found or account disabled');
      return { user };
    } catch (e) {
      throw new Error('Invalid token');
    }
  }

  // --- FLATS DIRECTORY ---
  async getFlats(): Promise<Flat[]> {
    await this.pullFromCloud();
    if (!this.db.flats || this.db.flats.length === 0) {
      this.db.flats = [...DEFAULT_FLATS];
      await this.pushToCloud();
    }
    return [...this.db.flats].sort((a, b) =>
      a.flatNumber.localeCompare(b.flatNumber, undefined, { numeric: true, sensitivity: 'base' })
    );
  }

  async createFlat(flatData: { flatNumber: string; residentName: string }): Promise<Flat> {
    await this.pullFromCloud();
    if (!this.db.flats) this.db.flats = [...DEFAULT_FLATS];
    const key = flatData.flatNumber.trim();
    const existingIndex = this.db.flats.findIndex((f) => f.flatNumber.trim().toLowerCase() === key.toLowerCase());
    const newFlat: Flat = {
      _id: 'flt_' + Date.now(),
      flatNumber: key,
      residentName: flatData.residentName.trim(),
    };
    if (existingIndex >= 0) {
      this.db.flats[existingIndex] = newFlat;
    } else {
      this.db.flats.push(newFlat);
    }
    await this.pushToCloud();
    return newFlat;
  }

  async updateFlat(flatNumber: string, residentName: string): Promise<Flat> {
    await this.pullFromCloud();
    if (!this.db.flats) this.db.flats = [...DEFAULT_FLATS];
    const key = flatNumber.trim().toLowerCase();
    const flat = this.db.flats.find((f) => f.flatNumber.trim().toLowerCase() === key);
    if (!flat) {
      return this.createFlat({ flatNumber, residentName });
    }
    flat.residentName = residentName.trim();
    await this.pushToCloud();
    return flat;
  }

  async deleteFlat(flatNumber: string): Promise<void> {
    await this.pullFromCloud();
    if (!this.db.flats) this.db.flats = [...DEFAULT_FLATS];
    const key = flatNumber.trim().toLowerCase();
    this.db.flats = this.db.flats.filter((f) => f.flatNumber.trim().toLowerCase() !== key);
    await this.pushToCloud();
  }

  // --- USERS ---
  async getUsers(): Promise<User[]> {
    await this.pullFromCloud();
    return this.db.users;
  }

  async createUser(userData: Partial<User>): Promise<User> {
    await this.pullFromCloud();
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
    await this.pushToCloud();
    return newUser;
  }

  async updateUser(id: string, userData: Partial<User>): Promise<User> {
    await this.pullFromCloud();
    const u = this.db.users.find((x) => x.id === id || x._id === id);
    if (!u) throw new Error('User not found');
    Object.assign(u, userData);
    await this.pushToCloud();
    return u;
  }

  async deleteUser(id: string): Promise<void> {
    await this.pullFromCloud();
    this.db.users = this.db.users.filter((x) => x.id !== id && x._id !== id);
    await this.pushToCloud();
  }

  // --- FESTIVALS ---
  async getFestivals(): Promise<Festival[]> {
    await this.pullFromCloud();
    return this.db.festivals;
  }

  async createFestival(festData: Partial<Festival>): Promise<Festival> {
    await this.pullFromCloud();
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
    await this.pushToCloud();
    return newFest;
  }

  async updateFestival(id: string, festData: Partial<Festival>): Promise<Festival> {
    await this.pullFromCloud();
    const fest = this.db.festivals.find((x) => x._id === id);
    if (!fest) throw new Error('Festival not found');
    if (festData.isActive) {
      this.db.festivals.forEach((f) => (f.isActive = false));
    }
    Object.assign(fest, festData);
    await this.pushToCloud();
    return fest;
  }

  async deleteFestival(id: string): Promise<void> {
    await this.pullFromCloud();
    this.db.festivals = this.db.festivals.filter((x) => x._id !== id);
    await this.pushToCloud();
  }

  // --- FUNDS ---
  async getFunds(festivalId?: string): Promise<Fund[]> {
    await this.pullFromCloud();
    if (!festivalId) return this.db.funds;
    return this.db.funds.filter((f) => f.festivalId === festivalId);
  }

  async createFund(fundData: Partial<Fund>, userId: string, userName: string): Promise<Fund> {
    await this.pullFromCloud();
    const flatNumber = (fundData.flatNumber || '').trim();
    let resName = (fundData.residentName || '').trim();

    // Auto-associate or update flat resident name if provided
    if (flatNumber) {
      const flat = this.db.flats?.find((f) => f.flatNumber.trim().toLowerCase() === flatNumber.toLowerCase());
      if (flat && !resName) {
        resName = flat.residentName;
      }
    }

    const newFund: Fund = {
      _id: 'fnd_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      festivalId: fundData.festivalId || 'fest_2026_001',
      flatNumber: flatNumber,
      residentName: resName,
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
    await this.addActivityLog(userId, userName, 'CREATE_FUND', `Added contribution of ₹${newFund.amount} for Flat ${newFund.flatNumber}`, newFund.festivalId);
    await this.pushToCloud();
    return newFund;
  }

  async bulkCreateFunds(fundsList: Partial<Fund>[], userId: string, userName: string): Promise<{ count: number }> {
    await this.pullFromCloud();
    let count = 0;
    for (const fundData of fundsList) {
      if (!fundData.flatNumber || !fundData.amount) continue;
      const flatNum = fundData.flatNumber.toString().trim();
      const flat = this.db.flats?.find((f) => f.flatNumber.trim().toLowerCase() === flatNum.toLowerCase());
      const resName = fundData.residentName || flat?.residentName || `Flat ${flatNum}`;

      const newFund: Fund = {
        _id: 'fnd_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        festivalId: fundData.festivalId || 'fest_2026_001',
        flatNumber: flatNum,
        residentName: resName,
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
      count++;
    }
    await this.addActivityLog(userId, userName, 'BULK_IMPORT_FUNDS', `Bulk imported ${count} contributions`);
    await this.pushToCloud();
    return { count };
  }

  async updateFund(id: string, fundData: Partial<Fund>): Promise<Fund> {
    await this.pullFromCloud();
    const f = this.db.funds.find((x) => x._id === id);
    if (!f) throw new Error('Fund record not found');
    Object.assign(f, fundData, { updatedAt: new Date().toISOString() });
    await this.pushToCloud();
    return f;
  }

  async deleteFund(id: string): Promise<void> {
    await this.pullFromCloud();
    this.db.funds = this.db.funds.filter((x) => x._id !== id);
    await this.pushToCloud();
  }

  // --- SPONSORSHIPS ---
  async getSponsorships(festivalId?: string): Promise<Sponsorship[]> {
    await this.pullFromCloud();
    if (!festivalId) return this.db.sponsorships;
    return this.db.sponsorships.filter((s) => s.festivalId === festivalId);
  }

  async createSponsorship(sponsorshipData: Partial<Sponsorship>, userId: string, userName: string): Promise<Sponsorship> {
    await this.pullFromCloud();
    const flatNum = (sponsorshipData.flatNumber || '').trim();
    let resName = (sponsorshipData.residentName || '').trim();

    if (flatNum && !resName) {
      const flat = this.db.flats?.find((f) => f.flatNumber.trim().toLowerCase() === flatNum.toLowerCase());
      if (flat) resName = flat.residentName;
    }

    const newSponsorship: Sponsorship = {
      _id: 'spn_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      festivalId: sponsorshipData.festivalId || 'fest_2026_001',
      flatNumber: flatNum,
      residentName: resName,
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
    await this.addActivityLog(userId, userName, 'CREATE_SPONSORSHIP', `Added sponsorship of ₹${newSponsorship.amount} (${newSponsorship.sponsoredItem}) by Flat ${newSponsorship.flatNumber}`, newSponsorship.festivalId);
    await this.pushToCloud();
    return newSponsorship;
  }

  async updateSponsorship(id: string, sponsorshipData: Partial<Sponsorship>): Promise<Sponsorship> {
    await this.pullFromCloud();
    const s = this.db.sponsorships.find((x) => x._id === id);
    if (!s) throw new Error('Sponsorship record not found');
    Object.assign(s, sponsorshipData, { updatedAt: new Date().toISOString() });
    await this.pushToCloud();
    return s;
  }

  async deleteSponsorship(id: string): Promise<void> {
    await this.pullFromCloud();
    this.db.sponsorships = this.db.sponsorships.filter((x) => x._id !== id);
    await this.pushToCloud();
  }

  // --- EXPENSES ---
  async getExpenses(festivalId?: string): Promise<Expense[]> {
    await this.pullFromCloud();
    if (!festivalId) return this.db.expenses;
    return this.db.expenses.filter((e) => e.festivalId === festivalId);
  }

  async getExpenseSuggestions(): Promise<string[]> {
    await this.pullFromCloud();
    const descriptions = this.db.expenses.map((e) => e.expenseDescription);
    const defaults = ['Ganesh Idol', 'Decoration', 'Flowers & Mala', 'Water Cans', 'Sound System', 'Puja Samagri', 'Pandit Ji Dakshina', 'Prasadam Lunch', 'Immersion Procession', 'Tent & Chairs'];
    return Array.from(new Set([...defaults, ...descriptions]));
  }

  async createExpense(expenseData: Partial<Expense>, userId: string, userName: string): Promise<Expense> {
    await this.pullFromCloud();
    const newExpense: Expense = {
      _id: 'exp_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
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
    await this.addActivityLog(userId, userName, 'CREATE_EXPENSE', `Added expense of ₹${newExpense.amount} for ${newExpense.expenseDescription}`, newExpense.festivalId);
    await this.pushToCloud();
    return newExpense;
  }

  async updateExpense(id: string, expenseData: Partial<Expense>): Promise<Expense> {
    await this.pullFromCloud();
    const e = this.db.expenses.find((x) => x._id === id);
    if (!e) throw new Error('Expense record not found');
    Object.assign(e, expenseData, { updatedAt: new Date().toISOString() });
    await this.pushToCloud();
    return e;
  }

  async deleteExpense(id: string): Promise<void> {
    await this.pullFromCloud();
    this.db.expenses = this.db.expenses.filter((x) => x._id !== id);
    await this.pushToCloud();
  }

  // --- COMMITTEE MEMBERS ---
  async getCommitteeMembers(festivalId?: string): Promise<CommitteeMember[]> {
    await this.pullFromCloud();
    if (!festivalId) return this.db.committeeMembers;
    return this.db.committeeMembers.filter((m) => m.festivalId === festivalId);
  }

  async createCommitteeMember(data: Partial<CommitteeMember>): Promise<CommitteeMember> {
    await this.pullFromCloud();
    const member: CommitteeMember = {
      _id: 'cm_' + Date.now(),
      festivalId: data.festivalId || 'fest_2026_001',
      name: data.name || '',
      position: data.position || '',
    };
    this.db.committeeMembers.push(member);
    await this.pushToCloud();
    return member;
  }

  async deleteCommitteeMember(id: string): Promise<void> {
    await this.pullFromCloud();
    this.db.committeeMembers = this.db.committeeMembers.filter((m) => m._id !== id);
    await this.pushToCloud();
  }

  // --- ACTIVITY LOGS ---
  async getActivityLogs(festivalId?: string): Promise<ActivityLog[]> {
    await this.pullFromCloud();
    let logs = this.db.activityLogs;
    if (festivalId) {
      logs = logs.filter((l) => !l.festivalId || l.festivalId === festivalId);
    }
    return [...logs].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  private async addActivityLog(userId: string, userName: string, action: string, description: string, festivalId?: string) {
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
  async getDashboardSummary(festivalId: string): Promise<any> {
    await this.pullFromCloud();
    const funds = this.db.funds.filter((f) => !festivalId || f.festivalId === festivalId);
    const sponsorships = this.db.sponsorships.filter((s) => !festivalId || s.festivalId === festivalId);
    const expenses = this.db.expenses.filter((e) => !festivalId || e.festivalId === festivalId);

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

    const summary: DashboardSummary = {
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

    const charts = {
      fundsVsExpenses: [
        { name: 'Funds Received', amount: totalFundsReceived },
        { name: 'Expenses', amount: totalExpenses },
        { name: 'Net Balance', amount: currentBalance },
      ],
      cashVsOnlineReceived: [
        { name: 'Cash', value: cashReceived },
        { name: 'Online', value: onlineReceived },
      ],
    };

    const recentTransactions = [
      ...funds.map((f) => ({
        _id: f._id,
        type: 'REGULAR_CONTRIBUTION',
        title: `Flat ${f.flatNumber} Contribution`,
        subtitle: f.residentName,
        paymentMode: f.paymentMode,
        date: f.date,
        amount: f.amount,
      })),
      ...sponsorships.map((s) => ({
        _id: s._id,
        type: 'SPONSORSHIP',
        title: `${s.sponsoredItem} Sponsorship`,
        subtitle: `Flat ${s.flatNumber} - ${s.residentName}`,
        paymentMode: s.paymentMode,
        date: s.date,
        amount: s.amount,
      })),
      ...expenses.map((e) => ({
        _id: e._id,
        type: 'EXPENSE',
        title: e.expenseDescription,
        subtitle: `Spent by ${e.spentBy}`,
        paymentMode: e.paymentMode,
        date: e.date,
        amount: e.amount,
      })),
    ]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);

    return {
      summary,
      charts,
      recentTransactions,
    };
  }

  // --- FINAL REPORT ---
  async getFinalReport(festivalId: string): Promise<FinalReportData> {
    await this.pullFromCloud();
    const festival = this.db.festivals.find((f) => f._id === festivalId) || {
      apartmentName: 'CHANAKYA RESIDENCY',
      festivalName: 'GANESH UTSAV',
      year: 2026,
    };

    const funds = this.db.funds.filter((f) => !festivalId || f.festivalId === festivalId);
    const sponsorships = this.db.sponsorships.filter((s) => !festivalId || s.festivalId === festivalId);
    const expenses = this.db.expenses.filter((e) => !festivalId || e.festivalId === festivalId);
    const committeeMembers = this.db.committeeMembers.filter((m) => !festivalId || m.festivalId === festivalId);

    // Group received funds by flat
    const flatMap = new Map<string, { flatNumber: string; residentName: string; regularAmount: number; sponsorshipAmount: number; totalAmount: number }>();

    // Initialize ALL flats in directory unconditionally (all 40 flats)
    const allFlats = (this.db.flats && this.db.flats.length > 0) ? this.db.flats : DEFAULT_FLATS;
    allFlats.forEach((flat) => {
      const key = flat.flatNumber.trim();
      flatMap.set(key, {
        flatNumber: key,
        residentName: flat.residentName,
        regularAmount: 0,
        sponsorshipAmount: 0,
        totalAmount: 0,
      });
    });

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

    const amountReceived = Array.from(flatMap.values()).sort((a, b) =>
      a.flatNumber.localeCompare(b.flatNumber, undefined, { numeric: true, sensitivity: 'base' })
    );

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
