import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { clearAuth } from "../auth/authStore";
import { useAuth } from "../auth/useAuth";
import "./employeeShell.css"; // 직원과 동일한 CSS 재사용

export default function AdminLayout() {
  const navigate = useNavigate();
  const { name } = useAuth();

  const logout = () => {
    clearAuth();
    navigate("/");
  };

  return (
    <div className="eshell">
      {/* Left Icon Sidebar (관리자 메뉴 3개) */}
      <aside className="eside">
        <div className="eside-top">
          <NavIcon to="/admin" label="홈" icon="🏠" />
          <NavIcon to="/admin/attendance" label="출결 현황" icon="📊" />
          <NavIcon to="/admin/approvals" label="요청 처리" icon="✅" />
        </div>

        <div className="eside-bottom">
          <button
            className="eside-logout"
            type="button"
            onClick={logout}
            title="로그아웃"
          >
            ⎋
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <main className="emain">
        {/* Top Bar */}
        <header className="etop">
          <div className="ebrand">
            <span className="ebrand-text">hawngcompany</span>
            <span className="ebrand-mark">▶</span>
          </div>

          <div className="eprofile">
            <div className="eavatar">🛠️</div>
            <div className="eprofile-meta">
              <div className="eprofile-name">
                {name ? `${name} (관리자)` : "Admin"}
              </div>
              <div className="eprofile-sub">Attendance Management</div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="econtent">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

function NavIcon({ to, icon, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => "enav" + (isActive ? " enav-active" : "")}
      title={label}
    >
      <span className="enav-icon">{icon}</span>
    </NavLink>
  );
}
