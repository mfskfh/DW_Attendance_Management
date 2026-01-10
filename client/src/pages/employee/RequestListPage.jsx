import { Link } from "react-router-dom";

export default function RequestListPage() {
  return (
    <div>
      <h2>내 요청 목록</h2>

      <div style={{ marginBottom: "12px" }}>
        <Link to="/employee/requests/new">요청하기</Link>
      </div>

      <table
        border="1"
        cellPadding="8"
        style={{ borderCollapse: "collapse", width: "100%" }}
      >
        <thead>
          <tr>
            <th>종류</th>
            <th>기간</th>
            <th>상태</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>휴가</td>
            <td>2026-01-10 ~ 2026-01-11</td>
            <td>대기</td>
          </tr>
          <tr>
            <td>조퇴</td>
            <td>2026-01-05</td>
            <td>승인</td>
          </tr>
          <tr>
            <td>결석</td>
            <td>2026-01-02</td>
            <td>거절</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
