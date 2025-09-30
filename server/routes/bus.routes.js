import express from "express";
import {
  createBusController,
  getAllBusesController,
  getBusByIdController,
  updateBusController,
  deleteBusController,
  permanentDeleteBusController,
  assignBusToRouteController,
  assignDriverToBusController,
  removeDriverFromBusController,
  updateBusStatusController,
  getBusesByRouteController,
  getAvailableBusesController,
  getBusByNumberController,
  getBusesByDriverController,
  getBusStatsController,
  getBusesNeedingMaintenanceController,
} from "../controller/bus.controller.js";
import authenticated from "../middleware/auth.js";
import authorization from "../middleware/authorize.js";
import { uploadBusImage } from "../config/multer.js";

const router = express.Router();

// ------------------ Public Routes tara login hunu parxa still to updated ------------------

// View available buses (public access for customers)
router.get("/available", getAvailableBusesController);
router.get("/route/:routeId", getBusesByRouteController);

//  Protected Routes (Authentication Required) login hunu parya bhanya haii raja  ------------------

// Basic bus operations
router.get("/", authenticated, getAllBusesController);
router.get("/:id", authenticated, getBusByIdController);
router.get("/number/:busNumber", authenticated, getBusByNumberController);

// Driver specific routes (busDriver role can view their assigned buses)
router.get("/driver/:driverId", authenticated, getBusesByDriverController);

// ------------------ Admin Only Routes ------------------

// Bus management (admin only)
router.post(
  "/",
  authenticated,
  authorization("admin"),
  uploadBusImage,
  createBusController
);
router.put(
  "/:id",
  authenticated,
  authorization("admin"),
  uploadBusImage,
  updateBusController
);
router.delete(
  "/:id",
  authenticated,
  authorization("admin"),
  deleteBusController
);
router.delete(
  "/:id/permanent",
  authenticated,
  authorization("admin"),
  permanentDeleteBusController
);

// Bus assignment (admin only)
router.put(
  "/:id/assign-route",
  authenticated,
  authorization("admin"),
  assignBusToRouteController
);
router.put(
  "/:id/assign-driver",
  authenticated,
  authorization("admin"),
  assignDriverToBusController
);
router.delete(
  "/:id/remove-driver",
  authenticated,
  authorization("admin"),
  removeDriverFromBusController
);

// Bus status management (admin and busDriver can update status)
router.put("/:id/status", authenticated, updateBusStatusController);

// Bus analytics and maintenance (admin only)
router.get(
  "/analytics/stats",
  authenticated,
  authorization("admin"),
  getBusStatsController
);
router.get(
  "/maintenance/needed",
  authenticated,
  authorization("admin"),
  getBusesNeedingMaintenanceController
);

export default router;
