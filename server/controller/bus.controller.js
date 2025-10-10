import {
  createBus,
  createBusWithImage,
  getAllBuses,
  getBusById,
  updateBus,
  updateBusWithImage,
  deleteBus,
  permanentDeleteBus,
  assignBusToRoute,
  assignDriverToBus,
  removeDriverFromBus,
  updateBusStatus,
  findBusesByRoute,
  getAvailableBuses,
  findBusByNumber,
  findBusesByDriver,
  getBusStats,
  getBusesNeedingMaintenance,
} from "../services/bus.service.js";
import {
  createBusSchema,
  updateBusSchema,
  busQuerySchema,
  busIdSchema,
  busAssignmentSchema,
  busStatusUpdateSchema,
} from "../validation/bus.validation.js";

// ------------------ Bus CRUD Controllers ------------------

// Create new bus
export const createBusController = async (req, res) => {
  try {
    // Defensive parsing for form-data: trim values, reject empty strings, and
    // return a helpful error if numbers are invalid. This prevents Zod from
    // receiving NaN which produces unhelpful messages.
    if (req.body) {
      // Debug: show raw incoming fields for easier diagnosis when using form-data
      try {
        console.debug("createBusController - raw incoming fields:", {
          capacity: req.body.capacity,
          capacityType: Array.isArray(req.body.capacity)
            ? "array"
            : typeof req.body.capacity,
          routeId: req.body.routeId,
          routeIdType: Array.isArray(req.body.routeId)
            ? "array"
            : typeof req.body.routeId,
          driverId: req.body.driverId,
          driverIdType: Array.isArray(req.body.driverId)
            ? "array"
            : typeof req.body.driverId,
        });
      } catch (e) {
        console.debug("createBusController - failed to log incoming fields", e);
      }
      const parseNumberField = (key, required = false) => {
        if (req.body[key] === undefined) return null;
        let raw = req.body[key];

        // If form-data repeated the key, it may be an array — pick the first value
        if (Array.isArray(raw)) raw = raw[0];

        // Normalize booleans/null-like strings
        if (raw === null)
          return { field: key, message: `${key} cannot be null` };
        if (typeof raw === "string") {
          const trimmed = raw.trim();
          if (
            trimmed === "" ||
            trimmed.toLowerCase() === "null" ||
            trimmed.toLowerCase() === "undefined"
          ) {
            return {
              field: key,
              message: required
                ? `${key} is required`
                : `${key} cannot be empty`,
            };
          }
          const n = Number(trimmed);
          if (Number.isNaN(n)) {
            console.debug(
              `parseNumberField: invalid numeric value for ${key}:`,
              trimmed
            );
            return { field: key, message: `${key} must be a valid number` };
          }
          req.body[key] = n;
          return null;
        }

        // If it's already a number, accept it
        if (typeof raw === "number") return null;

        // Try coercion for other types
        const n = Number(raw);
        if (Number.isNaN(n)) {
          console.debug(
            `parseNumberField: invalid numeric value for ${key}:`,
            raw
          );
          return { field: key, message: `${key} must be a valid number` };
        }
        req.body[key] = n;
        return null;
      };

      // capacity and routeId are required by schema; driverId is optional
      const capErr = parseNumberField("capacity", true);
      if (capErr) {
        console.debug(
          "createBusController - capacity parse failed, raw:",
          req.body.capacity
        );
        // include raw value for easier debugging in Postman
        return res
          .status(400)
          .json({
            errors: [Object.assign({}, capErr, { raw: req.body.capacity })],
            message: "Validation failed",
          });
      }
      const routeErr = parseNumberField("routeId", true);
      if (routeErr)
        return res
          .status(400)
          .json({
            errors: [Object.assign({}, routeErr, { raw: req.body.routeId })],
            message: "Validation failed",
          });
      const driverErr = parseNumberField("driverId", false);
      if (driverErr)
        return res
          .status(400)
          .json({
            errors: [Object.assign({}, driverErr, { raw: req.body.driverId })],
            message: "Validation failed",
          });
    }

    // Validate request body
    const result = createBusSchema.safeParse(req.body);
    if (!result.success) {
      // Fixed validation error handling - check for issues instead of errors
      const errors = result.error?.issues?.map((err) => ({
        field: err.path?.join(".") || "unknown",
        message: err.message,
      })) || [{ field: "validation", message: "Validation failed" }];
      return res.status(400).json({ errors, message: "Validation failed" });
    }

    // Check if image file is uploaded
    const imageFile = req.file;
    let bus;

    if (imageFile) {
      // Use createBusWithImage service for proper encapsulation
      bus = await createBusWithImage(result.data, imageFile);
    } else {
      // Use regular createBus service
      bus = await createBus(result.data);
    }

    res.status(201).json({
      success: true,
      message: "Bus created successfully",
      bus,
    });
  } catch (err) {
    console.error("Create Bus Error:", err);
    if (
      err.message.includes("already exists") ||
      err.message.includes("not found")
    ) {
      return res.status(409).json({ message: err.message });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get all buses with filtering and pagination
export const getAllBusesController = async (req, res) => {
  try {
    // Validate query parameters
    const queryResult = busQuerySchema.safeParse(req.query);
    if (!queryResult.success) {
      // Fixed validation error handling - check for issues instead of errors
      const errors = queryResult.error?.issues?.map((err) => ({
        field: err.path?.join(".") || "unknown",
        message: err.message,
      })) || [{ field: "validation", message: "Invalid query parameters" }];
      return res
        .status(400)
        .json({ errors, message: "Invalid query parameters" });
    }

    const {
      routeId,
      driverId,
      busType,
      status,
      isActive,
      page = 1,
      limit = 10,
    } = queryResult.data;
    const filters = {};

    if (routeId) filters.routeId = routeId;
    if (driverId) filters.driverId = driverId;
    if (busType) filters.busType = busType;
    if (status) filters.status = status;
    if (isActive !== undefined) filters.isActive = isActive === "true";

    const result = await getAllBuses(filters, page, limit);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    console.error("Get All Buses Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get bus by ID
export const getBusByIdController = async (req, res) => {
  try {
    // Validate bus ID
    const idResult = busIdSchema.safeParse(req.params);
    if (!idResult.success) {
      return res.status(400).json({ message: "Invalid bus ID" });
    }

    const bus = await getBusById(idResult.data.id);

    res.status(200).json({
      success: true,
      bus,
    });
  } catch (err) {
    console.error("Get Bus Error:", err);
    if (err.message === "Bus not found") {
      return res.status(404).json({ message: err.message });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update bus
export const updateBusController = async (req, res) => {
  try {
    // Validate bus ID
    const idResult = busIdSchema.safeParse(req.params);
    if (!idResult.success) {
      return res.status(400).json({ message: "Invalid bus ID" });
    }

    // Validate request body
    const bodyResult = updateBusSchema.safeParse(req.body);
    if (!bodyResult.success) {
      // Fixed validation error handling - check for issues instead of errors
      const errors = bodyResult.error?.issues?.map((err) => ({
        field: err.path?.join(".") || "unknown",
        message: err.message,
      })) || [{ field: "validation", message: "Validation failed" }];
      return res.status(400).json({ errors, message: "Validation failed" });
    }

    const busId = idResult.data.id;
    const updateData = bodyResult.data;

    console.log("🔄 Updating bus:", busId);
    console.log("📝 Update data:", updateData);

    // Image URL is already handled by multer middleware
    if (req.body.imageUrl) {
      console.log("📸 Update image URL:", req.body.imageUrl);
    }

    // Update bus in database
    const bus = await updateBus(busId, updateData);

    res.status(200).json({
      success: true,
      message: "Bus updated successfully",
      bus,
    });
  } catch (err) {
    console.error("Update Bus Error:", err);
    if (err.message === "Bus not found") {
      return res.status(404).json({ message: err.message });
    }
    if (
      err.message.includes("already exists") ||
      err.message.includes("not found")
    ) {
      return res.status(409).json({ message: err.message });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete bus (soft delete)
export const deleteBusController = async (req, res) => {
  try {
    // Validate bus ID
    const idResult = busIdSchema.safeParse(req.params);
    if (!idResult.success) {
      return res.status(400).json({ message: "Invalid bus ID" });
    }

    const bus = await deleteBus(idResult.data.id);

    res.status(200).json({
      success: true,
      message: "Bus deactivated successfully",
      bus,
    });
  } catch (err) {
    console.error("Delete Bus Error:", err);
    if (err.message === "Bus not found") {
      return res.status(404).json({ message: err.message });
    }
    if (err.message.includes("in transit")) {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

// Permanently delete bus
export const permanentDeleteBusController = async (req, res) => {
  try {
    // Validate bus ID
    const idResult = busIdSchema.safeParse(req.params);
    if (!idResult.success) {
      return res.status(400).json({ message: "Invalid bus ID" });
    }

    await permanentDeleteBus(idResult.data.id);

    res.status(200).json({
      success: true,
      message: "Bus permanently deleted",
    });
  } catch (err) {
    console.error("Permanent Delete Bus Error:", err);
    if (err.message === "Bus not found") {
      return res.status(404).json({ message: err.message });
    }
    if (err.message.includes("in transit")) {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

// ------------------ Bus Assignment Controllers ------------------

// Assign bus to route
export const assignBusToRouteController = async (req, res) => {
  try {
    // Validate bus ID
    const idResult = busIdSchema.safeParse(req.params);
    if (!idResult.success) {
      return res.status(400).json({ message: "Invalid bus ID" });
    }

    const { routeId } = req.body;
    if (!routeId) {
      return res.status(400).json({ message: "Route ID is required" });
    }

    const bus = await assignBusToRoute(idResult.data.id, routeId);

    res.status(200).json({
      success: true,
      message: "Bus assigned to route successfully",
      bus,
    });
  } catch (err) {
    console.error("Assign Bus to Route Error:", err);
    if (err.message.includes("not found")) {
      return res.status(404).json({ message: err.message });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

// Assign driver to bus
export const assignDriverToBusController = async (req, res) => {
  try {
    // Validate bus ID
    const idResult = busIdSchema.safeParse(req.params);
    if (!idResult.success) {
      return res.status(400).json({ message: "Invalid bus ID" });
    }

    const { driverId } = req.body;
    if (!driverId) {
      return res.status(400).json({ message: "Driver ID is required" });
    }

    const bus = await assignDriverToBus(idResult.data.id, driverId);

    res.status(200).json({
      success: true,
      message: "Driver assigned to bus successfully",
      bus,
    });
  } catch (err) {
    console.error("Assign Driver to Bus Error:", err);
    if (err.message.includes("not found")) {
      return res.status(404).json({ message: err.message });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

// Remove driver from bus
export const removeDriverFromBusController = async (req, res) => {
  try {
    // Validate bus ID
    const idResult = busIdSchema.safeParse(req.params);
    if (!idResult.success) {
      return res.status(400).json({ message: "Invalid bus ID" });
    }

    const bus = await removeDriverFromBus(idResult.data.id);

    res.status(200).json({
      success: true,
      message: "Driver removed from bus successfully",
      bus,
    });
  } catch (err) {
    console.error("Remove Driver from Bus Error:", err);
    if (err.message === "Bus not found") {
      return res.status(404).json({ message: err.message });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update bus status
export const updateBusStatusController = async (req, res) => {
  try {
    // Validate bus ID
    const idResult = busIdSchema.safeParse(req.params);
    if (!idResult.success) {
      return res.status(400).json({ message: "Invalid bus ID" });
    }

    // Validate status update data
    const bodyResult = busStatusUpdateSchema.safeParse(req.body);
    if (!bodyResult.success) {
      const errors = bodyResult.error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));
      return res.status(400).json({ errors, message: "Validation failed" });
    }

    const { status, reason } = bodyResult.data;
    const bus = await updateBusStatus(idResult.data.id, status, reason);

    res.status(200).json({
      success: true,
      message: "Bus status updated successfully",
      bus,
    });
  } catch (err) {
    console.error("Update Bus Status Error:", err);
    if (err.message === "Bus not found") {
      return res.status(404).json({ message: err.message });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

// ------------------ Bus Search Controllers ------------------

// Get buses by route
export const getBusesByRouteController = async (req, res) => {
  try {
    const { routeId } = req.params;

    if (!routeId || isNaN(routeId)) {
      return res.status(400).json({ message: "Valid route ID is required" });
    }

    const buses = await findBusesByRoute(parseInt(routeId));

    res.status(200).json({
      success: true,
      buses,
      count: buses.length,
    });
  } catch (err) {
    console.error("Get Buses by Route Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get available buses
export const getAvailableBusesController = async (req, res) => {
  try {
    const buses = await getAvailableBuses();

    res.status(200).json({
      success: true,
      buses,
      count: buses.length,
    });
  } catch (err) {
    console.error("Get Available Buses Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get bus by number
export const getBusByNumberController = async (req, res) => {
  try {
    const { busNumber } = req.params;

    if (!busNumber) {
      return res.status(400).json({ message: "Bus number is required" });
    }

    const bus = await findBusByNumber(busNumber);

    if (!bus) {
      return res.status(404).json({ message: "Bus not found" });
    }

    res.status(200).json({
      success: true,
      bus,
    });
  } catch (err) {
    console.error("Get Bus by Number Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get buses by driver
export const getBusesByDriverController = async (req, res) => {
  try {
    const { driverId } = req.params;

    if (!driverId || isNaN(driverId)) {
      return res.status(400).json({ message: "Valid driver ID is required" });
    }

    const buses = await findBusesByDriver(parseInt(driverId));

    res.status(200).json({
      success: true,
      buses,
      count: buses.length,
    });
  } catch (err) {
    console.error("Get Buses by Driver Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ------------------ Bus Analytics Controllers ------------------

// Get bus statistics
export const getBusStatsController = async (req, res) => {
  try {
    const stats = await getBusStats();

    res.status(200).json({
      success: true,
      stats,
    });
  } catch (err) {
    console.error("Get Bus Stats Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get buses needing maintenance
export const getBusesNeedingMaintenanceController = async (req, res) => {
  try {
    const buses = await getBusesNeedingMaintenance();

    res.status(200).json({
      success: true,
      buses,
      count: buses.length,
    });
  } catch (err) {
    console.error("Get Buses Needing Maintenance Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
