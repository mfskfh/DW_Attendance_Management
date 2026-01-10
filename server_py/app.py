import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv

from db import get_conn
from auth import register_user, login_user
from auth_guard import jwt_required
from attendance import get_today_attendance, check_in, check_out

load_dotenv()

app = Flask(__name__)
app.url_map.strict_slashes = False  # /login 과 /login/ 둘 다 허용

from flask_cors import CORS

CORS(
    app,
    resources={
        r"/api/*": {
            "origins": ["http://localhost:5173", "http://127.0.0.1:5173"],
            "methods": ["GET", "POST", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"],
        }
    },
)


@app.get("/api/health")
def health():
    return {"ok": True}

@app.get("/api/db-test")
def db_test():
    conn = get_conn()
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT 1 AS ok")
            row = cur.fetchone()
        return jsonify(row)
    finally:
        conn.close()

@app.post("/api/auth/register")
def register():
    data = request.get_json(force=True)
    username = data.get("username")
    password = data.get("password")
    name = data.get("name")
    role = data.get("role", "employee")

    if not username or not password or not name:
        return jsonify({"message": "이름/아이디/비밀번호는 필수입니다."}), 400

    ok, code, payload = register_user(username, password, name, role)
    return jsonify(payload), code

@app.post("/api/auth/login")
def login():
    data = request.get_json(force=True)
    username = data.get("username")
    password = data.get("password")
    role = data.get("role", "employee")

    if not username or not password:
        return jsonify({"message": "아이디/비밀번호는 필수입니다."}), 400

    ok, code, payload = login_user(username, password, role)
    return jsonify(payload), code

@app.get("/api/attendance/today")
@jwt_required
def attendance_today():
    user_id = int(request.user["userId"])
    row = get_today_attendance(user_id)
    return jsonify({"today": row}), 200

@app.post("/api/attendance/check-in")
@jwt_required
def attendance_check_in():
    user_id = int(request.user["userId"])
    row = check_in(user_id)
    return jsonify({"today": row}), 200

@app.post("/api/attendance/check-out")
@jwt_required
def attendance_check_out():
    user_id = int(request.user["userId"])
    row = check_out(user_id)
    return jsonify({"today": row}), 200

if __name__ == "__main__":
    port = int(os.getenv("FLASK_PORT", "4000"))
    app.run(host="0.0.0.0", port=port, debug=True)