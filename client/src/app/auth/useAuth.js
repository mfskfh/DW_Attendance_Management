import { getAuth } from "./authStore";

export function useAuth() {
  const auth = getAuth(); // { token, role, name } 또는 null
  const name = auth?.name || "";
  const role = auth?.role || "";

  const roleLabel = role === "admin" ? "관리자" : role === "employee" ? "직원" : "";

  return { auth, name, role, roleLabel };
}