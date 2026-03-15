import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import { SidebarProvider, useSidebar } from "./context/SidebarContext";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import StudentDashboard from "./pages/StudentDashboard";
import FacultyDashboard from "./pages/FacultyDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import StudentsManagement from "./pages/StudentsManagement";
import FacultyManagement from "./pages/FacultyManagement";
import ActivitiesManagement from "./pages/ActivitiesManagement";
import Activities from "./pages/Activities";
import Participations from "./pages/Participations";
import Students from "./pages/Students";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Reports from "./pages/Reports";
import Leaderboard from "./pages/Leaderboard";
import Announcements from "./pages/Announcements";
import DepartmentManagement from "./pages/DepartmentManagement";
import UserRoleManagement from "./pages/UserRoleManagement";
import PointsConfiguration from "./pages/PointsConfiguration";
import NotificationsCenter from "./pages/NotificationsCenter";
import AttendanceMarking from "./pages/AttendanceMarking";
import ResultUpload from "./pages/ResultUpload";
import StudentPerformance from "./pages/StudentPerformance";
import CommunicationModule from "./pages/CommunicationModule";
import ApplyActivities from "./pages/ApplyActivities";
import CertificateDownload from "./pages/CertificateDownload";
import SkillBadges from "./pages/SkillBadges";
import FeedbackSubmission from "./pages/FeedbackSubmission";

import SendNotification from "./pages/SendNotification";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./layouts/DashboardLayout";
import Sidebar from "./components/Sidebar";
import MobileHeader from "./components/MobileHeader";

import { useContext } from "react";

// Wrapper to conditionally show Sidebar
const LayoutWrapper = ({ children }) => {
  const { user } = useContext(AuthContext);
  const { collapsed, isMobile } = useSidebar();
  const location = useLocation();

  // Do not show Sidebar on login, register, or forgot password pages
  const noSidebarPaths = ["/login", "/register", "/forgot-password"];
  const showSidebar = user && !noSidebarPaths.includes(location.pathname);

  // Dynamic layout measurements based on sidebar state
  const sidebarWidth = collapsed ? 88 : 280;
  const layoutMargin = 20;

  return (
    <div style={{ display: "flex", minHeight: "100vh", position: "relative" }}>
      {showSidebar && <Sidebar />}
      {showSidebar && <MobileHeader />}
      
      {/* Main Content Area Wrapper */}
      <div style={{ 
        flex: 1,
        display: "flex",
        flexDirection: "column",
        /* Account for floating sidebar + margins */
        marginLeft: showSidebar && !isMobile ? `${sidebarWidth + (layoutMargin * 2)}px` : "0", 
        transition: "margin 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)",
        paddingTop: isMobile && showSidebar ? "80px" : `${layoutMargin}px`,
        paddingRight: isMobile ? "10px" : `${layoutMargin}px`,
        paddingBottom: `${layoutMargin}px`,
        paddingLeft: isMobile ? "10px" : (showSidebar ? "0px" : `${layoutMargin}px`),
        minHeight: "100vh",
        boxSizing: "border-box",
        width: "100%",
        maxWidth: "100%",
      }}>
        <div style={{
          background: showSidebar ? "var(--glass-bg)" : "transparent",
          backdropFilter: showSidebar ? "blur(20px)" : "none",
          WebkitBackdropFilter: showSidebar ? "blur(20px)" : "none",
          borderRadius: showSidebar ? "24px" : "0",
          border: showSidebar ? "1px solid var(--glass-border)" : "none",
          boxShadow: showSidebar ? "0 10px 40px rgba(0, 0, 0, 0.2)" : "none",
          flex: 1,
          overflowX: "hidden",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          position: "relative"
        }}>
          {children}
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <SidebarProvider>
        <Router>
          <LayoutWrapper>
            <Routes>
            {/* Default route */}
            <Route path="/" element={<Navigate to="/login" />} />

            {/* Auth Pages */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Admin Routes */}
            <Route
              path="/dashboard/admin"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <DashboardLayout>
                    <AdminDashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/admin/students"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <DashboardLayout>
                    <StudentsManagement />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/admin/faculty"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <DashboardLayout>
                    <FacultyManagement />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/admin/activities"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <DashboardLayout>
                    <ActivitiesManagement />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/admin/participations"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <DashboardLayout>
                    <Participations />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/admin/reports"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <DashboardLayout>
                    <Reports />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/admin/leaderboard"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <DashboardLayout>
                    <Leaderboard />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/admin/announcements"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <DashboardLayout>
                    <Announcements />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/admin/send-notification"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <DashboardLayout>
                    <SendNotification />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/admin/notifications"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <DashboardLayout>
                    <NotificationsCenter />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/admin/user-management"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <DashboardLayout>
                    <UserRoleManagement />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/admin/departments"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <DashboardLayout>
                    <DepartmentManagement />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/admin/points-config"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <DashboardLayout>
                    <PointsConfiguration />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/admin/profile"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <DashboardLayout>
                    <Profile />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/admin/settings"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <DashboardLayout>
                    <Settings />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            {/* Faculty Routes */}
            <Route
              path="/dashboard/faculty"
              element={
                <ProtectedRoute allowedRoles={["faculty"]}>
                  <DashboardLayout>
                    <FacultyDashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/faculty/activities"
              element={
                <ProtectedRoute allowedRoles={["faculty"]}>
                  <DashboardLayout>
                    <Activities />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/faculty/participations"
              element={
                <ProtectedRoute allowedRoles={["faculty"]}>
                  <DashboardLayout>
                    <Participations />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/faculty/reports"
              element={
                <ProtectedRoute allowedRoles={["faculty"]}>
                  <DashboardLayout>
                    <Reports />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/faculty/leaderboard"
              element={
                <ProtectedRoute allowedRoles={["faculty"]}>
                  <DashboardLayout>
                    <Leaderboard />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/faculty/announcements"
              element={
                <ProtectedRoute allowedRoles={["faculty"]}>
                  <DashboardLayout>
                    <Announcements />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/faculty/notifications"
              element={
                <ProtectedRoute allowedRoles={["faculty"]}>
                  <DashboardLayout>
                    <NotificationsCenter />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/faculty/attendance"
              element={
                <ProtectedRoute allowedRoles={["faculty"]}>
                  <DashboardLayout>
                    <AttendanceMarking />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/faculty/results"
              element={
                <ProtectedRoute allowedRoles={["faculty"]}>
                  <DashboardLayout>
                    <ResultUpload />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/faculty/performance"
              element={
                <ProtectedRoute allowedRoles={["faculty"]}>
                  <DashboardLayout>
                    <StudentPerformance />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/faculty/communication"
              element={
                <ProtectedRoute allowedRoles={["faculty"]}>
                  <DashboardLayout>
                    <CommunicationModule />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/faculty/profile"
              element={
                <ProtectedRoute allowedRoles={["faculty"]}>
                  <DashboardLayout>
                    <Profile />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/faculty/settings"
              element={
                <ProtectedRoute allowedRoles={["faculty"]}>
                  <DashboardLayout>
                    <Settings />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            {/* Student Routes */}
            <Route
              path="/dashboard/student"
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <DashboardLayout>
                    <StudentDashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/student/participations"
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <DashboardLayout>
                    <Participations />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/student/leaderboard"
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <DashboardLayout>
                    <Leaderboard />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/student/notifications"
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <DashboardLayout>
                    <NotificationsCenter />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/student/apply"
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <DashboardLayout>
                    <ApplyActivities />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/student/certificates"
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <DashboardLayout>
                    <CertificateDownload />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/student/badges"
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <DashboardLayout>
                    <SkillBadges />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/student/feedback"
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <DashboardLayout>
                    <FeedbackSubmission />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/student/profile"
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <DashboardLayout>
                    <Profile />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/student/settings"
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <DashboardLayout>
                    <Settings />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            {/* Catch-all route */}
            <Route path="*" element={<Navigate to="/login" />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </LayoutWrapper>
      </Router>
      </SidebarProvider>
    </AuthProvider>
  );
}

export default App;
