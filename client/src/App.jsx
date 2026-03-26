import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AuthProvider as HRAuthProvider } from './hr-portal/context/AuthContext.jsx';
import { ThemeProvider as HRThemeProvider } from './hr-portal/context/ThemeContext.jsx';
import { FilterProvider } from './context/FilterContext';
import ProtectedRoute from './components/ProtectedRoute';
import RoleBasedRedirect from './components/RoleBasedRedirect';
import Login from './pages/Login';
import Register from './pages/Register';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';

import AdminDashboard from './pages/AdminDashboard';
import AdminUserManagement from './pages/AdminUserManagement';
import AdminTeamManagement from './pages/AdminTeamManagement';
import TeamDetailsPage from './pages/TeamDetailsPage';
import MemberDetailsPage from './pages/MemberDetailsPage';
import AdminTaskAssignment from './pages/AdminTaskAssignment';
import AdminActivityLogs from './pages/AdminActivityLogs';
import TeamManagement from './pages/TeamManagement';
import TaskManagement from './pages/TaskManagement';
import MemberProfile from './pages/MemberProfile';
import IndividualTaskBreakdown from './pages/IndividualTaskBreakdown';
import Notifications from './pages/Notifications';
import Communication from './pages/Communication';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import LeadsPage from './pages/leads/LeadsPage';
import EODDashboard from './pages/EODDashboard';
import CalendarPage from './pages/Calendar';
import PrivacyPolicy from './pages/PrivacyPolicy';
import FileManagement from './pages/FileManagement';

// HR Modules
import AttendanceDashboard from './pages/hr/AttendanceDashboard';
import ApplyLeave from './pages/hr/ApplyLeave';
import MyRankings from './pages/hr/MyRankings';
import SalarySlips from './pages/hr/SalarySlips';
import MyProfile from './pages/hr/MyProfile';

// HR Admin Modules
import AdminOverview from './pages/hr-admin/AdminOverview';
import ManageEmployees from './pages/hr-admin/ManageEmployees';
import LeaveApprovals from './pages/hr-admin/LeaveApprovals';
import AttendanceLogs from './pages/hr-admin/AttendanceLogs';
import EodReports from './pages/hr-admin/EodReports';
import HrAnalytics from './pages/hr-admin/HrAnalytics';
import HrRankingsPage from './pages/hr-admin/HrRankingsPage';
import SalarySlipManagement from './pages/hr-admin/SalarySlipManagement';
import SalaryCalculatorPage from './pages/hr-admin/SalaryCalculatorPage';
import AdminAnnouncements from './pages/admin/AdminAnnouncements';
import AdminSalarySlips from './pages/admin/AdminSalarySlips';
import Leaderboard from './pages/hr/Leaderboard';
import EmployeeAnnouncements from './pages/hr/EmployeeAnnouncements';
import GenerateSalarySlips from './pages/hr-admin/GenerateSalarySlips';

import './index.css';

function App() {
  return (
    <AuthProvider>
      <HRAuthProvider>
        <HRThemeProvider>
          <FilterProvider>
            <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected Routes - Role-Based Dashboards */}
            <Route path="/dashboard" element={
              <ProtectedRoute requiredRole="non-admin">
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/dashboard" element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute requiredRole="admin">
                <AdminUserManagement />
              </ProtectedRoute>
            } />
            <Route path="/admin/teams" element={
              <ProtectedRoute requiredRole="admin">
                <AdminTeamManagement />
              </ProtectedRoute>
            } />
            <Route path="/admin/team/:teamId" element={
              <ProtectedRoute requiredRole="admin">
                <TeamDetailsPage />
              </ProtectedRoute>
            } />
            <Route path="/admin/member/:memberId" element={
              <ProtectedRoute requiredRole="admin">
                <MemberDetailsPage />
              </ProtectedRoute>
            } />
            <Route path="/admin/tasks" element={
              <ProtectedRoute requiredRole="admin">
                <AdminTaskAssignment />
              </ProtectedRoute>
            } />
            <Route path="/admin/activities" element={
              <ProtectedRoute requiredRole="admin">
                <AdminActivityLogs />
              </ProtectedRoute>
            } />
            <Route path="/team" element={
              <ProtectedRoute>
                <TeamManagement />
              </ProtectedRoute>
            } />
            <Route path="/team/member/:memberId" element={
              <ProtectedRoute>
                <MemberProfile />
              </ProtectedRoute>
            } />
            <Route path="/tasks" element={
              <ProtectedRoute>
                <TaskManagement />
              </ProtectedRoute>
            } />
            <Route path="/member-task-breakdown" element={
              <ProtectedRoute requiredRole="team_lead">
                <IndividualTaskBreakdown />
              </ProtectedRoute>
            } />
            <Route path="/notifications" element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            } />
            <Route path="/communication" element={
              <ProtectedRoute>
                <Communication />
              </ProtectedRoute>
            } />
            <Route path="/reports" element={
              <ProtectedRoute requiredRole="team_lead">
                <Reports />
              </ProtectedRoute>
            } />
            <Route path="/eod-reports" element={
              <ProtectedRoute requiredRole="team_lead">
                <EODDashboard />
              </ProtectedRoute>
            } />
            <Route path="/leads" element={
              <ProtectedRoute>
                <LeadsPage />
              </ProtectedRoute>
            } />
            <Route path="/calendar" element={
              <ProtectedRoute>
                <CalendarPage />
              </ProtectedRoute>
            } />
            <Route path="/admin/calendar" element={
              <ProtectedRoute requiredRole="admin">
                <CalendarPage />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } />

            <Route path="/files" element={
              <ProtectedRoute>
                <FileManagement />
              </ProtectedRoute>
            } />

            {/* HR Routes (Employees) */}
            <Route path="/hr/dashboard" element={
              <ProtectedRoute>
                <AttendanceDashboard />
              </ProtectedRoute>
            } />
            <Route path="/hr/leaves" element={
              <ProtectedRoute>
                <ApplyLeave />
              </ProtectedRoute>
            } />
            <Route path="/hr/rankings" element={
              <ProtectedRoute>
                <MyRankings />
              </ProtectedRoute>
            } />
            <Route path="/hr/salary" element={
              <ProtectedRoute>
                <SalarySlips />
              </ProtectedRoute>
            } />
            <Route path="/hr/profile" element={
              <ProtectedRoute>
                <MyProfile />
              </ProtectedRoute>
            } />

            {/* HR Employee Announcements */}
            <Route path="/hr/announcements" element={
              <ProtectedRoute>
                <EmployeeAnnouncements />
              </ProtectedRoute>
            } />

            {/* HR Admin Routes (Admins & HR Role) */}
            <Route path="/hr-admin/overview" element={
              <ProtectedRoute requiredRole="hr">
                <AdminOverview />
              </ProtectedRoute>
            } />
            <Route path="/hr-admin/employees" element={
              <ProtectedRoute requiredRole="hr">
                <ManageEmployees />
              </ProtectedRoute>
            } />
            <Route path="/hr-admin/leaves" element={
              <ProtectedRoute requiredRole="hr">
                <LeaveApprovals />
              </ProtectedRoute>
            } />
            <Route path="/hr-admin/attendance" element={
              <ProtectedRoute requiredRole="hr">
                <AttendanceLogs />
              </ProtectedRoute>
            } />
            <Route path="/hr-admin/eod" element={
              <ProtectedRoute requiredRole="hr">
                <EodReports />
              </ProtectedRoute>
            } />
            
            {/* Admin Announcements (admin role) */}
            <Route path="/admin/announcements" element={
              <ProtectedRoute requiredRole="admin">
                <AdminAnnouncements />
              </ProtectedRoute>
            } />

            {/* HR Admin Announcements (hr role) */}
            <Route path="/hr-admin/announcements" element={
              <ProtectedRoute requiredRole="hr">
                <AdminAnnouncements />
              </ProtectedRoute>
            } />

            {/* Admin Salary Slips */}
            <Route path="/admin/salary-slips" element={
              <ProtectedRoute requiredRole="admin">
                <AdminSalarySlips />
              </ProtectedRoute>
            } />

            {/* HR Analytics (HR Admin) */}
            <Route path="/hr-admin/analytics" element={
              <ProtectedRoute requiredRole="hr">
                <HrAnalytics />
              </ProtectedRoute>
            } />

            {/* HR Rankings (HR Admin) */}
            <Route path="/hr-admin/rankings" element={
              <ProtectedRoute requiredRole="hr">
                <HrRankingsPage />
              </ProtectedRoute>
            } />

            {/* HR Salary Calculator (HR Admin) */}
            <Route path="/hr-admin/salary-calculator" element={
              <ProtectedRoute requiredRole="hr">
                <SalaryCalculatorPage />
              </ProtectedRoute>
            } />

            {/* HR Salary Slips (HR Admin) */}
            <Route path="/hr-admin/salary-slips" element={
              <ProtectedRoute requiredRole="hr">
                <SalarySlipManagement />
              </ProtectedRoute>
            } />

            {/* HR Generate Salary Slips (HR Admin) */}
            <Route path="/hr-admin/generate-slips" element={
              <ProtectedRoute requiredRole="hr">
                <GenerateSalarySlips />
              </ProtectedRoute>
            } />

            {/* Rankings / Leaderboard (all authenticated) */}
            {/* <Route path="/hr/leaderboard" element={
              <ProtectedRoute>
                <Leaderboard />
              </ProtectedRoute>
            } /> */}

            {/* Default Route - Landing Page */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="*" element={
              <ProtectedRoute>
                <RoleBasedRedirect />
              </ProtectedRoute>
            } />
          </Routes>
        </Router>
      </FilterProvider>
      </HRThemeProvider>
    </HRAuthProvider>
  </AuthProvider>
  );
}

export default App;
