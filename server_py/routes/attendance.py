from flask import Blueprint, request, jsonify
from datetime import date, datetime
from .utils import require_auth
from db import get_conn

bp = Blueprint("attendance", __name__, url_prefix="/api")

# 직원: 오늘 출결 조회
@bp.get("/employee/attendance/today")
@require_auth()
def employee_today(user):
    conn = get_conn()
    cur = conn.cursor(dictionary=True)
    today = date.today()

    cur.execute("""
        SELECT work_date, check_in, check_out, status
        FROM attendance
        WHERE user_id=%s AND work_date=%s
    """, (user["id"], today))
    row = cur.fetchone()

    if not row:
        # 기록 없으면 미출근 기본 반환
        return jsonify({
            "work_date": str(today),
            "check_in": None,
            "check_out": None,
            "status": "미출근"
        })

    return jsonify({
        "work_date": str(row["work_date"]),
        "check_in": str(row["check_in"]) if row["check_in"] else None,
        "check_out": str(row["check_out"]) if row["check_out"] else None,
        "status": row["status"]
    })

# 직원: 출근 처리
@bp.post("/employee/attendance/clock-in")
@require_auth()
def clock_in(user):
    conn = get_conn()
    cur = conn.cursor(dictionary=True)
    today = date.today()
    now = datetime.now().time()

    # 기존 row가 있으면 업데이트, 없으면 insert
    cur.execute("""
        SELECT id, check_in FROM attendance
        WHERE user_id=%s AND work_date=%s
    """, (user["id"], today))
    row = cur.fetchone()

    if row and row["check_in"]:
        return jsonify({"message": "이미 출근 처리되었습니다."}), 400

    # 09:00 기준 지각 판정(원하면 시간 변경 가능)
    status = "지각" if now >= datetime.strptime("09:01", "%H:%M").time() else "출근"

    if row:
        cur.execute("""
            UPDATE attendance
            SET check_in=%s, status=%s
            WHERE id=%s
        """, (now, status, row["id"]))
    else:
        cur.execute("""
            INSERT INTO attendance (user_id, work_date, check_in, status)
            VALUES (%s, %s, %s, %s)
        """, (user["id"], today, now, status))

    conn.commit()
    return jsonify({"message": "출근 처리 완료", "status": status})

# 직원: 퇴근 처리
@bp.post("/employee/attendance/clock-out")
@require_auth()
def clock_out(user):
    conn = get_conn()
    cur = conn.cursor(dictionary=True)
    today = date.today()
    now = datetime.now().time()

    cur.execute("""
        SELECT id, check_in, check_out, status
        FROM attendance
        WHERE user_id=%s AND work_date=%s
    """, (user["id"], today))
    row = cur.fetchone()

    if not row or not row["check_in"]:
        return jsonify({"message": "출근 기록이 없습니다."}), 400
    if row["check_out"]:
        return jsonify({"message": "이미 퇴근 처리되었습니다."}), 400

    # 18:00 이전이면 조퇴(원하면 규칙 변경)
    status = "조퇴" if now < datetime.strptime("18:00", "%H:%M").time() else row["status"]

    cur.execute("""
        UPDATE attendance
        SET check_out=%s, status=%s
        WHERE id=%s
    """, (now, status, row["id"]))
    conn.commit()

    return jsonify({"message": "퇴근 처리 완료", "status": status})

# 직원: 월별 출결 목록
@bp.get("/employee/attendance")
@require_auth()
def employee_month(user):
    month = request.args.get("month")  # "2026-01"
    if not month:
        return jsonify({"message": "month=YYYY-MM 필요"}), 400

    conn = get_conn()
    cur = conn.cursor(dictionary=True)

    cur.execute("""
        SELECT work_date, check_in, check_out, status
        FROM attendance
        WHERE user_id=%s AND DATE_FORMAT(work_date, '%%Y-%%m')=%s
        ORDER BY work_date DESC
    """, (user["id"], month))
    rows = cur.fetchall()

    out = []
    for r in rows:
        out.append({
            "date": str(r["work_date"]),
            "inTime": str(r["check_in"]) if r["check_in"] else None,
            "outTime": str(r["check_out"]) if r["check_out"] else None,
            "status": r["status"]
        })

    return jsonify(out)
