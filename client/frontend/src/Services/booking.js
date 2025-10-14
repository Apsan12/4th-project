import api from "./api";

export const createBooking = async (bookingData) => {
  try {
    const response = await api.post("/bookings", bookingData);
    return response.data;
  } catch (error) {
    console.error("Error creating booking:", error);
    throw error;
  }
};

export const updateBookingStatus = async (slug, body) => {
  try {
    // body can be { status } or { paymentStatus, paymentMethod } depending on server expectations
    const response = await api.patch(`/bookings/${slug}/status`, body);
    return response.data;
  } catch (error) {
    console.error("Error updating booking status:", error);
    throw error;
  }
};

export const getBookingsByUser = async (userId) => {
  try {
    const response = await api.get(`/bookings/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching bookings by user:", error);
    throw error;
  }
};

export const cancelBooking = async (slug, body = {}) => {
  try {
    const response = await api.patch(`/bookings/${slug}/cancel`, body);
    return response.data;
  } catch (error) {
    console.error("Error canceling booking:", error);
    throw error;
  }
};

export const getBookingBySlug = async (slug) => {
  try {
    const response = await api.get(`/bookings/${slug}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching booking by slug:", error);
    throw error;
  }
};

export const checkSeatAvailability = async ({
  busId,
  travelDate,
  seatNumbers,
}) => {
  try {
    const params = { busId, travelDate };
    if (seatNumbers)
      params.seatNumbers = Array.isArray(seatNumbers)
        ? seatNumbers.join(",")
        : seatNumbers;
    const response = await api.get(`/bookings/availability`, { params });
    return response.data;
  } catch (error) {
    console.error("Error checking seat availability:", error);
    throw error;
  }
};
export const getmyBookings = async (params) => {
  try {
    const response = await api.get("/bookings/my-bookings", { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching my bookings:", error);
    throw error;
  }
};
