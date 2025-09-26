import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { verifyEmail, resendVerificationEmail } from "../../Services/auth";
import "./login.css";

const Verify = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");

  useEffect(() => {
    // Get token from URL parameters
    const urlToken = searchParams.get("token");
    const urlEmail = searchParams.get("email");

    if (urlToken) {
      setToken(urlToken);
      verifyEmailWithToken(urlToken);
    }

    if (urlEmail) {
      setEmail(urlEmail);
    }
  }, [searchParams]);

  const verifyEmailWithToken = async (tokenToVerify) => {
    setLoading(true);
    setMessage("");

    try {
      const response = await verifyEmail(tokenToVerify);
      setMessage(response.message || "Email verified successfully!");
      setIsSuccess(true);

      setTimeout(() => {
        navigate("/login");
      }, 3000);// 3 sec ko tiime set hoo hai 
    } catch (error) {
      console.error("Email verification error:", error);
      setMessage(
        error.message || "Email verification failed. Please try again."
      );
      setIsSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  const handleManualVerification = async (e) => {
    e.preventDefault();
    if (!token.trim()) {
      setMessage("Please enter a verification token.");
      return;
    }
    await verifyEmailWithToken(token.trim());
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handleTokenChange = (e) => {
    setToken(e.target.value);
  };

  return (
    <div className="login-page">
      <div className="login-form">
        <h1>Email Verification</h1>

        {message && (
          <div className={isSuccess ? "success-message" : "error-message"}>
            {message}
          </div>
        )}

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Verifying your email...</p>
          </div>
        ) : !isSuccess ? (
          <>
            {/* Manual Token Entry Form */}
            <form onSubmit={handleManualVerification} className="form-group">
              <div className="input-group">
                <input
                  type="text"
                  name="token"
                  placeholder="Enter verification token"
                  value={token}
                  onChange={handleTokenChange}
                  className="form-input"
                  required
                />
              </div>

              <button type="submit" className="form-button" disabled={loading}>
                {loading ? "Verifying..." : "Verify Email"}
              </button>
            </form>

            <div className="divider">
              <span>OR</span>
            </div>
          </>
        ) : (
          <div className="success-container">
            <div className="success-icon">✓</div>
            <p>Your email has been verified successfully!</p>
            <p className="redirect-text">Redirecting to login page...</p>
          </div>
        )}

        <div className="auth-links">
          <p>
            Remember your password?{" "}
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="link-button"
            >
              Back to Login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Verify;
