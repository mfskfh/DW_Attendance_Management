import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv

from db import get_conn
from auth import register_user, login_user
from auth_guard import jwt_required
from attendance import get_today_attendance, check_in, check_out
from routes.attendance import bp as attendance_bp
from routes.requests import bp as requests_bp
from routes.admin import bp as admin_bp
from datetime import date, datetime

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

ALLOWED_STATUS = {"출근","지각","조퇴","결석","미출근","휴가"}

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

@app.get("/api/db-tables")
def db_tables():
    conn = get_conn()
    cur = conn.cursor()  # 어떤 커서든 fetchall 결과 받기
    cur.execute("SHOW TABLES")
    rows = cur.fetchall()

    tables = []
    for r in rows:
        # r이 tuple이면 (tableName,) 형태
        if isinstance(r, (list, tuple)):
            tables.append(r[0])
        # r이 dict이면 {"Tables_in_db": "..."} 형태
        elif isinstance(r, dict):
            key = next(iter(r.keys()))
            tables.append(r[key])
        else:
            tables.append(str(r))

    return {"tables": tables}

from datetime import date, datetime

@app.get("/api/employee/attendance/today")
def get_today_attendance():
    user_id = 1 # TODO:
    today = date.today()

    conn = get_conn()
    cur = conn.cursor()
    cur.execute("""
        SELECT status, check_in, check_out
        FROM attendance
        WHERE user_id=%s AND work_date=%s
    """, (user_id, today))

    row = cur.fetchone()

    if not row:
        return {
            "status": "미출근",
            "check_in": None,
            "check_out": None,
        }

    # ✅ row가 tuple/list인 경우
    if isinstance(row, (list, tuple)):
        status, check_in, check_out = row[0], row[1], row[2]
    # ✅ row가 dict인 경우
    elif isinstance(row, dict):
        status = row.get("status")
        check_in = row.get("check_in")
        check_out = row.get("check_out")
    else:
        # 예상 못한 타입 방어
        return {"message": f"Unexpected row type: {type(row)}"}, 500

    work_state = "미출근"
    if check_in and not check_out:
        work_state = "근무중"
    elif check_in and check_out:
        work_state = "퇴근완료"

    return {
        "status": status,
        "work_state": work_state,
        "check_in": str(check_in) if check_in else None,
        "check_out": str(check_out) if check_out else None,
    }


@app.post("/api/employee/attendance/clock-in")
@app.post("/api/employee/attendance/clock-in")
def clock_in():
    user_id = 1  # ✅ 지금은 고정, 나중에 토큰에서 꺼내면 됨

    today = date.today()
    now_t = datetime.now().strftime("%H:%M:%S")

    conn = get_conn()
    cur = conn.cursor()

    # 이미 출근했는지 확인
    cur.execute(
        "SELECT check_in FROM attendance WHERE user_id=%s AND work_date=%s",
        (user_id, today),
    )
    row = cur.fetchone()

    if row and row[0]:
        return {"message": "이미 출근 처리되었습니다."}, 400

    # 없으면 생성 + 출근시간 기록 / 있으면 출근시간만 기록
    cur.execute(
        """
        INSERT INTO attendance (user_id, work_date, check_in, status)
        VALUES (%s, %s, %s, '출근')
        ON DUPLICATE KEY UPDATE
          check_in = IFNULL(check_in, VALUES(check_in)),
          status = '출근'
        """,
        (user_id, today, now_t),
    )

    conn.commit()
    return {"message": "출근 처리 완료", "check_in": now_t, "status": "출근"}


@app.post("/api/employee/attendance/clock-out")
def clock_out():
    user_id = 1  # ✅ 지금은 고정, 나중에 토큰에서 꺼내면 됨

    today = date.today()
    now_t = datetime.now().strftime("%H:%M:%S")

    conn = get_conn()
    cur = conn.cursor()  # ✅ 튜플 커서 고정

    # 오늘 출근 기록이 있는지 확인 (check_in)
    cur.execute(
        "SELECT check_in, check_out FROM attendance WHERE user_id=%s AND work_date=%s",
        (user_id, today),
    )
    row = cur.fetchone()  # row = (check_in, check_out) or None

    # 출근 안 했으면 퇴근 불가
    if not row:
        return {"message": "출근 기록이 없어 퇴근할 수 없습니다."}, 400

    check_in = row[0] if isinstance(row, (tuple, list)) else row.get("check_in")
    check_out = row[1] if isinstance(row, (tuple, list)) else row.get("check_out")

    if check_in is None:
        return {"message": "출근 기록이 없어 퇴근할 수 없습니다."}, 400

    if check_out is not None:
        return {"message": "이미 퇴근 처리되었습니다."}, 40

    # 퇴근 처리 + 상태는 일단 출근 유지(원하면 '조퇴' 판정도 가능)
    cur.execute(
        """
        UPDATE attendance
        SET check_out=%s,
            status='출근'
        WHERE user_id=%s AND work_date=%s
        """,
        (now_t, user_id, today),
    )

    conn.commit()
    return {"message": "퇴근 처리 완료", "check_out": now_t, "status": "출근"}

@app.get("/api/admin/attendance/status-list")
def admin_attendance_status_list():
    q_date = request.args.get("date")
    dept = request.args.get("dept", "전체")
    page = int(request.args.get("page", "1"))
    page_size = int(request.args.get("pageSize", "5"))
    offset = (page - 1) * page_size

    if not q_date:
        q_date = date.today().isoformat()

    conn = get_conn()
    cur = conn.cursor()  # 현재 네 환경에서는 dict로 나옴 (OK)

    # users dept 컬럼 있는지 확인
    cur.execute("SHOW COLUMNS FROM users")
    col_rows = cur.fetchall()

    cols = []
    for r in col_rows:
        if isinstance(r, dict):
            cols.append(r.get("Field"))
        else:
            cols.append(r[0])

    has_dept = "dept" in cols

    dept_where = ""
    dept_params = []
    if has_dept and dept != "전체":
        dept_where = "WHERE u.dept=%s"
        dept_params.append(dept)

    # total
    cur.execute(f"SELECT COUNT(*) AS cnt FROM users u {dept_where}", dept_params)
    one = cur.fetchone()
    total = one["cnt"] if isinstance(one, dict) else one[0]

    # list query
    if has_dept:
        sql = f"""
          SELECT
            u.id AS id,
            u.name AS name,
            u.dept AS dept,
            COALESCE(a.status, '미출근') AS status,
            a.check_in AS check_in,
            a.check_out AS check_out
          FROM users u
          LEFT JOIN attendance a
            ON a.user_id = u.id AND a.work_date = %s
          {dept_where}
          ORDER BY u.id ASC
          LIMIT %s OFFSET %s
        """
    else:
        sql = f"""
          SELECT
            u.id AS id,
            u.name AS name,
            '미지정' AS dept,
            COALESCE(a.status, '미출근') AS status,
            a.check_in AS check_in,
            a.check_out AS check_out
          FROM users u
          LEFT JOIN attendance a
            ON a.user_id = u.id AND a.work_date = %s
          ORDER BY u.id ASC
          LIMIT %s OFFSET %s
        """

    cur.execute(sql, [q_date] + dept_params + [page_size, offset])
    rows = cur.fetchall()

    cur.close()
    conn.close()

    items = []
    for r in rows:
        # dict이든 tuple이든 대응
        if isinstance(r, dict):
            uid = r.get("id")
            name = r.get("name")
            deptv = r.get("dept")
            status = r.get("status")
            cin = r.get("check_in")
            cout = r.get("check_out")
        else:
            uid, name, deptv, status, cin, cout = r

        items.append({
            "id": uid,
            "name": name,
            "dept": deptv,
            "status": status,
            "inTime": str(cin)[:5] if cin else "-",
            "outTime": str(cout)[:5] if cout else "-",
        })

    return {"date": q_date, "total": total, "page": page, "pageSize": page_size, "items": items}

@app.get("/api/admin/dashboard/summary")
def admin_dashboard_summary():
    rng = request.args.get("range", "today")

    from datetime import date, timedelta
    today = date.today()

    if rng == "today":
        start = today
        end = today
    elif rng == "week":
        start = today - timedelta(days=6)
        end = today
    else:  # month
        start = today.replace(day=1)
        end = today

    conn = get_conn()
    cur = conn.cursor()

    # 상태별(기간 전체 합산이 아니라 “오늘/각 날짜별 인원” 기준으로 보고 싶으면 일별 데이터도 같이 줘야 함)
    # 1) 일별 집계
    cur.execute("""
      SELECT work_date, status, COUNT(*) as cnt
      FROM attendance
      WHERE work_date BETWEEN %s AND %s
      GROUP BY work_date, status
      ORDER BY work_date ASC
    """, (start.isoformat(), end.isoformat()))
    rows = cur.fetchall()

    # 2) 전체 직원 수 (미출근 계산에 필요)
    cur.execute("SELECT COUNT(*) FROM users")
    total_users = cur.fetchone()[0]

    cur.close(); conn.close()

    statuses = ["출근","지각","조퇴","결석","미출근","휴가"]

    # 일별 map
    daily = {}
    for d, s, cnt in rows:
        d = str(d)
        if d not in daily:
            daily[d] = {k: 0 for k in statuses}
        daily[d][s] = cnt

    # 날짜별로 “미출근” 보정: total_users - (해당 날짜에 attendance 존재하는 사람 수 중 미출근 제외? )
    # 여기서는 단순히 attendance row 없는 사람까지 미출근으로 포함하려면:
    # 해당 날짜에 기록된 총 row 수를 구해 (출근/지각/조퇴/결석/휴가/미출근 포함) => 미출근을 total_users - (출근/지각/조퇴/결석/휴가) 로 재계산
    # (미출근 row를 굳이 만들지 않아도 됨)
    for d in daily.keys():
        present_like = daily[d]["출근"] + daily[d]["지각"] + daily[d]["조퇴"] + daily[d]["결석"] + daily[d]["휴가"]
        daily[d]["미출근"] = max(0, total_users - present_like)

    # range summary: 오늘/주간/월간은 “마지막 날짜(end)” 기준으로 파이 차트 보여주기 좋음
    end_key = end.isoformat()
    summary = daily.get(end_key, {k: 0 for k in statuses})
    # end 날짜에 attendance row가 하나도 없으면 미출근=total_users로
    if sum(summary.values()) == 0:
        summary["미출근"] = total_users

    # daily array
    daily_arr = []
    # start~end 모든 날짜 채우기
    curd = start
    while curd <= end:
        dk = curd.isoformat()
        v = daily.get(dk, {k: 0 for k in statuses})
        if sum(v.values()) == 0:
            v["미출근"] = total_users
        daily_arr.append({"date": dk, **v})
        curd = curd + timedelta(days=1)

    return {"range": rng, "summary": summary, "daily": daily_arr}


@app.post("/api/admin/attendance/update-status")
def admin_update_attendance_status_v2():
    body = request.get_json(silent=True) or {}
    user_id = body.get("user_id")
    work_date = body.get("work_date")  # "YYYY-MM-DD"
    status = (body.get("status") or "")
    print("RAW STATUS:", repr(status))
    status = status.strip()
    print("STRIPPED STATUS:", repr(status))

    if not user_id or not work_date or not status:
        return {"message": "user_id, work_date, status가 필요합니다."}, 400

    # ✅ attendance row 없으면 생성, 있으면 상태만 업데이트
    conn = get_conn()
    cur = conn.cursor()

    ALLOWED = {"출근","지각","조퇴","결석","미출근","휴가"}
    if status not in ALLOWED:
        return {"message": f"잘못된 status: {status}"}, 400

    cur.execute(
        """
        INSERT INTO attendance (user_id, work_date, status)
        VALUES (%s, %s, %s)
        ON DUPLICATE KEY UPDATE
        status = VALUES(status),
        updated_at = CURRENT_TIMESTAMP
        """,
        (user_id, work_date, status),
    )

    conn.commit()
    cur.close()
    conn.close()

    return {"ok": True, "user_id": user_id, "work_date": work_date, "status": status}

#들여쓰기 없음

app.register_blueprint(attendance_bp)
app.register_blueprint(requests_bp)
app.register_blueprint(admin_bp)

if __name__ == "__main__":
    port = int(os.getenv("FLASK_PORT", "4000"))
    app.run(host="0.0.0.0", port=port, debug=True)