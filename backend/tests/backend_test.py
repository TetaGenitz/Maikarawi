"""
Backend test suite for SiKerja Attendance Management System.
Covers: auth (admin/employee), employees CRUD, departments, locations, holidays,
attendance check-in/out (WFO geofence, WFH, duplicates), work plans, leaves,
reports (weekly/monthly), settings, excel/pdf exports, and password change.
"""
import os
import uuid
import pytest
import requests
from datetime import date, timedelta

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL")
if not BASE_URL:
    # fallback to frontend/.env
    with open("/app/frontend/.env") as f:
        for line in f:
            if line.startswith("REACT_APP_BACKEND_URL="):
                BASE_URL = line.split("=", 1)[1].strip()
                break
BASE_URL = BASE_URL.rstrip("/")
API = f"{BASE_URL}/api"

ADMIN = {"email": "admin@gov.id", "password": "admin123"}
EMP_BUDI = {"email": "budi@gov.id", "password": "employee123"}

# Office coords from seed
OFFICE_LAT = -6.175392
OFFICE_LON = 106.827153


# ---------- Session/Fixtures ----------
@pytest.fixture(scope="session")
def admin_token():
    r = requests.post(f"{API}/auth/admin/login", json=ADMIN, timeout=15)
    assert r.status_code == 200, f"admin login failed: {r.status_code} {r.text}"
    return r.json()["token"]


@pytest.fixture(scope="session")
def admin_client(admin_token):
    s = requests.Session()
    s.headers.update({"Authorization": f"Bearer {admin_token}"})
    return s


@pytest.fixture(scope="session")
def employee_token():
    r = requests.post(f"{API}/auth/employee/login", json=EMP_BUDI, timeout=15)
    assert r.status_code == 200, f"employee login failed: {r.status_code} {r.text}"
    return r.json()["token"]


@pytest.fixture(scope="session")
def employee_client(employee_token):
    s = requests.Session()
    s.headers.update({"Authorization": f"Bearer {employee_token}"})
    return s


@pytest.fixture(scope="session")
def fresh_employee(admin_client):
    """Create a brand-new employee for attendance tests (no prior attendance today)."""
    unique = uuid.uuid4().hex[:8]
    payload = {
        "employee_id": f"TEST_{unique}",
        "full_name": f"TEST Employee {unique}",
        "email": f"test_{unique}@gov.id",
        "position": "Tester",
        "password": "employee123",
    }
    r = admin_client.post(f"{API}/employees", json=payload, timeout=15)
    assert r.status_code == 200, r.text
    emp = r.json()

    # login as this employee
    lr = requests.post(f"{API}/auth/employee/login",
                       json={"email": payload["email"], "password": "employee123"}, timeout=15)
    assert lr.status_code == 200, lr.text
    token = lr.json()["token"]
    sess = requests.Session()
    sess.headers.update({"Authorization": f"Bearer {token}"})
    return {"employee": emp, "session": sess, "email": payload["email"]}


# ---------- Auth ----------
class TestAuth:
    def test_admin_login_ok(self, admin_token):
        assert isinstance(admin_token, str) and len(admin_token) > 20

    def test_employee_login_ok(self, employee_token):
        assert isinstance(employee_token, str) and len(employee_token) > 20

    def test_admin_login_bad_password(self):
        r = requests.post(f"{API}/auth/admin/login",
                          json={"email": "admin@gov.id", "password": "wrong"}, timeout=15)
        assert r.status_code == 401

    def test_me_unauthenticated(self):
        r = requests.get(f"{API}/auth/me", timeout=15)
        assert r.status_code == 401

    def test_me_admin(self, admin_client):
        r = admin_client.get(f"{API}/auth/me", timeout=15)
        assert r.status_code == 200
        assert r.json()["role"] == "admin"

    def test_me_employee(self, employee_client):
        r = employee_client.get(f"{API}/auth/me", timeout=15)
        assert r.status_code == 200
        j = r.json()
        assert j["role"] == "employee"
        assert j.get("employee") is not None

    def test_cross_role_admin_endpoint_blocked(self, employee_client):
        r = employee_client.get(f"{API}/dashboard/stats", timeout=15)
        assert r.status_code == 403


# ---------- Dashboard ----------
class TestDashboard:
    def test_stats_shape(self, admin_client):
        r = admin_client.get(f"{API}/dashboard/stats", timeout=15)
        assert r.status_code == 200
        j = r.json()
        for k in ["total_employees", "present_today", "wfo_today", "wfh_today",
                  "leave_today", "absent_today", "trend", "department_stats"]:
            assert k in j
        assert isinstance(j["trend"], list) and len(j["trend"]) == 7
        assert isinstance(j["department_stats"], list)


# ---------- Departments / Locations / Holidays / Employees CRUD ----------
class TestCRUD:
    def test_departments_list(self, admin_client):
        r = admin_client.get(f"{API}/departments", timeout=15)
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_department_create_update_delete(self, admin_client):
        r = admin_client.post(f"{API}/departments",
                              json={"name": "TEST_Dept", "description": "test"}, timeout=15)
        assert r.status_code == 200
        did = r.json()["id"]
        r = admin_client.put(f"{API}/departments/{did}",
                             json={"name": "TEST_Dept2", "description": "u"}, timeout=15)
        assert r.status_code == 200 and r.json()["name"] == "TEST_Dept2"
        r = admin_client.delete(f"{API}/departments/{did}", timeout=15)
        assert r.status_code == 200

    def test_locations_crud(self, admin_client):
        r = admin_client.post(f"{API}/locations",
                              json={"name": "TEST_Loc", "latitude": 1.0, "longitude": 2.0,
                                    "allowed_radius": 50, "status": "inactive"}, timeout=15)
        assert r.status_code == 200
        lid = r.json()["id"]
        r = admin_client.delete(f"{API}/locations/{lid}", timeout=15)
        assert r.status_code == 200

    def test_holidays_create_and_list(self, admin_client):
        far = (date.today() + timedelta(days=365)).isoformat()
        r = admin_client.post(f"{API}/holidays",
                              json={"holiday_date": far, "name": "TEST_Holiday"}, timeout=15)
        assert r.status_code == 200
        hid = r.json()["id"]
        r = admin_client.get(f"{API}/holidays", timeout=15)
        assert r.status_code == 200 and any(h["id"] == hid for h in r.json())
        admin_client.delete(f"{API}/holidays/{hid}", timeout=15)

    def test_employee_create_list_update_login(self, admin_client):
        unique = uuid.uuid4().hex[:8]
        email = f"crud_{unique}@gov.id"
        r = admin_client.post(f"{API}/employees", json={
            "employee_id": f"CRUD_{unique}", "full_name": "CRUD User",
            "email": email, "password": "employee123",
        }, timeout=15)
        assert r.status_code == 200, r.text
        emp = r.json()
        # list
        r = admin_client.get(f"{API}/employees", timeout=15)
        assert r.status_code == 200 and any(e["id"] == emp["id"] for e in r.json())
        # update
        r = admin_client.put(f"{API}/employees/{emp['id']}",
                             json={"full_name": "CRUD Updated"}, timeout=15)
        assert r.status_code == 200 and r.json()["full_name"] == "CRUD Updated"
        # login
        lr = requests.post(f"{API}/auth/employee/login",
                           json={"email": email, "password": "employee123"}, timeout=15)
        assert lr.status_code == 200

    def test_employee_duplicate_email(self, admin_client):
        r = admin_client.post(f"{API}/employees", json={
            "employee_id": f"DUP_{uuid.uuid4().hex[:6]}",
            "full_name": "Dup", "email": "budi@gov.id",
        }, timeout=15)
        assert r.status_code == 400


# ---------- Attendance ----------
class TestAttendance:
    def test_checkout_before_checkin_blocked(self, fresh_employee):
        s = fresh_employee["session"]
        r = s.post(f"{API}/attendance/check-out", json={
            "selfie": "data:image/png;base64,AAA",
            "activity": "x", "output": "y", "activity_status": "completed",
        }, timeout=15)
        assert r.status_code == 400
        assert "belum" in r.json().get("detail", "").lower()

    def test_wfo_outside_radius_rejected(self, fresh_employee):
        s = fresh_employee["session"]
        # Very far location
        r = s.post(f"{API}/attendance/check-in", json={
            "attendance_type": "WFO",
            "latitude": 0.0, "longitude": 0.0,
            "selfie": "data:image/png;base64,AAA",
        }, timeout=15)
        assert r.status_code == 400
        detail = r.json().get("detail", "").lower()
        assert "m dari" in detail or "radius" in detail

    def test_wfh_checkin_success(self, fresh_employee):
        s = fresh_employee["session"]
        r = s.post(f"{API}/attendance/check-in", json={
            "attendance_type": "WFH",
            "selfie": "data:image/png;base64,AAA",
        }, timeout=15)
        assert r.status_code == 200, r.text
        j = r.json()
        assert j["attendance_type"] == "WFH"
        assert j["check_in_time"]

    def test_duplicate_checkin_blocked(self, fresh_employee):
        s = fresh_employee["session"]
        r = s.post(f"{API}/attendance/check-in", json={
            "attendance_type": "WFH", "selfie": "data:image/png;base64,AAA",
        }, timeout=15)
        assert r.status_code == 400
        assert "sudah melakukan check-in" in r.json().get("detail", "").lower()

    def test_today_returns_record(self, fresh_employee):
        s = fresh_employee["session"]
        r = s.get(f"{API}/attendance/today", timeout=15)
        assert r.status_code == 200
        j = r.json()
        assert j and j["check_in_time"] and j["attendance_type"] == "WFH"

    def test_checkout_success(self, fresh_employee):
        s = fresh_employee["session"]
        r = s.post(f"{API}/attendance/check-out", json={
            "selfie": "data:image/png;base64,BBB",
            "activity": "Testing", "output": "Report", "activity_status": "completed",
        }, timeout=15)
        assert r.status_code == 200, r.text
        assert r.json()["check_out_time"]

    def test_second_checkout_blocked(self, fresh_employee):
        s = fresh_employee["session"]
        r = s.post(f"{API}/attendance/check-out", json={
            "selfie": "data:image/png;base64,BBB",
            "activity": "again", "output": "again",
        }, timeout=15)
        assert r.status_code == 400


# ---------- Holiday blocks check-in (fresh employee different from above) ----------
class TestHolidayBlock:
    def test_checkin_blocked_on_holiday(self, admin_client):
        tdy = date.today().isoformat()
        # Add today as a holiday
        hr = admin_client.post(f"{API}/holidays",
                               json={"holiday_date": tdy, "name": "TEST_TodayHoliday"}, timeout=15)
        assert hr.status_code == 200
        hid = hr.json()["id"]
        try:
            # Create fresh employee
            unique = uuid.uuid4().hex[:8]
            email = f"hol_{unique}@gov.id"
            cr = admin_client.post(f"{API}/employees", json={
                "employee_id": f"HOL_{unique}", "full_name": "Hol User",
                "email": email, "password": "employee123",
            }, timeout=15)
            assert cr.status_code == 200
            lr = requests.post(f"{API}/auth/employee/login",
                               json={"email": email, "password": "employee123"}, timeout=15)
            tok = lr.json()["token"]
            r = requests.post(f"{API}/attendance/check-in",
                              headers={"Authorization": f"Bearer {tok}"},
                              json={"attendance_type": "WFH", "selfie": "data:image/png;base64,AA"},
                              timeout=15)
            assert r.status_code == 400
            assert "libur" in r.json().get("detail", "").lower()
        finally:
            admin_client.delete(f"{API}/holidays/{hid}", timeout=15)


# ---------- Leaves ----------
class TestLeaves:
    def test_leave_flow_and_block_checkin(self, admin_client):
        # Create fresh employee
        unique = uuid.uuid4().hex[:8]
        email = f"lv_{unique}@gov.id"
        cr = admin_client.post(f"{API}/employees", json={
            "employee_id": f"LV_{unique}", "full_name": "Leave User",
            "email": email, "password": "employee123",
        }, timeout=15)
        assert cr.status_code == 200
        lr = requests.post(f"{API}/auth/employee/login",
                           json={"email": email, "password": "employee123"}, timeout=15)
        tok = lr.json()["token"]
        emp_headers = {"Authorization": f"Bearer {tok}"}

        # Create leave for today
        tdy = date.today().isoformat()
        cr = requests.post(f"{API}/leaves", headers=emp_headers, json={
            "leave_type": "sakit", "start_date": tdy, "end_date": tdy,
            "reason": "flu",
        }, timeout=15)
        assert cr.status_code == 200
        lid = cr.json()["id"]
        assert cr.json()["status"] == "pending"

        # Admin approves
        dr = admin_client.put(f"{API}/leaves/{lid}/decision",
                              json={"status": "approved"}, timeout=15)
        assert dr.status_code == 200 and dr.json()["status"] == "approved"

        # Check-in blocked
        r = requests.post(f"{API}/attendance/check-in", headers=emp_headers,
                          json={"attendance_type": "WFH", "selfie": "data:image/png;base64,AA"},
                          timeout=15)
        assert r.status_code == 400
        assert "cuti" in r.json().get("detail", "").lower()


# ---------- Work plans ----------
class TestWorkPlans:
    def test_create_and_list(self, employee_client):
        tdy = date.today().isoformat()
        r = employee_client.post(f"{API}/work-plans", json={
            "work_date": tdy,
            "items": [
                {"work_plan": "Task A", "priority": "high", "target": "done", "notes": ""},
                {"work_plan": "Task B", "priority": "normal", "target": "done", "notes": ""},
            ],
        }, timeout=15)
        assert r.status_code == 200 and r.json()["count"] == 2
        r = employee_client.get(f"{API}/work-plans?work_date={tdy}", timeout=15)
        assert r.status_code == 200
        items = r.json()
        assert len(items) == 2


# ---------- Reports & Exports ----------
class TestReportsExports:
    def test_weekly_report(self, admin_client):
        # Monday of this week
        today = date.today()
        monday = today - timedelta(days=today.weekday())
        r = admin_client.get(f"{API}/reports/weekly?week_start={monday.isoformat()}", timeout=20)
        assert r.status_code == 200
        j = r.json()
        assert "rows" in j and "summary" in j and "period" in j

    def test_monthly_report(self, admin_client):
        today = date.today()
        r = admin_client.get(f"{API}/reports/monthly?year={today.year}&month={today.month}", timeout=20)
        assert r.status_code == 200
        j = r.json()
        assert "rows" in j and "summary" in j

    def test_excel_export(self, admin_client):
        today = date.today().isoformat()
        r = admin_client.get(f"{API}/exports/excel?date_from={today}&date_to={today}", timeout=30)
        assert r.status_code == 200
        assert "spreadsheetml" in r.headers.get("content-type", "")
        assert len(r.content) > 500

    def test_pdf_export(self, admin_client):
        today = date.today().isoformat()
        r = admin_client.get(f"{API}/exports/pdf?date_from={today}&date_to={today}", timeout=30)
        assert r.status_code == 200
        assert "application/pdf" in r.headers.get("content-type", "")
        assert r.content[:4] == b"%PDF"


# ---------- Settings ----------
class TestSettings:
    def test_get_settings(self):
        r = requests.get(f"{API}/settings", timeout=15)
        assert r.status_code == 200
        j = r.json()
        assert "office_name" in j and "primary_color" in j

    def test_update_settings(self, admin_client):
        new_title = f"TEST_TITLE_{uuid.uuid4().hex[:6]}"
        new_office = f"TEST_OFFICE_{uuid.uuid4().hex[:6]}"
        r = admin_client.put(f"{API}/settings",
                             json={"ad_title": new_title, "office_name": new_office}, timeout=15)
        assert r.status_code == 200
        # verify persisted
        r = requests.get(f"{API}/settings", timeout=15)
        assert r.json()["ad_title"] == new_title
        assert r.json()["office_name"] == new_office

    def test_settings_update_requires_admin(self, employee_client):
        r = employee_client.put(f"{API}/settings", json={"ad_title": "nope"}, timeout=15)
        assert r.status_code == 403


# ---------- Change Password ----------
class TestChangePassword:
    def test_change_password_flow(self, admin_client):
        # Create fresh employee
        unique = uuid.uuid4().hex[:8]
        email = f"pw_{unique}@gov.id"
        cr = admin_client.post(f"{API}/employees", json={
            "employee_id": f"PW_{unique}", "full_name": "PW User",
            "email": email, "password": "employee123",
        }, timeout=15)
        assert cr.status_code == 200
        # login
        lr = requests.post(f"{API}/auth/employee/login",
                           json={"email": email, "password": "employee123"}, timeout=15)
        tok = lr.json()["token"]
        headers = {"Authorization": f"Bearer {tok}"}
        # wrong old
        r = requests.post(f"{API}/auth/change-password", headers=headers,
                          json={"old_password": "WRONG", "new_password": "newpass123"}, timeout=15)
        assert r.status_code == 400
        # correct
        r = requests.post(f"{API}/auth/change-password", headers=headers,
                          json={"old_password": "employee123", "new_password": "newpass123"}, timeout=15)
        assert r.status_code == 200
        # login with new
        lr = requests.post(f"{API}/auth/employee/login",
                           json={"email": email, "password": "newpass123"}, timeout=15)
        assert lr.status_code == 200
