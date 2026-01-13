import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./requestCreatePage.css";

export default function RequestCreatePage() {
  const navigate = useNavigate();

  const [type, setType] = useState("휴가");
  const [date, setDate] = useState("");
  const [reason, setReason] = useState("");
  const [detail, setDetail] = useState("");

  const submit = () => {
    if (!date || !reason) {
      alert("날짜와 사유는 필수입니다.");
      return;
    }

    // 나중에 API 연결
    console.log("요청 전송:", { type, date, reason, detail });

    alert("요청이 전송되었습니다.");

    navigate("/employee/requests");
  };

  return (
    <div className="rc-wrap">
      <h2 className="rc-title">요청 작성</h2>

      <div className="rc-card">
        <Field label="요청 유형">
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option>휴가</option>
            <option>조퇴</option>
            <option>결석</option>
          </select>
        </Field>

        <Field label="날짜">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </Field>

        <Field label="사유 (간단)">
          <input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="예: 병원 방문"
          />
        </Field>

        <Field label="상세 내용">
          <textarea
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
            placeholder="상세 사유를 입력하세요"
          />
        </Field>

        <div className="rc-actions">
          <button className="rc-cancel" onClick={() => navigate(-1)}>
            취소
          </button>
          <button className="rc-submit" onClick={submit}>
            요청 보내기
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="rc-field">
      <div className="rc-label">{label}</div>
      {children}
    </div>
  );
}
