import bcrypt from 'bcryptjs';

export interface MemoryUser {
  _id: string;
  fullName: string;
  username: string;
  passwordHash: string;
  role: 'ADMIN' | 'COMMITTEE_MEMBER';
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MemoryFestival {
  _id: string;
  apartmentName: string;
  festivalName: string;
  year: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MemoryFund {
  _id: string;
  festivalId: string;
  flatNumber: string;
  residentName: string;
  amount: number;
  paymentMode: 'CASH' | 'ONLINE';
  date: string;
  description?: string;
  notes?: string;
  transactionReference?: string;
  proofUrl?: string;
  createdBy: string;
  createdByName?: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MemorySponsorship {
  _id: string;
  festivalId: string;
  flatNumber: string;
  residentName: string;
  sponsoredItem: string;
  amount: number;
  paymentMode: 'CASH' | 'ONLINE';
  date: string;
  description?: string;
  notes?: string;
  paymentReference?: string;
  proofUrl?: string;
  createdBy: string;
  createdByName?: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MemoryExpense {
  _id: string;
  festivalId: string;
  expenseDescription: string;
  amount: number;
  spentBy: string;
  paymentMode: 'CASH' | 'ONLINE';
  date: string;
  notes?: string;
  receiptUrl?: string;
  createdBy: string;
  createdByName?: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MemoryCommitteeMember {
  _id: string;
  festivalId: string;
  name: string;
  position?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MemoryActivityLog {
  _id: string;
  festivalId?: string;
  userId: string;
  userName: string;
  action: string;
  entityType?: string;
  entityId?: string;
  description: string;
  createdAt: string;
}

class InMemoryStore {
  users: MemoryUser[] = [];
  festivals: MemoryFestival[] = [];
  funds: MemoryFund[] = [];
  sponsorships: MemorySponsorship[] = [];
  expenses: MemoryExpense[] = [];
  committeeMembers: MemoryCommitteeMember[] = [];
  activityLogs: MemoryActivityLog[] = [];
  initialized = false;

  init() {
    if (this.initialized) return;

    const defaultPasswordHash = bcrypt.hashSync('admin123', 10);
    const committeePasswordHash = bcrypt.hashSync('member123', 10);

    const adminId = 'usr_admin_001';
    const memberId = 'usr_member_002';
    const festId = 'fest_2026_001';

    this.users = [
      {
        _id: adminId,
        fullName: 'Admin User',
        username: 'admin',
        passwordHash: defaultPasswordHash,
        role: 'ADMIN',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        _id: memberId,
        fullName: 'Ravinder Committee',
        username: 'ravinder',
        passwordHash: committeePasswordHash,
        role: 'COMMITTEE_MEMBER',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ];

    this.festivals = [
      {
        _id: festId,
        apartmentName: 'CHANAKYA RESIDENCY',
        festivalName: 'GANESH UTSAV',
        year: 2026,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        _id: 'fest_2025_002',
        apartmentName: 'CHANAKYA RESIDENCY',
        festivalName: 'GANESH UTSAV',
        year: 2025,
        isActive: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ];

    this.funds = [
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
        updatedAt: new Date().toISOString(),
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
        updatedAt: new Date().toISOString(),
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
        updatedAt: new Date().toISOString(),
      }
    ];

    this.sponsorships = [
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
        updatedAt: new Date().toISOString(),
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
        updatedAt: new Date().toISOString(),
      }
    ];

    this.expenses = [
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
        updatedAt: new Date().toISOString(),
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
        updatedAt: new Date().toISOString(),
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
        updatedAt: new Date().toISOString(),
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
        updatedAt: new Date().toISOString(),
      }
    ];

    this.committeeMembers = [
      {
        _id: 'cm_001',
        festivalId: festId,
        name: 'B. RAVINDER',
        position: 'President',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        _id: 'cm_002',
        festivalId: festId,
        name: 'ANAND JAYA BABU',
        position: 'Treasurer',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ];

    this.activityLogs = [
      {
        _id: 'act_001',
        festivalId: festId,
        userId: adminId,
        userName: 'Admin User',
        action: 'SYSTEM_INIT',
        description: 'Initialized Ganesh Utsav 2026 accounting system',
        createdAt: new Date().toISOString(),
      }
    ];

    this.initialized = true;
  }
}

export const store = new InMemoryStore();
store.init();
