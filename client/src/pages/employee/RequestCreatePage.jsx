export default function RequestCreatePage() {
  return (
    <div>
      <h2>조퇴 / 결석 / 휴가 요청</h2>

      <form style={{ maxWidth: "400px" }}>
        <div style={{ marginBottom: "12px" }}>
          <label>요청 종류</label><br />
          <select>
            <option>조퇴</option>
            <option>결석</option>
            <option>휴가</option>
          </select>
        </div>

        <div style={{ marginBottom: "12px" }}>
          <label>날짜</label><br />
          <input type="date" />
        </div>

        <div style={{ marginBottom: "12px" }}>
          <label>사유</label><br />
          <textarea rows="4" />
        </div>

        <button type="button">요청 제출</button>
      </form>
    </div>
  );
}
