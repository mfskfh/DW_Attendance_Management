export default function AttendanceHistoryPage() {
  return (
    <div>
      <h2>내 출결 확인</h2>

      <table
        border="1"
        cellPadding="8"
        style={{ borderCollapse: "collapse", width: "100%", marginTop: "16px" }}
      >
        <thead>
          <tr>
            <th>날짜</th>
            <th>출근 시간</th>
            <th>퇴근 시간</th>
            <th>상태</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>2026-01-01</td>
            <td>09:00</td>
            <td>18:00</td>
            <td>정상</td>
          </tr>
          <tr>
            <td>2026-01-02</td>
            <td>09:10</td>
            <td>18:00</td>
            <td>지각</td>
          </tr>
          <tr>
            <td>2026-01-03</td>
            <td>-</td>
            <td>-</td>
            <td>결근</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
