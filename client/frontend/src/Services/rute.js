import api from "./api";

export const getAllRutes = async () => {
  try {
    const response = await api.get("/routes");
    return response.data;
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
        destination
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error searching routes:", error);
    throw error;
  }
};



export const getByCode=async (code) => {
  try {
    const response = await api.get(`/routes/code/${code}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching route by code:", error);
    throw error;
  }
};




