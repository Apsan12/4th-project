import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getmyBookings } from "../../Services/booking";
import "../booking/Booking.css";

const GetMyBooking = ({ max = 6 }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await getmyBookings({ limit: max });
        if (res && res.success) setBookings(res.data.bookings || res.data);
        else setError(res?.message || "Failed to load bookings");
      } catch (err) {
        setError(
          err?.response?.data?.message ||
            err.message ||
            "Failed to load bookings"
        );
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [max]);

  if (loading) return <div className="card">Loading your bookings...</div>;
  if (error) return <div className="card form-error">{error}</div>;

  return (
    <div className="widget bookings-widget">
      <div className="widget-header">
        <h3>🎫 My Bookings</h3>
        <div className="widget-actions">
          <button
            className="widget-btn"
            onClick={() => navigate("/my-bookings")}
          >
            View All
          </button>
        </div>
      </div>

      {bookings.length === 0 ? (
        <div className="card">
          You have no bookings yet.{" "}
          <button className="link" onClick={() => navigate("/booking")}>
            Book now
          </button>
        </div>
      ) : (
        <div className="booking-list">
          {bookings.slice(0, max).map((b) => (
            <div key={b.slug || b.id} className="booking-item">
              <div className="booking-main">
                <div className="booking-title">
                  {b.bus?.name || b.route?.name || b.bookingReference || b.slug}
                </div>
                <div className="booking-sub">Date: {b.travelDate}</div>
                <div className="booking-sub">
                  Seats:{" "}
                  {Array.isArray(b.seatNumbers)
                    ? b.seatNumbers.join(", ")
                    : b.seatNumbers}
                </div>
              </div>
              <div className="booking-actions">
                <button
                  className="link"
                  onClick={() => navigate(`/bookings/${b.slug || b.id}`)}
                >
                  View
                </button>
                <button
                  className="link"
                  onClick={() => navigate(`/bookings/${b.slug || b.id}/update`)}
                >
                  Update
                </button>
                <button
                  className="link danger"
                  onClick={() => navigate(`/bookings/${b.slug || b.id}/cancel`)}
                >
                  Cancel
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GetMyBooking;
