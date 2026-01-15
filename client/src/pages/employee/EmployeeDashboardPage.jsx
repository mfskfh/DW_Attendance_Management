import { useEffect, useMemo, useState } from "react";
import { employeeApi } from "../../app/api/api";
import "./employeeDashboard.css";

export default function EmployeeDashboardPage() {
  const [today, setToday] = useState(null);
  const [now, setNow] = useState(new Date());
  const [msg, setMsg] = useState("");

  const refresh = async () => {
    try {
      setMsg("");
      const data = await employeeApi.today();
      setToday(data);
    } catch (e) {
      setMsg(e.message || "오늘 출결 정보를 불러오지 못했습니다.");
    }
  };

  useEffect(() => {
    refresh();
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const nowDateStr = now.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  });

  const nowTimeStr = now.toLocaleTimeString("ko-KR", { hour12: false });

  const canClockIn = !today?.check_in;
  const canClockOut = !!today?.check_in && !today?.check_out;

  const onClockIn = async () => {
    try {
      setMsg("");
      await employeeApi.clockIn();
      await refresh();
    } catch (e) {
      setMsg(e.message || "출근 처리 실패");
    }
  };

  const onClockOut = async () => {
    try {
      setMsg("");
      await employeeApi.clockOut();
      await refresh();
    } catch (e) {
      setMsg(e.message || "퇴근 처리 실패");
    }
  };

  // 2줄 그래프/달력은 아직 DB 연결 전: 더미 유지(나중에 month API로 교체)
  const monthSummary = useMemo(
    () => ({
      출근: 15,
      지각: 2,
      조퇴: 1,
      결석: 0,
      미출근: 2,
      휴가: 1,
    }),
    []
  );

  return (
    <div className="edash">
      {/* 상단 타이틀 */}
      <div className="edash-head">
        <div className="edash-title">Dashboard</div>
        <div className="edash-date">{nowDateStr}</div>
      </div>

      {msg && <div className="edash-msg">{msg}</div>}

      {/* 1줄: 오늘 출결 */}
      <section className="edash-row1">
        <div className="card card-pad">
          <div className="card-titleRow">
            <div className="card-title">오늘 출결</div>

            <div className="card-actions">
              <button className="btn" onClick={onClockIn} disabled={!canClockIn}>
                출근
              </button>
              <button className="btn btn-outline" onClick={onClockOut} disabled={!canClockOut}>
                퇴근
              </button>
            </div>
          </div>

          <div className="today-grid">
            <Info label="지금 상태" value={today?.work_state ?? "—"} badge />
            <Info label="현재 시각" value={nowTimeStr} />
            <Info label="출근 시각" value={today?.check_in ?? "—"} />
            <Info label="퇴근 시각" value={today?.check_out ?? "—"} />
          </div>

          <div className="today-foot">
            <span className="tiny">출근 상태</span>
            <span className={"pill " + statusClass(today?.status)}>{today?.status ?? "—"}</span>
            <span className="tiny" style={{ marginLeft: 10 }}>
              (퇴근은 status가 아니라 퇴근시각으로 판단)
            </span>
          </div>
        </div>
      </section>

      {/* 2줄: 달력 + 원그래프 (일단 더미) */}
      <section className="edash-row2">
        <div className="card card-pad">
          <div className="card-title">이번 달 출결 캘린더</div>
          <MiniCalendarDummy />
        </div>

        <div className="card card-pad">
          <div className="card-title">이번 달 출결 비율</div>
          <div className="ratio-wrap">
            <div className="ratio-list">
              {Object.entries(monthSummary).map(([k, v]) => (
                <div key={k} className="ratio-item">
                  <span className={"dot " + statusClass(k)} />
                  <span className="ratio-label">{k}</span>
                  <span className="ratio-value">{v}일</span>
                </div>
              ))}
            </div>

            <div className="ratio-chart">
              <PieDummy data={monthSummary} />
            </div>
          </div>
        </div>
      </section>

      {/* 3줄: 빠른 메뉴 */}
      <section className="edash-row3">
        <div className="card card-pad">
          <div className="card-title">빠른 메뉴</div>
          <div className="quick">
            <QuickBtn title="출근 처리" sub="오늘 출근하기" onClick={onClockIn} disabled={!canClockIn} />
            <QuickBtn
              title="퇴근 처리"
              sub="오늘 퇴근하기"
              onClick={onClockOut}
              disabled={!canClockOut}
              outline
            />
            <QuickBtn title="내 출결 확인" sub="월별 출결 보기" href="/employee/attendance" />
            <QuickBtn title="요청 목록" sub="내 요청 확인" href="/employee/requests" />
          </div>
        </div>
      </section>
    </div>
  );
}

/* ---------- UI pieces ---------- */

function Info({ label, value, badge }) {
  return (
    <div className={"info " + (badge ? "info-badge" : "")}>
      <div className="info-label">{label}</div>
      <div className="info-value">{value}</div>
    </div>
  );
}

function QuickBtn({ title, sub, href, onClick, disabled, outline }) {
  const className = "qbtn" + (outline ? " qbtn-outline" : "");
  if (href) {
    return (
      <a className={className} href={href}>
        <div className="qbtn-title">{title}</div>
        <div className="qbtn-sub">{sub}</div>
      </a>
    );
  }
  return (
    <button className={className} onClick={onClick} disabled={disabled} type="button">
      <div className="qbtn-title">{title}</div>
      <div className="qbtn-sub">{sub}</div>
    </button>
  );
}

function statusClass(status) {
  switch (status) {
    case "출근":
      return "s-present";
    case "지각":
      return "s-late";
    case "조퇴":
      return "s-early";
    case "결석":
      return "s-absent";
    case "미출근":
      return "s-miss";
    case "휴가":
      return "s-leave";
    default:
      return "s-neutral";
  }
}

/* ---------- Dummy calendar & pie (DB 연결은 다음 단계) ---------- */

function MiniCalendarDummy() {
  // 5x7 정도의 간단 캘린더 느낌 더미
  const days = Array.from({ length: 35 }, (_, i) => i + 1);
  const fake = (d) => {
    const map = ["출근", "지각", "조퇴", "결석", "미출근", "휴가"];
    return map[d % map.length];
  };

  return (
    <div className="cal">
      {days.map((d) => (
        <div key={d} className="cal-cell">
          <div className="cal-day">{d <= 31 ? d : ""}</div>
          {d <= 31 && <div className={"cal-dot " + statusClass(fake(d))} />}
        </div>
      ))}
    </div>
  );
}

function PieDummy({ data }) {
  // 라이브러리 없이 “원형 느낌”만 내는 더미(나중에 recharts로 교체 가능)
  const total = Object.values(data).reduce((a, b) => a + b, 0) || 1;
  const pct = (v) => Math.round((v / total) * 100);

  return (
    <div className="pie">
      <div className="pie-center">{total}일</div>
      <div className="pie-legend">
        {Object.entries(data).map(([k, v]) => (
          <div key={k} className="pie-legendItem">
            <span className={"dot " + statusClass(k)} />
            <span>{k}</span>
            <span className="pie-pct">{pct(v)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
