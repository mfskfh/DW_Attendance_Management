from flask import Blueprint, request, jsonify
from datetime import date
from .utils import require_auth
from db import get_conn

bp = Blueprint("requests", __name__, url_prefix="/api")

# 직원: 내 요청 목록
@bp.get("/employee/requests")
@require_auth()
def my_requests(user):
    conn = get_conn()
    cur = conn.cursor(dictionary=True)
    cur.execute("""
        SELECT id, req_type, req_date, reason, detail, status, created_at
        FROM requests
        WHERE user_id=%s
        ORDER BY id DESC
    """, (user["id"],))
    rows = cur.fetchall()

    return jsonify([{
        "id": r["id"],
        "type": r["req_type"],
        "date": str(r["req_date"]),
        "reason": r["reason"],
        "detail": r["detail"],
        "status": r["status"],
        "createdAt": str(r["created_at"])
    } for r in rows])

# 직원: 요청 생성
@bp.post("/employee/requests")
@require_auth()
def create_request(user):
    body = request.get_json() or {}
    req_type = body.get("type")
    req_date = body.get("date")
    reason = body.get("reason")
    detail = body.get("detail", "")

    if not req_type or not req_date or not reason:
        return jsonify({"message": "type/date/reason 필수"}), 400

    conn = get_conn()
    cur = conn.cursor(dictionary=True)
    cur.execute("""
        INSERT INTO requests (user_id, req_type, req_date, reason, detail)
        VALUES (%s, %s, %s, %s, %s)
    """, (user["id"], req_type, req_date, reason, detail))
    conn.commit()

    return jsonify({"message": "요청 전송 완료"})
