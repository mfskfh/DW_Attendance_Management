// src/pages/auth/LoginPage.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { setAuth, getAuthMessage, clearAuthMessage } from "../../app/auth/authStore";
import "./loginPage.css";

const API_BASE = "http://127.0.0.1:4000";

// 타이밍
const OUT_MS = 600;   // 1) 텍스트 OUT
const MOVE_MS = 800;  // 2) 배경/카드 MOVE
const IN_MS = 600;    // 3) 텍스트 IN

export default function LoginPage() {
  const navigate = useNavigate();

  // 화면 기준 역할(레이아웃/텍스트 위치/배경 반쪽 위치를 결정)
  const [role, setRole] = useState("employee"); // employee | admin

  // 카드 UI 역할(카드 제목 색/버튼 라벨/그림자 색을 결정) — MOVE 시작 시 바꿈
  const [uiRole, setUiRole] = useState("employee"); // employee | admin

  const [mode, setMode] = useState("login"); // login | register

  // 전환 상태
  const [switching, setSwitching] = useState(false);
  const [phase, setPhase] = useState("idle"); // idle | textOut | move | textIn
  const [dir, setDir] = useState(null); // toAdmin | toEmployee

  // ✅ 배경 crossfade용
  const [bgNext, setBgNext] = useState(null);   // employee | admin | null
  const [bgFade, setBgFade] = useState(false);  // true면 base out + next in (동시)

  const timeouts = useRef([]);

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

  useEffect(() => {
    return () => {
      timeouts.current.forEach(clearTimeout);
      timeouts.current = [];
    };
  }, []);

  const hero = useMemo(() => {
    return role === "employee"
      ? { title: "ATTENDANCE\nMANAGEMENT", slogan: "Comfortable commute\nbetter workday" }
      : { title: "ATTENDANCE\nMANAGEMENT", slogan: "Manage attendance\nwith ease" };
  }, [role]);

  const titleText = useMemo(() => {
    const isEmp = uiRole === "employee";
    if (mode === "login") return isEmp ? "EMPLOYEE LOGIN" : "ADMIN LOGIN";
    return isEmp ? "EMPLOYEE SIGN UP" : "ADMIN SIGN UP";
  }, [uiRole, mode]);

  const switchText = uiRole === "employee" ? "ADMIN LOGIN" : "EMPLOYEE LOGIN";

  const goAfterLogin = (r) => {
    if (r === "admin") navigate("/admin");
    else navigate("/employee");
  };

  const clearAllTimeouts = () => {
    timeouts.current.forEach(clearTimeout);
    timeouts.current = [];
  };

  const startSwitch = () => {
    if (switching) return;

    clearAllTimeouts();

    const target = role === "employee" ? "admin" : "employee";
    const nextDir = role === "employee" ? "toAdmin" : "toEmployee";

    setSwitching(true);
    setDir(nextDir);
    setMode("login");

    // 1) 텍스트 OUT
    setPhase("textOut");

    // 2) MOVE 시작: 카드 UI + 배경 동시 크로스페이드 시작
    timeouts.current.push(
      setTimeout(() => {
        setPhase("move");

        // 카드(제목/그림자/버튼 라벨)
        setUiRole(target);

        // ✅ 배경: next를 겹쳐 올리고, 동시에 base out + next in
        setBgNext(target);
        setBgFade(true);
      }, OUT_MS)
    );

    // 2) MOVE 끝: 실제 role 교체 + 배경 정리(깜빡임 방지로 1프레임 뒤)
    timeouts.current.push(
      setTimeout(() => {
        setRole(target);

        // ✅ role 바뀐 다음 프레임에서 next 제거 (순간 튐/빈프레임 방지)
        requestAnimationFrame(() => {
          setBgFade(false);
          setBgNext(null);
        });

        setPhase("textIn");
      }, OUT_MS + MOVE_MS)
    );

    // 3) textIn 끝: 정리
    timeouts.current.push(
      setTimeout(() => {
        setPhase("idle");
        setSwitching(false);
        setDir(null);
      }, OUT_MS + MOVE_MS + IN_MS)
    );
  };

  return (
    <div className={`lp lp--${role} ui--${uiRole} ${switching ? "is-switching" : ""} ph-${phase} ${dir ? dir : ""}`}>
      {infoMessage && <div className="lp-toast">{infoMessage}</div>}

      {/* ✅ 배경: “겹친 상태로 같이 이동 + opacity만 동시 전환” */}
      <BackgroundHalf role={role} bgNext={bgNext} bgFade={bgFade} />

      {/* ✅ 텍스트 */}
      <HeroSingle role={role} phase={phase} title={hero.title} slogan={hero.slogan} />

      {/* ✅ 카드 */}
      <div className="lp-cardScene" aria-live="polite">
        <div className={`lp-glow ${uiRole}`} aria-hidden="true" />

        <div className="lp-card">
          <h2 className="lp-cardTitle">{titleText}</h2>

          <LoginBox
            role={uiRole}
            mode={mode}
            setMode={setMode}
            onSwitchRole={startSwitch}
            switchText={switchText}
            onLoggedIn={goAfterLogin}
            switching={switching}
          />
        </div>
      </div>
    </div>
  );
}

/* =======================
   Background: half panel
   - base와 next를 “같은 위치에 겹쳐”
   - MOVE 시작과 동시에:
     base opacity 1 -> 0
     next opacity 0 -> 1
   - 둘 다 같은 transform 규칙 적용되어 같이 이동
======================= */
function BackgroundHalf({ role, bgNext, bgFade }) {
  const baseTheme = role === "employee" ? "employee" : "admin";

  return (
    <div className="lp-bg" aria-hidden="true">
      {/* base layer: 항상 존재, bgFade일 때만 fadeOut */}
      <div className={`lp-bgLayer ${baseTheme} on ${bgFade ? "fadeOut" : ""}`}>
        <div className="lp-bgHalf">
          {baseTheme === "employee" ? <div className="lp-circles" /> : <Triangles />}
        </div>
      </div>

      {/* next layer: bgNext 있을 때만 겹쳐 올림, bgFade일 때 on */}
      {bgNext && (
        <div className={`lp-bgLayer ${bgNext} ${bgFade ? "on" : ""}`}>
          <div className="lp-bgHalf">
            {bgNext === "employee" ? <div className="lp-circles" /> : <Triangles />}
          </div>
        </div>
      )}
    </div>
  );
}

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

/* =======================
   Hero: single
======================= */
function HeroSingle({ role, phase, title, slogan }) {
  const tLines = title.split("\n");
  const sLines = slogan.split("\n");

  return (
    <div className={`lp-hero ph-${phase}`}>
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

/* =======================
   Login Box (기능 유지)
======================= */
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
        <input className="lp-input" placeholder="NAME" value={name} onChange={(e) => setName(e.target.value)} />
      )}

      <input className="lp-input" placeholder="ID" value={username} onChange={(e) => setUsername(e.target.value)} />

      <input
        className="lp-input"
        type="password"
        placeholder="PASSWORD"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button className="lp-btn lp-btnMain" type="button" onClick={submit} disabled={loading || switching}>
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
