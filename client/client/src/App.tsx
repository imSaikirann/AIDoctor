import { useTranslation } from "react-i18next";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";

import MyAppointments from "./pages/MyAppointments";
import ChatBot from "./pages/ChatBot";
import { RequireAuth } from "./auth/RequireAuth";
import { useAuth } from "./auth/useAuth";
import { Login } from "./pages/Login";
import { RegisterPatient } from "./pages/RegisterPatient";
import { RegisterDoctor } from "./pages/RegisterDoctor";
import { PatientDashboard } from "./pages/PatientDashboard";
import { DoctorDashboard } from "./pages/DoctorDashboard";
import { AdminDashboard } from "./pages/AdminDashboard";
import { PublicOnly } from "./pages/PublicOnly";
import MedicinesPage from "./pages/MedicinePage";
import CartPage from "./pages/CartPage";
import MyOrdersPage from "./pages/MyOrdersPage";
import AdminMedicinesPage from "./pages/AdminMedicinesPage";
import AdminOrdersPage from "./pages/AdminOrdersPage";
import Home from "./pages/Home";
import MedicalRecordsPage from "./pages/MedicalRecordsPage";

function RoleRedirect() {
  const { t } = useTranslation();
  const { user, loading } = useAuth();

  if (loading) return <div className="p-6">{t("common.loading")}</div>;
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
          <Route path="/" element={<Home />} />

          <Route
            path="/login"
            element={
              <PublicOnly>
                <Login />
              </PublicOnly>
            }
          />

          <Route
            path="/register/patient"
            element={
              <PublicOnly>
                <RegisterPatient />
              </PublicOnly>
            }
          />

          <Route
            path="/register/doctor"
            element={
              <PublicOnly>
                <RegisterDoctor />
              </PublicOnly>
            }
          />

          <Route path="/dashboard" element={<RoleRedirect />} />

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

          <Route
            path="/doctor"
            element={
              <RequireAuth role="DOCTOR">
                <DoctorDashboard />
              </RequireAuth>
            }
          />

          <Route
            path="/medical-records"
            element={
              <RequireAuth>
                <MedicalRecordsPage />
              </RequireAuth>
            }
          />

          <Route
            path="/admin"
            element={
              <RequireAuth role="ADMIN">
                <AdminDashboard />
              </RequireAuth>
            }
          />

          <Route
            path="/ai-chat"
            element={
              <RequireAuth>
                <ChatBot />
              </RequireAuth>
            }
          />

          <Route
            path="/medicines"
            element={
              <RequireAuth role="PATIENT">
                <MedicinesPage />
              </RequireAuth>
            }
          />

          <Route
            path="/cart"
            element={
              <RequireAuth role="PATIENT">
                <CartPage />
              </RequireAuth>
            }
          />

          <Route
            path="/orders"
            element={
              <RequireAuth role="PATIENT">
                <MyOrdersPage />
              </RequireAuth>
            }
          />

          <Route
            path="/admin/medicines"
            element={
              <RequireAuth role="ADMIN">
                <AdminMedicinesPage />
              </RequireAuth>
            }
          />

          <Route
            path="/admin/orders"
            element={
              <RequireAuth role="ADMIN">
                <AdminOrdersPage />
              </RequireAuth>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
