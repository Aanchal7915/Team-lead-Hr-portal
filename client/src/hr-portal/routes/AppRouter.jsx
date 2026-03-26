

// src/routes/AppRouter.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from '../pages/HomePage.jsx';
import LoginPage from '../pages/LoginPage.jsx';
import RegisterPage from '../pages/RegisterPage.jsx';
import ForgotPasswordPage from '../pages/ForgotPasswordPage.jsx';
import EmployeeDashboard from '../pages/EmployeeDashboard.jsx';
import EmployeeProfile from '../pages/EmployeeProfile.jsx';
import HRDashboard from '../pages/HRDashboard.jsx';
import HREmployeeView from '../pages/HREmployeeView.jsx';
import NotFoundPage from '../pages/NotFoundPage.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';
import RegisterHRPage from "../pages/registerHRPage.jsx";
import EODReportsPage from "../pages/EODReportsPage.jsx";
import ManageEmployeesPage from '../pages/ManageEmployeesPage.jsx';
import SalaryCalculatorPage from '../pages/SalaryCalculatorPage.jsx';
import EmployeeAnnouncements from '../pages/EmployeeAnnouncements.jsx';
import AnnouncementsPage from '../pages/AnnouncmentsPage.jsx';
import AnalyticsDashboard from '../pages/AnalyticsDashbaord.jsx';
import GetDataPage from '../pages/GetDataPage.jsx';
import ApplyForLeavePage from '../pages/ApplyForLeavePage.jsx';
import ApproveLeavePage from '../pages/ApproveLeavePage.jsx';
import MainLayout from "../components/MainLayout.jsx";
import RankingsPage from '../pages/RankingsPage.jsx';
import PenaltiesPage from '../pages/PenaltiesPage.jsx';
import PrivacyPolicyPage from '../pages/PrivacyPolicyPage.jsx';
import SalarySlipManagement from '../pages/SalarySlipManagement.jsx';
import EmployeeSalarySlips from '../pages/EmployeeSalarySlips.jsx';

const AppRouter = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<MainLayout><HomePage /></MainLayout>} />
      <Route path="/login" element={<MainLayout><LoginPage /></MainLayout>} />
      <Route path="/register" element={<MainLayout><RegisterPage /></MainLayout>} />
      <Route path="/register-hr" element={<RegisterHRPage />} />
      <Route path="/forgot-password" element={<MainLayout><ForgotPasswordPage /></MainLayout>} />
      <Route path="/privacy-policy" element={<MainLayout><PrivacyPolicyPage /></MainLayout>} />

      {/* Employee Protected Routes */}
      <Route
        path="/employee/dashboard"
        element={<ProtectedRoute roles={['employee']}><MainLayout><EmployeeDashboard /></MainLayout></ProtectedRoute>}
      />
      <Route
        path="/employee/profile"
        element={<ProtectedRoute roles={['employee']}><MainLayout><EmployeeProfile /></MainLayout></ProtectedRoute>}
      />
      <Route
        path="/employee/announcements"
        element={<ProtectedRoute roles={['employee']}><MainLayout><EmployeeAnnouncements /></MainLayout></ProtectedRoute>}
      />
      <Route
        path="/employee/apply-leave"
        element={<ProtectedRoute roles={['employee']}><MainLayout><ApplyForLeavePage /></MainLayout></ProtectedRoute>}
      />
      <Route
        path="/employee/rankings"
        element={<ProtectedRoute roles={['employee']}><MainLayout><RankingsPage /></MainLayout></ProtectedRoute>}
      />
      <Route
        path="/employee/salary-slips"
        element={<ProtectedRoute roles={['employee']}><MainLayout><EmployeeSalarySlips /></MainLayout></ProtectedRoute>}
      />

      {/* HR Protected Routes */}


      <Route
        path="/hr/dashboard"
        element={<ProtectedRoute roles={['hr']}><MainLayout><HRDashboard /></MainLayout></ProtectedRoute>}
      />
      <Route
        path="/hr/employee/:id"
        element={<ProtectedRoute roles={['hr']}><HREmployeeView /></ProtectedRoute>}
      />
      <Route
        path="/hr/eod-reports"
        element={<ProtectedRoute roles={['hr']}><EODReportsPage /></ProtectedRoute>}
      />
      <Route
        path="/hr/manage-employees"
        element={<ProtectedRoute roles={['hr']}><ManageEmployeesPage /></ProtectedRoute>}
      />
      <Route
        path="/hr/salary-calculator"
        element={<ProtectedRoute roles={['hr']}><SalaryCalculatorPage /></ProtectedRoute>}
      />
      <Route
        path="/hr/announcements"
        element={<ProtectedRoute roles={['hr']}><AnnouncementsPage /></ProtectedRoute>}
      />
      <Route
        path="/hr/analytics"
        element={<ProtectedRoute roles={['hr']}><AnalyticsDashboard /></ProtectedRoute>}
      />
      {/* --- NEW HR RANKINGS ROUTE --- */}
      <Route
        path="/hr/rankings"
        element={<ProtectedRoute roles={['hr']}><MainLayout><RankingsPage /></MainLayout></ProtectedRoute>}
      />
      <Route
        path="/hr/getdata"
        element={<ProtectedRoute roles={['hr']}><GetDataPage /></ProtectedRoute>}
      />
      <Route
        path="/hr/approve-leave"
        element={<ProtectedRoute roles={['hr']}><ApproveLeavePage /></ProtectedRoute>}
      />
      <Route
        path="/hr/penalties"
        element={
          <ProtectedRoute roles={['hr']}>
            <MainLayout>
              <PenaltiesPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/hr/salary-slips"
        element={
          <ProtectedRoute roles={['hr']}>
            <MainLayout>
              <SalarySlipManagement />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      {/* Catch-all Not Found Route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRouter;
