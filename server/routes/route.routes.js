import express from "express";
import {
  createRouteController,
  getAllRoutesController,
  getRouteByIdController,
  updateRouteController,
  deleteRouteController,
  permanentDeleteRouteController,
  searchRoutesController,
  getActiveRoutesController,
  getRouteByCodeController,
  getRouteStatsController,
  getPopularRoutesController,
} from "../controller/route.controller.js";
import authenticated from "../middleware/auth.js";
import authorization from "../middleware/authorize.js";

const router = express.Router();

// ------------------ Public Routes ------------------

// Search and view routes (public access for customers)
router.get("/search", searchRoutesController);
router.get("/active", getActiveRoutesController);
router.get("/popular", getPopularRoutesController);
router.get("/code/:code", getRouteByCodeController);

// ------------------ Protected Routes (Authentication Required) ------------------

// Basic route operations
router.get("/", authenticated, getAllRoutesController);
router.get("/:id", authenticated, getRouteByIdController);

// ------------------ Admin Only Routes ------------------

// Route management (admin only)
router.post("/", authenticated, authorization("admin"), createRouteController);
router.put(
  "/:id",
  authenticated,
  authorization("admin"),
  updateRouteController
);
router.delete(
  "/:id",
  authenticated,
  authorization("admin"),
  deleteRouteController
);
router.delete(
  "/:id/permanent",
  authenticated,
  authorization("admin"),
  permanentDeleteRouteController
);

// Route analytics (admin only)
router.get(
  "/analytics/stats",
  authenticated,
  authorization("admin"),
  getRouteStatsController
);

export default router;
