import { useMemo, useState } from "react";
import "./attendanceHistoryPage.css";

const ATTENDANCE = [
  { date: "2026-01-13", status: "출근", inTime: "08:58", outTime: "-" },
  { date: "2026-01-12", status: "지각", inTime: "09:15", outTime: "18:00" },
  { date: "2026-01-11", status: "출근", inTime: "08:55", outTime: "18:02" },
  { date: "2026-01-10", status: "휴가", inTime: "-", outTime: "-" },
  { date: "2026-01-09", status: "조퇴", inTime: "09:00", outTime: "15:30" },
  { date: "2026-01-08", status: "미출근", inTime: "-", outTime: "-" },
  { date: "2026-01-07", status: "결석", inTime: "-", outTime: "-" },
];

export default function AttendanceHistoryPage() {
  const [month, setMonth] = useState("2026-01");

  const filtered = useMemo(() => {
    return ATTENDANCE.filter((a) => a.date.startsWith(month));
  }, [month]);

  const today = ATTENDANCE[0];

  return (
    <div className="my-wrap">
      <div className="my-head">
        <h2 className="my-title">내 출결 확인</h2>

        <select
          className="my-select"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
        >
          <option value="2026-01">2026년 1월</option>
          <option value="2025-12">2025년 12월</option>
        </select>
      </div>

      {/* 오늘 상태 */}
      <div className="my-today">
        <div className="my-card">
          <div className="my-cardTitle">오늘 상태</div>
          <div className={`my-status ${today.status}`}>{today.status}</div>

          <div className="my-times">
            <div>
              <span>출근</span>
              <strong>{today.inTime}</strong>
            </div>
            <div>
              <span>퇴근</span>
              <strong>{today.outTime}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* 목록 */}
      <div className="my-list">
        {filtered.map((row) => (
          <div key={row.date} className="my-row">
            <span>{row.date}</span>
            <span className={`my-badge ${row.status}`}>{row.status}</span>
            <span>{row.inTime}</span>
            <span>{row.outTime}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
