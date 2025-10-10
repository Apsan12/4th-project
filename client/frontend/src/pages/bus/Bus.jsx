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
        <div className="bus-card">
          <div className="bus-media">
            <img
              src={bus.imageUrl || "/placeholder-bus.png"}
              alt={bus.busNumber}
            />
          </div>
          <div className="bus-info">
            <h2>
              {bus.busNumber} 7 {bus.busType}
            </h2>
            <div className="meta-row">
              <span className="meta-item">
                <strong>Capacity:</strong> {bus.capacity}
              </span>
              <span className="meta-item">
                <strong>Status:</strong> {bus.status}
              </span>
              <span className="meta-item">
                <strong>Route:</strong>{" "}
                {bus.route ? bus.route.routeName : "N/A"}
              </span>
            </div>
            <p className="bus-desc">{bus.description}</p>
            <div className="bus-actions">
              <button onClick={() => navigate(-1)} className="btn">
                Back
              </button>
              <button className="btn primary">Book Now</button>
            </div>
          </div>
        </div>
      </main>
      <Fottter />
    </div>
  );
};

export default Bus;
