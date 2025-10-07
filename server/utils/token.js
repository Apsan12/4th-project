import { config } from "dotenv";
import jwt from "jsonwebtoken";
config();

// Access token (short-lived)
export const generateToken = (id, expiresIn = "1h") => {
  return jwt.sign({ id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn });
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  } catch (error) {
    console.error(
      "Access token verification failed:",
      error.name,
      error.message
    );
    return null;
  }
};

// --------------------
// Refresh tokens (long-lived)
// --------------------
const refreshTokens = new Set();

export const generateRefreshToken = (id) => {
  const refreshToken = jwt.sign({ id }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });
  refreshTokens.add(refreshToken);
  return refreshToken;
};

export const verifyRefreshToken = (token) => {
  if (!refreshTokens.has(token)) return null;
  try {
    return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
  } catch (error) {
    console.error(
      "Refresh token verification failed:",
      error.name,
      error.message
    );
    return null;
  }
};

export const revokeRefreshToken = (token) => {
  refreshTokens.delete(token);
};

// --------------------
// Email verification tokens
// --------------------
export const generateEmailVerificationToken = (email) => {
  return jwt.sign({ email }, process.env.EMAIL_TOKEN_SECRET, {
    expiresIn: "1d",
  });
};

export const verifyEmailVerificationToken = (token) => {
  try {
    return jwt.verify(token, process.env.EMAIL_TOKEN_SECRET);
  } catch (error) {
    console.error(
      "Email token verification failed:",
      error.name,
      error.message
    );
    return null;
  }
};
