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
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Determine request pathname
  const parsedUrl = url.parse(req.url || '', true);
  let pathname = parsedUrl.pathname || '';

  // Fallback using query.path if req.url was rewritten
  if (req.query && typeof req.query.path === 'string') {
    pathname = '/api/' + req.query.path;
  } else if (req.query && Array.isArray(req.query.path)) {
    pathname = '/api/' + req.query.path.join('/');
  }

  try {
    if (pathname.includes('/auth/login')) {
      return await authLogin(req, res);
    }
    if (pathname.includes('/auth/logout')) {
      return await authLogout(req, res);
    }
    if (pathname.includes('/auth/me')) {
      return await authMe(req, res);
    }

    if (pathname.includes('/users/') && pathname.split('/users/')[1]) {
      const id = pathname.split('/users/')[1];
      req.query.id = id;
      return await usersId(req, res);
    }
    if (pathname.includes('/users')) {
      return await usersIndex(req, res);
    }

    if (pathname.includes('/festivals/') && pathname.split('/festivals/')[1]) {
      const id = pathname.split('/festivals/')[1];
      req.query.id = id;
      return await festivalsId(req, res);
    }
    if (pathname.includes('/festivals')) {
      return await festivalsIndex(req, res);
    }

    if (pathname.includes('/funds/') && pathname.split('/funds/')[1]) {
      const id = pathname.split('/funds/')[1];
      req.query.id = id;
      return await fundsId(req, res);
    }
    if (pathname.includes('/funds')) {
      return await fundsIndex(req, res);
    }

    if (pathname.includes('/sponsorships/') && pathname.split('/sponsorships/')[1]) {
      const id = pathname.split('/sponsorships/')[1];
      req.query.id = id;
      return await sponsorshipsId(req, res);
    }
    if (pathname.includes('/sponsorships')) {
      return await sponsorshipsIndex(req, res);
    }

    if (pathname.includes('/expenses/suggestions')) {
      return await expensesSuggestions(req, res);
    }
    if (pathname.includes('/expenses/') && pathname.split('/expenses/')[1]) {
      const id = pathname.split('/expenses/')[1];
      req.query.id = id;
      return await expensesId(req, res);
    }
    if (pathname.includes('/expenses')) {
      return await expensesIndex(req, res);
    }

    if (pathname.includes('/reports/dashboard')) {
      return await reportsDashboard(req, res);
    }
    if (pathname.includes('/reports/final')) {
      return await reportsFinal(req, res);
    }

    if (pathname.includes('/committee-members')) {
      return await committeeMembersIndex(req, res);
    }

    if (pathname.includes('/activity-logs')) {
      return await activityLogsIndex(req, res);
    }

    if (pathname.includes('/upload')) {
      return await uploadHandler(req, res);
    }

    return res.status(404).json({ message: `API Endpoint ${pathname} Not Found` });
  } catch (err: any) {
    console.error('API Router Error:', err);
    return res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
}
