import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { userProfile } from "../Services/auth";

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      // Verify token with backend
      await userProfile();
      setIsAuthenticated(true);
    } catch (error) {
      // Token is invalid or expired
      localStorage.removeItem("token");
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          background: "linear-gradient(135deg, #000000 0%, #333333 100%)",
          color: "#ffffff",
        }}
      >
        <div
          style={{
            width: "60px",
            height: "60px",
            border: "6px solid rgba(255, 255, 255, 0.1)",
            borderTop: "6px solid #ffffff",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            marginBottom: "2rem",
          }}
        ></div>
        <p
          style={{
            fontSize: "1.2rem",
            fontWeight: "500",
            textTransform: "uppercase",
            letterSpacing: "2px",
          }}
        >
          Authenticating...
        </p>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
