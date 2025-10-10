import api from "./api";

/**
 * Get all available buses (public endpoint)
 */
export const getAvailableBuses = async () => {
  try {
    const res = await api.get("/buses/available");
    return res.data;
  } catch (err) {
    console.error("Error fetching available buses:", err);
    throw err;
  }
};

/**
 * Get buses assigned to a specific route (public endpoint)
 * @param {number|string} routeId
 */
export const getBusesByRoute = async (routeId) => {
  try {
    const res = await api.get(`/buses/route/${routeId}`);
    return res.data;
  } catch (err) {
    console.error(`Error fetching buses for route ${routeId}:`, err);
    throw err;
  }
};

/**
 * Get a bus by its bus number (public endpoint)
 * @param {string} busNumber
 */
export const getBusByNumber = async (busNumber) => {
  try {
    const res = await api.get(`/buses/number/${encodeURIComponent(busNumber)}`);
    return res.data;
  } catch (err) {
    console.error(`Error fetching bus by number ${busNumber}:`, err);
    throw err;
  }
};

/**
 * Optionally get buses by driver (keeps parity with backend). This requires authentication on backend routes.
 * @param {number|string} driverId
 */
export const getBusesByDriver = async (driverId) => {
  try {
    const res = await api.get(`/buses/driver/${driverId}`);
    return res.data;
  } catch (err) {
    console.error(`Error fetching buses for driver ${driverId}:`, err);
    throw err;
  }
};

export default {
  getAvailableBuses,
  getBusesByRoute,
  getBusByNumber,
  getBusesByDriver,
};
