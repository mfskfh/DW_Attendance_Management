import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div>
      <h1>출결관리 시스템</h1>

      <p>프로젝트 메인 페이지</p>

      <ul>
        <li><Link to="/employee">직원 페이지로 이동</Link></li>
        <li><Link to="/admin">관리자 페이지로 이동</Link></li>
      </ul>
    </div>
  );
}
