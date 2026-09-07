import express from 'express';
import cors from 'cors';

// Import serverless handlers from underscore-prefixed directories
import authLogin from './_auth/login';
import authLogout from './_auth/logout';
import authMe from './_auth/me';
import usersIndex from './_users/index';
import usersId from './_users/id';
import festivalsIndex from './_festivals/index';
import festivalsId from './_festivals/id';
import fundsIndex from './_funds/index';
import fundsId from './_funds/id';
import sponsorshipsIndex from './_sponsorships/index';
import sponsorshipsId from './_sponsorships/id';
import expensesIndex from './_expenses/index';
import expensesSuggestions from './_expenses/suggestions';
import expensesId from './_expenses/id';
import reportsDashboard from './_reports/dashboard';
import reportsFinal from './_reports/final';
import committeeMembersIndex from './_committee-members/index';
import activityLogsIndex from './_activity-logs/index';
import uploadHandler from './_upload/index';

const app = express();

// Enable CORS
app.use(cors({ origin: true, credentials: true }));

// Safe Vercel body handling middleware (handles pre-parsed req.body from Vercel platform)
app.use((req: any, res: any, next: any) => {
  if (req.body !== undefined && req.body !== null) {
    if (typeof req.body === 'string') {
      try {
        req.body = JSON.parse(req.body);
      } catch (e) {
        // Keep as string or object
      }
    }
    return next();
  }
  express.json({ limit: '10mb' })(req, res, (err) => {
    if (err) req.body = {};
    next();
  });
});

// Express wrapper adapter for Vercel handlers
const adapt = (handler: any) => async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    if (req.params && req.params.id) {
      req.query = req.query || {};
      req.query.id = req.params.id;
    }
    await handler(req as any, res as any);
  } catch (err) {
    next(err);
  }
};

// --- AUTH ROUTES ---
app.post('/api/auth/login', adapt(authLogin));
app.post('/api/auth/logout', adapt(authLogout));
app.get('/api/auth/me', adapt(authMe));

// --- USERS ROUTES ---
app.all('/api/users/:id', adapt(usersId));
app.all('/api/users', adapt(usersIndex));

// --- FESTIVALS ROUTES ---
app.all('/api/festivals/:id', adapt(festivalsId));
app.all('/api/festivals', adapt(festivalsIndex));

// --- FUNDS ROUTES ---
app.all('/api/funds/:id', adapt(fundsId));
app.all('/api/funds', adapt(fundsIndex));

// --- SPONSORSHIPS ROUTES ---
app.all('/api/sponsorships/:id', adapt(sponsorshipsId));
app.all('/api/sponsorships', adapt(sponsorshipsIndex));

// --- EXPENSES ROUTES ---
app.get('/api/expenses/suggestions', adapt(expensesSuggestions));
app.all('/api/expenses/:id', adapt(expensesId));
app.all('/api/expenses', adapt(expensesIndex));

// --- REPORTS ROUTES ---
app.get('/api/reports/dashboard', adapt(reportsDashboard));
app.get('/api/reports/final', adapt(reportsFinal));

// --- COMMITTEE MEMBERS ROUTES ---
app.all('/api/committee-members/:id', adapt(committeeMembersIndex));
app.all('/api/committee-members', adapt(committeeMembersIndex));

// --- ACTIVITY LOGS ROUTES ---
app.get('/api/activity-logs', adapt(activityLogsIndex));

// --- UPLOAD ROUTE ---
app.post('/api/upload', adapt(uploadHandler));

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('API Express Global Error:', err);
  if (res.headersSent) return next(err);
  res.status(500).json({ message: err?.message || 'Internal Server Error' });
});

// Standard Vercel Serverless Function export signature
export default function handler(req: any, res: any) {
  return app(req, res);
}
