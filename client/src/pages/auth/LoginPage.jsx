// src/pages/auth/LoginPage.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { setAuth, getAuthMessage, clearAuthMessage } from "../../app/auth/authStore";
import "./loginPage.css";

const API_BASE = "http://127.0.0.1:4000";

/** 전환 타이밍(느림-빠름-느림은 CSS easing으로 처리) */
const OUT_MS = 350;  // 1) 텍스트 OUT
const MOVE_MS = 650; // 2) 배경/카드 이동(겹침 포함)
const IN_MS = 350;   // 3) 텍스트 IN

export default function LoginPage() {
  const navigate = useNavigate();

  const [role, setRole] = useState("employee"); // employee | admin
  const [mode, setMode] = useState("login"); // login | register

  const [switching, setSwitching] = useState(false);
  const [nextRole, setNextRole] = useState(null); // employee | admin | null
  const [phase, setPhase] = useState("idle"); // idle | textOut | move | textIn

  const [infoMessage, setInfoMessage] = useState(() => {
    const msg = getAuthMessage();
    if (msg) clearAuthMessage();
    return msg || "";
  });

  useEffect(() => {
    if (!infoMessage) return;
    const t = setTimeout(() => setInfoMessage(""), 2000);
    return () => clearTimeout(t);
  }, [infoMessage]);

  const isEmployee = role === "employee";

  const hero = useMemo(() => {
    return isEmployee
      ? { title: "ATTENDANCE\nMANAGEMENT", slogan: "Comfortable commute\nbetter workday" }
      : { title: "ATTENDANCE\nMANAGEMENT", slogan: "Manage attendance\nwith ease" };
  }, [isEmployee]);

  const titleText =
    mode === "login"
      ? isEmployee
        ? "EMPLOYEE LOGIN"
        : "ADMIN LOGIN"
      : isEmployee
      ? "EMPLOYEE SIGN UP"
      : "ADMIN SIGN UP";

  const nextHero = useMemo(() => {
    if (!nextRole) return null;
    return nextRole === "employee"
      ? { title: "ATTENDANCE\nMANAGEMENT", slogan: "Comfortable commute\nbetter workday" }
      : { title: "ATTENDANCE\nMANAGEMENT", slogan: "Manage attendance\nwith ease" };
  }, [nextRole]);

  const nextTitleText = useMemo(() => {
    if (!nextRole) return "";
    const nextIsEmp = nextRole === "employee";
    return mode === "login"
      ? nextIsEmp
        ? "EMPLOYEE LOGIN"
        : "ADMIN LOGIN"
      : nextIsEmp
      ? "EMPLOYEE SIGN UP"
      : "ADMIN SIGN UP";
  }, [nextRole, mode]);

  const goAfterLogin = (r) => {
    if (r === "admin") navigate("/admin");
    else navigate("/employee");
  };

  const startSwitch = () => {
    if (switching) return;

    const target = role === "employee" ? "admin" : "employee";
    setSwitching(true);
    setNextRole(target);
    setMode("login");

    // 1) 텍스트 OUT
    setPhase("textOut");

    // 2) 배경/카드 이동
    setTimeout(() => setPhase("move"), OUT_MS);

    // 역할 실제 변경 (move 끝나는 타이밍)
    setTimeout(() => {
      setRole(target);
      setPhase("textIn");
    }, OUT_MS + MOVE_MS);

    // 3) 텍스트 IN 종료 후 정리
    setTimeout(() => {
      setPhase("idle");
      setSwitching(false);
      setNextRole(null);
    }, OUT_MS + MOVE_MS + IN_MS);
  };

  return (
    <div className={`lp lp--${role} ${switching ? "is-switching" : ""} ph-${phase}`}>
      {infoMessage && <div className="lp-toast">{infoMessage}</div>}

      {/* 배경: current + next(전환 중) */}
      <div className="lp-bg" aria-hidden="true">
        {/* current */}
        <div className="lp-bgTrack current">
          <div className="lp-pane lp-pane--white" />
          <div className={`lp-pane lp-pane--color ${role}`}>
            {role === "employee" ? <div className="lp-circles" /> : <Triangles />}
          </div>
        </div>

        {/* next */}
        {nextRole && (
          <div className={`lp-bgTrack next ${nextRole}`}>
            <div className="lp-pane lp-pane--white" />
            <div className={`lp-pane lp-pane--color ${nextRole}`}>
              {nextRole === "employee" ? <div className="lp-circles" /> : <Triangles />}
            </div>
          </div>
        )}
      </div>

      {/* 텍스트: current OUT + next IN */}
      <HeroSplit role={role} title={hero.title} slogan={hero.slogan} kind="current" />
      {nextRole && nextHero && (
        <HeroSplit role={nextRole} title={nextHero.title} slogan={nextHero.slogan} kind="next" />
      )}

      {/* 카드: current OUT + next IN (겹침 시 current가 배경 뒤로) */}
      <div className="lp-cardSceneWrap">
        {/* current 카드 */}
        <div className="lp-cardScene current">
          <div className={`lp-glow ${role}`} aria-hidden="true" />
          <div className="lp-card">
            <h2 className="lp-cardTitle">{titleText}</h2>

            <LoginBox
              role={role}
              mode={mode}
              setMode={setMode}
              onSwitchRole={startSwitch}
              switchText={isEmployee ? "ADMIN LOGIN" : "EMPLOYEE LOGIN"}
              onLoggedIn={goAfterLogin}
              switching={switching}
            />
          </div>
        </div>

        {/* next 카드(전환 중엔 클릭 막고, 전환 끝나면 role이 바뀌어 current가 됨) */}
        {nextRole && (
          <div className={`lp-cardScene next ${nextRole}`}>
            <div className={`lp-glow ${nextRole}`} aria-hidden="true" />
            <div className="lp-card">
              <h2 className="lp-cardTitle">{nextTitleText}</h2>

              <LoginBox
                role={nextRole}
                mode={"login"}
                setMode={setMode}
                onSwitchRole={() => {}}
                switchText={nextRole === "employee" ? "ADMIN LOGIN" : "EMPLOYEE LOGIN"}
                onLoggedIn={goAfterLogin}
                switching={true}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* 배경 도형(관리자 삼각형) */
function Triangles() {
  return (
    <div className="lp-triangles">
      <span className="tri a" />
      <span className="tri b" />
      <span className="tri c" />
      <span className="tri d" />
      <span className="tri e" />
    </div>
  );
}

/* 타이틀/서브: base(흰색) + cut(배경색) 레이어 */
function HeroSplit({ role, title, slogan, kind = "current" }) {
  const tLines = title.split("\n");
  const sLines = slogan.split("\n");

  return (
    <div className={`lp-hero lp-hero--${role} ${kind}`} aria-hidden="true">
      <div className="lp-heroLayer base">
        <div className="lp-heroLayerInner">
          <h1 className="lp-heroTitle">
            {tLines.map((l, i) => (
              <span key={i}>
                {l}
                <br />
              </span>
            ))}
          </h1>

          <p className="lp-heroSlogan">
            {sLines.map((l, i) => (
              <span key={i}>
                {l}
                <br />
              </span>
            ))}
          </p>
        </div>
      </div>

      <div className={`lp-heroLayer cut ${role}`}>
        <div className="lp-heroLayerInner">
          <h1 className="lp-heroTitle">
            {tLines.map((l, i) => (
              <span key={i}>
                {l}
                <br />
              </span>
            ))}
          </h1>

          <p className="lp-heroSlogan">
            {sLines.map((l, i) => (
              <span key={i}>
                {l}
                <br />
              </span>
            ))}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ---------- Login Box (네 로그인 방식 그대로 유지) ---------- */
function LoginBox({ role, mode, setMode, onSwitchRole, switchText, onLoggedIn, switching }) {
  const loginType = role;

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("idle");

  const submit = async () => {
    if (switching) return;

    setMsg("");
    setStatus("idle");
    setLoading(true);

    try {
      if (mode === "register") {
        const r = await fetch(`${API_BASE}/api/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, username, password, role: loginType }),
        });

        const data = await r.json().catch(() => ({}));
        if (!r.ok) {
          setStatus("error");
          setMsg(data.message || `회원가입 실패 (HTTP ${r.status})`);
          return;
        }

        setStatus("success");
        setMsg("회원가입 성공! 로그인 해주세요.");
        setPassword("");
        setMode("login");
        return;
      }

      const r = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, role: loginType }),
      });

      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        setStatus("error");
        setMsg(data.message || `로그인 실패 (HTTP ${r.status})`);
        return;
      }

      setStatus("success");
      setMsg("로그인 성공! 이동합니다.");

      setAuth({ token: data.token, role: data.role, name: data.name });

      setTimeout(() => onLoggedIn(data.role), 450);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lp-form">
      {mode === "register" && (
        <input
          className="lp-input"
          placeholder="NAME"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      )}

      <input
        className="lp-input"
        placeholder="ID"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <input
        className="lp-input"
        type="password"
        placeholder="PASSWORD"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        className="lp-btn lp-btnMain"
        type="button"
        onClick={submit}
        disabled={loading || switching}
      >
        {loading ? "처리중..." : mode === "login" ? "LOGIN" : "SIGN UP"}
      </button>

      <button
        className="lp-btn"
        type="button"
        onClick={() => setMode((m) => (m === "login" ? "register" : "login"))}
        disabled={switching}
      >
        {mode === "login" ? "CREATE ACCOUNT" : "BACK TO LOGIN"}
      </button>

      <button className="lp-btn lp-btnSwitch" type="button" onClick={onSwitchRole} disabled={switching}>
        {switchText}
      </button>

      {msg && <p className={`lp-msg ${status}`}>{msg}</p>}
    </div>
  );
}
