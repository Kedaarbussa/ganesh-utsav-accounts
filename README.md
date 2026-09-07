# 🪔 GANESH UTSAV ACCOUNTS

A complete financial management web application designed specifically for managing **Ganesh Chaturthi / Ganesh Utsav** festival finances for residential communities and apartment complexes.

---

## 🌟 Key Features

1. **Dynamic Financial Accounting**:
   - **Regular Contributions**: Tracks festival funds received flat-wise from residents.
   - **Sponsorship Contributions**: Records sponsorships (Lunch, Laddoo, Idol, Decoration, Prasadam) given directly to the committee.
   - **Expense Tracking**: Free-text expense descriptions with smart suggestions from past entries.
   - **Strict Payment Mode Enforcement**: Tracks transactions as strictly `CASH` or `ONLINE`. Split payments are recorded as separate transactions.

2. **Accurate Balance & Summary Calculations**:
   - **Total Funds Received** = Regular Contributions + Sponsorship Contributions
   - **Total Expenses** = Sum of all Expense transactions
   - **Current Balance** = Total Funds Received - Total Expenses
   - **Cash Balance** = Cash Received - Cash Spent
   - **Online Balance** = Online Received - Online Spent
   - **Zero Double-Counting**: Sponsorships are listed in Event Contributions for resident recognition without double-counting in grand totals.

3. **Traditional 2-Column Final Report**:
   - Resembles traditional apartment financial statements shared with residents after festival completion.
   - **Amount Received** (Left) vs. **Payments Made** (Right).
   - Event Contributions recognition section.
   - Committee Members footer roster.
   - PDF Download (A4 printable format), Excel export, CSV export, and Direct Printing support.

4. **Multi-Year Support**:
   - Switch seamlessly between Ganesh Utsav 2025, 2026, 2027, etc.
   - Completely isolated financial data per festival year.

5. **Hybrid User & Role System**:
   - **Admin**: Complete access (CRUD all transactions, manage users, create/switch festival years, view activity audit logs, configure apartment settings).
   - **Committee Member**: Can add transactions and edit only transactions created by themselves. Cannot delete transactions or modify application settings.

6. **Cloud File Storage**:
   - Attach payment receipts, UPI screenshots, and bills via Cloudinary (with fallback preview mode).

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons, Recharts
- **Backend**: Node.js, Vercel Serverless Functions (`/api/*`)
- **Database**: MongoDB Atlas, Mongoose
- **Authentication**: JWT, bcryptjs password hashing
- **File Uploads**: Cloudinary API
- **Document Generation**: jsPDF, AutoTable, XLSX, PapaParse
- **Deployment**: Vercel (Unified Single Repo Deployment)

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- MongoDB Atlas account (free cluster)
- Cloudinary account (optional for image hosting)

### 2. Environment Variables Setup
Create a `.env` file in the root directory (refer to `.env.example`):

```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/ganesh_utsav_db?retryWrites=true&w=majority
JWT_SECRET=ganesh_utsav_super_secret_jwt_key_2026
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 3. Installation
```bash
npm install
```

### 4. Running Locally
Start the Vite development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

---

## 🔑 Default Accounts (First Run Seed)

On initial connection, the system automatically seeds default accounts:

| Role | Username | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin` | `0904` | Complete Control (CRUD, Users, Settings) |
| **Committee Member** | `ravinder` | `member123` | Data Entry & Edit Own Records |

---

## ☁️ Deploying to Vercel

The repository is configured for unified deployment on Vercel (Vite Frontend + Node.js Serverless API in `/api`).

1. Push your repository to GitHub.
2. Import the repository into **Vercel**.
3. Set the Environment Variables (`MONGODB_URI`, `JWT_SECRET`, `CLOUDINARY_CLOUD_NAME`, etc.) in the Vercel dashboard.
4. Click **Deploy**. Vercel will automatically build the React frontend and deploy the serverless API routes.

---

## 📝 License
Created for Ganesh Utsav Apartment Financial Management.
