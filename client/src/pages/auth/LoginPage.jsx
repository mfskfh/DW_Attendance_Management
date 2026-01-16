// src/pages/auth/LoginPage.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { setAuth, getAuthMessage, clearAuthMessage } from "../../app/auth/authStore";
import "./loginPage.css";

const API_BASE = "http://127.0.0.1:4000";

// 느림-빠름-느림은 CSS easing으로 처리
const OUT_MS = 500;     // 1) 텍스트 OUT
const MOVE_MS = 1300;   // 2) 배경/카드 이동
const IN_MS = 450;      // 3) 텍스트 IN
const SWAP_AT = 0.55;   // move 중간쯤에서 카드 내용/그림자/색 교체

export default function LoginPage() {
  const navigate = useNavigate();

  // role = "현재 화면 상태(전환 끝난 뒤 기준)"
  const [role, setRole] = useState("employee"); // employee | admin

  // animFrom = "전환 중 기준 role(끝날 때까지 고정)"
  const [animFrom, setAnimFrom] = useState("employee");
  const [animTo, setAnimTo] = useState(null); // employee | admin | null
  const [phase, setPhase] = useState("idle"); // idle | textOut | move | textIn
  const [switching, setSwitching] = useState(false);

  // 카드에 실제로 표시되는 역할(전환 중간에 바뀜)
  const [displayRole, setDisplayRole] = useState("employee");

  const [mode, setMode] = useState("login"); // login | register

  const timers = useRef([]);

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
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
  }, []);

  const hero = useMemo(() => {
    const isEmp = displayRole === "employee";
    return isEmp
      ? { title: "ATTENDANCE\nMANAGEMENT", slogan: "Comfortable commute\nbetter workday" }
      : { title: "ATTENDANCE\nMANAGEMENT", slogan: "Manage attendance\nwith ease" };
  }, [displayRole]);

  const titleText = useMemo(() => {
    const isEmp = displayRole === "employee";
    if (mode === "login") return isEmp ? "EMPLOYEE LOGIN" : "ADMIN LOGIN";
    return isEmp ? "EMPLOYEE SIGN UP" : "ADMIN SIGN UP";
  }, [displayRole, mode]);

  const switchText = displayRole === "employee" ? "ADMIN LOGIN" : "EMPLOYEE LOGIN";

  const goAfterLogin = (r) => {
    if (r === "admin") navigate("/admin");
    else navigate("/employee");
  };

  const startSwitch = () => {
    if (switching) return;

    const from = role;
    const to = from === "employee" ? "admin" : "employee";

    setSwitching(true);
    setMode("login");

    // ✅ 전환 동안 기준 role은 from으로 고정 (튕김 방지 핵심)
    setAnimFrom(from);
    setAnimTo(to);

    // 텍스트 out → move → text in
    setPhase("textOut");

    timers.current.push(
      setTimeout(() => {
        setPhase("move");
      }, OUT_MS)
    );

    // ✅ 카드가 배경에 가려졌을 타이밍에 표시 내용만 바꿈(중요)
    timers.current.push(
      setTimeout(() => {
        setDisplayRole(to); // 카드 텍스트/색/그림자 바뀜 (가려져 있어서 자연스러움)
      }, OUT_MS + Math.floor(MOVE_MS * SWAP_AT))
    );

    // move 끝난 뒤: 실제 role 확정 + textIn
    timers.current.push(
      setTimeout(() => {
        setRole(to);     // 이제부터 새 화면 기준
        setAnimTo(null); // 전환 종료 준비
        setPhase("textIn");
      }, OUT_MS + MOVE_MS)
    );

    timers.current.push(
      setTimeout(() => {
        setPhase("idle");
        setSwitching(false);
        setAnimFrom(to); // 다음 전환의 from 기준을 최신으로
      }, OUT_MS + MOVE_MS + IN_MS)
    );
  };

  // ✅ 배경/카드 이동 방향은 "animFrom 기준"
  // employee 화면 -> panel(색)은 left:0 에서 left:50vw 로
  // admin 화면 -> panel(색)은 left:50vw 에서 left:0 로
  const dir = useMemo(() => {
    if (!switching || phase !== "move") return "none";
    return animFrom === "employee" ? "toRight" : "toLeft";
  }, [switching, phase, animFrom]);

  return (
    <div
      className={[
        "lp",
        `lp--${animFrom}`,     // ✅ 전환 중엔 from 유지
        `ph-${phase}`,
        switching ? "is-switching" : "",
        `dir-${dir}`,
      ].join(" ")}
    >
      {infoMessage && <div className="lp-toast">{infoMessage}</div>}

      {/* ✅ 배경(반쪽 컬러 패널 1개) + 내부에서 색/패턴만 크로스페이드 */}
      <BackgroundHalfPanel
        from={animFrom}
        to={animTo}
        switching={switching}
        phase={phase}
      />

      {/* ✅ 텍스트는 한 벌만: textOut → move 동안 숨김 → textIn */}
      <HeroOne
        role={displayRole}
        title={hero.title}
        slogan={hero.slogan}
        phase={phase}
      />

      {/* ✅ 카드도 한 벌만(내용은 move 중간에 바뀜) */}
      <CardOne
        role={displayRole}
        titleText={titleText}
        mode={mode}
        setMode={setMode}
        onSwitchRole={startSwitch}
        switchText={switchText}
        onLoggedIn={goAfterLogin}
        switching={switching}
      />
    </div>
  );
}

/* ------------------ 배경: 반쪽 패널 1개 + 색/패턴 크로스페이드 ------------------ */
function BackgroundHalfPanel({ from, to, switching, phase }) {
  const fromIsEmp = from === "employee";
  const toIsEmp = to === "employee";

  // move 구간에서만 to 레이어 opacity 올라감
  const showTo = Boolean(to) && (phase === "move" || phase === "textIn");

  return (
    <div className="lp-bg" aria-hidden="true">
      <div className="lp-panel">
        {/* from layer */}
        <div className={`lp-panelLayer ${fromIsEmp ? "blue" : "orange"} on`}>
          {fromIsEmp ? <div className="lp-circles" /> : <Triangles />}
        </div>

        {/* to layer */}
        {to && (
          <div className={`lp-panelLayer ${toIsEmp ? "blue" : "orange"} ${showTo ? "on" : ""}`}>
            {toIsEmp ? <div className="lp-circles" /> : <Triangles />}
          </div>
        )}
      </div>

      {/* ✅ 카드 가리기용: move 구간에만 패널이 카드 위로 올라오게 */}
      <div className={`lp-cover ${phase === "move" ? "on" : ""}`} />
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

/* ------------------ 텍스트: 한 벌 ------------------ */
function HeroOne({ role, title, slogan, phase }) {
  const tLines = title.split("\n");
  const sLines = slogan.split("\n");

  return (
    <div className={`lp-heroOne role-${role} ph-${phase}`} aria-hidden="true">
      <div className="lp-heroLayer base">
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

      <div className={`lp-heroLayer cut ${role}`}>
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
  );
}

/* ------------------ 카드: 한 벌 ------------------ */
function CardOne({ role, titleText, mode, setMode, onSwitchRole, switchText, onLoggedIn, switching }) {
  return (
    <div className={`lp-cardSceneOne role-${role}`}>
      <div className={`lp-glow ${role}`} aria-hidden="true" />

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
  );
}

/* ---------- Login Box (기존 로그인 방식 유지) ---------- */
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
