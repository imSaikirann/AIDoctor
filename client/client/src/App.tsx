import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import Home from "./pages/Home";
import MyAppointments from "./pages/MyAppointments";
import ChatBot from "./pages/ChatBot";
// import Login from "./pages/Login";
// import RegisterPatient from "./pages/RegisterPatient";
// import RegisterDoctor from "./pages/RegisterDoctor";
// import PatientDashboard from "./pages/PatientDashboard";
// import DoctorDashboard from "./pages/DoctorDashboard";
// import AdminDashboard from "./pages/AdminDashboard";
import { RequireAuth } from "./auth/RequireAuth";
import { useAuth } from "./auth/useAuth";
import { Login } from "./pages/Login";
import { RegisterPatient } from "./pages/RegisterPatient";
import { RegisterDoctor } from "./pages/RegisterDoctor";
import { PatientDashboard } from "./pages/PatientDashboard";
import { DoctorDashboard } from "./pages/DoctorDashboard";
import { AdminDashboard } from "./pages/AdminDashboard";
// import { useAuth } from "./auth/AuthProvider";

function RoleRedirect() {
  const { user, loading } = useAuth();

  if (loading) return <div className="p-6">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;

  if (user.role === "PATIENT") return <Navigate to="/patient" replace />;
  if (user.role === "DOCTOR") return <Navigate to="/doctor" replace />;
  if (user.role === "ADMIN") return <Navigate to="/admin" replace />;

  return <Navigate to="/login" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register/patient" element={<RegisterPatient />} />
          <Route path="/register/doctor" element={<RegisterDoctor />} />

          {/* Smart redirect based on role */}
          <Route path="/dashboard" element={<RoleRedirect />} />

          {/* PATIENT */}
          <Route
            path="/patient"
            element={
              <RequireAuth role="PATIENT">
                <PatientDashboard />
              </RequireAuth>
            }
          />

          <Route
            path="/my-appointments"
            element={
              <RequireAuth role="PATIENT">
                <MyAppointments />
              </RequireAuth>
            }
          />

          {/* DOCTOR */}
          <Route
            path="/doctor"
            element={
              <RequireAuth role="DOCTOR">
                <DoctorDashboard />
              </RequireAuth>
            }
          />

          {/* ADMIN */}
          <Route
            path="/admin"
            element={
              <RequireAuth role="ADMIN">
                <AdminDashboard />
              </RequireAuth>
            }
          />

          {/* AI Chat (accessible to logged users only) */}
          <Route
            path="/ai-chat"
            element={
              <RequireAuth>
                <ChatBot />
              </RequireAuth>
            }
          />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;