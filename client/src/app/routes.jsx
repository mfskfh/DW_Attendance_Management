import { Routes, Route } from "react-router-dom";

import AttendanceHistoryPage from "../pages/employee/AttendanceHistoryPage";
import RequestListPage from "../pages/employee/RequestListPage";
import RequestCreatePage from "../pages/employee/RequestCreatePage";

import AdminDashboardPage from "../pages/admin/AdminDashboardPage";
import AttendanceStatusPage from "../pages/admin/AttendanceStatusPage";
import EmployeeManagementPage from "../pages/admin/EmployeeManagementPage";
import EmployeeDashboardPage from "../pages/employee/EmployeeDashboardPage";
import EmployeeDetailAttendancePage from "../pages/admin/EmployeeDetailAttendancePage";
import ApprovalsPage from "../pages/admin/ApprovalsPage";

import EmployeeLayout from "./layouts/EmployeeLayout";
import AdminLayout from "./layouts/AdminLayout";

import LoginPage from "../pages/auth/LoginPage";
import ProtectedRoute from "./auth/ProtectedRoute";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />

      <Route
        path="/employee"
        element={
          <ProtectedRoute allowRole="employee">
            <EmployeeLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<EmployeeDashboardPage />} />
        <Route path="attendance" element={<AttendanceHistoryPage />} />
        <Route path="requests" element={<RequestListPage />} />
        <Route path="requests/new" element={<RequestCreatePage />} />
      </Route>


      <Route
        path="/admin"
        element={
          <ProtectedRoute allowRole="admin">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboardPage />} />
        <Route path="attendance" element={<AttendanceStatusPage />} />
        <Route path="approvals" element={<ApprovalsPage />} />
        <Route path="employees" element={<EmployeeManagementPage />} />
        <Route path="employees/:employeeId/attendance" element={<EmployeeDetailAttendancePage />} />
      </Route>
    </Routes>
  );
}
