import { getAuth } from "../auth/authStore";

const API_BASE = "http://127.0.0.1:4000";

async function apiFetch(path, options = {}) {
  const auth = getAuth();
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (auth?.token) headers.Authorization = `Bearer ${auth.token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `HTTP ${res.status}`);
  }
  return data;
}

async function req(url, options = {}) {
  const r = await fetch(API_BASE + url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.message || `HTTP ${r.status}`);
  return data;
}

/* 직원 */
export const employeeApi = {
  today: () => apiFetch("/api/employee/attendance/today"),
  clockIn: () => apiFetch("/api/employee/attendance/clock-in", { method: "POST" }),
  clockOut: () => apiFetch("/api/employee/attendance/clock-out", { method: "POST" }),
  month: (month) => apiFetch(`/api/employee/attendance?month=${month}`),
  myRequests: () => apiFetch("/api/employee/requests"),
  createRequest: (body) =>
    apiFetch("/api/employee/requests", { method: "POST", body: JSON.stringify(body) }),
};

/* 관리자 */
export const adminApi = {
  stats: (range) => apiFetch(`/api/admin/stats?range=${range}`),
  requests: (status) => apiFetch(status ? `/api/admin/requests?status=${status}` : "/api/admin/requests"),
  decideRequest: (id, action, note="") =>
    apiFetch(`/api/admin/requests/${id}/decision`, {
      method: "POST",
      body: JSON.stringify({ action, note }),
    }),
  
  updateAttendanceStatus: async ({ user_id, work_date, status }) => {
    const r = await fetch("http://127.0.0.1:4000/api/admin/attendance/status", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id, work_date, status }),
    });

    const data = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(data.message || `상태 변경 실패 (HTTP ${r.status})`);
    return data;
  },

  attendanceStatusList: async ({ date, dept, page, pageSize }) => {
    const qs = new URLSearchParams({
      date,
      dept,
      page: String(page),
      pageSize: String(pageSize),
    });

  
  
    const r = await fetch(`http://127.0.0.1:4000/api/admin/attendance/status-list?${qs.toString()}`);
    const data = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(data.message || `목록 조회 실패 (HTTP ${r.status})`);
    return data;
  },

statusList: ({ date, dept, page, pageSize }) =>
    req(
      `/api/admin/attendance/status-list?date=${encodeURIComponent(date)}&dept=${encodeURIComponent(
        dept
      )}&page=${page}&pageSize=${pageSize}`
    ),

  updateStatus: ({ user_id, work_date, status }) =>
    req(`/api/admin/attendance/update-status`, {
      method: "POST",
      body: JSON.stringify({ user_id, work_date, status }),
    }),  
};
