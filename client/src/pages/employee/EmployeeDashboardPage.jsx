import "./employeeDashboard.css";

export default function EmployeeDashboardPage() {
  const stats = [
    { label: "출근", value: 452, sub: "+ 2 new employees added!", icon: "👤" },
    { label: "외출", value: 360, sub: "−10% Less than yesterday", icon: "🧭" },
    { label: "휴가", value: 30, sub: "+3% Increase than yesterday", icon: "🧳" },
    { label: "지각", value: 62, sub: "+3% Increase than yesterday", icon: "⏰" },
    { label: "조퇴", value: 6, sub: "−10% Less than yesterday", icon: "🌙" },
    { label: "결석", value: 42, sub: "2% Increase than yesterday", icon: "📅" },
  ];

  const chartPoints = [60, 72, 58, 74, 82, 55, 68, 42, 60, 71, 58, 40, 63];

  return (
    <div>
      <div className="edb-breadcrumb">
        Dashboard <span className="edb-bc-sep">▸</span> Attendance Insights
      </div>

      <section className="edb-grid">
        <div className="edb-card edb-card-big">
          <div className="edb-big-time">
            <div className="edb-sun">☀️</div>
            <div>
              <div className="edb-time">8:02:09 AM</div>
              <div className="edb-muted">Realtime Insight</div>
            </div>
          </div>

          <div className="edb-big-date">
            <div className="edb-muted">Today:</div>
            <div className="edb-date">2nd August 2023</div>
          </div>

          <button className="edb-primary-btn">⚙ Advanced Configuration</button>
        </div>

        {stats.map((s) => (
          <div className="edb-card edb-stat" key={s.label}>
            <div className="edb-stat-top">
              <div>
                <div className="edb-stat-value">{s.value}</div>
                <div className="edb-stat-label">{s.label}</div>
              </div>
              <div className="edb-stat-icon">{s.icon}</div>
            </div>
            <div className="edb-stat-sub">{s.sub}</div>
          </div>
        ))}
      </section>

      <section className="edb-card edb-chart">
        <div className="edb-chart-head">
          <div className="edb-chart-title">출결현황</div>
          <div className="edb-chart-tabs">
            <label className="edb-radio">
              <input type="radio" name="range" defaultChecked /> Daily
            </label>
            <label className="edb-radio">
              <input type="radio" name="range" /> Weekly
            </label>
            <label className="edb-radio">
              <input type="radio" name="range" /> Monthly
            </label>
            <button className="edb-ghost-btn" title="설정">⚙</button>
          </div>
        </div>

        <div className="edb-chart-body">
          <SimpleLineChart points={chartPoints} />
          <div className="edb-xlabels">
            {["01 Aug","02 Aug","03 Aug","04 Aug","07 Aug","08 Aug","09 Aug","10 Aug","11 Aug","14 Aug","15 Aug","16 Aug"].map((d) => (
              <div className="edb-xlabel" key={d}>{d}</div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function SimpleLineChart({ points = [] }) {
  const w = 1000;
  const h = 240;
  const pad = 18;

  if (!points.length) return null;

  const max = Math.max(...points);
  const min = Math.min(...points);
  const span = Math.max(1, max - min);

  const xStep = (w - pad * 2) / (points.length - 1);
  const toXY = (v, i) => {
    const x = pad + i * xStep;
    const y = pad + (h - pad * 2) * (1 - (v - min) / span);
    return [x, y];
  };

  const d = points
    .map((v, i) => {
      const [x, y] = toXY(v, i);
      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

  return (
    <svg className="edb-svg" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      {[0, 1, 2, 3].map((i) => (
        <line
          key={i}
          x1="0"
          x2={w}
          y1={pad + ((h - pad * 2) / 3) * i}
          y2={pad + ((h - pad * 2) / 3) * i}
          className="edb-gridline"
        />
      ))}
      <path d={`${d} L ${w - pad} ${h - pad} L ${pad} ${h - pad} Z`} className="edb-area" />
      <path d={d} className="edb-line" />
      {points.map((v, i) => {
        const [x, y] = toXY(v, i);
        return <circle key={i} cx={x} cy={y} r={4} className="edb-dot" />;
      })}
    </svg>
  );
}
