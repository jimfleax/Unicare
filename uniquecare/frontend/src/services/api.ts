const API_BASE = 'http://localhost:5000/api';

/* ── Types ─────────────────────────────────────────────────── */
export interface IssueRecord {
  id: string;
  title: string;
  location: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  status: 'Open' | 'In Progress' | 'Resolved';
  assignee: string;
  reporter: string;
  ticketId?: string;
  date: string;
  time?: string;
  description?: string;
  category?: string;
  activityLogs?: Array<{
    _id?: string;
    message: string;
    createdAt: string;
    createdBy: { name: string; role: string };
  }>;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  data: {
    user: {
      _id: string;
      name: string;
      email: string;
      role: 'student' | 'technician' | 'admin' | 'lab_admin';
    };
    token: string;
  };
}

export interface MeResponse {
  user: {
    _id: string;
    name: string;
    email: string;
    role: 'student' | 'technician' | 'admin' | 'lab_admin';
  };
}

/* ── Auth Token Helper ─────────────────────────────────────── */
function getStoredToken(): string | null {
  try {
    const raw = localStorage.getItem('ucare-auth');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.token || null;
  } catch {
    return null;
  }
}

function getAuthHeaders(): Record<string, string> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

/* ── Auth API ──────────────────────────────────────────────── */

/** POST /api/auth/login */
export async function loginApi(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) {
    return { success: false, message: data.message || 'Login failed', data: data.data };
  }
  return data;
}

/** POST /api/auth/register */
export async function signupApi(name: string, email: string, password: string, role?: string): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ name, email, password, role: role || 'student' }),
  });
  const data = await res.json();
  if (!res.ok) {
    return { success: false, message: data.message || 'Registration failed', data: data.data };
  }
  return data;
}

/** GET /api/auth/me — Validate session with token */
export async function getMeApi(token: string): Promise<MeResponse | null> {
  try {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.success && data.data) {
      return data.data;
    }
    return null;
  } catch {
    return null;
  }
}

/* ── Issues API ────────────────────────────────────────────── */

export async function fetchIssuesFromApi(): Promise<IssueRecord[] | null> {
  try {
    const res = await fetch(`${API_BASE}/incidents`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.success && Array.isArray(data.data)) {
      return data.data;
    }
    return null;
  } catch (e) {
    console.warn('Backend API unavailable, using local state fallback');
    return null;
  }
}

export async function createIssueApi(issue: Partial<IssueRecord>): Promise<IssueRecord | null> {
  try {
    const payload = {
      title: issue.title,
      description: issue.description || issue.title,
      location: issue.location,
      category: issue.category,
      tagId: issue.id
    };
    const res = await fetch(`${API_BASE}/incidents`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.success && data.data) {
      return data.data;
    }
    return null;
  } catch (e) {
    return null;
  }
}

export const fetcher = async (url: string) => {
  const token = getStoredToken() || "";
  const headers: HeadersInit = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(`${API_BASE}${url}`, { headers });
  if (!res.ok) {
    const error = new Error('An error occurred while fetching the data.');
    (error as any).info = await res.json().catch(() => ({}));
    (error as any).status = res.status;
    throw error;
  }
  const data = await res.json();
  return data.data;
};

export async function updateIncidentStatusApi(id: string, status: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/incidents/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    return res.ok;
  } catch (error) {
    console.error("Failed to update status", error);
    return false;
  }
}

export async function addRepairLogApi(issueId: string, content: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/incidents/${issueId}/logs`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ content }),
    });
    return res.ok;
  } catch (e) {
    console.error("Failed to add repair log", e);
    return false;
  }
}

export async function fetchAssetsApi(): Promise<any[]> {
  try {
    const res = await fetch(`${API_BASE}/assets`, { headers: getAuthHeaders() });
    if (!res.ok) return [];
    const data = await res.json();
    return data.success ? data.data : [];
  } catch {
    return [];
  }
}

export interface Technician {
  id: string;
  name: string;
  title: string;
  specialty: string;
  status: 'On Shift' | 'In Field' | 'On Call' | 'Off Duty';
  phone: string;
  activeJobsCount: number;
  avatarColor: string;
}

export interface SparePart {
  id: string;
  name: string;
  category: string;
  stock: number;
  unit: string;
  status: 'In Stock' | 'Low Stock' | 'Reorder';
}

export async function fetchTechniciansApi(): Promise<Technician[] | null> {
  try {
    const res = await fetch(`${API_BASE}/users/technicians`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.success && Array.isArray(data.data)) {
      return data.data;
    }
    return null;
  } catch (e) {
    console.error('Failed to fetch technicians', e);
    return null;
  }
}

export async function fetchInventoryApi(): Promise<SparePart[] | null> {
  try {
    const res = await fetch(`${API_BASE}/inventory`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.success && Array.isArray(data.data)) {
      return data.data;
    }
    return null;
  } catch (e) {
    console.error('Failed to fetch inventory', e);
    return null;
  }
}


async function fetchMetadata<T>(name: string): Promise<T> {
  const res = await fetch(`${API_BASE}/metadata/${name}`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error(`Failed to load ${name} (${res.status})`);
  const body = await res.json();
  if (!body || !body.success || body.data === undefined || body.data === null) {
    throw new Error(`Failed to load ${name}`);
  }
  return body.data as T;
}

export const fetchLocationsApi = (): Promise<string[]> => fetchMetadata<string[]>('locations');
export const fetchCategoriesApi = (): Promise<{value: string, label: string}[]> => fetchMetadata('categories');
export const fetchPrioritiesApi = (): Promise<{value: string, label: string}[]> => fetchMetadata('priorities');
export const fetchStatusesApi = (): Promise<string[]> => fetchMetadata<string[]>('statuses');
export const fetchFaqsApi = (): Promise<{question: string, answer: string}[]> => fetchMetadata('faqs');
export const fetchStudentProfileApi = (): Promise<{batch: string, batchCode: string, branch: string, rollNo: string}> => fetchMetadata('student-profile');
export async function markNotificationsReadApi(): Promise<boolean> { try { const res = await fetch(`${API_BASE}/notifications/mark-read`, { method: "PUT", headers: getAuthHeaders() }); return res.ok; } catch { return false; } }
export async function markNotificationReadApi(id: string): Promise<boolean> { try { const res = await fetch(`${API_BASE}/notifications/${id}/mark-read`, { method: "PUT", headers: getAuthHeaders() }); return res.ok; } catch { return false; } }
