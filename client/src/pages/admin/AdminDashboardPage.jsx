import { useState, useMemo } from "react";
import {
  PieChart, Pie, Cell,
  LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import "./adminDashboard.css";

/* mock data */
const todayStats = { 출근: 32, 지각: 3, 조퇴: 2, 결석: 4, 미출근: 2 , 휴가: 4};
const weekStats  = { 출근: 210, 지각: 18, 조퇴: 11, 결석: 22, 미출근: 9, 휴가: 23 };
const monthStats = { 출근: 880, 지각: 54, 조퇴: 31, 결석: 61, 미출근: 21, 휴가: 53};

const dailyTrend = [
  { day: "월", 출근: 30, 지각: 3, 조퇴: 1, 휴가: 4, 미출근: 1 },
  { day: "화", 출근: 28, 지각: 4, 조퇴: 2, 휴가: 5, 미출근: 2 },
  { day: "수", 출근: 31, 지각: 2, 조퇴: 1, 휴가: 3, 미출근: 1 },
  { day: "목", 출근: 29, 지각: 5, 조퇴: 3, 휴가: 4, 미출근: 1 },
  { day: "금", 출근: 27, 지각: 4, 조퇴: 2, 휴가: 6, 미출근: 3 },
];

const COLORS = ["#22c55e", "#f59e0b", "#fb7185", "#ef4444", "#94a3b8", "#60a5fa"];

export default function AdminDashboardPage() {
  const [range, setRange] = useState("today");

  const stats = useMemo(() => {
    if (range === "week") return weekStats;
    if (range === "month") return monthStats;
    return todayStats;
  }, [range]);

  const pieData = Object.entries(stats).map(([name, value]) => ({ name, value }));

  return (
    <div className="adashWrap">
      {/* ✅ KPI 5개: 완전 독립 박스 */}
      <section className="kpiGrid">
        {Object.entries(stats).map(([label, value], idx) => (
          <div className="kpiCard" key={label}>
            <div className="kpiTop">
              <span className="kpiDot" style={{ background: COLORS[idx] }} />
              <span className="kpiLabel">{label}</span>
            </div>
            <div className="kpiValue">{value}</div>
          </div>
        ))}
      </section>

      {/* ✅ 그래프 영역 + 기간 선택 */}
      <section className="dashMain">
        <div className="dashHead">
          <h2 className="dashTitle">관리자 대시보드</h2>
          <div className="dashTabs">
            <button onClick={() => setRange("today")} className={range === "today" ? "active" : ""}>오늘</button>
            <button onClick={() => setRange("week")} className={range === "week" ? "active" : ""}>주간</button>
            <button onClick={() => setRange("month")} className={range === "month" ? "active" : ""}>월간</button>
          </div>
        </div>

        <div className="adash">
          {/* 왼쪽: 원 그래프 */}
          <div className="adash-card">
            <h3 className="cardTitle">출결 비율</h3>
            <div className="chartBox">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" innerRadius={55} outerRadius={105} paddingAngle={3}>
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 오른쪽: 꺾은선 */}
          <div className="adash-card">
            <h3 className="cardTitle">일별 추이</h3>
            <div className="chartBox">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Line dataKey="출근" stroke={COLORS[0]} strokeWidth={2} />
                  <Line dataKey="지각" stroke={COLORS[1]} strokeWidth={2} />
                  <Line dataKey="조퇴" stroke={COLORS[2]} strokeWidth={2} />
                  <Line dataKey="휴가" stroke={COLORS[3]} strokeWidth={2} />
                  <Line dataKey="미출근" stroke={COLORS[4]} strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
