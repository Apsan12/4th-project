import Router from "express";

const router = Router();
import {
  registerUserController,
  verifyEmailController,
  loginUserController,
  refreshTokenController,
  logoutUserController,
  userProfileController,
  updateUserController,
  deleteUserController,
  getAllUsersController,
  getUserByIdController,
  getOwnProfileController,
  assignDriverRoleController,
  removeDriverRoleController,
  getAllDriversController,
  getAvailableDriversController,
  updateUserRoleController,
  requestPasswordReset,
  resetPassword,
} from "../controller/user.controller.js";

import authenticated from "../middleware/auth.js";
import authorization from "../middleware/authorize.js";

const userRoute = Router();

userRoute.post("/register", registerUserController);
userRoute.get("/verify-email", verifyEmailController);
userRoute.post("/login", loginUserController);
userRoute.post("/refresh-token", refreshTokenController);
userRoute.post("/logout", authenticated, logoutUserController);
userRoute.get("/me", authenticated, getOwnProfileController);
userRoute.put("/update-user", authenticated, updateUserController);
userRoute.post("/password-reset", requestPasswordReset);
userRoute.post("/reset-password", resetPassword);

userRoute.get(
  "/",
  authenticated,
  authorization("admin"),
  getAllUsersController
);
userRoute.get(
  "/:id",
  authenticated,
  authorization("admin"),
  getUserByIdController
);
userRoute.delete(
  "/:id",
  authenticated,
  authorization("admin"),
  deleteUserController
);

// Driver management routes
userRoute.post(
  "/:userId/assign-driver",
  authenticated,
  authorization("admin"),
  assignDriverRoleController
);
userRoute.delete(
  "/:userId/remove-driver",
  authenticated,
  authorization("admin"),
  removeDriverRoleController
);
userRoute.put(
  "/:userId/role",
  authenticated,
  authorization("admin"),
  updateUserRoleController
);

// Driver listing routes
userRoute.get(
  "/drivers/all",
  authenticated,
  authorization("admin"),
  getAllDriversController
);
userRoute.get(
  "/drivers/available",
  authenticated,
  getAvailableDriversController
);

export default userRoute;
