import { Outlet, Link, useNavigate } from "react-router-dom";
import { clearAuth } from "../auth/authStore";
import { useAuth } from "../auth/useAuth";

export default function AdminLayout() {

  const navigate = useNavigate();
  const { name, roleLabel } = useAuth();

  const handleLogout = () => {
    clearAuth();
    navigate("/");
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <aside style={{ width: "220px", borderRight: "1px solid #ddd", padding: "16px" }}>
        <h3>관리자 메뉴</h3>
        <div style={{ marginBottom: 12, fontWeight: "bold" }}>
          {name ? `${name} (${roleLabel})` : ""}
        </div>
        <button type="button" onClick={handleLogout}>로그아웃</button>
        <ul>
          <li><Link to="/admin">대시보드</Link></li>
          <li><Link to="/admin/attendance">출결 현황</Link></li>
          <li><Link to="/admin/employees">직원 관리</Link></li>
          <li><Link to="/admin/approvals">요청 관리</Link></li>
        </ul>
      </aside>

      <main style={{ flex: 1, padding: "16px" }}>
        <Outlet />
      </main>
    </div>
  );
}
