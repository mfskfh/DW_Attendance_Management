import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { setAuth, getAuthMessage, clearAuthMessage } from "../../app/auth/authStore";
import "./loginPage.css";

const API_BASE = "http://127.0.0.1:4000";
const SWITCH_MS = 1100; // 전체 전환 시간(원하는 느낌이면 900~1400 사이 조절)

export default function LoginPage() {
  const navigate = useNavigate();

  const [role, setRole] = useState("employee"); // employee | admin
  const [mode, setMode] = useState("login"); // login | register

  // 연속 전환 상태
  const [switching, setSwitching] = useState(false);
  const [dir, setDir] = useState("toAdmin"); // toAdmin | toEmployee
  const [nextRole, setNextRole] = useState(null);

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
      ? {
          title: "ATTENDANCE\nMANAGEMENT",
          slogan: "Comfortable commute,\nbetter workday.",
        }
      : {
          title: "ATTENDANCE\nMANAGEMENT",
          slogan: "Manage attendance\nwith ease.",
        };
  }, [isEmployee]);

  const titleText =
    mode === "login"
      ? isEmployee
        ? "EMPLOYEE LOGIN"
        : "ADMIN LOGIN"
      : isEmployee
      ? "EMPLOYEE SIGN UP"
      : "ADMIN SIGN UP";

  const goAfterLogin = (r) => {
    if (r === "admin") navigate("/admin");
    else navigate("/employee");
  };

  const startSwitch = () => {
    if (switching) return;

    const target = isEmployee ? "admin" : "employee";
    const direction = isEmployee ? "toAdmin" : "toEmployee";

    setSwitching(true);
    setDir(direction);
    setNextRole(target);

    // 전환이 끝나는 타이밍에 role을 바꿈 (중간에 끊기지 않게)
    setTimeout(() => {
      setRole(target);
      setMode("login");
      setSwitching(false);
      setNextRole(null);
    }, SWITCH_MS);
  };

  return (
    <div className={`lp lp--${role} ${dir} ${switching ? "is-switching" : ""}`}>
      {infoMessage && <div className="lp-toast">{infoMessage}</div>}

      {/* ✅ 배경: 사라지지 않고 계속 유지. 색/패턴만 자연 전환 */}
      <BackgroundContinuous role={role} nextRole={nextRole} switching={switching} />

      {/* ✅ 텍스트: 화면 밖으로 끝까지 이동 */}
      <HeroContinuous role={role} nextRole={nextRole} switching={switching} hero={hero} dir={dir} />

      {/* ✅ 카드: 계속 이동 + 중간에 배경 뒤로 들어가 가려짐 */}
      <CardContinuous
        role={role}
        nextRole={nextRole}
        switching={switching}
        titleText={titleText}
        mode={mode}
        setMode={setMode}
        onSwitchRole={startSwitch}
        switchText={isEmployee ? "ADMIN LOGIN" : "EMPLOYEE LOGIN"}
        onLoggedIn={goAfterLogin}
      />
    </div>
  );
}

function BackgroundContinuous({ role, nextRole, switching }) {
  const showAlt = Boolean(nextRole);

  return (
    <div className="lp-bg" aria-hidden="true">
      {/* 베이스 레이어(항상 존재) */}
      <div className={`lp-bgBase ${role}`} />

      {/* 전환 중이면 다음 색을 덮어서 자연스럽게 변환 */}
      <div className={`lp-bgBlend ${showAlt ? nextRole : ""} ${switching ? "on" : ""}`} />

      {/* 패턴도 자연스럽게 변환 (원 <-> 삼각형) */}
      <div className={`lp-patternLayer circles ${role === "employee" ? "on" : ""} ${switching ? "fade" : ""}`} />
      <div className={`lp-patternLayer triangles ${role === "admin" ? "on" : ""} ${switching ? "fade" : ""}`}>
        <span className="tri a" />
        <span className="tri b" />
        <span className="tri c" />
        <span className="tri d" />
        <span className="tri e" />
      </div>

      {/* 전환 중 다음 패턴도 미리 올라와서 크로스페이드 */}
      {nextRole && (
        <>
          <div className={`lp-patternLayer circles pre ${nextRole === "employee" ? "preOn" : ""}`} />
          <div className={`lp-patternLayer triangles pre ${nextRole === "admin" ? "preOn" : ""}`}>
            <span className="tri a" />
            <span className="tri b" />
            <span className="tri c" />
            <span className="tri d" />
            <span className="tri e" />
          </div>
        </>
      )}
    </div>
  );
}

function HeroContinuous({ nextRole, switching, hero }) {
  // 현재 텍스트(OUT), 다음 텍스트(IN)를 동시에 렌더링해서 끊김 없이 연결
  const nextHero =
    nextRole === "admin"
      ? { title: "ATTENDANCE\nMANAGEMENT", slogan: "Manage attendance\nwith ease." }
      : nextRole === "employee"
      ? { title: "ATTENDANCE\nMANAGEMENT", slogan: "Comfortable commute,\nbetter workday." }
      : null;

  return (
    <div className="lp-heroScene" aria-hidden="true">
      <div className={`lp-heroBlock current ${switching ? "go-out" : ""}`}>
        <h1 className="lp-heroTitle">
          {hero.title.split("\n").map((l, i) => (
            <span key={i}>
              {l}
              <br />
            </span>
          ))}
        </h1>
        <p className="lp-heroSlogan">
          {hero.slogan.split("\n").map((l, i) => (
            <span key={i}>
              {l}
              <br />
            </span>
          ))}
        </p>
      </div>

      {nextHero && (
        <div className={`lp-heroBlock next ${switching ? "go-in" : ""}`}>
          <h1 className="lp-heroTitle">
            {nextHero.title.split("\n").map((l, i) => (
              <span key={i}>
                {l}
                <br />
              </span>
            ))}
          </h1>
          <p className="lp-heroSlogan">
            {nextHero.slogan.split("\n").map((l, i) => (
              <span key={i}>
                {l}
                <br />
              </span>
            ))}
          </p>
        </div>
      )}
    </div>
  );
}

function CardContinuous({
  role,
  switching,
  titleText,
  mode,
  setMode,
  onSwitchRole,
  switchText,
  onLoggedIn,
}) {
  return (
    <div className="lp-cardScene">
      <div className={`lp-glow ${role}`} aria-hidden="true" />

      <div className={`lp-cardMover ${switching ? "moving" : ""}`}>
        <div className="lp-card">
          <h2 className="lp-cardTitle">{titleText}</h2>

          <LoginBox
            role={role}
            mode={mode}
            setMode={setMode}
            onSwitchRole={onSwitchRole}
            switchText={switchText}
            onLoggedIn={onLoggedIn}
            switching={switching}
          />
        </div>
      </div>
    </div>
  );
}

/* ---------- Login Box ---------- */
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

      <button className="lp-btn" type="button" onClick={() => setMode((m) => (m === "login" ? "register" : "login"))} disabled={switching}>
        {mode === "login" ? "CREATE ACCOUNT" : "BACK TO LOGIN"}
      </button>

      <button className="lp-btn lp-btnSwitch" type="button" onClick={onSwitchRole} disabled={switching}>
        {switchText}
      </button>

      {msg && <p className={`lp-msg ${status}`}>{msg}</p>}
    </div>
  );
}
