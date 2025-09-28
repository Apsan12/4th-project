import { Routes, Route } from "react-router-dom";
import Register from "../pages/Auth/Register";
import Login from "../pages/Auth/Login";
import Verify from "../pages/Auth/Verify";
import Home from "../pages/home/Home";
import ResetPw from "../pages/Auth/ResetPw";
import ConfirmReset from "../pages/Auth/ConfirmReset";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/reset" element={<ResetPw />} />
      <Route path="/reset-password" element={<ConfirmReset />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify" element={<Verify />} />
      <Route
        path="*"
        element={<h1 className="text-center">404 - Page Not Found</h1>}
      />
    </Routes>
  );
}
