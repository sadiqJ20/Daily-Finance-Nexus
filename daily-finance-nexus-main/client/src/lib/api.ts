// API service for communicating with the backend

const API_BASE = import.meta.env.VITE_API_URL || '/api';
console.log('🔍 Using API URL:', import.meta.env.VITE_API_URL); // Debug log for API URL

/**
 * Typed JSON fetch – throws for non-2xx responses.
 */
export async function apiFetch<T>(endpoint: string, init: RequestInit = {}): Promise<T> {
  const fullUrl = `${API_BASE}${endpoint}`;
  console.log('📡 Requesting:', fullUrl, init); // Debug log for each request
  const res = await fetch(fullUrl, {
    headers: { 'Content-Type': 'application/json', ...(init.headers || {}) },
    ...init,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

// Auth API
export const authAPI = {
  register: (userData: any) => {
    return apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },
  login: (credentials: any) => {
    return apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },
};

// Loans API
export const loansAPI = {
  getAll: () => apiFetch('/loans'),
  create: (loanData: any) => {
    return apiFetch('/loans', {
      method: 'POST',
      body: JSON.stringify(loanData),
    });
  },
  update: (id: string, loanData: any) => {
    return apiFetch(`/loans/${id}`, {
      method: 'PUT',
      body: JSON.stringify(loanData),
    });
  },
  delete: (id: string) => {
    return apiFetch(`/loans/${id}`, {
      method: 'DELETE',
    });
  },
};

// Payments API
export const paymentsAPI = {
  getAll: (loanId?: string) => {
    const query = loanId ? `?loanId=${loanId}` : '';
    return apiFetch(`/payments${query}`);
  },
  create: (paymentData: any) => {
    return apiFetch('/payments', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  },
};