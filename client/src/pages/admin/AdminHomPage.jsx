import { Link } from "react-router-dom";
import "./adminPages.css";

export default function AdminHomePage() {
  return (
    <div className="page">
      <h2 className="pageTitle">관리자 홈</h2>

      <div className="cardGrid">
        <Link className="card" to="/admin/attendance">
          <div className="cardTitle">오늘 출결 현황</div>
          <div className="cardDesc">출근/퇴근/지각/결석 인원 확인</div>
        </Link>

        <Link className="card" to="/admin/requests">
          <div className="cardTitle">요청 처리</div>
          <div className="cardDesc">휴가/조퇴/결석 요청 승인·거절</div>
        </Link>

        <Link className="card" to="/admin/employees">
          <div className="cardTitle">직원 관리</div>
          <div className="cardDesc">직원 목록/정보 수정/권한 관리</div>
        </Link>
      </div>
    </div>
  );
}
