import { Link } from "react-router-dom";

export default function EmployeeManagementPage() {
  return (
    <div>
      <h2>직원 관리</h2>
      <p>직원 목록을 관리합니다.</p>

      <table
        border="1"
        cellPadding="8"
        style={{ borderCollapse: "collapse", width: "100%", marginTop: "16px" }}
      >
        <thead>
          <tr>
            <th>이름</th>
            <th>부서</th>
            <th>직급</th>
            <th>상태</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>홍길동</td>
            <td>개발팀</td>
            <td>사원</td>
            <td>재직</td>
            <td>
              <Link to="/admin/employees/1/attendance">출결 보기</Link>
            </td>
          </tr>
          <tr>
            <td>김철수</td>
            <td>디자인팀</td>
            <td>대리</td>
            <td>재직</td>
            <td>
              <Link to="/admin/employees/2/attendance">출결 보기</Link>
            </td>
          </tr>
          <tr>
            <td>이영희</td>
            <td>기획팀</td>
            <td>과장</td>
            <td>휴직</td>
            <td>
              <Link to="/admin/employees/3/attendance">출결 보기</Link>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
