from datetime import date
from db import get_conn

def get_today_attendance(user_id: int):
    conn = get_conn()
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT id, user_id, work_date, check_in, check_out, status
                FROM attendance
                WHERE user_id=%s AND work_date=CURDATE()
                """,
                (user_id,),
            )
            row = cur.fetchone()
        return row
    finally:
        conn.close()

def check_in(user_id: int):
    conn = get_conn()
    try:
        with conn.cursor() as cur:
            # 오늘 레코드가 없으면 생성, 있으면 check_in만 채움
            cur.execute(
                """
                INSERT INTO attendance (user_id, work_date, check_in)
                VALUES (%s, CURDATE(), NOW())
                ON DUPLICATE KEY UPDATE check_in = IFNULL(check_in, NOW())
                """,
                (user_id,),
            )
        return get_today_attendance(user_id)
    finally:
        conn.close()

def check_out(user_id: int):
    conn = get_conn()
    try:
        with conn.cursor() as cur:
            # 출근 기록이 있어야 퇴근 가능하게 하고 싶으면 여기서 체크 가능
            cur.execute(
                """
                UPDATE attendance
                SET check_out = IFNULL(check_out, NOW())
                WHERE user_id=%s AND work_date=CURDATE()
                """,
                (user_id,),
            )
        return get_today_attendance(user_id)
    finally:
        conn.close()
