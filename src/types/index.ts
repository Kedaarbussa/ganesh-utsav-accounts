export type Role = 'ADMIN' | 'COMMITTEE_MEMBER';
export type PaymentMode = 'CASH' | 'ONLINE';

export interface User {
  id: string;
  _id?: string;
  fullName: string;
  username: string;
  role: Role;
  isActive: boolean;
  lastLogin?: string;
  createdAt?: string;
}

export interface Festival {
  _id: string;
  apartmentName: string;
  festivalName: string;
  year: number;
  isActive: boolean;
  createdAt?: string;
}

export interface Fund {
  _id: string;
  festivalId: string;
  flatNumber: string;
  residentName: string;
  amount: number;
  paymentMode: PaymentMode;
  date: string;
  description?: string;
  notes?: string;
  transactionReference?: string;
  proofUrl?: string;
  createdBy: string | { _id: string; fullName: string; username: string };
  createdByName?: string;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Sponsorship {
  _id: string;
  festivalId: string;
  flatNumber: string;
  residentName: string;
  sponsoredItem: string;
  amount: number;
  paymentMode: PaymentMode;
  date: string;
  description?: string;
  notes?: string;
  paymentReference?: string;
  proofUrl?: string;
  createdBy: string | { _id: string; fullName: string; username: string };
  createdByName?: string;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Expense {
  _id: string;
  festivalId: string;
  expenseDescription: string;
  amount: number;
  spentBy: string;
  paymentMode: PaymentMode;
  date: string;
  notes?: string;
  receiptUrl?: string;
  createdBy: string | { _id: string; fullName: string; username: string };
  createdByName?: string;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CommitteeMember {
  _id: string;
  festivalId: string;
  name: string;
  position?: string;
}

export interface ActivityLog {
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

export interface DashboardSummary {
  totalRegular: number;
  totalSponsorship: number;
  totalFundsReceived: number;
  totalExpenses: number;
  currentBalance: number;
  cashReceived: number;
  cashSpent: number;
  cashBalance: number;
  onlineReceived: number;
  onlineSpent: number;
  onlineBalance: number;
  contributingFlatsCount: number;
}

export interface FinalReportData {
  header: {
    apartmentName: string;
    festivalName: string;
    year: number;
  };
  amountReceived: Array<{
    flatNumber: string;
    residentName: string;
    regularAmount: number;
    sponsorshipAmount: number;
    totalAmount: number;
  }>;
  paymentsMade: Array<{
    particular: string;
    count: number;
    totalAmount: number;
  }>;
  eventContributions: Array<{
    _id: string;
    flatNumber: string;
    residentName: string;
    sponsoredItem: string;
    amount: number;
    paymentMode: PaymentMode;
    date: string;
  }>;
  committeeMembers: CommitteeMember[];
  totals: {
    totalRegular: number;
    totalSponsorship: number;
    totalFundsReceived: number;
    totalPaymentsMade: number;
    remainingBalance: number;
  };
}
