export default function AdminDashboardPage() {
  return (
    <div>
      <h2>관리자 대시보드</h2>
      <p>오늘의 출결 현황 요약입니다.</p>

      {/* 요약 카드 영역 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "16px",
          marginTop: "16px",
        }}
      >
        <div style={cardStyle}>
          <h3>출근</h3>
          <p style={countStyle}>12명</p>
        </div>

        <div style={cardStyle}>
          <h3>지각</h3>
          <p style={countStyle}>2명</p>
        </div>

        <div style={cardStyle}>
          <h3>휴가</h3>
          <p style={countStyle}>1명</p>
        </div>

        <div style={cardStyle}>
          <h3>미출근</h3>
          <p style={countStyle}>1명</p>
        </div>
      </div>

      {/* 안내 문구 */}
      <div style={{ marginTop: "24px" }}>
        <p>자세한 내용은 좌측 메뉴에서 확인할 수 있습니다.</p>
      </div>
    </div>
  );
}

const cardStyle = {
  border: "1px solid #ddd",
  borderRadius: "8px",
  padding: "16px",
  textAlign: "center",
};

const countStyle = {
  fontSize: "24px",
  fontWeight: "bold",
  marginTop: "8px",
};
