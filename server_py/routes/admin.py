from flask import Blueprint, request, jsonify
from datetime import date, timedelta
from .utils import require_auth, require_role
from db import get_conn

bp = Blueprint("admin", __name__, url_prefix="/api/admin")

STATUS_ORDER = ["출근","지각","조퇴","결석","미출근","휴가"]

def _date_range(kind):
    today = date.today()
    if kind == "today":
        return today, today
    if kind == "week":
        start = today - timedelta(days=6)
        return start, today
    # month
    start = today.replace(day=1)
    return start, today

@bp.get("/stats")
@require_auth()
@require_role("admin")
def admin_stats(user):
    kind = request.args.get("range", "today")
    start, end = _date_range(kind)

    conn = get_conn()
    cur = conn.cursor(dictionary=True)

    cur.execute("""
        SELECT status, COUNT(*) as cnt
        FROM attendance
        WHERE work_date BETWEEN %s AND %s
        GROUP BY status
    """, (start, end))
    rows = cur.fetchall()

    stats = {k: 0 for k in STATUS_ORDER}
    for r in rows:
        if r["status"] in stats:
            stats[r["status"]] = int(r["cnt"])

    return jsonify({"range": kind, "start": str(start), "end": str(end), "stats": stats})

# 관리자: 요청 목록
@bp.get("/requests")
@require_auth()
@require_role("admin")
def admin_requests(user):
    status = request.args.get("status")  # 대기/승인/거절/None
    conn = get_conn()
    cur = conn.cursor(dictionary=True)

    if status:
        cur.execute("""
            SELECT r.id, u.name, u.username, r.req_type, r.req_date, r.reason, r.detail, r.status, r.created_at
            FROM requests r
            JOIN users u ON u.id = r.user_id
            WHERE r.status=%s
            ORDER BY r.id DESC
        """, (status,))
    else:
        cur.execute("""
            SELECT r.id, u.name, u.username, r.req_type, r.req_date, r.reason, r.detail, r.status, r.created_at
            FROM requests r
            JOIN users u ON u.id = r.user_id
            ORDER BY r.id DESC
        """)
    rows = cur.fetchall()

    return jsonify([{
        "id": r["id"],
        "name": r["name"],
        "username": r["username"],
        "type": r["req_type"],
        "date": str(r["req_date"]),
        "reason": r["reason"],
        "detail": r["detail"],
        "status": r["status"],
        "createdAt": str(r["created_at"])
    } for r in rows])

# 관리자: 요청 승인/거절
@bp.post("/requests/<int:req_id>/decision")
@require_auth()
@require_role("admin")
def decision(user, req_id):
    body = request.get_json() or {}
    action = body.get("action")  # 승인/거절
    note = body.get("note", "")

    if action not in ["승인","거절"]:
        return jsonify({"message": "action은 승인 또는 거절"}), 400

    conn = get_conn()
    cur = conn.cursor(dictionary=True)

    cur.execute("UPDATE requests SET status=%s, admin_note=%s WHERE id=%s", (action, note, req_id))
    conn.commit()

    return jsonify({"message": f"{action} 처리 완료"})
