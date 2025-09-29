import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { logoutUser } from "../Services/auth";
import "./Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    try {
      setLoading(true);
      await logoutUser();
      // Clear any local storage or session data if needed
      localStorage.removeItem("token");
      sessionStorage.clear();
      // Redirect to login page
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      // Even if logout API fails, redirect to login for security
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo Section */}
        <div className="navbar-logo">
          <h2> Jam Jam Bus </h2>
        </div>

        {/* Navigation Links */}
        <div className="navbar-nav">
          <Link to="/dashboard" className="nav-link">
            Dashboard
          </Link>
          <Link to="/about" className="nav-link">
            About Us
          </Link>
          <Link to="/contact" className="nav-link">
            Contact Us
          </Link>
        </div>

        {/* Right Side - Logout Button */}
        <div className="navbar-actions">
          <button
            className="logout-button"
            onClick={handleLogout}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="loading-spinner"></span>
                Logging out...
              </>
            ) : (
              <>
                <span className="logout-icon">🚪</span>
                Logout
              </>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
