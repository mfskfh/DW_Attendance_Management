import { useMemo, useState } from "react";
import "./approvalsPage.css";

const REQUESTS = [
  { id: 1, name: "김민수", dept: "개발팀", type: "휴가", date: "2026-01-13", reason: "병원 방문", status: "대기" },
  { id: 2, name: "박지연", dept: "디자인팀", type: "조퇴", date: "2026-01-13", reason: "가족 일정", status: "대기" },
  { id: 3, name: "이도현", dept: "개발팀", type: "결석", date: "2026-01-12", reason: "몸살", status: "승인" },
  { id: 4, name: "최서윤", dept: "디자인팀", type: "휴가", date: "2026-01-15", reason: "개인 사유", status: "거절" },
];

const DEPTS = ["전체", "개발팀", "디자인팀"];

export default function ApprovalsPage() {
  const [dept, setDept] = useState("전체");
  const [items, setItems] = useState(REQUESTS);

  const filtered = useMemo(() => {
    if (dept === "전체") return items;
    return items.filter((r) => r.dept === dept);
  }, [dept, items]);

  const updateStatus = (id, status) => {
    setItems((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r))
    );
  };

  return (
    <div className="ap-wrap">
      <div className="ap-head">
        <div>
          <h2 className="ap-title">요청 관리</h2>
          <div className="ap-sub">휴가 · 조퇴 · 결석 요청 승인 / 거절</div>
        </div>

        <div className="ap-filters">
          {DEPTS.map((d) => (
            <button
              key={d}
              className={"ap-chip" + (dept === d ? " active" : "")}
              onClick={() => setDept(d)}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <div className="ap-list">
        {filtered.map((req) => (
          <RequestCard key={req.id} req={req} onAction={updateStatus} />
        ))}

        {filtered.length === 0 && (
          <div className="ap-empty">요청이 없습니다.</div>
        )}
      </div>
    </div>
  );
}

function RequestCard({ req, onAction }) {
  return (
    <div className="ap-card">
      <div className="ap-top">
        <div className="ap-person">
          <div className="ap-avatar">👤</div>
          <div>
            <div className="ap-name">{req.name}</div>
            <div className="ap-meta">{req.dept}</div>
          </div>
        </div>

        <span className={`ap-status ${req.status}`}>{req.status}</span>
      </div>

      <div className="ap-body">
        <Row label="요청 유형" value={req.type} />
        <Row label="날짜" value={req.date} />
        <Row label="사유" value={req.reason} />
      </div>

      {req.status === "대기" && (
        <div className="ap-actions">
          <button className="btn-approve" onClick={() => onAction(req.id, "승인")}>
            승인
          </button>
          <button className="btn-reject" onClick={() => onAction(req.id, "거절")}>
            거절
          </button>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="ap-row">
      <span className="ap-k">{label}</span>
      <span className="ap-v">{value}</span>
    </div>
  );
}
