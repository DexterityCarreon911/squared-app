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

function ProtectedStudent({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}

function ProtectedAdmin({ children }: { children: React.ReactNode }) {
  const { isAdmin } = useAuth()
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
        path="/qr-quest"
        element={
          <ProtectedStudent>
            <StudentLayout />
          </ProtectedStudent>
        }
      >
        <Route index element={<QRQuest />} />
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
