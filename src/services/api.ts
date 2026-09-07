const API_BASE = '/api';

export function getAuthToken(): string | null {
  return localStorage.getItem('ganesh_token');
}

export function setAuthToken(token: string) {
  localStorage.setItem('ganesh_token', token);
}

export function removeAuthToken() {
  localStorage.removeItem('ganesh_token');
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  let data: any = {};
  try {
    data = await response.json();
  } catch (e) {
    // Non-JSON response
  }

  if (!response.ok) {
    const errorMsg =
      data?.message ||
      data?.error?.message ||
      (typeof data?.error === 'string' ? data.error : null) ||
      response.statusText ||
      `Request failed (${response.status})`;
    throw new Error(errorMsg);
  }

  return data as T;
}

export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint, { method: 'GET' }),
  post: <T>(endpoint: string, body: any) => request<T>(endpoint, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(endpoint: string, body: any) => request<T>(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(endpoint: string) => request<T>(endpoint, { method: 'DELETE' }),
};
