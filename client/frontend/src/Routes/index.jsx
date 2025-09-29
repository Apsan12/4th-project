import { Routes, Route } from "react-router-dom";
import Register from "../pages/Auth/Register";
import Login from "../pages/Auth/Login";
import Verify from "../pages/Auth/Verify";
import Home from "../pages/home/Home";
import ResetPw from "../pages/Auth/ResetPw";
import ConfirmReset from "../pages/Auth/ConfirmReset";
import Dashboard from "../pages/dashboarb/Dashboard";
import UserProfile from "../pages/Auth/UserProfile";
import AboutUs from "../pages/company/AboutUs";
import ContactUs from "../pages/company/ContactUs";
import ProtectedRoute from "../component/ProtectedRoute";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/reset" element={<ResetPw />} />
      <Route path="/reset-password" element={<ConfirmReset />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify" element={<Verify />} />
      <Route path="/about" element={<AboutUs />} />
      <Route path="/contact" element={<ContactUs />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <UserProfile />
          </ProtectedRoute>
        }
      />

      <Route
        path="*"
        element={<h1 className="text-center">404 - Page Not Found</h1>}
      />
    </Routes>
  );
}
