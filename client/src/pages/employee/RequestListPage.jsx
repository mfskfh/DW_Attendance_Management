import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./requestListPage.css";

const REQUESTS = [
  { id: 1, type: "휴가", date: "2026-01-15", reason: "병원 방문", status: "대기" },
  { id: 2, type: "조퇴", date: "2026-01-13", reason: "가족 일정", status: "승인" },
  { id: 3, type: "결석", date: "2026-01-10", reason: "몸살", status: "거절" },
  { id: 4, type: "휴가", date: "2026-01-05", reason: "여행", status: "승인" },
];

const FILTERS = ["전체", "대기", "승인", "거절"];

export default function RequestListPage() {
  const navigate = useNavigate();

  const [filter, setFilter] = useState("전체");

  const filtered = useMemo(() => {
    if (filter === "전체") return REQUESTS;
    return REQUESTS.filter((r) => r.status === filter);
  }, [filter]);

  return (
    <div className="mr-wrap">
      <div className="mr-head">
        <h2 className="mr-title">나의 요청 목록</h2>

        <div className="mr-right">
          <button
            className="mr-createBtn"
            onClick={() => navigate("/employee/requests/new")}
          >
            + 요청하기
          </button>

          <div className="mr-filters">
            {FILTERS.map((f) => (
              <button
                key={f}
                className={"mr-chip" + (filter === f ? " active" : "")}
                onClick={() => setFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function RequestCard({ req }) {
  return (
    <div className="mr-card">
      <div className="mr-top">
        <span className="mr-type">{req.type}</span>
        <span className={`mr-status ${req.status}`}>{req.status}</span>
      </div>

      <div className="mr-body">
        <Row label="날짜" value={req.date} />
        <Row label="사유" value={req.reason} />
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="mr-row">
      <span className="mr-k">{label}</span>
      <span className="mr-v">{value}</span>
    </div>
  );
}
