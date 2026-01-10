export default function ApprovalsPage() {
  return (
    <div>
      <h2>요청 관리</h2>

      <table
        border="1"
        cellPadding="8"
        style={{ borderCollapse: "collapse", width: "100%", marginTop: "16px" }}
      >
        <thead>
          <tr>
            <th>직원명</th>
            <th>요청 종류</th>
            <th>기간</th>
            <th>사유</th>
            <th>상태</th>
            <th>처리</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>홍길동</td>
            <td>휴가</td>
            <td>2026-01-10 ~ 2026-01-11</td>
            <td>개인 사정</td>
            <td>대기</td>
            <td>
              <button>승인</button>{" "}
              <button>거절</button>
            </td>
          </tr>
          <tr>
            <td>김철수</td>
            <td>조퇴</td>
            <td>2026-01-05</td>
            <td>병원 방문</td>
            <td>대기</td>
            <td>
              <button>승인</button>{" "}
              <button>거절</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
