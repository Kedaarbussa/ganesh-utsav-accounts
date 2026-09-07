import express from 'express';
import cors from 'cors';

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
import uploadHandler from './_upload';

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware to restore original request URL if rewritten by Vercel
app.use((req: any, res: any, next: any) => {
  const forwardedUri = req.headers['x-forwarded-uri'] as string;
  const pathQuery = req.query?.path as string;

  if (forwardedUri && forwardedUri.startsWith('/api')) {
    req.url = forwardedUri;
  } else if (pathQuery) {
    req.url = '/api/' + pathQuery.replace(/^\/+/, '');
  }
  next();
});

const wrap = (fn: any) => async (req: any, res: any, next: any) => {
  try {
    if (req.params && req.params.id) {
      req.query = req.query || {};
      req.query.id = req.params.id;
    }
    await fn(req, res);
  } catch (err) {
    next(err);
  }
};

const router = express.Router();

// Auth
router.post('/auth/login', wrap(authLogin));
router.post('/auth/logout', wrap(authLogout));
router.get('/auth/me', wrap(authMe));

// Users
router.get('/users', wrap(usersIndex));
router.post('/users', wrap(usersIndex));
router.get('/users/:id', wrap(usersId));
router.put('/users/:id', wrap(usersId));
router.delete('/users/:id', wrap(usersId));

// Festivals
router.get('/festivals', wrap(festivalsIndex));
router.post('/festivals', wrap(festivalsIndex));
router.get('/festivals/:id', wrap(festivalsId));
router.put('/festivals/:id', wrap(festivalsId));
router.delete('/festivals/:id', wrap(festivalsId));

// Funds
router.get('/funds', wrap(fundsIndex));
router.post('/funds', wrap(fundsIndex));
router.get('/funds/:id', wrap(fundsId));
router.put('/funds/:id', wrap(fundsId));
router.delete('/funds/:id', wrap(fundsId));

// Sponsorships
router.get('/sponsorships', wrap(sponsorshipsIndex));
router.post('/sponsorships', wrap(sponsorshipsIndex));
router.get('/sponsorships/:id', wrap(sponsorshipsId));
router.put('/sponsorships/:id', wrap(sponsorshipsId));
router.delete('/sponsorships/:id', wrap(sponsorshipsId));

// Expenses
router.get('/expenses/suggestions', wrap(expensesSuggestions));
router.get('/expenses', wrap(expensesIndex));
router.post('/expenses', wrap(expensesIndex));
router.get('/expenses/:id', wrap(expensesId));
router.put('/expenses/:id', wrap(expensesId));
router.delete('/expenses/:id', wrap(expensesId));

// Reports
router.get('/reports/dashboard', wrap(reportsDashboard));
router.get('/reports/final', wrap(reportsFinal));

// Committee Members
router.get('/committee-members', wrap(committeeMembersIndex));
router.post('/committee-members', wrap(committeeMembersIndex));

// Activity Logs
router.get('/activity-logs', wrap(activityLogsIndex));

// Upload
router.post('/upload', wrap(uploadHandler));

app.use('/api', router);
app.use('/', router);

// 404 Handler
app.use((req: any, res: any) => {
  res.status(404).json({ message: `API route ${req.method} ${req.url} not found` });
});

// Error Handler
app.use((err: any, req: any, res: any, next: any) => {
  console.error('Express API Serverless Error:', err);
  res.status(500).json({ message: err?.message || 'Internal Server Error' });
});

module.exports = app;
export default app;
