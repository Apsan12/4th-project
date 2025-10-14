import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { cancelBooking } from "../../Services/booking";
import "./Booking.css";

const CancelBooking = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onCancel = async () => {
    setError("");
    if (!slug) return setError("Invalid booking");
    setLoading(true);
    try {
      const res = await cancelBooking(slug, { reason });
      if (res && res.success) {
        navigate("/my-bookings");
      } else {
        setError(res?.message || "Cancel failed");
      }
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Cancel failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="booking-page container">
      <h2>Cancel booking</h2>
      <p className="muted">
        Provide a short reason for cancellation (optional).
      </p>

      <div className="card" style={{ maxWidth: 640 }}>
        <label>Reason</label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Optional: why are you cancelling?"
        />
        {error && <div className="form-error">{error}</div>}
        <div style={{ marginTop: 12 }}>
          <button className="primary" onClick={onCancel} disabled={loading}>
            {loading ? "Cancelling..." : "Confirm Cancel"}
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
    </main>
  );
};

export default CancelBooking;
