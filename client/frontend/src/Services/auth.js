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

export const userProfile = async () => {
  try {
    const response = await api.get("/users/me");
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch user profile" };
  }
};

export const logoutUser = async () => {
  try {
    const response = await api.post("/users/logout");
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Logout failed" };
  }
};

export const resendVerificationEmail = async (email) => {
  try {
    const response = await api.post("/users/resend-verification", { email });
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || { message: "Failed to resend verification email" }
    );
  }
};

export const updateUserProfile = async (profileData) => {
  try {
    const response = await api.put("/users/update-user", profileData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to update user profile" };
  }
};

export const deleteUserAccount = async () => {
  try {
    const response = await api.delete("/users/delete");
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to delete user account" };
  }
};

export const changePassword = async (passwordData) => {
  try {
    const response = await api.post("/users/change-password", passwordData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to change password" };
  }
};

export const changeUserPassword = async (passwordData) => {
  try {
    const response = await api.post("/users/change-password", passwordData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to change user password" };
  }
};

export const resetUserPassword = async (email) => {
  try {
    const response = await api.post("/users/password-reset", { email });
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || { message: "Failed to request password reset" }
    );
  }
};

export const confirmPasswordReset = async (token, newPassword) => {
  try {
    const response = await api.post("/users/reset-password", {
      token,
      newPassword,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to reset password" };
  }
};
