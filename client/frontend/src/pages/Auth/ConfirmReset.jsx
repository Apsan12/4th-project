import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { confirmPasswordReset } from "../../Services/auth";
import "./reset.css";

const ConfirmReset = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setMessage("Invalid or missing reset token");
    }
  }, [token]);

  const handleReset = async (e) => {
    e.preventDefault();

    if (!token) {
      setMessage("Invalid reset token");
      return;
    }

    if (!newPassword || !confirmPassword) {
      setMessage("Please fill in all fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      setMessage("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);
    try {
      const response = await confirmPasswordReset(token, newPassword);
      setMessage("Password reset successfully! Redirecting to login...");
      setTimeout(() => {
        navigate("/login");
      });
    } catch (error) {
      setMessage(error.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="reset-page">
        <div className="reset-form">
          <h2>Invalid Reset Link</h2>
          <div className="reset-message error">
            This reset link is invalid or has expired.
          </div>
          <div className="reset-links">
            <a href="/reset">Request New Reset Link</a>
            <a href="/login">Back to Login</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="reset-page">
      <div className="reset-form">
        <h2>Set New Password</h2>
        <form onSubmit={handleReset}>
          <div className="form-group">
            <label htmlFor="newPassword">New Password</label>
            <div className="password-input-container">
              <input
                id="newPassword"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={loading}
              />
              <div className="show-password-container">
                <input
                  type="checkbox"
                  id="showPassword"
                  className="show-password-checkbox"
                  checked={showPassword}
                  onChange={(e) => setShowPassword(e.target.checked)}
                />
                <label htmlFor="showPassword">Show password</label>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="password-input-container">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
              />
              <div className="show-password-container">
                <input
                  type="checkbox"
                  id="showConfirmPassword"
                  className="show-password-checkbox"
                  checked={showConfirmPassword}
                  onChange={(e) => setShowConfirmPassword(e.target.checked)}
                />
                <label htmlFor="showConfirmPassword">Show password</label>
              </div>
            </div>
          </div>

          <button type="submit" className="reset-button" disabled={loading}>
            {loading ? (
              <>
                <span className="loading-spinner"></span>
                Resetting Password...
              </>
            ) : (
              "Reset Password"
            )}
          </button>
        </form>

        {message && (
          <div
            className={`reset-message ${
              message.includes("successfully")
                ? "success"
                : message.includes("Invalid") ||
                  message.includes("expired") ||
                  message.includes("match")
                ? "error"
                : "info"
            }`}
          >
            {message}
          </div>
        )}

        <div className="reset-links">
          <a href="/login">Back to Login</a>
        </div>
      </div>
    </div>
  );
};

export default ConfirmReset;
