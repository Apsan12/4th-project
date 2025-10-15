import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getmyBookings, cancelBooking } from "../../Services/booking";
import "../booking/Booking.css";
import Navbar from "../../component/Navbar";
import Footer from "../../component/Fottter";

const GetMyBooking = ({ max = 6 }) => {
  const [bookings, setBookings] = useState([]);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");
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
    <>
      <Navbar />
      <div className="widget bookings-widget">
        <div className="widget-header">
          <h3>🎫 My Bookings</h3>
          <div className="widget-actions">
            <button className="widget-btn" onClick={() => navigate("/booking")}>
              Book New
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
          <div style={{ overflowX: "auto" }}>
            <table
              className="booking-table"
              style={{ width: "100%", borderCollapse: "collapse" }}
            >
              <thead>
                <tr style={{ background: "#f8f8f8" }}>
                  <th>Reference</th>
                  <th>Bus</th>
                  <th>Route</th>
                  <th>Date</th>
                  <th>Seats</th>
                  <th>Status</th>
                  <th>Fare</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.slice(0, max).map((b) => (
                  <tr key={b.slug || b.id}>
                    <td>{b.bookingReference || b.slug || b.id}</td>
                    <td>{b.bus?.busNumber || b.bus?.name || "-"}</td>
                    <td>{b.route?.routeName || b.route?.name || "-"}</td>
                    <td>{b.travelDate}</td>
                    <td>
                      {Array.isArray(b.seatNumbers)
                        ? b.seatNumbers.join(", ")
                        : b.seatNumbers}
                    </td>
                    <td>{b.status || b.bookingStatus || "-"}</td>
                    <td>₹{b.fare || b.route?.fare || "-"}</td>
                    <td>
                      <button
                        className="link"
                        onClick={() => navigate(`/bookings/${b.slug || b.id}`)}
                      >
                        View
                      </button>
                      <button
                        className="link"
                        onClick={() =>
                          navigate(`/bookings/${b.slug || b.id}/update`)
                        }
                      >
                        Update
                      </button>
                      <button
                        className="link danger"
                        onClick={() => setDeletingId(b.slug || b.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Delete confirmation modal */}
        {deletingId && (
          <div className="modal-overlay">
            <div className="modal card">
              <h4>Delete Booking</h4>
              <p>Are you sure you want to delete this booking?</p>
              {deleteError && <div className="form-error">{deleteError}</div>}
              <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
                <button
                  className="danger"
                  disabled={deleteLoading}
                  onClick={async () => {
                    setDeleteLoading(true);
                    setDeleteError("");
                    try {
                      await cancelBooking(deletingId);
                      setBookings((prev) =>
                        prev.filter((b) => (b.slug || b.id) !== deletingId)
                      );
                      setDeletingId(null);
                    } catch (err) {
                      setDeleteError(
                        err?.response?.data?.message ||
                          err.message ||
                          "Failed to delete booking"
                      );
                    } finally {
                      setDeleteLoading(false);
                    }
                  }}
                >
                  {deleteLoading ? "Deleting..." : "Delete"}
                </button>
                <button className="link" onClick={() => setDeletingId(null)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default GetMyBooking;
