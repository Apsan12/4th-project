import api from "./api";

export const registerUser = async (userData) => {
  try {
    const response = await api.post("/users/register", userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Registration failed" };
  }
};

export const loginUser = async (credentials) => {
  try {
    const response = await api.post("/users/login", credentials);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Login failed" };
  }
};

export const verifyEmail = async (token) => {
  try {
    const response = await api.get(`/users/verify-email?token=${token}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Email verification failed" };
  }
};

export const resendVerificationEmail = async (email) => {
  // Note: There's no dedicated resend endpoint in the backend
  // This is a placeholder - you may need to implement a resend endpoint
  // or ask users to re-register if they didn't receive the email
  throw {
    message:
      "Resend functionality not available. Please contact support or re-register.",
  };
};
