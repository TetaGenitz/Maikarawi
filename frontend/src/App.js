import React from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

import AdminLogin from "@/pages/AdminLogin";
import EmployeeLogin from "@/pages/EmployeeLogin";

import AdminLayout from "@/layouts/AdminLayout";
import EmployeeLayout from "@/layouts/EmployeeLayout";

import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminAttendancePage from "@/pages/admin/AdminAttendancePage";
import EmployeesPage from "@/pages/admin/EmployeesPage";
import DepartmentsPage from "@/pages/admin/DepartmentsPage";
import LocationsPage from "@/pages/admin/LocationsPage";
import HolidaysPage from "@/pages/admin/HolidaysPage";
import LeavesAdminPage from "@/pages/admin/LeavesAdminPage";
import SettingsPage from "@/pages/admin/SettingsPage";
import ReportPage from "@/pages/admin/ReportPage";
import AdminWorkPlansPage from "@/pages/admin/AdminWorkPlansPage";

import EmployeeDashboard from "@/pages/employee/EmployeeDashboard";
import MyAttendance from "@/pages/employee/MyAttendance";
import WorkPlanPage from "@/pages/employee/WorkPlanPage";
import MyLeaves from "@/pages/employee/MyLeaves";
import ProfilePage from "@/pages/employee/ProfilePage";

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <Toaster richColors position="top-center" />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<EmployeeLogin />} />
            <Route path="/admin/login" element={<AdminLogin />} />

            <Route element={<ProtectedRoute role="admin"><AdminLayout /></ProtectedRoute>}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/attendance" element={<AdminAttendancePage />} />
              <Route path="/admin/weekly" element={<ReportPage mode="weekly" />} />
              <Route path="/admin/monthly" element={<ReportPage mode="monthly" />} />
              <Route path="/admin/employees" element={<EmployeesPage />} />
              <Route path="/admin/departments" element={<DepartmentsPage />} />
              <Route path="/admin/locations" element={<LocationsPage />} />
              <Route path="/admin/holidays" element={<HolidaysPage />} />
              <Route path="/admin/leaves" element={<LeavesAdminPage />} />
              <Route path="/admin/workplans" element={<AdminWorkPlansPage />} />
              <Route path="/admin/settings" element={<SettingsPage />} />
            </Route>

            <Route element={<ProtectedRoute role="employee"><EmployeeLayout /></ProtectedRoute>}>
              <Route path="/app" element={<EmployeeDashboard />} />
              <Route path="/app/attendance" element={<MyAttendance />} />
              <Route path="/app/workplan" element={<WorkPlanPage />} />
              <Route path="/app/leaves" element={<MyLeaves />} />
              <Route path="/app/profile" element={<ProfilePage />} />
            </Route>

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </div>
    </AuthProvider>
  );
}

export default App;
