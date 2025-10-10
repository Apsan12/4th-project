import api from "./api";

export const getAllRutes = async () => {
  try {
    const response = await api.get("/routes");
    // normalize common shapes into an array of routes
    const d = response?.data;
    if (!d) return [];
    if (Array.isArray(d)) return d;
    if (Array.isArray(d.routes)) return d.routes;
    if (d.data && Array.isArray(d.data.routes)) return d.data.routes;
    return [];
  } catch (error) {
    console.error("Error fetching routes:", error);
    throw error;
  }
};
export const getRuteById = async (id) => {
  try {
    const response = await api.get(`/routes/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching route by ID:", error);
    throw error;
  }
};

export const searchRutes = async (origin, destination) => {
  try {
    const response = await api.get("/routes/search", {
      params: {
        origin,
        destination,
      },
    });
    const d = response?.data;
    if (!d) return [];
    if (Array.isArray(d)) return d;
    if (Array.isArray(d.routes)) return d.routes;
    if (d.data && Array.isArray(d.data.routes)) return d.data.routes;
    return [];
  } catch (error) {
    console.error("Error searching routes:", error);
    throw error;
  }
};

export const getByCode = async (code) => {
  try {
    const response = await api.get(`/routes/code/${code}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching route by code:", error);
    throw error;
  }
};
