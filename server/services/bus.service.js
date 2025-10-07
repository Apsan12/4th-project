import Bus from "../model/bus.model.js";
import Route from "../model/route.model.js";
import User from "../model/user.model.js";

// Create a new bus
export const createBus = async (busData) => {
  const {
    busNumber,
    busType,
    capacity,
    routeId,
    driverId,
    status,
    isActive,
    amenities,
    description,
    licensePlate,
    imageUrl,
  } = busData;

  // Check if bus number already exists
  const existingBus = await Bus.findOne({
    where: { busNumber: busNumber.toUpperCase() },
  });
  if (existingBus) {
    throw new Error("Bus number already exists");
  }

  // Check if license plate already exists

  // Verify route exists
  const route = await Route.findByPk(routeId);
  if (!route) {
    throw new Error("Route not found");
  }

  // Verify driver exists if provided
  if (driverId) {
    const driver = await User.findByPk(driverId);
    if (!driver || driver.role !== "busDriver") {
      throw new Error("Valid driver not found");
    }
  }
  if (licensePlate) {
    const existingLicense = await Bus.findOne({
      where: { licensePlate: licensePlate.toUpperCase() },
    });
    if (existingLicense) {
      throw new Error("License plate already exists");
    }
  }

  const bus = await Bus.create({
    busNumber: busNumber.toUpperCase(),
    busType: busType || "standard",
    capacity,
    routeId,
    driverId: driverId || null,
    status: status || "available",
    isActive: isActive !== undefined ? isActive : true,
    amenities: amenities || [],
    description: description?.trim(),
    licensePlate: licensePlate ? licensePlate.toUpperCase() : null,
    imageUrl,
  });

  return bus;
};

// Get all buses with pagination and filtering
export const getAllBuses = async (filters = {}, page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  const where = {};

  // Apply filters
  if (filters.routeId) where.routeId = filters.routeId;
  if (filters.driverId) where.driverId = filters.driverId;
  if (filters.busType) where.busType = filters.busType;
  if (filters.status) where.status = filters.status;
  if (filters.isActive !== undefined) where.isActive = filters.isActive;

  const { count, rows } = await Bus.findAndCountAll({
    where,
    limit,
    offset,
    order: [["createdAt", "DESC"]],
    include: [
      {
        model: Route,
        as: "route",
        attributes: ["id", "routeCode", "routeName", "origin", "destination"],
      },
      {
        model: User,
        as: "driver",
        attributes: ["id", "username", "email", "phoneNumber"],
        required: false,
      },
    ],
  });

  return {
    buses: rows,
    totalCount: count,
    currentPage: page,
    totalPages: Math.ceil(count / limit),
    hasNextPage: page < Math.ceil(count / limit),
    hasPreviousPage: page > 1,
  };
};

// Get bus by ID
export const getBusById = async (id) => {
  const bus = await Bus.findByPk(id, {
    include: [
      {
        model: Route,
        as: "route",
        attributes: [
          "id",
          "routeCode",
          "routeName",
          "origin",
          "destination",
          "distance",
          "fare",
        ],
      },
      {
        model: User,
        as: "driver",
        attributes: ["id", "username", "email", "phoneNumber"],
        required: false,
      },
    ],
  });

  if (!bus) {
    throw new Error("Bus not found");
  }

  return bus;
};

// Update bus
export const updateBus = async (id, updateData) => {
  const bus = await Bus.findByPk(id);
  if (!bus) {
    throw new Error("Bus not found");
  }

  // Check if updating bus number and it already exists
  if (
    updateData.busNumber &&
    updateData.busNumber.toUpperCase() !== bus.busNumber
  ) {
    const existingBus = await Bus.findOne({
      where: { busNumber: updateData.busNumber.toUpperCase() },
    });
    if (existingBus) {
      throw new Error("Bus number already exists");
    }
    updateData.busNumber = updateData.busNumber.toUpperCase();
  }

  // Check if updating license plate and it already exists
  if (
    updateData.licensePlate &&
    updateData.licensePlate.toUpperCase() !== bus.licensePlate
  ) {
    const existingLicense = await Bus.findOne({
      where: { licensePlate: updateData.licensePlate.toUpperCase() },
    });
    if (existingLicense) {
      throw new Error("License plate already exists");
    }
    updateData.licensePlate = updateData.licensePlate.toUpperCase();
  }

  // Verify route exists if updating
  if (updateData.routeId) {
    const route = await Route.findByPk(updateData.routeId);
    if (!route) {
      throw new Error("Route not found");
    }
  }

  // Verify driver exists if updating
  if (updateData.driverId) {
    const driver = await User.findByPk(updateData.driverId);
    if (!driver || driver.role !== "driver") {
      throw new Error("Valid driver not found");
    }
  }

  // Remove empty/null/undefined imageUrl from updateData to preserve existing image
  if (!updateData.imageUrl || updateData.imageUrl === "") {
    delete updateData.imageUrl;
  }

  // Remove busImage field if it's empty object (comes from frontend)
  if (
    updateData.busImage &&
    typeof updateData.busImage === "object" &&
    Object.keys(updateData.busImage).length === 0
  ) {
    delete updateData.busImage;
  }

  // Trim string fields
  if (updateData.model) updateData.model = updateData.model.trim();
  if (updateData.manufacturer)
    updateData.manufacturer = updateData.manufacturer.trim();
  if (updateData.description)
    updateData.description = updateData.description.trim();

  console.log("💾 Updating bus with data:", updateData);
  await bus.update(updateData);

  // Reload the bus to get fresh data from database
  await bus.reload();

  console.log("✅ Bus updated successfully. Final imageUrl:", bus.imageUrl);
  return bus;
};

// Update bus with image
export const updateBusWithImage = async (id, updateData, imageFile = null) => {
  const bus = await Bus.findByPk(id);
  if (!bus) {
    throw new Error("Bus not found");
  }

  // If new image file is provided, handle image replacement
  if (imageFile) {
    // Delete old image from Cloudinary if it exists
    if (bus.imageUrl) {
      try {
        // Extract public_id from Cloudinary URL
        const urlParts = bus.imageUrl.split("/");
        const filename = urlParts[urlParts.length - 1];
        const publicId = `bus-management/buses/${filename.split(".")[0]}`;

        // Delete old image from Cloudinary
        const { v2: cloudinary } = await import("cloudinary");
        await cloudinary.uploader.destroy(publicId);
        console.log(`Deleted old bus image: ${publicId}`);
      } catch (error) {
        console.error("Error deleting old bus image:", error);
        // Don't throw error here, continue with update
      }
    }

    // Set new image URL
    updateData.imageUrl = imageFile.path; // Cloudinary provides the full URL in file.path
  }

  // Use the existing updateBus logic for validation
  return await updateBus(id, updateData);
};

// Create bus with image
export const createBusWithImage = async (busData, imageFile = null) => {
  // If image file is provided, add the Cloudinary URL to bus data
  if (imageFile) {
    busData.imageUrl = imageFile.path; // Cloudinary provides the full URL in file.path
  }

  return await createBus(busData);
};

// Delete bus (soft delete by setting isActive to false)
export const deleteBus = async (id) => {
  const bus = await Bus.findByPk(id);
  if (!bus) {
    throw new Error("Bus not found");
  }

  // Check if bus is currently in transit
  if (bus.status === "in-transit") {
    throw new Error("Cannot delete bus that is currently in transit");
  }

  await bus.update({ isActive: false, status: "out-of-service" });
  return bus;
};

// Hard delete bus (permanent deletion)
export const permanentDeleteBus = async (id) => {
  const bus = await Bus.findByPk(id);
  if (!bus) {
    throw new Error("Bus not found");
  }

  if (bus.status === "in-transit") {
    throw new Error(
      "Cannot permanently delete bus that is currently in transit"
    );
  }

  await bus.destroy();
  return true;
};

// ------------------ Bus Assignment Operations ------------------

// Assign bus to route
export const assignBusToRoute = async (busId, routeId) => {
  const bus = await Bus.findByPk(busId);
  if (!bus) {
    throw new Error("Bus not found");
  }

  const route = await Route.findByPk(routeId);
  if (!route || !route.isActive) {
    throw new Error("Active route not found");
  }

  await bus.update({ routeId });
  return bus;
};

// Assign driver to bus
export const assignDriverToBus = async (busId, driverId) => {
  const bus = await Bus.findByPk(busId);
  if (!bus) {
    throw new Error("Bus not found");
  }

  const driver = await User.findByPk(driverId);
  if (!driver || driver.role !== "driver") {
    throw new Error("Valid driver not found");
  }

  await bus.update({ driverId });
  return bus;
};

// Remove driver from bus
export const removeDriverFromBus = async (busId) => {
  const bus = await Bus.findByPk(busId);
  if (!bus) {
    throw new Error("Bus not found");
  }

  await bus.update({ driverId: null });
  return bus;
};

// Update bus status
export const updateBusStatus = async (busId, status, reason = null) => {
  const bus = await Bus.findByPk(busId);
  if (!bus) {
    throw new Error("Bus not found");
  }

  const updateData = { status };

  // Add reason to description if provided
  if (reason) {
    updateData.description = `${
      bus.description || ""
    }\n${new Date().toISOString()}: Status changed to ${status} - ${reason}`.trim();
  }

  await bus.update(updateData);
  return bus;
};

// ------------------ Bus Search & Filter Operations ------------------

// Find buses by route
export const findBusesByRoute = async (routeId) => {
  return await Bus.findByRoute(routeId);
};

// Get available buses
export const getAvailableBuses = async () => {
  return await Bus.findAvailableBuses();
};

// Find bus by number
export const findBusByNumber = async (busNumber) => {
  return await Bus.findByBusNumber(busNumber.toUpperCase());
};

// Find buses by driver
export const findBusesByDriver = async (driverId) => {
  return await Bus.findByDriverId(driverId);
};

// ------------------ Bus Statistics ------------------

// Get bus statistics
export const getBusStats = async () => {
  const total = await Bus.count();
  const active = await Bus.count({ where: { isActive: true } });
  const available = await Bus.count({ where: { status: "available" } });
  const inTransit = await Bus.count({ where: { status: "in-transit" } });
  const maintenance = await Bus.count({ where: { status: "maintenance" } });
  const outOfService = await Bus.count({ where: { status: "out-of-service" } });

  const busTypes = await Bus.findAll({
    attributes: [
      "busType",
      [Bus.sequelize.fn("COUNT", Bus.sequelize.col("busType")), "count"],
    ],
    group: ["busType"],
    where: { isActive: true },
  });

  return {
    total,
    active,
    inactive: total - active,
    statusBreakdown: {
      available,
      inTransit,
      maintenance,
      outOfService,
    },
    typeBreakdown: busTypes.map((item) => ({
      type: item.busType,
      count: parseInt(item.dataValues.count),
    })),
  };
};

// Get buses needing maintenance
export const getBusesNeedingMaintenance = async () => {
  const today = new Date();
  const upcomingMaintenance = new Date();
  upcomingMaintenance.setDate(today.getDate() + 7); // Next 7 days

  return await Bus.findAll({
    where: {
      isActive: true,
      nextMaintenanceDate: {
        [Bus.sequelize.Op.lte]: upcomingMaintenance,
      },
    },
    include: [
      {
        model: Route,
        as: "route",
        attributes: ["routeCode", "routeName"],
      },
    ],
    order: [["nextMaintenanceDate", "ASC"]],
  });
};
