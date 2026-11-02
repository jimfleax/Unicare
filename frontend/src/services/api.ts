const API_BASE = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api`;

export async function checkHealthApi(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) return false;
    const data = await res.json();
    return !!data.success;
  } catch (error) {
    return false;
  }
}
/* ── Types ─────────────────────────────────────────────────── */
export interface IssueRecord {
  id: string;
  title: string;
  location: string;
  priority: "Critical" | "High" | "Medium" | "Low";
  status: "Open" | "In Progress" | "Resolved";
  assignee: string;
  reporter: string;
  ticketId?: string;
  date: string;
  createdAt?: string;
  time?: string;
  description?: string;
  category?: string;
  resolvedAt?: string;
  mediaUrls?: string[];
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
      role: "student" | "technician" | "admin" | "lab_admin";
      avatarUrl?: string;
    };
    token: string;
  };
}

export interface MeResponse {
  user: {
    _id: string;
    name: string;
    email: string;
    role: "student" | "technician" | "admin" | "lab_admin";
    avatarUrl?: string;
  };
}

/* ── Auth Token Helper ─────────────────────────────────────── */
export function getStoredToken(): string | null {
  try {
    const raw = localStorage.getItem("ucare-auth");
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
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

/* ── Auth API ──────────────────────────────────────────────── */

/** POST /api/auth/login */
export async function loginApi(
  email: string,
  password: string,
): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) {
    return {
      success: false,
      message: data.message || "Login failed",
      data: data.data,
    };
  }
  return data;
}

/** POST /api/auth/register */
export async function signupApi(
  name: string,
  email: string,
  password: string,
  role?: string,
): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ name, email, password, role: role || "student" }),
  });
  const data = await res.json();
  if (!res.ok) {
    return {
      success: false,
      message: data.message || "Registration failed",
      data: data.data,
    };
  }
  return data;
}

/** GET /api/auth/me — Validate session with token */
export async function getMeApi(token: string): Promise<MeResponse | null> {
  try {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
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
    console.warn("Backend API unavailable, using local state fallback");
    return null;
  }
}

export async function createIssueApi(
  issue: Partial<IssueRecord>,
): Promise<IssueRecord | null> {
  try {
    const payload = {
      title: issue.title,
      description: issue.description || issue.title,
      location: issue.location,
      category: issue.category,
      priority: issue.priority || "Medium",
      tagId: issue.id,
      mediaUrls: issue.mediaUrls || [],
    };
    const res = await fetch(`${API_BASE}/incidents`, {
      method: "POST",
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
    Accept: "application/json",
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetch(`${API_BASE}${url}`, { headers });
  if (!res.ok) {
    const error = new Error("An error occurred while fetching the data.");
    (error as any).info = await res.json().catch(() => ({}));
    (error as any).status = res.status;
    throw error;
  }
  const data = await res.json();
  return data.data;
};

export async function updateIncidentStatusApi(
  id: string,
  status: string,
): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/incidents/${id}`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    return res.ok;
  } catch (error) {
    console.error("Failed to update status", error);
    return false;
  }
}

export async function addRepairLogApi(
  issueId: string,
  content: string,
): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/incidents/${issueId}/logs`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ content }),
    });
    return res.ok;
  } catch (e) {
    console.error("Failed to add repair log", e);
    return false;
  }
}

export interface RequisitionPayload {
  inventoryId: string;
  technicianId: string;
  quantityRequested: number;
  reason?: string;
}

export async function createRequisitionApi(
  payload: RequisitionPayload,
): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/requisitions`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return res.ok;
  } catch (error) {
    console.error("Failed to create requisition", error);
    return false;
  }
}

export async function fetchAssetsApi(): Promise<any[]> {
  try {
    const res = await fetch(`${API_BASE}/assets`, {
      headers: getAuthHeaders(),
    });
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
  status: "On Shift" | "In Field" | "On Call" | "Off Duty";
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
  status: "In Stock" | "Low Stock" | "Reorder";
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
    console.error("Failed to fetch technicians", e);
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
    console.error("Failed to fetch inventory", e);
    return null;
  }
}

async function fetchMetadata<T>(name: string): Promise<T> {
  const res = await fetch(`${API_BASE}/metadata/${name}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to load ${name} (${res.status})`);
  const body = await res.json();
  if (!body || !body.success || body.data === undefined || body.data === null) {
    throw new Error(`Failed to load ${name}`);
  }
  return body.data as T;
}

export const fetchLocationsApi = (): Promise<
  { value: string; label: string; color: string }[]
> => fetchMetadata("locations");
export const fetchCategoriesApi = (): Promise<
  { value: string; label: string }[]
> => fetchMetadata("categories");
export const fetchPrioritiesApi = (): Promise<
  { value: string; label: string; color: string }[]
> => fetchMetadata("priorities");
export const fetchStatusesApi = (): Promise<string[]> =>
  fetchMetadata<string[]>("statuses");
export const fetchFaqsApi = (): Promise<
  { question: string; answer: string }[]
> => fetchMetadata("faqs");
export const fetchStudentProfileApi = (): Promise<{
  batch: string;
  batchCode: string;
  branch: string;
  rollNo: string;
  avatarUrl?: string;
}> => fetchMetadata("student-profile");

export const fetchAssetHealthStatusesApi = (): Promise<
  { value: string; label: string }[]
> => fetchMetadata("asset-health-statuses");

export const fetchTechnicianStatusesApi = (): Promise<
  { value: string; label: string }[]
> => fetchMetadata("technician-statuses");

export const fetchUserRolesApi = (): Promise<
  { value: string; label: string }[]
> => fetchMetadata("user-roles");

export const fetchTechnicianReportTypesApi = (): Promise<
  { value: string; label: string }[]
> => fetchMetadata("technician-report-types");

export const fetchMaintenanceStatusesApi = (): Promise<
  { value: string; label: string }[]
> => fetchMetadata("maintenance-statuses");
export async function markNotificationsReadApi(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/notifications/mark-read`, {
      method: "PUT",
      headers: getAuthHeaders(),
    });
    return res.ok;
  } catch {
    return false;
  }
}
export async function markNotificationReadApi(id: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/notifications/${id}/mark-read`, {
      method: "PUT",
      headers: getAuthHeaders(),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/* ── Assets CRUD API ───────────────────────────────────────── */
export async function createAssetApi(assetData: any): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/assets`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(assetData),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function updateAssetApi(
  tagId: string,
  assetData: any,
): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/assets/${tagId}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(assetData),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function deleteAssetApi(tagId: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/assets/${tagId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/* ── Inventory CRUD API ────────────────────────────────────── */
export async function createInventoryApi(partData: any): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/inventory`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(partData),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function updateInventoryApi(
  id: string,
  partData: any,
): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/inventory/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(partData),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function deleteInventoryApi(id: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/inventory/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** POST /api/notifications/subscribe */
export async function subscribeToPushNotificationsApi(
  subscription: PushSubscription,
): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/notifications/subscribe`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(subscription),
    });
    return res.ok;
  } catch (error) {
    console.error("Failed to subscribe to push notifications", error);
    return false;
  }
}

export async function updateTechnicianStatusApi(
  status: string,
): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/users/me/status`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    return res.ok;
  } catch (error) {
    console.error("Failed to update technician status", error);
    return false;
  }
}

/* ── Media & Upload API ────────────────────────────────────── */
export async function uploadImageApi(
  file: File,
  folder = "general",
): Promise<string | null> {
  try {
    const token = getStoredToken();
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    const headers: Record<string, string> = { Accept: "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/upload`, {
      method: "POST",
      headers,
      body: formData,
    });
    if (!res.ok) return null;
    const json = await res.json();
    if (json.success && json.data?.url) {
      const rawUrl: string = json.data.url;
      // If relative URL (/uploads/...), prefix with host
      const host = API_BASE.replace(/\/api\/?$/, "");
      return rawUrl.startsWith("http") ? rawUrl : `${host}${rawUrl}`;
    }
    return null;
  } catch (e) {
    console.error("Failed to upload image:", e);
    return null;
  }
}

/* ── User Avatar API ───────────────────────────────────────── */
export async function updateMyAvatarApi(avatarUrl: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/users/me/avatar`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify({ avatarUrl }),
    });
    return res.ok;
  } catch (error) {
    console.error("Failed to update avatar", error);
    return false;
  }
}

/* ── Alerts API ────────────────────────────────────────────── */
export async function fetchAlertsApi(): Promise<any[]> {
  try {
    const res = await fetch(`${API_BASE}/alerts`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.success && Array.isArray(json.data) ? json.data : [];
  } catch {
    return [];
  }
}

export async function createAlertApi(data: {
  title: string;
  loc: string;
  date?: string;
  type?: string;
}): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/alerts`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function deleteAlertApi(id: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/alerts/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/* ── Technician Reports API ────────────────────────────────── */
export interface TechnicianReportPayload {
  technicianId?: string;
  technicianName?: string;
  incidentId?: string;
  issueType: string;
  description: string;
}

export async function submitTechnicianReportApi(
  payload: TechnicianReportPayload,
): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/technician-reports`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return res.ok;
  } catch (error) {
    console.error("Failed to submit technician report", error);
    return false;
  }
}

export async function fetchTechnicianReportsApi(): Promise<any[]> {
  try {
    const res = await fetch(`${API_BASE}/technician-reports`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.success && Array.isArray(json.data) ? json.data : [];
  } catch {
    return [];
  }
}

export async function updateTechnicianReportStatusApi(
  id: string,
  status: string,
  adminNotes?: string,
): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/technician-reports/${id}`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify({ status, adminNotes }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export const api = {
  get: async (url: string) => {
    const res = await fetch(`${API_BASE}${url}`, { headers: getAuthHeaders() });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw { response: { data: err } };
    }
    return { data: await res.json() };
  },
  post: async (url: string, body: any) => {
    const res = await fetch(`${API_BASE}${url}`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw { response: { data: err } };
    }
    return { data: await res.json() };
  },
  put: async (url: string, body: any) => {
    const res = await fetch(`${API_BASE}${url}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw { response: { data: err } };
    }
    return { data: await res.json() };
  },
  delete: async (url: string) => {
    const res = await fetch(`${API_BASE}${url}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw { response: { data: err } };
    }
    return { data: await res.json() };
  },
};
