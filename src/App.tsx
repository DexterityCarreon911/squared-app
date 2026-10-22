import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider, useAuth } from "@/contexts/AuthContext"
import StudentLayout from "@/layouts/StudentLayout"
import AdminLayout from "@/layouts/AdminLayout"

// Pages
import Landing from "@/pages/Landing"
import Login from "@/pages/Login"
import Register from "@/pages/Register"
import ForgotPassword from "@/pages/ForgotPassword"
import NotFound from "@/pages/NotFound"

// Student Pages
import StudentHome from "@/pages/student/Home"
import Attendance from "@/pages/student/Attendance"
import ConfessionsWall from "@/pages/student/Confessions"
import Voting from "@/pages/student/Voting"
import Payments from "@/pages/student/Payments"
import QRQuest from "@/pages/student/QRQuest"
import QRCard from "@/pages/student/QRCard"
import AttendanceRecord from "@/pages/student/AttendanceRecord"
import Notifications from "@/pages/student/Notifications"
import ScanForm from "@/pages/student/ScanForm"
import GenerateQR from "@/pages/student/GenerateQR"
import Purchases from "@/pages/student/Purchases"
import StudentNstpEvaluation from "@/pages/instructor/StudentEvaluation"
import StudentNstpCertificate from "@/pages/instructor/StudentCertificate"

// Admin Pages
import AdminDashboard from "@/pages/admin/Dashboard"
import AdminStudents from "@/pages/admin/Students"
import AdminEvents from "@/pages/admin/Events"
import AdminAnnouncements from "@/pages/admin/Announcements"
import AdminConfessions from "@/pages/admin/Confessions"
import AdminScanner from "@/pages/admin/Scanner"
import AdminPayments from "@/pages/admin/Payments"
import AdminSupport from "@/pages/admin/Support"
import AdminLogin from "@/pages/admin/Login"
import AdminSlider from "@/pages/admin/Slider"
import AdminVotingManagement from "@/pages/admin/VotingManagement"
import AdminEvaluations from "@/pages/admin/Evaluations"
import AdminQRQuestManagement from "@/pages/admin/QRQuestManagement"
import AdminSettings from "@/pages/admin/Settings"
import AdminPos from "@/pages/admin/Pos"
import AdminAuroraPayments from "@/pages/admin/AuroraPayments"
import AdminAuroraCheckin from "@/pages/admin/AuroraCheckin"
import PrefectRoutes from "@/pages/prefect/PrefectRoutes"
import InstructorLogin from "@/pages/instructor/Login"
import InstructorDashboard from "@/pages/instructor/Dashboard"
import InstructorSubjects from "@/pages/instructor/Subjects"
import InstructorScanner from "@/pages/instructor/Scanner"
import InstructorRecords from "@/pages/instructor/Records"
import InstructorScanners from "@/pages/instructor/Scanners"
import LoadingState from "@/components/LoadingState"
import ErrorState from "@/components/ErrorState"

function ProtectedStudent({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, authLoading, authError, refreshAuth } = useAuth()
  if (authLoading) return <LoadingState message="Checking your session..." />
  if (authError) return <ErrorState message={authError} onRetry={() => void refreshAuth()} />
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}

function ProtectedAdmin({ children }: { children: React.ReactNode }) {
  const { isAdmin, authLoading, authError, refreshAuth } = useAuth()
  if (authLoading) return <LoadingState message="Checking your session..." />
  if (authError) return <ErrorState message={authError} onRetry={() => void refreshAuth()} />
  if (!isAdmin) return <Navigate to="/admin" replace />
  return <>{children}</>
}

function AdminLoginRoute() {
  const { isAdmin } = useAuth()
  if (isAdmin) return <Navigate to="/admin/dashboard" replace />
  return <AdminLogin />
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/prefect/*" element={<PrefectRoutes />} />
      <Route path="/instructor/login" element={<InstructorLogin />} />
      <Route path="/instructor" element={<InstructorDashboard />} />
      <Route path="/instructor/subjects" element={<InstructorSubjects />} />
      <Route path="/instructor/scan" element={<InstructorScanner />} />
      <Route path="/instructor/attendance" element={<InstructorRecords mode="history" />} />
      <Route path="/instructor/scanners" element={<InstructorScanners />} />
      <Route path="/instructor/reports" element={<InstructorRecords mode="reports" />} />
      <Route path="/instructor/evaluations" element={<InstructorRecords mode="evaluations" />} />
      <Route path="/instructor/certificates" element={<InstructorRecords mode="certificates" />} />
      <Route path="/nstp/evaluation" element={<StudentNstpEvaluation />} />
      <Route path="/nstp/certificate" element={<StudentNstpCertificate />} />

      {/* Admin Login */}
      <Route path="/admin" element={<AdminLoginRoute />} />

      {/* Student Routes (wrapped in StudentLayout) */}
      <Route
        path="/home"
        element={
          <ProtectedStudent>
            <StudentLayout />
          </ProtectedStudent>
        }
      >
        <Route index element={<StudentHome />} />
      </Route>
      <Route
        path="/attendance"
        element={
          <ProtectedStudent>
            <StudentLayout />
          </ProtectedStudent>
        }
      >
        <Route index element={<Attendance />} />
      </Route>
      <Route
        path="/qr-card"
        element={
          <ProtectedStudent>
            <StudentLayout />
          </ProtectedStudent>
        }
      >
        <Route index element={<QRCard />} />
      </Route>
      <Route
        path="/attendance-record"
        element={
          <ProtectedStudent>
            <StudentLayout />
          </ProtectedStudent>
        }
      >
        <Route index element={<AttendanceRecord />} />
      </Route>
      <Route
        path="/notifications"
        element={
          <ProtectedStudent>
            <StudentLayout />
          </ProtectedStudent>
        }
      >
        <Route index element={<Notifications />} />
      </Route>
      <Route
        path="/scan-form"
        element={
          <ProtectedStudent>
            <StudentLayout />
          </ProtectedStudent>
        }
      >
        <Route index element={<ScanForm />} />
      </Route>
      <Route
        path="/generate-qr"
        element={
          <ProtectedStudent>
            <StudentLayout />
          </ProtectedStudent>
        }
      >
        <Route index element={<GenerateQR />} />
      </Route>
      <Route
        path="/confessions"
        element={
          <ProtectedStudent>
            <StudentLayout />
          </ProtectedStudent>
        }
      >
        <Route index element={<ConfessionsWall />} />
      </Route>
      <Route
        path="/voting"
        element={
          <ProtectedStudent>
            <StudentLayout />
          </ProtectedStudent>
        }
      >
        <Route index element={<Voting />} />
      </Route>
      <Route
        path="/qr-quest"
        element={
          <ProtectedStudent>
            <StudentLayout />
          </ProtectedStudent>
        }
      >
        <Route index element={<QRQuest />} />
      </Route>
      <Route
        path="/payments"
        element={
          <ProtectedStudent>
            <StudentLayout />
          </ProtectedStudent>
        }
      >
        <Route index element={<Payments />} />
      </Route>
      <Route
        path="/student/purchases"
        element={
          <ProtectedStudent>
            <StudentLayout />
          </ProtectedStudent>
        }
      >
        <Route index element={<Purchases />} />
      </Route>

      {/* Admin Routes (wrapped in AdminLayout) */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedAdmin>
            <AdminLayout />
          </ProtectedAdmin>
        }
      >
        <Route index element={<AdminDashboard />} />
      </Route>
      <Route
        path="/admin/students"
        element={
          <ProtectedAdmin>
            <AdminLayout />
          </ProtectedAdmin>
        }
      >
        <Route index element={<AdminStudents />} />
      </Route>
      <Route
        path="/admin/events"
        element={
          <ProtectedAdmin>
            <AdminLayout />
          </ProtectedAdmin>
        }
      >
        <Route index element={<AdminEvents />} />
      </Route>
      <Route
        path="/admin/announcements"
        element={
          <ProtectedAdmin>
            <AdminLayout />
          </ProtectedAdmin>
        }
      >
        <Route index element={<AdminAnnouncements />} />
      </Route>
      <Route
        path="/admin/confessions"
        element={
          <ProtectedAdmin>
            <AdminLayout />
          </ProtectedAdmin>
        }
      >
        <Route index element={<AdminConfessions />} />
      </Route>
      <Route
        path="/admin/scanner"
        element={
          <ProtectedAdmin>
            <AdminLayout />
          </ProtectedAdmin>
        }
      >
        <Route index element={<AdminScanner />} />
      </Route>
      <Route
        path="/admin/qr-scanner"
        element={
          <ProtectedAdmin>
            <AdminLayout />
          </ProtectedAdmin>
        }
      >
        <Route index element={<AdminScanner />} />
      </Route>
      <Route
        path="/admin/payments"
        element={
          <ProtectedAdmin>
            <AdminLayout />
          </ProtectedAdmin>
        }
      >
        <Route index element={<AdminPayments />} />
      </Route>
      <Route
        path="/admin/support"
        element={
          <ProtectedAdmin>
            <AdminLayout />
          </ProtectedAdmin>
        }
      >
        <Route index element={<AdminSupport />} />
      </Route>

      {/* New Admin Routes */}
      <Route
        path="/admin/slider"
        element={
          <ProtectedAdmin>
            <AdminLayout />
          </ProtectedAdmin>
        }
      >
        <Route index element={<AdminSlider />} />
      </Route>
      <Route
        path="/admin/voting"
        element={
          <ProtectedAdmin>
            <AdminLayout />
          </ProtectedAdmin>
        }
      >
        <Route index element={<AdminVotingManagement />} />
      </Route>
      <Route
        path="/admin/evaluations"
        element={
          <ProtectedAdmin>
            <AdminLayout />
          </ProtectedAdmin>
        }
      >
        <Route index element={<AdminEvaluations />} />
      </Route>
      <Route
        path="/admin/qr-quest"
        element={
          <ProtectedAdmin>
            <AdminLayout />
          </ProtectedAdmin>
        }
      >
        <Route index element={<AdminQRQuestManagement />} />
      </Route>
      <Route
        path="/admin/settings"
        element={
          <ProtectedAdmin>
            <AdminLayout />
          </ProtectedAdmin>
        }
      >
        <Route index element={<AdminSettings />} />
      </Route>
      <Route
        path="/admin/pos"
        element={
          <ProtectedAdmin>
            <AdminLayout />
          </ProtectedAdmin>
        }
      >
        <Route index element={<AdminPos />} />
      </Route>
      <Route
        path="/admin/aurora-payments"
        element={
          <ProtectedAdmin>
            <AdminLayout />
          </ProtectedAdmin>
        }
      >
        <Route index element={<AdminAuroraPayments />} />
      </Route>
      <Route
        path="/admin/aurora-checkin"
        element={
          <ProtectedAdmin>
            <AdminLayout />
          </ProtectedAdmin>
        }
      >
        <Route index element={<AdminAuroraCheckin />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
