const KEY = "attendance_auth";
const MESSAGE_KEY = "auth_message";

export function setAuthMessage(message) {
  localStorage.setItem(MESSAGE_KEY, message);
}

export function getAuthMessage() {
  return localStorage.getItem(MESSAGE_KEY);
}

export function clearAuthMessage() {
  localStorage.removeItem(MESSAGE_KEY);
}

export function setAuth({ token, role, name }) {
  localStorage.setItem(KEY, JSON.stringify({ token, role, name }));
}

export function getAuth() {
  const raw = localStorage.getItem(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearAuth() {
  localStorage.removeItem(KEY);
}

export function isLoggedIn() {
  const auth = getAuth();
  return !!auth?.token;
}
