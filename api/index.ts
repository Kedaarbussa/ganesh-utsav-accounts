import type { VercelRequest, VercelResponse } from '@vercel/node';
import url from 'url';

import authLogin from './_auth/login';
import authLogout from './_auth/logout';
import authMe from './_auth/me';
import usersIndex from './_users/index';
import usersId from './_users/[id]';
import festivalsIndex from './_festivals/index';
import festivalsId from './_festivals/[id]';
import fundsIndex from './_funds/index';
import fundsId from './_funds/[id]';
import sponsorshipsIndex from './_sponsorships/index';
import sponsorshipsId from './_sponsorships/[id]';
import expensesIndex from './_expenses/index';
import expensesSuggestions from './_expenses/suggestions';
import expensesId from './_expenses/[id]';
import reportsDashboard from './_reports/dashboard';
import reportsFinal from './_reports/final';
import committeeMembersIndex from './_committee-members/index';
import activityLogsIndex from './_activity-logs/index';
import uploadHandler from './_upload';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const parsedUrl = url.parse(req.url || '', true);
  const pathname = parsedUrl.pathname || '';

  try {
    if (pathname === '/api/auth/login') {
      return await authLogin(req, res);
    }
    if (pathname === '/api/auth/logout') {
      return await authLogout(req, res);
    }
    if (pathname === '/api/auth/me') {
      return await authMe(req, res);
    }

    if (pathname === '/api/users' || pathname === '/api/users/') {
      return await usersIndex(req, res);
    }
    if (pathname.startsWith('/api/users/')) {
      const id = pathname.replace('/api/users/', '');
      req.query.id = id;
      return await usersId(req, res);
    }

    if (pathname === '/api/festivals' || pathname === '/api/festivals/') {
      return await festivalsIndex(req, res);
    }
    if (pathname.startsWith('/api/festivals/')) {
      const id = pathname.replace('/api/festivals/', '');
      req.query.id = id;
      return await festivalsId(req, res);
    }

    if (pathname === '/api/funds' || pathname === '/api/funds/') {
      return await fundsIndex(req, res);
    }
    if (pathname.startsWith('/api/funds/')) {
      const id = pathname.replace('/api/funds/', '');
      req.query.id = id;
      return await fundsId(req, res);
    }

    if (pathname === '/api/sponsorships' || pathname === '/api/sponsorships/') {
      return await sponsorshipsIndex(req, res);
    }
    if (pathname.startsWith('/api/sponsorships/')) {
      const id = pathname.replace('/api/sponsorships/', '');
      req.query.id = id;
      return await sponsorshipsId(req, res);
    }

    if (pathname === '/api/expenses/suggestions') {
      return await expensesSuggestions(req, res);
    }
    if (pathname === '/api/expenses' || pathname === '/api/expenses/') {
      return await expensesIndex(req, res);
    }
    if (pathname.startsWith('/api/expenses/')) {
      const id = pathname.replace('/api/expenses/', '');
      req.query.id = id;
      return await expensesId(req, res);
    }

    if (pathname === '/api/reports/dashboard') {
      return await reportsDashboard(req, res);
    }
    if (pathname === '/api/reports/final') {
      return await reportsFinal(req, res);
    }

    if (pathname === '/api/committee-members' || pathname === '/api/committee-members/') {
      return await committeeMembersIndex(req, res);
    }

    if (pathname === '/api/activity-logs' || pathname === '/api/activity-logs/') {
      return await activityLogsIndex(req, res);
    }

    if (pathname === '/api/upload') {
      return await uploadHandler(req, res);
    }

    return res.status(404).json({ message: `API Endpoint ${pathname} Not Found` });
  } catch (err: any) {
    console.error('Unified API Error:', err);
    return res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
}
