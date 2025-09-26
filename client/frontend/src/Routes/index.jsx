import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import Register from "../pages/Auth/Register";
import Login from "../pages/Auth/Login";
import Verify from "../pages/Auth/Verify";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify" element={<Verify />} />
      <Route
        path="*"
        element={<h1 className="text-center">404 - Page Not Found</h1>}
      />
    </Routes>
  );
}
