import os
import bcrypt
import jwt
from datetime import datetime, timedelta
from db import get_conn

def register_user(username: str, password: str, name: str, role: str):
    role = "admin" if role == "admin" else "employee"

    conn = get_conn()
    try:
        with conn.cursor() as cur:
            # 아이디 중복 확인
            cur.execute("SELECT id FROM users WHERE username=%s", (username,))
            if cur.fetchone():
                return (False, 409, {"message": "이미 사용 중인 아이디입니다."})

            # 비밀번호 해시 저장
            pw_hash = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

            cur.execute(
                "INSERT INTO users (username, password_hash, name, role) VALUES (%s, %s, %s, %s)",
                (username, pw_hash, name, role),
            )

        return (True, 201, {"message": "회원가입 완료"})
    finally:
        conn.close()


def login_user(username: str, password: str, requested_role: str):
    requested_role = "admin" if requested_role == "admin" else "employee"

    conn = get_conn()
    try:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT id, username, password_hash, name, role FROM users WHERE username=%s",
                (username,),
            )
            user = cur.fetchone()

            if not user:
                return (False, 401, {"message": "아이디 또는 비밀번호가 틀렸습니다."})

            # 역할까지 일치해야 로그인 허용 (원하면 나중에 이 조건 제거 가능)
            if user["role"] != requested_role:
                return (False, 403, {"message": "해당 역할로 로그인할 수 없습니다."})

            ok = bcrypt.checkpw(password.encode("utf-8"), user["password_hash"].encode("utf-8"))
            if not ok:
                return (False, 401, {"message": "아이디 또는 비밀번호가 틀렸습니다."})

            payload = {
                "userId": user["id"],
                "role": user["role"],
                "name": user["name"],
                "exp": datetime.utcnow() + timedelta(days=7),
            }

            token = jwt.encode(payload, os.getenv("JWT_SECRET"), algorithm="HS256")

        return (True, 200, {"token": token, "role": user["role"], "name": user["name"]})
    finally:
        conn.close()
