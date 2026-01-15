from functools import wraps
from flask import request, jsonify
import jwt
import os

JWT_SECRET = os.getenv("JWT_SECRET", "dev-secret")

def require_auth():
    def deco(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            auth = request.headers.get("Authorization", "")
            if not auth.startswith("Bearer "):
                return jsonify({"message": "토큰이 필요합니다."}), 401
            token = auth.split(" ", 1)[1]
            try:
                payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
            except Exception:
                return jsonify({"message": "토큰이 유효하지 않습니다."}), 401

            # payload에 id/role/name이 들어있다고 가정
            user = {
                "id": payload.get("id"),
                "role": payload.get("role"),
                "name": payload.get("name"),
            }
            return fn(user, *args, **kwargs)
        return wrapper
    return deco

def require_role(role):
    def deco(fn):
        @wraps(fn)
        def wrapper(user, *args, **kwargs):
            if user.get("role") != role:
                return jsonify({"message": "권한이 없습니다."}), 403
            return fn(user, *args, **kwargs)
        return wrapper
    return deco
