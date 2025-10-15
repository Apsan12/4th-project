import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getBookingBySlug } from "../../Services/booking";
import Navbar from "../../component/Navbar";
import Footer from "../../component/Footer";

export default function BookingDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await getBookingBySlug(slug);
        setBooking(res.data.booking || res.data || res);
      } catch (err) {
        setError(
          err?.response?.data?.message ||
            err.message ||
            "Failed to load booking"
        );
      } finally {
        setLoading(false);
      }
    };
    if (slug) load();
  }, [slug]);

  return (
    <>
      <Navbar />
      <div style={{ maxWidth: 900, margin: "24px auto", padding: 16 }}>
        {loading ? (
          <div className="card">Loading booking...</div>
        ) : error ? (
          <div className="card form-error">
            <h3>Error</h3>
            <div>{error}</div>
            <div style={{ marginTop: 12 }}>
              <button onClick={() => navigate(-1)}>Go Back</button>
            </div>
          </div>
        ) : !booking ? (
          <div className="card">
            Booking not found.
            <div style={{ marginTop: 12 }}>
              <button onClick={() => navigate(-1)}>Go Back</button>
            </div>
          </div>
        ) : (
          <div className="card">
            <h2>Booking Details</h2>
            <p>
              <strong>Reference:</strong>{" "}
              {booking.bookingReference || booking.slug}
            </p>
            <p>
              <strong>Status:</strong> {booking.status}
            </p>
            <p>
              <strong>Travel Date:</strong> {booking.travelDate}
            </p>
            <p>
              <strong>Seats:</strong>{" "}
              {Array.isArray(booking.seatNumbers)
                ? booking.seatNumbers.join(", ")
                : booking.seatNumbers}
            </p>
            <p>
              <strong>Bus:</strong>{" "}
              {booking.bus?.busNumber || booking.bus?.name || "-"}
            </p>
            <p>
              <strong>Route:</strong>{" "}
              {booking.bus?.route?.routeName || booking.route?.routeName || "-"}
            </p>
            <p>
              <strong>Passenger(s):</strong>{" "}
              {Array.isArray(booking.passengerNames)
                ? booking.passengerNames.join(", ")
                : booking.passengerNames}
            </p>
            <p>
              <strong>Contact:</strong> {booking.contactPhone} |{" "}
              {booking.contactEmail}
            </p>
            <p>
              <strong>Fare:</strong> ₹{booking.totalAmount}
            </p>

            <div style={{ marginTop: 12 }}>
              <button onClick={() => navigate(-1)}>Back</button>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}
