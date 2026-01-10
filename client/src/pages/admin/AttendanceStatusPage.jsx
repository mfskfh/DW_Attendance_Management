export default function AttendanceStatusPage() {
  return (
    <div>
      <h2>출결 현황</h2>
      <p>오늘 직원들의 출결 상태를 확인할 수 있습니다.</p>

      <table
        border="1"
        cellPadding="8"
        style={{ borderCollapse: "collapse", width: "100%", marginTop: "16px" }}
      >
        <thead>
          <tr>
            <th>직원명</th>
            <th>부서</th>
            <th>출근 시간</th>
            <th>퇴근 시간</th>
            <th>상태</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>홍길동</td>
            <td>개발팀</td>
            <td>09:00</td>
            <td>-</td>
            <td>근무중</td>
          </tr>
          <tr>
            <td>김철수</td>
            <td>디자인팀</td>
            <td>09:12</td>
            <td>-</td>
            <td>지각</td>
          </tr>
          <tr>
            <td>이영희</td>
            <td>기획팀</td>
            <td>-</td>
            <td>-</td>
            <td>휴가</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
