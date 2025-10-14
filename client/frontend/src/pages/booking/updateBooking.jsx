import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { updateBookingStatus, getBookingBySlug } from "../../Services/booking";
import "./Booking.css";

const UpdateBooking = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [paymentStatus, setPaymentStatus] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    if (!slug) return;
    const load = async () => {
      try {
        const res = await getBookingBySlug(slug);
        if (res && res.success) setBooking(res.data.booking);
      } catch (err) {
        setError(
          err?.response?.data?.message ||
            err.message ||
            "Failed to load booking"
        );
      }
    };
    load();
  }, [slug]);

  const onUpdate = async () => {
    setError("");
    if (!slug) return setError("Invalid booking");
    if (!paymentStatus) return setError("Choose payment status");
    setLoading(true);
    try {
      const body = { paymentStatus };
      if (paymentMethod) body.paymentMethod = paymentMethod;
      const res = await updateBookingStatus(slug, body);
      if (res && res.success) {
        navigate(`/bookings/${slug}`);
      } else {
        setError(res?.message || "Update failed");
      }
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="booking-page container">
      <h2>Update booking</h2>
      {booking && (
        <div className="card" style={{ maxWidth: 720 }}>
          <div style={{ marginBottom: 8 }}>
            <strong>Ref:</strong> {booking?.bookingReference || booking?.slug}
          </div>
          <div style={{ marginBottom: 8 }}>
            <strong>Travel date:</strong> {booking?.travelDate}
          </div>
          <label>Payment status</label>
          <select
            value={paymentStatus}
            onChange={(e) => setPaymentStatus(e.target.value)}
          >
            <option value="">Select</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="refunded">Refunded</option>
          </select>

          <label>Payment method (optional)</label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
          >
            <option value="">-- none --</option>
            <option value="cash">Cash</option>
            <option value="card">Card</option>
            <option value="upi">UPI</option>
            <option value="wallet">Wallet</option>
          </select>

          {error && <div className="form-error">{error}</div>}

          <div style={{ marginTop: 12 }}>
            <button className="primary" onClick={onUpdate} disabled={loading}>
              {loading ? "Updating..." : "Update booking"}
            </button>
            <button
              className="link"
              onClick={() => navigate(-1)}
              style={{ marginLeft: 8 }}
            >
              Back
            </button>
          </div>
        </div>
      )}

      {!booking && !error && <p>Loading booking...</p>}
      {error && <div className="form-error">{error}</div>}
    </main>
  );
};

export default UpdateBooking;
