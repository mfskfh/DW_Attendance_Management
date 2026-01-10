import os
import jwt
from functools import wraps
from flask import request, jsonify

def jwt_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        # ✅ 프리플라이트(OPTIONS)는 인증 검사 없이 통과
        if request.method == "OPTIONS":
            return ("", 204)

        auth = request.headers.get("Authorization", "")
        if not auth.startswith("Bearer "):
            return jsonify({"message": "인증이 필요합니다."}), 401

        token = auth.replace("Bearer ", "").strip()
        try:
            payload = jwt.decode(token, os.getenv("JWT_SECRET"), algorithms=["HS256"])
        except Exception:
            return jsonify({"message": "토큰이 유효하지 않습니다."}), 401

        request.user = payload
        return fn(*args, **kwargs)

    return wrapper
