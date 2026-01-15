import { useEffect, useMemo, useState } from "react";
import { adminApi } from "../../app/api/api";
import "./attendanceStatusPage.css";

const PAGE_SIZE = 5;
const DEPTS = ["전체", "개발팀", "디자인팀"];
const STATUS_OPTIONS = ["출근", "지각", "조퇴", "결석", "미출근", "휴가"];

export default function AttendanceStatusPage() {
  const [dept, setDept] = useState("전체");
  const [page, setPage] = useState(1);
  const [dateStr, setDateStr] = useState(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  });

  const [rows, setRows] = useState([]); // API 결과
  const [total, setTotal] = useState(0);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      setMsg("");
      const data = await adminApi.statusList({
        date: dateStr,
        dept,
        page,
        pageSize: PAGE_SIZE,
      });

      // 서버 응답 형태 가정:
      // { items: [...], total: 12 }
      setRows(data.items || []);
      setTotal(data.total || 0);
    } catch (e) {
      setMsg(e.message || "출근 현황을 불러오지 못했습니다.");
      setRows([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dept, page, dateStr]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  const counts = useMemo(() => {
    const c = { 출근: 0, 지각: 0, 조퇴: 0, 결석: 0, 미출근: 0, 휴가: 0 };
    rows.forEach((e) => {
      c[e.status] = (c[e.status] || 0) + 1;
    });
    return c;
  }, [rows]);

  const changeDept = (d) => {
    setDept(d);
    setPage(1);
  };

  const onSavedRow = () => {
    load(); // 저장 후 목록 갱신
  };

  return (
    <div className="ast-wrap">
      <div className="ast-head">
        <div>
          <h2 className="ast-title">출근 현황</h2>
          <div className="ast-sub">DB 연동 · 부서 필터 + 페이지당 5명</div>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <input
            type="date"
            value={dateStr}
            onChange={(e) => {
              setDateStr(e.target.value);
              setPage(1);
            }}
          />

          <div className="ast-filters">
            {DEPTS.map((d) => (
              <button
                key={d}
                type="button"
                className={"ast-chip" + (dept === d ? " active" : "")}
                onClick={() => changeDept(d)}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      </div>

      {msg && <div className="ast-empty">{msg}</div>}

      {/* 상단 요약 */}
      <div className="ast-summary">
        <SummaryBox label="출근" value={counts.출근} tone="ok" />
        <SummaryBox label="지각" value={counts.지각} tone="warn" />
        <SummaryBox label="조퇴" value={counts.조퇴} tone="pink" />
        <SummaryBox label="결석" value={counts.결석} tone="bad" />
        <SummaryBox label="미출근" value={counts.미출근} tone="gray" />
        <SummaryBox label="휴가" value={counts.휴가} tone="info" />
      </div>

      {/* 카드 리스트 */}
      <div className="ast-list">
        {loading && <div className="ast-empty">불러오는 중...</div>}

        {!loading &&
          rows.map((emp) => (
            <EmployeeCard key={emp.user_id} emp={emp} workDate={dateStr} onSaved={onSavedRow} />
          ))}

        {!loading && rows.length === 0 && !msg && <div className="ast-empty">표시할 인원이 없습니다.</div>}
      </div>

      {/* 페이지네이션 */}
      <div className="ast-pager">
        <button
          type="button"
          className="ast-pageBtn"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={safePage === 1}
        >
          이전
        </button>

        <div className="ast-pageInfo">
          {safePage} / {totalPages}
        </div>

        <button
          type="button"
          className="ast-pageBtn"
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={safePage === totalPages}
        >
          다음
        </button>
      </div>
    </div>
  );
}

function SummaryBox({ label, value, tone }) {
  return (
    <div className={`ast-sbox ${tone}`}>
      <div className="ast-slabel">{label}</div>
      <div className="ast-svalue">{value}</div>
    </div>
  );
}

function EmployeeCard({ emp, workDate, onSaved }) {
  const badgeClass = getBadgeClass(emp.status);

  return (
    <div className="ast-card">
      <div className="ast-cardTop">
        <div className="ast-person">
          <div className="ast-avatar">👤</div>
          <div>
            <div className="ast-name">{emp.name}</div>
            <div className="ast-meta">{emp.dept || "—"}</div>
          </div>
        </div>

        <div className={`ast-badge ${badgeClass}`}>{emp.status}</div>
      </div>

      <div className="ast-cardBody">
        <div className="ast-row">
          <span className="ast-k">출근 시간</span>
          <span className="ast-v">{emp.check_in || "-"}</span>
        </div>

        <div className="ast-row">
          <span className="ast-k">퇴근 시간</span>
          <span className="ast-v">{emp.check_out || "-"}</span>
        </div>

        <div className="ast-row">
          <span className="ast-k">상태 변경</span>
          <span className="ast-v">
            <StatusEditor row={emp} workDate={workDate} onSaved={onSaved} />
          </span>
        </div>
      </div>
    </div>
  );
}

function StatusEditor({ row, workDate, onSaved }) {
  const [value, setValue] = useState(row.status || "미출근");
  const [saving, setSaving] = useState(false);
  const [localMsg, setLocalMsg] = useState("");

  const save = async () => {
    setSaving(true);
    setLocalMsg("");
    try {
      await adminApi.updateStatus({
        user_id: row.user_id,
        work_date: workDate,
        status: value,
      });
      setLocalMsg("저장됨");
      onSaved?.();
    } catch (e) {
      setLocalMsg(e.message || "저장 실패");
    } finally {
      setSaving(false);
      setTimeout(() => setLocalMsg(""), 1200);
    }
  };

  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <select value={value} onChange={(e) => setValue(e.target.value)}>
        {STATUS_OPTIONS.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>

      <button type="button" onClick={save} disabled={saving}>
        {saving ? "저장중..." : "저장"}
      </button>

      {localMsg && <span style={{ fontSize: 12, opacity: 0.7 }}>{localMsg}</span>}
    </div>
  );
}

function getBadgeClass(status) {
  switch (status) {
    case "출근":
      return "ok";
    case "지각":
      return "warn";
    case "휴가":
      return "info";
    case "조퇴":
      return "pink";
    case "결석":
      return "bad";
    case "미출근":
    default:
      return "gray";
  }
}
