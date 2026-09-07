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

// Auth
app.post(['/api/auth/login', '/auth/login'], wrap(authLogin));
app.post(['/api/auth/logout', '/auth/logout'], wrap(authLogout));
app.get(['/api/auth/me', '/auth/me'], wrap(authMe));

// Users
app.get(['/api/users', '/users'], wrap(usersIndex));
app.post(['/api/users', '/users'], wrap(usersIndex));
app.get(['/api/users/:id', '/users/:id'], wrap(usersId));
app.put(['/api/users/:id', '/users/:id'], wrap(usersId));
app.delete(['/api/users/:id', '/users/:id'], wrap(usersId));

// Festivals
app.get(['/api/festivals', '/festivals'], wrap(festivalsIndex));
app.post(['/api/festivals', '/festivals'], wrap(festivalsIndex));
app.get(['/api/festivals/:id', '/festivals/:id'], wrap(festivalsId));
app.put(['/api/festivals/:id', '/festivals/:id'], wrap(festivalsId));
app.delete(['/api/festivals/:id', '/festivals/:id'], wrap(festivalsId));

// Funds
app.get(['/api/funds', '/funds'], wrap(fundsIndex));
app.post(['/api/funds', '/funds'], wrap(fundsIndex));
app.get(['/api/funds/:id', '/funds/:id'], wrap(fundsId));
app.put(['/api/funds/:id', '/funds/:id'], wrap(fundsId));
app.delete(['/api/funds/:id', '/funds/:id'], wrap(fundsId));

// Sponsorships
app.get(['/api/sponsorships', '/sponsorships'], wrap(sponsorshipsIndex));
app.post(['/api/sponsorships', '/sponsorships'], wrap(sponsorshipsIndex));
app.get(['/api/sponsorships/:id', '/sponsorships/:id'], wrap(sponsorshipsId));
app.put(['/api/sponsorships/:id', '/sponsorships/:id'], wrap(sponsorshipsId));
app.delete(['/api/sponsorships/:id', '/sponsorships/:id'], wrap(sponsorshipsId));

// Expenses
app.get(['/api/expenses/suggestions', '/expenses/suggestions'], wrap(expensesSuggestions));
app.get(['/api/expenses', '/expenses'], wrap(expensesIndex));
app.post(['/api/expenses', '/expenses'], wrap(expensesIndex));
app.get(['/api/expenses/:id', '/expenses/:id'], wrap(expensesId));
app.put(['/api/expenses/:id', '/expenses/:id'], wrap(expensesId));
app.delete(['/api/expenses/:id', '/expenses/:id'], wrap(expensesId));

// Reports
app.get(['/api/reports/dashboard', '/reports/dashboard'], wrap(reportsDashboard));
app.get(['/api/reports/final', '/reports/final'], wrap(reportsFinal));

// Committee Members
app.get(['/api/committee-members', '/committee-members'], wrap(committeeMembersIndex));
app.post(['/api/committee-members', '/committee-members'], wrap(committeeMembersIndex));

// Activity Logs
app.get(['/api/activity-logs', '/activity-logs'], wrap(activityLogsIndex));

// Upload
app.post(['/api/upload', '/upload'], wrap(uploadHandler));

// Fallback 404 Handler
app.use((req: any, res: any) => {
  res.status(404).json({ message: `Route ${req.method} ${req.url} Not Found` });
});

// Global Error Handler
app.use((err: any, req: any, res: any, next: any) => {
  console.error('Express API Error:', err);
  res.status(500).json({ message: err?.message || 'Internal Server Error' });
});

module.exports = app;
export default app;
