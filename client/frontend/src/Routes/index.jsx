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
import GetRute from "../pages/Rute/GetRute";
import Bus from "../pages/bus/Bus";
import BusList from "../pages/bus/BusList";
import ProtectedRoute from "../component/ProtectedRoute";
import HelpAndSupport from "../pages/HelpAnSupport";

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
      <Route path="/help-support" element={<HelpAndSupport />}></Route>

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
        path="/routes"
        element={
          <ProtectedRoute>
            <GetRute />
          </ProtectedRoute>
        }
      />
      <Route path="/buses" element={<BusList />} />
      <Route path="/bus/:busNumber" element={<Bus />} />

      <Route
        path="*"
        element={
          <h1
            style={{
              textAlign: "center",
              backgroundColor: "lightgray",
              color: "darkred",
            }}
          >
            404 - Page Not Found
          </h1>
        }
      />
    </Routes>
  );
}
