import { getAuth } from "../auth/authStore";

const API_BASE = "http://127.0.0.1:4000";

export async function apiFetch(path, options = {}) {
  const auth = getAuth();
  const token = auth?.token;

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data.message || `요청 실패 (HTTP ${res.status})`;
    throw new Error(msg);
  }

  return data;
}
