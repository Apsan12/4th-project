import Route from "../model/route.model.js";
import Bus from "../model/bus.model.js";

// ------------------ Route CRUD Operations ------------------

// Create a new route
export const createRoute = async (routeData) => {
  const {
    routeCode,
    routeName,
    origin,
    destination,
    distance,
    estimatedDuration,
    fare,
    stops,
    isActive,
    description,
  } = routeData;

  // Check if route code already exists
  const existingRoute = await Route.findOne({ where: { routeCode } });
  if (existingRoute) {
    throw new Error("Route code already exists");
  }

  // Check if route with same origin and destination exists
  const duplicateRoute = await Route.findOne({
    where: { origin, destination, isActive: true },
  });
  if (duplicateRoute) {
    throw new Error("Active route between these locations already exists");
  }

  const route = await Route.create({
    routeCode: routeCode.toUpperCase(),
    routeName: routeName.trim(),
    origin: origin.trim(),
    destination: destination.trim(),
    distance,
    estimatedDuration,
    fare,
    stops: stops || [],
    isActive: isActive !== undefined ? isActive : true,
    description: description?.trim(),
  });

  return route;
};

// Get all routes with pagination and filtering
export const getAllRoutes = async (filters = {}, page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  const where = {};

  // Apply filters
  if (filters.origin) where.origin = filters.origin;
  if (filters.destination) where.destination = filters.destination;
  if (filters.isActive !== undefined) where.isActive = filters.isActive;

  const { count, rows } = await Route.findAndCountAll({
    where,
    limit,
    offset,
    order: [["createdAt", "DESC"]],
    include: [
      {
        model: Bus,
        as: "buses",
        attributes: ["id", "busNumber", "busType", "capacity", "status"],
      },
    ],
  });

  return {
    routes: rows,
    totalCount: count,
    currentPage: page,
    totalPages: Math.ceil(count / limit),
    hasNextPage: page < Math.ceil(count / limit),
    hasPreviousPage: page > 1,
  };
};

// Get route by ID
export const getRouteById = async (id) => {
  const route = await Route.findByPk(id, {
    include: [
      {
        model: Bus,
        as: "buses",
        attributes: [
          "id",
          "busNumber",
          "busType",
          "capacity",
          "status",
          "licensePlate",
        ],
      },
    ],
  });

  if (!route) {
    throw new Error("Route not found");
  }

  return route;
};

// Update route
export const updateRoute = async (id, updateData) => {
  const route = await Route.findByPk(id);
  if (!route) {
    throw new Error("Route not found");
  }

  // Check if updating route code and it already exists
  if (updateData.routeCode && updateData.routeCode !== route.routeCode) {
    const existingRoute = await Route.findOne({
      where: { routeCode: updateData.routeCode.toUpperCase() },
    });
    if (existingRoute) {
      throw new Error("Route code already exists");
    }
    updateData.routeCode = updateData.routeCode.toUpperCase();
  }

  // Trim string fields
  if (updateData.routeName) updateData.routeName = updateData.routeName.trim();
  if (updateData.origin) updateData.origin = updateData.origin.trim();
  if (updateData.destination)
    updateData.destination = updateData.destination.trim();
  if (updateData.description)
    updateData.description = updateData.description.trim();

  await route.update(updateData);
  return route;
};

// Delete route (soft delete by setting isActive to false)
export const deleteRoute = async (id) => {
  const route = await Route.findByPk(id);
  if (!route) {
    throw new Error("Route not found");
  }

  // Check if there are active buses on this route
  const activeBuses = await Bus.findAll({
    where: { routeId: id, isActive: true },
  });

  if (activeBuses.length > 0) {
    throw new Error(
      "Cannot delete route with active buses. Please reassign or deactivate buses first."
    );
  }

  await route.update({ isActive: false });
  return route;
};

// Hard delete route (permanent deletion)
export const permanentDeleteRoute = async (id) => {
  const route = await Route.findByPk(id);
  if (!route) {
    throw new Error("Route not found");
  }

  // Check if there are any buses on this route
  const buses = await Bus.findAll({ where: { routeId: id } });
  if (buses.length > 0) {
    throw new Error(
      "Cannot permanently delete route with associated buses. Please reassign buses first."
    );
  }

  await route.destroy();
  return true;
};

// ------------------ Route Search & Filter Operations ------------------

// Find routes by origin and destination
export const findRoutesByOriginDestination = async (origin, destination) => {
  return await Route.findByOriginDestination(origin, destination);
};

// Get active routes
export const getActiveRoutes = async () => {
  return await Route.findActiveRoutes();
};

// Find route by code
export const findRouteByCode = async (routeCode) => {
  return await Route.findByRouteCode(routeCode.toUpperCase());
};

// ------------------ Route Statistics ------------------

// Get route statistics
export const getRouteStats = async () => {
  const totalRoutes = await Route.count();
  const activeRoutes = await Route.count({ where: { isActive: true } });
  const inactiveRoutes = totalRoutes - activeRoutes;

  const routesWithBuses = await Route.count({
    include: [
      {
        model: Bus,
        as: "buses",
        where: { isActive: true },
        required: true,
      },
    ],
  });

  return {
    total: totalRoutes,
    active: activeRoutes,
    inactive: inactiveRoutes,
    withActiveBuses: routesWithBuses,
  };
};

// Get popular routes (routes with most buses)
export const getPopularRoutes = async (limit = 5) => {
  const routes = await Route.findAll({
    where: { isActive: true },
    include: [
      {
        model: Bus,
        as: "buses",
        where: { isActive: true },
        required: false,
      },
    ],
    order: [[{ model: Bus, as: "buses" }, "id", "DESC"]],
    limit,
  });

  return routes.map((route) => ({
    ...route.toJSON(),
    busCount: route.buses.length,
  }));
};
