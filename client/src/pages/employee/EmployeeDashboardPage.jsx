import { useNavigate } from "react-router-dom";
import { useAuth } from "../../app/auth/useAuth";
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from "recharts";
import "./employeeDashboard.css";

export default function EmployeeHomePage() {
  const navigate = useNavigate();
  const { name } = useAuth();

  const today = new Date().toLocaleDateString("ko-KR");

  const todayStatus = {
    status: "출근",
    inTime: "08:58",
    outTime: "-"
  };

  const pieData = [
    { name: "출근", value: 18 },
    { name: "지각", value: 2 },
    { name: "휴가", value: 1 },
    { name: "결석", value: 0 },
  ];

  const barData = [
    { day: "월", 출근: 1, 지각: 0, 결석: 0 },
    { day: "화", 출근: 1, 지각: 0, 결석: 0 },
    { day: "수", 출근: 0, 지각: 1, 결석: 0 },
    { day: "목", 출근: 1, 지각: 0, 결석: 0 },
    { day: "금", 출근: 1, 지각: 0, 결석: 0 },
    { day: "토", 출근: 0, 지각: 0, 결석: 0 },
    { day: "일", 출근: 0, 지각: 0, 결석: 0 },
  ];

  return (
    <div className="ed-wrap">
      <h2 className="ed-title">대시보드</h2>
      <div className="ed-sub">{name}님 · {today}</div>

      <div className="ed-grid">

        {/* 오늘 출결 */}
        <div className="ed-card">
          <h3>오늘 출결</h3>
          <div className="ed-status">{todayStatus.status}</div>
          <div className="ed-times">
            <span>출근 {todayStatus.inTime}</span>
            <span>퇴근 {todayStatus.outTime}</span>
          </div>
        </div>

        {/* 출결 비율 */}
        <div className="ed-card">
          <h3>이번 달 출결 비율</h3>
          <div className="chartBox">
            <ResponsiveContainer width="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" outerRadius={80}>
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={["#4ade80","#facc15","#60a5fa","#f87171"][i]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 주간 그래프 */}
        <div className="ed-card full">
          <h3>최근 7일 출결</h3>
          <div className="chartBox">
            <ResponsiveContainer width="100%">
              <BarChart data={barData}>
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="출근" fill="#4ade80" />
                <Bar dataKey="지각" fill="#facc15" />
                <Bar dataKey="결석" fill="#f87171" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 빠른 메뉴 */}
        <div className="ed-card">
          <h3>빠른 메뉴</h3>
          <div className="ed-menu">
            <button onClick={() => navigate("/employee/attendance")}>내 출결 확인</button>
            <button onClick={() => navigate("/employee/requests")}>나의 요청 목록</button>
            <button onClick={() => navigate("/employee/requests/new")}>요청 작성</button>
          </div>
        </div>

      </div>
    </div>
  );
}
