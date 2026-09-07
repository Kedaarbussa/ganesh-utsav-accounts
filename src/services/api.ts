import { clientStorage } from './clientStorage';

export function getAuthToken(): string | null {
  return localStorage.getItem('ganesh_token');
}

export function setAuthToken(token: string) {
  localStorage.setItem('ganesh_token', token);
}

export function removeAuthToken() {
  localStorage.removeItem('ganesh_token');
}

// Router dispatcher for client API calls
async function handleClientApi(endpoint: string, method: string, body?: any): Promise<any> {
  const token = getAuthToken() || '';
  const urlPath = endpoint.split('?')[0];

  // Helper to extract query parameters
  const getQueryParam = (param: string): string | undefined => {
    if (!endpoint.includes('?')) return undefined;
    const queryString = endpoint.split('?')[1];
    const params = new URLSearchParams(queryString);
    return params.get(param) || undefined;
  };

  // --- AUTH ENDPOINTS ---
  if (urlPath === '/auth/login' && method === 'POST') {
    const { username, password } = body || {};
    return clientStorage.login(username, password);
  }

  if (urlPath === '/auth/me' && method === 'GET') {
    return clientStorage.getMe(token);
  }

  if (urlPath === '/auth/logout') {
    return { message: 'Logged out successfully' };
  }

  // --- FESTIVALS ---
  if (urlPath === '/festivals' && method === 'GET') {
    return clientStorage.getFestivals();
  }

  if (urlPath === '/festivals' && method === 'POST') {
    return clientStorage.createFestival(body);
  }

  if (urlPath.startsWith('/festivals/') && method === 'PUT') {
    const id = urlPath.replace('/festivals/', '');
    return clientStorage.updateFestival(id, body);
  }

  if (urlPath.startsWith('/festivals/') && method === 'DELETE') {
    const id = urlPath.replace('/festivals/', '');
    clientStorage.deleteFestival(id);
    return { message: 'Festival deleted' };
  }

  // --- USERS ---
  if (urlPath === '/users' && method === 'GET') {
    return clientStorage.getUsers();
  }

  if (urlPath === '/users' && method === 'POST') {
    return clientStorage.createUser(body);
  }

  if (urlPath.startsWith('/users/') && method === 'PUT') {
    const id = urlPath.replace('/users/', '');
    return clientStorage.updateUser(id, body);
  }

  if (urlPath.startsWith('/users/') && method === 'DELETE') {
    const id = urlPath.replace('/users/', '');
    clientStorage.deleteUser(id);
    return { message: 'User deleted' };
  }

  // --- FUNDS ---
  if (urlPath === '/funds' && method === 'GET') {
    const festivalId = getQueryParam('festivalId');
    return clientStorage.getFunds(festivalId);
  }

  if (urlPath === '/funds' && method === 'POST') {
    const userRes = clientStorage.getMe(token);
    return clientStorage.createFund(body, userRes.user.id || userRes.user._id || '', userRes.user.fullName);
  }

  if (urlPath.startsWith('/funds/') && method === 'PUT') {
    const id = urlPath.replace('/funds/', '');
    return clientStorage.updateFund(id, body);
  }

  if (urlPath.startsWith('/funds/') && method === 'DELETE') {
    const id = urlPath.replace('/funds/', '');
    clientStorage.deleteFund(id);
    return { message: 'Fund record deleted' };
  }

  // --- SPONSORSHIPS ---
  if (urlPath === '/sponsorships' && method === 'GET') {
    const festivalId = getQueryParam('festivalId');
    return clientStorage.getSponsorships(festivalId);
  }

  if (urlPath === '/sponsorships' && method === 'POST') {
    const userRes = clientStorage.getMe(token);
    return clientStorage.createSponsorship(body, userRes.user.id || userRes.user._id || '', userRes.user.fullName);
  }

  if (urlPath.startsWith('/sponsorships/') && method === 'PUT') {
    const id = urlPath.replace('/sponsorships/', '');
    return clientStorage.updateSponsorship(id, body);
  }

  if (urlPath.startsWith('/sponsorships/') && method === 'DELETE') {
    const id = urlPath.replace('/sponsorships/', '');
    clientStorage.deleteSponsorship(id);
    return { message: 'Sponsorship record deleted' };
  }

  // --- EXPENSES ---
  if (urlPath === '/expenses/suggestions' && method === 'GET') {
    return clientStorage.getExpenseSuggestions();
  }

  if (urlPath === '/expenses' && method === 'GET') {
    const festivalId = getQueryParam('festivalId');
    return clientStorage.getExpenses(festivalId);
  }

  if (urlPath === '/expenses' && method === 'POST') {
    const userRes = clientStorage.getMe(token);
    return clientStorage.createExpense(body, userRes.user.id || userRes.user._id || '', userRes.user.fullName);
  }

  if (urlPath.startsWith('/expenses/') && method === 'PUT') {
    const id = urlPath.replace('/expenses/', '');
    return clientStorage.updateExpense(id, body);
  }

  if (urlPath.startsWith('/expenses/') && method === 'DELETE') {
    const id = urlPath.replace('/expenses/', '');
    clientStorage.deleteExpense(id);
    return { message: 'Expense record deleted' };
  }

  // --- COMMITTEE MEMBERS ---
  if (urlPath === '/committee-members' && method === 'GET') {
    const festivalId = getQueryParam('festivalId');
    return clientStorage.getCommitteeMembers(festivalId);
  }

  if (urlPath === '/committee-members' && method === 'POST') {
    return clientStorage.createCommitteeMember(body);
  }

  if (urlPath.startsWith('/committee-members/') && method === 'DELETE') {
    const id = urlPath.replace('/committee-members/', '');
    clientStorage.deleteCommitteeMember(id);
    return { message: 'Committee member deleted' };
  }

  // --- REPORTS ---
  if (urlPath === '/reports/dashboard' && method === 'GET') {
    const festivalId = getQueryParam('festivalId') || 'fest_2026_001';
    return clientStorage.getDashboardSummary(festivalId);
  }

  if (urlPath === '/reports/final' && method === 'GET') {
    const festivalId = getQueryParam('festivalId') || 'fest_2026_001';
    return clientStorage.getFinalReport(festivalId);
  }

  // --- ACTIVITY LOGS ---
  if (urlPath === '/activity-logs' && method === 'GET') {
    const festivalId = getQueryParam('festivalId');
    return clientStorage.getActivityLogs(festivalId);
  }

  // --- UPLOAD ---
  if (urlPath === '/upload' && method === 'POST') {
    const { fileData } = body || {};
    return { url: fileData || '', message: 'Uploaded successfully' };
  }

  throw new Error(`Endpoint ${endpoint} not supported`);
}

export const api = {
  get: <T>(endpoint: string) => handleClientApi(endpoint, 'GET') as Promise<T>,
  post: <T>(endpoint: string, body: any) => handleClientApi(endpoint, 'POST', body) as Promise<T>,
  put: <T>(endpoint: string, body: any) => handleClientApi(endpoint, 'PUT', body) as Promise<T>,
  delete: <T>(endpoint: string) => handleClientApi(endpoint, 'DELETE') as Promise<T>,
};
