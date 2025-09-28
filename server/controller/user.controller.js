// Controller: Get own profile

import {
  createUser,
  findByEmail,
  findById,
  getAllUsers,
  updateUser,
  deleteUser,
  comparePassword,
  assignDriverRole,
  removeDriverRole,
  getAllDrivers,
  getAvailableDrivers,
  updateUserRole,
} from "../services/user.service.js";
import {
  sendMail,
  welcomeEmailTemplate,
  resetPasswordTemplate,
} from "../utils/sendmail.js";
import {
  generateToken,
  generateRefreshToken,
  verifyToken,
  verifyRefreshToken,
  generateEmailVerificationToken,
  verifyEmailVerificationToken,
} from "../utils/token.js";
import { createUserSchema } from "../validation/user.validation.js";
import { hashPassword } from "../services/user.service.js";
import { clearAuthCookies, setAuthCookies } from "../config/cookie.js";
import User from "../model/user.model.js";
import { Op } from "sequelize";
import crypto from "crypto";

export const registerUserController = async (req, res) => {
  try {
    // Validate request
    const result = createUserSchema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));
      return res.status(400).json({ errors, message: "Validation failed" });
    }
    const { username, email, password, phoneNumber } = result.data;

    const existingUser = await findByEmail(email);
    if (existingUser)
      return res.status(409).json({ message: "Email already registered" });

    const user = await createUser({ username, email, password, phoneNumber });

    const token = generateEmailVerificationToken(user.email);
    const verificationLink = `http://localhost:5174/verify?token=${token}`;

    await sendMail(
      user.email,
      "Welcome !",
      welcomeEmailTemplate(username, verificationLink)
    );

    res.status(201).json({
      message: "Verification email sent",
      user,
    });
  } catch (err) {
    console.error("Register Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const verifyEmailController = async (req, res) => {
  const { token } = req.query;
  // console.log(req.query.token,"token");
  if (!token) return res.status(400).json({ message: "Token required" });

  try {
    const decoded = verifyEmailVerificationToken(token);
    // console.log(decoded,"decoded");
    if (!decoded)
      return res.status(400).json({ message: "Invalid or expired token" });

    const user = await findByEmail(decoded.email);
    // console.log(user,"user");
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.isVerified)
      return res.status(200).json({ message: "Email already verified" });

    await updateUser(user.id, { isVerified: true });

    res.status(200).json({ message: "Email verified successfully" });
  } catch (err) {
    console.error("Verify Email Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const loginUserController = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "All fields are required" });

    const user = await findByEmail(email);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    if (!user.isVerified)
      return res.status(403).json({ message: "Email not verified" });

    const accessToken = generateToken(user.id);
    const refreshToken = generateRefreshToken(user.id);
    setAuthCookies(res, accessToken, refreshToken);

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        accessToken,
        refreshToken,
      },
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const refreshTokenController = (req, res) => {
  try {
    const rt = req.cookies?.refresh_token;
    if (!rt) return res.status(401).json({ message: "No refresh token" });

    const decoded = verifyRefreshToken(rt);
    if (!decoded)
      return res.status(401).json({ message: "Invalid refresh token" });

    const newAccess = generateToken(decoded.id);
    setAuthCookies(res, newAccess, rt);
    res.status(200).json({ message: "Session refreshed" });
  } catch (err) {
    console.error("Refresh Token Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const logoutUserController = (req, res) => {
  try {
    clearAuthCookies(res);
    res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    console.error("Logout Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const userProfileController = async (req, res) => {
  try {
    const user = await findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    console.log(user, "user");

    res.status(200).json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Profile Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateUserController = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    const user = await updateUser(id, updateData);
    res.json({ user });
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({
      where: { email: email.trim().toLowerCase() },
    });
    if (!user)
      return res
        .status(200)
        .json({ message: "If the email exists, a reset link was sent" });

    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 1000 * 60 * 15; // 15 min
    await user.save();

    const resetLink = `http://localhost:5173/reset-password?token=${rawToken}`; // frontend page recommended

    await sendMail(
      user.email,
      "Reset Your Password",
      resetPasswordTemplate(user.username, resetLink)
    );

    res
      .status(200)
      .json({ message: "a reset link was sent to your email address" });
  } catch (error) {
    console.error("Error requesting password reset:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Reset password (with token)
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Reset token is required" });
    }

    if (!newPassword) {
      return res.status(400).json({ message: "New password is required" });
    }

    // Hash the provided token to compare with stored hash
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Find user with matching token that hasn't expired
    const user = await User.findOne({
      where: {
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { [Op.gt]: Date.now() },
      },
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid or expired reset token" });
    }

    // Hash the new password
    const hashed = await hashPassword(newPassword);

    // Update password and clear reset token fields
    await user.update({
      password: hashed,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    });

    res.json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update basic profile fields

// Change password (authenticated)
export const updatePassword = async (req, res) => {
  const userId = req.user.id; // assuming user ID is available from auth middleware
  const { oldPassword, newPassword } = req.body;

  const user = await findById(userId);
  if (!user) return res.status(404).json({ message: "User not found" });

  // Optionally check old password
  const isMatch = await user.comparePassword(oldPassword, user.password);
  if (!isMatch)
    return res.status(400).json({ message: "Old password is incorrect" });

  const hashed = await hashPassword(newPassword);
  await user.update({ password: hashed });

  res.json({ message: "Password updated successfully" });
};

export const deleteUserController = async (req, res) => {
  try {
    await deleteUser(req.user.id);
    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Delete User Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllUsersController = async (req, res) => {
  try {
    const users = await getAllUsers();
    res.status(200).json({ count: users.length, users });
  } catch (err) {
    console.error("Get All Users Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getUserByIdController = async (req, res) => {
  try {
    const user = await findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ user });
  } catch (err) {
    console.error("Get User Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ------------------ Driver Management Controllers ------------------

// Assign user to bus driver role
export const assignDriverRoleController = async (req, res) => {
  try {
    const { userId } = req.params;
    const driverData = req.body;

    // Validate user ID
    if (!userId || isNaN(userId)) {
      return res.status(400).json({ message: "Valid user ID is required" });
    }

    const user = await assignDriverRole(parseInt(userId), driverData);

    res.status(200).json({
      success: true,
      message: "User assigned as bus driver successfully",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Assign Driver Role Error:", err);
    if (
      err.message.includes("not found") ||
      err.message.includes("already assigned")
    ) {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

// Remove driver role from user
export const removeDriverRoleController = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId || isNaN(userId)) {
      return res.status(400).json({ message: "Valid user ID is required" });
    }

    const user = await removeDriverRole(parseInt(userId));

    res.status(200).json({
      success: true,
      message: "Driver role removed successfully",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Remove Driver Role Error:", err);
    if (
      err.message.includes("not found") ||
      err.message.includes("not a bus driver") ||
      err.message.includes("assigned to active buses")
    ) {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get all drivers
export const getAllDriversController = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const result = await getAllDrivers(parseInt(page), parseInt(limit));

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    console.error("Get All Drivers Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get available drivers (not assigned to any bus)
export const getAvailableDriversController = async (req, res) => {
  try {
    const drivers = await getAvailableDrivers();

    res.status(200).json({
      success: true,
      drivers,
      count: drivers.length,
    });
  } catch (err) {
    console.error("Get Available Drivers Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update user role
export const updateUserRoleController = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role, reason } = req.body;

    if (!userId || isNaN(userId)) {
      return res.status(400).json({ message: "Valid user ID is required" });
    }

    if (!role) {
      return res.status(400).json({ message: "Role is required" });
    }

    // Validate role
    if (!["user", "admin", "busDriver"].includes(role)) {
      return res.status(400).json({ message: "Invalid role specified" });
    }

    const user = await updateUserRole(parseInt(userId), role, reason);

    res.status(200).json({
      success: true,
      message: "User role updated successfully",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Update User Role Error:", err);
    if (
      err.message.includes("not found") ||
      err.message.includes("assigned to active buses")
    ) {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getOwnProfileController = async (req, res) => {
  try {
    // Since this is protected by authenticated middleware, req.user is guaranteed
    // Fetch fresh user data from database for most up-to-date info
    const user = await findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Return clean user profile data (exclude password)
    res.status(200).json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        phoneNumber: user.phoneNumber,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (err) {
    console.error("Get Own Profile Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
