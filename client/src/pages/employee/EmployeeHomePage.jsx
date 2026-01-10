import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../../app/api/api";

export default function EmployeeHomePage() {
  const [today, setToday] = useState(null); // {check_in, check_out, ...} or null
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const checkedIn = !!today?.check_in;
  const checkedOut = !!today?.check_out;

  const statusText = useMemo(() => {
    if (!today) return "오늘 출근 기록 없음";
    if (checkedIn && !checkedOut) return "출근 완료 (퇴근 전)";
    if (checkedIn && checkedOut) return "퇴근 완료";
    return "오늘 출근 기록 없음";
  }, [today, checkedIn, checkedOut]);

  const loadToday = async () => {
    setError("");
    setLoading(true);
    try {
      const data = await apiFetch("/api/attendance/today");
      setToday(data.today); // null or object
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadToday();
  }, []);

  const onCheckIn = async () => {
    setError("");
    try {
      const data = await apiFetch("/api/attendance/check-in", { method: "POST" });
      setToday(data.today);
    } catch (e) {
      setError(e.message);
    }
  };

  const onCheckOut = async () => {
    setError("");
    try {
      const data = await apiFetch("/api/attendance/check-out", { method: "POST" });
      setToday(data.today);
    } catch (e) {
      setError(e.message);
    }
  };

  if (loading) return <div style={{ padding: 16 }}>불러오는 중...</div>;

  return (
    <div style={{ padding: 16 }}>
      <h2>오늘 출결</h2>

      <div style={{ marginBottom: 12, fontWeight: "bold" }}>{statusText}</div>

      {today && (
        <div style={{ marginBottom: 12 }}>
          <div>출근: {today.check_in ? String(today.check_in) : "-"}</div>
          <div>퇴근: {today.check_out ? String(today.check_out) : "-"}</div>
        </div>
      )}

      <div style={{ display: "flex", gap: 8 }}>
        <button type="button" onClick={onCheckIn} disabled={checkedIn}>
          출근
        </button>
        <button type="button" onClick={onCheckOut} disabled={!checkedIn || checkedOut}>
          퇴근
        </button>
        <button type="button" onClick={loadToday}>
          새로고침
        </button>
      </div>

      {error && <p style={{ marginTop: 12, color: "crimson" }}>{error}</p>}
    </div>
  );
}
