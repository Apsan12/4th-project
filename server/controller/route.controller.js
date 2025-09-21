import {
  createRoute,
  getAllRoutes,
  getRouteById,
  updateRoute,
  deleteRoute,
  permanentDeleteRoute,
  findRoutesByOriginDestination,
  getActiveRoutes,
  findRouteByCode,
  getRouteStats,
  getPopularRoutes,
} from "../services/route.service.js";
import {
  createRouteSchema,
  updateRouteSchema,
  routeQuerySchema,
  routeIdSchema,
} from "../validation/route.validation.js";

// ------------------ Route CRUD Controllers ------------------

// Create new route
export const createRouteController = async (req, res) => {
  try {
    // Validate request body
    const result = createRouteSchema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));
      return res.status(400).json({ errors, message: "Validation failed" });
    }

    const route = await createRoute(result.data);

    res.status(201).json({
      success: true,
      message: "Route created successfully",
      route,
    });
  } catch (err) {
    console.error("Create Route Error:", err);
    if (err.message.includes("already exists")) {
      return res.status(409).json({ message: err.message });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get all routes with filtering and pagination
export const getAllRoutesController = async (req, res) => {
  try {
    // Validate query parameters
    const queryResult = routeQuerySchema.safeParse(req.query);
    if (!queryResult.success) {
      const errors = queryResult.error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));
      return res
        .status(400)
        .json({ errors, message: "Invalid query parameters" });
    }

    const {
      origin,
      destination,
      isActive,
      page = 1,
      limit = 10,
    } = queryResult.data;
    const filters = {};

    if (origin) filters.origin = origin;
    if (destination) filters.destination = destination;
    if (isActive !== undefined) filters.isActive = isActive === "true";

    const result = await getAllRoutes(filters, page, limit);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    console.error("Get All Routes Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get route by ID
export const getRouteByIdController = async (req, res) => {
  try {
    // Validate route ID
    const idResult = routeIdSchema.safeParse(req.params);
    if (!idResult.success) {
      return res.status(400).json({ message: "Invalid route ID" });
    }

    const route = await getRouteById(idResult.data.id);

    res.status(200).json({
      success: true,
      route,
    });
  } catch (err) {
    console.error("Get Route Error:", err);
    if (err.message === "Route not found") {
      return res.status(404).json({ message: err.message });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update route
export const updateRouteController = async (req, res) => {
  try {
    // Validate route ID
    const idResult = routeIdSchema.safeParse(req.params);
    if (!idResult.success) {
      return res.status(400).json({ message: "Invalid route ID" });
    }

    // Validate request body
    const bodyResult = updateRouteSchema.safeParse(req.body);
    if (!bodyResult.success) {
      const errors = bodyResult.error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));
      return res.status(400).json({ errors, message: "Validation failed" });
    }

    const route = await updateRoute(idResult.data.id, bodyResult.data);

    res.status(200).json({
      success: true,
      message: "Route updated successfully",
      route,
    });
  } catch (err) {
    console.error("Update Route Error:", err);
    if (err.message === "Route not found") {
      return res.status(404).json({ message: err.message });
    }
    if (err.message.includes("already exists")) {
      return res.status(409).json({ message: err.message });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete route (soft delete)
export const deleteRouteController = async (req, res) => {
  try {
    // Validate route ID
    const idResult = routeIdSchema.safeParse(req.params);
    if (!idResult.success) {
      return res.status(400).json({ message: "Invalid route ID" });
    }

    const route = await deleteRoute(idResult.data.id);

    res.status(200).json({
      success: true,
      message: "Route deactivated successfully",
      route,
    });
  } catch (err) {
    console.error("Delete Route Error:", err);
    if (err.message === "Route not found") {
      return res.status(404).json({ message: err.message });
    }
    if (err.message.includes("active buses")) {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

// Permanently delete route
export const permanentDeleteRouteController = async (req, res) => {
  try {
    // Validate route ID
    const idResult = routeIdSchema.safeParse(req.params);
    if (!idResult.success) {
      return res.status(400).json({ message: "Invalid route ID" });
    }

    await permanentDeleteRoute(idResult.data.id);

    res.status(200).json({
      success: true,
      message: "Route permanently deleted",
    });
  } catch (err) {
    console.error("Permanent Delete Route Error:", err);
    if (err.message === "Route not found") {
      return res.status(404).json({ message: err.message });
    }
    if (err.message.includes("associated buses")) {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

// ------------------ Route Search Controllers ------------------

// Search routes by origin and destination
export const searchRoutesController = async (req, res) => {
  try {
    const { origin, destination } = req.query;

    if (!origin || !destination) {
      return res.status(400).json({
        message: "Both origin and destination are required",
      });
    }

    const routes = await findRoutesByOriginDestination(origin, destination);

    res.status(200).json({
      success: true,
      routes,
      count: routes.length,
    });
  } catch (err) {
    console.error("Search Routes Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get active routes
export const getActiveRoutesController = async (req, res) => {
  try {
    const routes = await getActiveRoutes();

    res.status(200).json({
      success: true,
      routes,
      count: routes.length,
    });
  } catch (err) {
    console.error("Get Active Routes Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get route by code
export const getRouteByCodeController = async (req, res) => {
  try {
    const { code } = req.params;

    if (!code) {
      return res.status(400).json({ message: "Route code is required" });
    }

    const route = await findRouteByCode(code);

    if (!route) {
      return res.status(404).json({ message: "Route not found" });
    }

    res.status(200).json({
      success: true,
      route,
    });
  } catch (err) {
    console.error("Get Route by Code Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ------------------ Route Analytics Controllers ------------------

// Get route statistics
export const getRouteStatsController = async (req, res) => {
  try {
    const stats = await getRouteStats();

    res.status(200).json({
      success: true,
      stats,
    });
  } catch (err) {
    console.error("Get Route Stats Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get popular routes
export const getPopularRoutesController = async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    const routes = await getPopularRoutes(parseInt(limit));

    res.status(200).json({
      success: true,
      routes,
      count: routes.length,
    });
  } catch (err) {
    console.error("Get Popular Routes Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
