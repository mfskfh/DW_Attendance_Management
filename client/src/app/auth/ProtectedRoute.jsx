import { Navigate } from "react-router-dom";
import { getAuth, setAuthMessage } from "./authStore";

export default function ProtectedRoute({ allowRole, children }) {
  const auth = getAuth();

  if (!auth?.token) {
    setAuthMessage("로그인이 필요합니다.");
    return <Navigate to="/" replace />;
  }

  if (allowRole && auth.role !== allowRole) {
    setAuthMessage("접근 권한이 없습니다.");
    return <Navigate to="/" replace />;
  }

  return children;
}