import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { clearAuth } from "../auth/authStore";
import { useAuth } from "../auth/useAuth";
import "./employeeShell.css";

export default function EmployeeLayout() {
  const navigate = useNavigate();
  const { name, roleLabel } = useAuth();

  const logout = () => {
    clearAuth();
    navigate("/");
  };

  return (
    <div className="eshell">
      {/* Left Icon Sidebar (3개만) */}
      <aside className="eside">
        <div className="eside-top">
          <NavIcon to="/employee" label="홈" icon="🏠" />
          <NavIcon to="/employee/attendance" label="내 출결 확인" icon="🕒" />
          <NavIcon to="/employee/requests" label="요청 목록" icon="📄" />
        </div>

        <div className="eside-bottom">
          <button className="eside-logout" type="button" onClick={logout} title="로그아웃">
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
            <div className="eavatar">👤</div>
            <div className="eprofile-meta">
              <div className="eprofile-name">
                {name ? `${name} (${roleLabel})` : "Employee"}
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
