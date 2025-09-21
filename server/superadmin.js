import dotenv from "dotenv";
dotenv.config();

import sequelize, { connectDB } from "./config/connectdb.js"; // make sure DB connects first
import User from "./model/user.model.js";
import { hashPassword } from "./services/user.service.js";

// Get admin credentials from .env
const adminEmail = process.env.ADMIN_EMAIL;
const adminUsername = process.env.ADMIN_USERNAME;
const adminPassword = process.env.ADMIN_PASSWORD || "ChangeMe123!";

async function createSuperAdmin() {
  try {
    // Make sure DB is connected
    await connectDB();

    const existingAdmin = await User.findOne({
      where: { email: adminEmail, role: "admin" },
    });

    if (existingAdmin) {
      console.log(`Super admin already exists. Email: ${adminEmail}`);
      return;
    }

    const hashed = await hashPassword(adminPassword);
    await User.create({
      username: adminUsername,
      email: adminEmail,
      password: hashed,
      role: "admin",
      isVerified: true,
    });

    console.log(
      `✅ Super admin created.\nEmail: ${adminEmail}\nPassword: ${adminPassword}`
    );
  } catch (error) {
    console.error("Error creating super admin:", error);
    // Do not throw here, just log it to prevent server crash
  }
}

// Call at startup
createSuperAdmin();

export default createSuperAdmin;
