import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getBusByNumber } from "../../Services/bus";
import Navbar from "../../component/Navbar";
import Fottter from "../../component/Fottter";
import "./Bus.css";

const Bus = () => {
  const { busNumber } = useParams();
  const navigate = useNavigate();
  const [bus, setBus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!busNumber) {
      setError("Invalid bus selected");
      setLoading(false);
      return;
    }
    (async () => {
      try {
        setLoading(true);
        const res = await getBusByNumber(busNumber);
        if (res && res.success && res.bus) {
          setBus(res.bus);
        } else {
          setError("Bus not found");
        }
      } catch (err) {
        console.error("Error fetching bus:", err);
        setError("Failed to load bus details");
      } finally {
        setLoading(false);
      }
    })();
  }, [busNumber, navigate]);

  if (loading)
    return (
      <div className="page-wrap">
        <Navbar />
        <main className="bus-page container">Loading bus...</main>
        <Fottter />
      </div>
    );

  if (error)
    return (
      <div className="page-wrap">
        <Navbar />
        <main className="bus-page container error">{error}</main>
        <Fottter />
      </div>
    );

  return (
    <div className="page-wrap">
      <Navbar />

      <main className="bus-page container">
        <section className="bus-hero card">
          <div className="hero-media">
            <img
              src={bus.imageUrl || "/placeholder-bus.png"}
              alt={bus.busNumber}
            />
            <div
              className={`status-badge ${
                bus.status?.toLowerCase() === "available"
                  ? "available"
                  : "unavailable"
              }`}
            >
              {bus.status || "Unknown"}
            </div>
          </div>

          <div className="hero-info">
            <div className="title-row">
              <h1 className="bus-number">{bus.busNumber}</h1>
              <div className="seat-count">{bus.capacity} seats</div>
            </div>

            <div className="subline">
              {bus.busType || "Standard"} ·{" "}
              {bus.route
                ? bus.route.routeName
                : "Route information unavailable"}
            </div>

            <p className="bus-desc">
              {bus.description || "No additional description available."}
            </p>

            <div className="chips">
              <span className="chip">Plate: {bus.plateNumber || "—"}</span>
              <span className="chip">Driver: {bus.driverName || "—"}</span>
              <span className="chip">Year: {bus.yearOfManufacture || "—"}</span>
            </div>

            <div className="actions-row">
              <button
                className="btn primary large"
                onClick={() => navigate(`/bus/${bus.busNumber}`)}
              >
                View Details
              </button>
              <button className="btn outline large">Book Tickets</button>
            </div>
          </div>
        </section>

        <section className="seat-map card">
          <h3>Seat map (preview)</h3>
          <div className="seat-grid">
            {Array.from({ length: bus.capacity || 0 }).map((_, i) => (
              <div key={i} className={`seat ${i % 3 === 0 ? "aisle" : ""}`}>
                {" "}
                {i + 1}{" "}
              </div>
            ))}
          </div>
          <p className="muted">
            This is a simplified preview. Seat selection will be available at
            booking.
          </p>
        </section>
      </main>

      <Fottter />
    </div>
  );
};

export default Bus;
