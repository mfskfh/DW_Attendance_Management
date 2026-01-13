import { useMemo, useState } from "react";
import "./attendanceStatusPage.css";

/** 더미 데이터 (나중에 DB로 교체) */
const EMPLOYEES = [
  { id: 1, name: "김민수", dept: "개발팀", status: "출근", inTime: "08:58", lateMin: 0 },
  { id: 2, name: "박지연", dept: "디자인팀", status: "지각", inTime: "09:18", lateMin: 18 },
  { id: 3, name: "이도현", dept: "개발팀", status: "미출근", inTime: "-", lateMin: 0 },
  { id: 4, name: "최서윤", dept: "디자인팀", status: "휴가", inTime: "-", lateMin: 0 },
  { id: 5, name: "정하늘", dept: "개발팀", status: "조퇴", inTime: "09:05", lateMin: 0 },
  { id: 6, name: "한예린", dept: "디자인팀", status: "출근", inTime: "08:49", lateMin: 0 },
  { id: 7, name: "오승현", dept: "개발팀", status: "결석", inTime: "-", lateMin: 0 },
  { id: 8, name: "임수정", dept: "개발팀", status: "출근", inTime: "09:00", lateMin: 0 },
  { id: 9, name: "유나영", dept: "디자인팀", status: "출근", inTime: "08:57", lateMin: 0 },
  { id: 10, name: "서준호", dept: "개발팀", status: "지각", inTime: "09:11", lateMin: 11 },
  { id: 11, name: "문채원", dept: "디자인팀", status: "미출근", inTime: "-", lateMin: 0 },
  { id: 12, name: "장우진", dept: "개발팀", status: "출근", inTime: "08:55", lateMin: 0 },
];

const PAGE_SIZE = 5;
const DEPTS = ["전체", "개발팀", "디자인팀"];

export default function AttendanceStatusPage() {
  const [dept, setDept] = useState("전체");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const list = dept === "전체" ? EMPLOYEES : EMPLOYEES.filter((e) => e.dept === dept);
    return list;
  }, [dept]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  const pageItems = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, safePage]);

  const counts = useMemo(() => {
    const c = { 출근: 0, 지각: 0, 조퇴: 0, 휴가: 0, 미출근: 0, 결석: 0 };
    filtered.forEach((e) => {
      c[e.status] = (c[e.status] || 0) + 1;
    });
    return c;
  }, [filtered]);

  const changeDept = (d) => {
    setDept(d);
    setPage(1);
  };

  return (
    <div className="ast-wrap">
      <div className="ast-head">
        <div>
          <h2 className="ast-title">출근 현황</h2>
          <div className="ast-sub">오늘 기준 · 부서별 필터 + 페이지당 5명</div>
        </div>

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

      {/* 상단 요약 */}
      <div className="ast-summary">
        <SummaryBox label="출근" value={counts.출근} tone="ok" />
        <SummaryBox label="지각" value={counts.지각} tone="warn" />
        <SummaryBox label="조퇴" value={counts.조퇴} tone="pink" />
        <SummaryBox label="휴가" value={counts.휴가} tone="info" />
        <SummaryBox label="미출근" value={counts.미출근} tone="gray" />
        <SummaryBox label="결석" value={counts.결석} tone="bad" />
      </div>

      {/* 카드 리스트 */}
      <div className="ast-list">
        {pageItems.map((emp) => (
          <EmployeeCard key={emp.id} emp={emp} />
        ))}

        {pageItems.length === 0 && (
          <div className="ast-empty">표시할 인원이 없습니다.</div>
        )}
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

function EmployeeCard({ emp }) {
  const badgeClass = getBadgeClass(emp.status);

  return (
    <div className="ast-card">
      <div className="ast-cardTop">
        <div className="ast-person">
          <div className="ast-avatar">👤</div>
          <div>
            <div className="ast-name">{emp.name}</div>
            <div className="ast-meta">{emp.dept}</div>
          </div>
        </div>

        <div className={`ast-badge ${badgeClass}`}>{emp.status}</div>
      </div>

      <div className="ast-cardBody">
        <div className="ast-row">
          <span className="ast-k">출근 시간</span>
          <span className="ast-v">{emp.inTime}</span>
        </div>

        <div className="ast-row">
          <span className="ast-k">지각 분</span>
          <span className="ast-v">{emp.status === "지각" ? `${emp.lateMin}분` : "-"}</span>
        </div>
      </div>
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
