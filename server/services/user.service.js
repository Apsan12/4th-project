import bcrypt from "bcrypt";
import User from "../model/user.model.js";

export const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

export const comparePassword = async (password, hashed) => {
  return await bcrypt.compare(password, hashed);
};

export const findByEmail = async (email) => {
  return await User.findOne({ where: { email } });
};

// Find user by ID
export const findById = async (id) => {
  return await User.findByPk(id);
};

export const createUser = async (userData) => {
  const { username, email, password, role, isVerified, phoneNumber, imageUrl } =
    userData;

  const existingUser = await findByEmail(email);
  if (existingUser) {
    throw new Error("Email already registered");
  }

  const hashedPassword = await hashPassword(password);

  const user = await User.create({
    username,
    email: email.trim().toLowerCase(),
    password: hashedPassword,
    role: role || "user",
    phoneNumber,
    imageUrl,
    isVerified: isVerified || false,
  });

  return user;
};

export const getAllUsers = async (page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  return await User.findAll({
    attributes: { exclude: ["password"] },
    limit,
    offset,
  });
};

export const updateUser = async (id, updateData) => {
  const user = await findById(id);
  if (!user) throw new Error("User not found");

  if (updateData.password) {
    updateData.password = await hashPassword(updateData.password);
  }

  await user.update(updateData);
  return user;
};

// Update user profile with image
export const updateUserProfile = async (id, updateData) => {
  const user = await findById(id);
  if (!user) throw new Error("User not found");

  // Remove empty imageUrl from updateData to preserve existing image
  if (updateData.imageUrl === "") {
    delete updateData.imageUrl;
  }

  console.log("💾 Updating user with data:", updateData);
  await user.update(updateData);

  console.log("✅ User updated successfully. Final imageUrl:", user.imageUrl);
  return user;
};

export const deleteUser = async (id) => {
  const user = await findById(id);
  if (!user) throw new Error("User not found");

  await user.destroy();
  return true;
};

// ------------------ Driver Management Functions ------------------

// Assign user to bus driver role
export const assignDriverRole = async (userId, driverData = {}) => {
  const user = await findById(userId);
  if (!user) throw new Error("User not found");

  // Check if user is already a driver
  if (user.role === "busDriver") {
    throw new Error("User is already assigned as a bus driver");
  }

  // Update user role to busDriver
  await user.update({
    role: "busDriver",
    // You can add additional driver-specific fields here if needed
    // licenseNumber: driverData.licenseNumber,
    // licenseExpiryDate: driverData.licenseExpiryDate,
    // experience: driverData.experience,
  });

  return user;
};

// Remove driver role from user
export const removeDriverRole = async (userId) => {
  const user = await findById(userId);
  if (!user) throw new Error("User not found");

  if (user.role !== "busDriver") {
    throw new Error("User is not a bus driver");
  }

  // Check if driver is assigned to any active buses
  const Bus = await import("../model/bus.model.js").then((m) => m.default);
  const assignedBuses = await Bus.findAll({
    where: { driverId: userId, isActive: true },
  });

  if (assignedBuses.length > 0) {
    throw new Error("Cannot remove driver role while assigned to active buses");
  }

  // Update user role back to regular user
  await user.update({
    role: "user",
  });

  return user;
};

// Get all drivers
export const getAllDrivers = async (page = 1, limit = 10) => {
  const offset = (page - 1) * limit;

  const { count, rows } = await User.findAndCountAll({
    where: { role: "busDriver" },
    attributes: { exclude: ["password"] },
    limit,
    offset,
    order: [["createdAt", "DESC"]],
  });

  return {
    drivers: rows,
    totalCount: count,
    currentPage: page,
    totalPages: Math.ceil(count / limit),
    hasNextPage: page < Math.ceil(count / limit),
    hasPreviousPage: page > 1,
  };
};

// Get available drivers (not assigned to any bus)
export const getAvailableDrivers = async () => {
  const Bus = await import("../model/bus.model.js").then((m) => m.default);

  const drivers = await User.findAll({
    where: { role: "busDriver" },
    attributes: { exclude: ["password"] },
    include: [
      {
        model: Bus,
        as: "buses",
        required: false,
        where: { isActive: true },
      },
    ],
  });

  // Filter drivers who have no active bus assignments
  const availableDrivers = drivers.filter(
    (driver) => driver.buses.length === 0
  );

  return availableDrivers;
};

// Update user role
export const updateUserRole = async (userId, newRole, reason = null) => {
  const user = await findById(userId);
  if (!user) throw new Error("User not found");

  const oldRole = user.role;

  // If changing from busDriver, check for active bus assignments
  if (oldRole === "busDriver" && newRole !== "busDriver") {
    const Bus = await import("../model/bus.model.js").then((m) => m.default);
    const assignedBuses = await Bus.findAll({
      where: { driverId: userId, isActive: true },
    });

    if (assignedBuses.length > 0) {
      throw new Error("Cannot change role while assigned to active buses");
    }
  }

  await user.update({ role: newRole });

  return user;
};
