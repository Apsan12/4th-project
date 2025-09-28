import React from "react";
import { useState } from "react";
import { resetUserPassword } from "../../Services/auth";
import "./reset.css";

const ResetPw = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleReset = async () => {
    try {
      const response = await resetUserPassword(email);
      setMessage(response.message);
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <div className="reset-page">
      <div className="reset-form">
        <h2>Reset Password</h2>
        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            id="email"
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <button className="reset-button" onClick={handleReset}>
          Reset Password
        </button>
        {message && (
          <div
            className={`reset-message ${
              message.includes("success") ? "success" : "error"
            }`}
          >
            {message}
          </div>
        )}
        <div className="reset-links">
          <a href="/login">Back to Login</a>
          <a href="/register">Create Account</a>
        </div>
      </div>
    </div>
  );
};

export default ResetPw;
