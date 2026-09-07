import type { IncomingMessage, ServerResponse } from 'http';
import url from 'url';

// Import handlers
import authLogin from '../auth/login';
import authLogout from '../auth/logout';
import authMe from '../auth/me';
import usersIndex from '../users/index';
import usersId from '../users/[id]';
import festivalsIndex from '../festivals/index';
import festivalsId from '../festivals/[id]';
import fundsIndex from '../funds/index';
import fundsId from '../funds/[id]';
import sponsorshipsIndex from '../sponsorships/index';
import sponsorshipsId from '../sponsorships/[id]';
import expensesIndex from '../expenses/index';
import expensesSuggestions from '../expenses/suggestions';
import expensesId from '../expenses/[id]';
import reportsDashboard from '../reports/dashboard';
import reportsFinal from '../reports/final';
import committeeMembersIndex from '../committee-members/index';
import activityLogsIndex from '../activity-logs/index';
import uploadHandler from '../upload';

export async function handleDevApiRequest(req: IncomingMessage, res: ServerResponse) {
  const parsedUrl = url.parse(req.url || '', true);
  const pathname = parsedUrl.pathname || '';

  // Helper to attach status and json helper to res (emulating VercelResponse)
  const vRes: any = res;
  vRes.status = (statusCode: number) => {
    res.statusCode = statusCode;
    return vRes;
  };
  vRes.json = (data: any) => {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(data));
    return vRes;
  };

  // Helper to parse JSON body if present
  let body: any = {};
  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
    const buffers: Buffer[] = [];
    for await (const chunk of req) {
      buffers.push(chunk);
    }
    const rawBody = Buffer.concat(buffers).toString();
    try {
      body = rawBody ? JSON.parse(rawBody) : {};
    } catch (e) {
      body = {};
    }
  }

  const vReq: any = req;
  vReq.query = parsedUrl.query;
  vReq.body = body;

  try {
    if (pathname === '/api/auth/login') {
      return await authLogin(vReq, vRes);
    }
    if (pathname === '/api/auth/logout') {
      return await authLogout(vReq, vRes);
    }
    if (pathname === '/api/auth/me') {
      return await authMe(vReq, vRes);
    }

    if (pathname === '/api/users' || pathname === '/api/users/') {
      return await usersIndex(vReq, vRes);
    }
    if (pathname.startsWith('/api/users/')) {
      const id = pathname.replace('/api/users/', '');
      vReq.query.id = id;
      return await usersId(vReq, vRes);
    }

    if (pathname === '/api/festivals' || pathname === '/api/festivals/') {
      return await festivalsIndex(vReq, vRes);
    }
    if (pathname.startsWith('/api/festivals/')) {
      const id = pathname.replace('/api/festivals/', '');
      vReq.query.id = id;
      return await festivalsId(vReq, vRes);
    }

    if (pathname === '/api/funds' || pathname === '/api/funds/') {
      return await fundsIndex(vReq, vRes);
    }
    if (pathname.startsWith('/api/funds/')) {
      const id = pathname.replace('/api/funds/', '');
      vReq.query.id = id;
      return await fundsId(vReq, vRes);
    }

    if (pathname === '/api/sponsorships' || pathname === '/api/sponsorships/') {
      return await sponsorshipsIndex(vReq, vRes);
    }
    if (pathname.startsWith('/api/sponsorships/')) {
      const id = pathname.replace('/api/sponsorships/', '');
      vReq.query.id = id;
      return await sponsorshipsId(vReq, vRes);
    }

    if (pathname === '/api/expenses/suggestions') {
      return await expensesSuggestions(vReq, vRes);
    }
    if (pathname === '/api/expenses' || pathname === '/api/expenses/') {
      return await expensesIndex(vReq, vRes);
    }
    if (pathname.startsWith('/api/expenses/')) {
      const id = pathname.replace('/api/expenses/', '');
      vReq.query.id = id;
      return await expensesId(vReq, vRes);
    }

    if (pathname === '/api/reports/dashboard') {
      return await reportsDashboard(vReq, vRes);
    }
    if (pathname === '/api/reports/final') {
      return await reportsFinal(vReq, vRes);
    }

    if (pathname === '/api/committee-members' || pathname === '/api/committee-members/') {
      return await committeeMembersIndex(vReq, vRes);
    }

    if (pathname === '/api/activity-logs' || pathname === '/api/activity-logs/') {
      return await activityLogsIndex(vReq, vRes);
    }

    if (pathname === '/api/upload') {
      return await uploadHandler(vReq, vRes);
    }

    return vRes.status(404).json({ message: `API Endpoint ${pathname} Not Found` });
  } catch (err: any) {
    console.error('Dev Router API Error:', err);
    return vRes.status(500).json({ message: err.message || 'Internal Server Error' });
  }
}
