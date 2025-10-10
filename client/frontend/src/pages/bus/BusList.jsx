import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAvailableBuses } from "../../Services/bus";
import Navbar from "../../component/Navbar";
import Fottter from "../../component/Fottter";
import "./BusList.css";

const BusList = () => {
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await getAvailableBuses();
        if (res && res.success) setBuses(res.buses || []);
        else setBuses([]);
      } catch (err) {
        console.error("Error fetching buses", err);
        setError("Failed to load buses");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const lower = (s = "") => String(s).toLowerCase();

  const filtered = buses.filter((bus) => {
    const matchesSearch =
      !search ||
      lower(bus.busNumber).includes(lower(search)) ||
      lower(bus.busType).includes(lower(search)) ||
      (bus.route && lower(bus.route.routeName || "").includes(lower(search))) ||
      lower(bus.licensePlate || "").includes(lower(search));

    const matchesType = !filterType || bus.busType === filterType;
    const matchesStatus = !filterStatus || bus.status === filterStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  if (loading)
    return (
      <div className="page-wrap">
        <Navbar />
        <main className="bus-list container">
          <div className="loading">Loading buses...</div>
        </main>
        <Fottter />
      </div>
    );

  if (error)
    return (
      <div className="page-wrap">
        <Navbar />
        <main className="bus-list container error">{error}</main>
        <Fottter />
      </div>
    );

  return (
    <div className="page-wrap">
      <Navbar />
      <main className="bus-list container">
        <header className="bus-list-header">
          <div className="bus-header-row">
            <div>
              <h2>Available Buses</h2>
              <p className="muted">
                Find a bus by number, type, route or plate
              </p>
            </div>

            <div className="bus-controls">
              <input
                type="search"
                placeholder="Search buses... (number, type, route, plate)"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="search-input"
              />

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="select-input"
              >
                <option value="">All types</option>
                <option value="standard">Standard</option>
                <option value="luxury">Luxury</option>
                <option value="semi-luxury">Semi-luxury</option>
                <option value="sleeper">Sleeper</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="select-input"
              >
                <option value="">All status</option>
                <option value="available">Available</option>
                <option value="in-transit">In Transit</option>
                <option value="maintenance">Maintenance</option>
                <option value="out-of-service">Out of Service</option>
              </select>
            </div>
          </div>
        </header>

        <div className="bus-grid">
          {filtered.length === 0 ? (
            <div className="no-results">
              No buses found. Try adjusting filters.
            </div>
          ) : (
            filtered.map((bus) => (
              <div key={bus.id} className="bus-card">
                <div className="bus-thumb">
                  <img
                    src={bus.imageUrl || "/placeholder-bus.png"}
                    alt={bus.busNumber}
                  />
                  <div className={`status-badge ${bus.status || "available"}`}>
                    {bus.status || "available"}
                  </div>
                </div>

                <div className="bus-card-info">
                  <div className="bus-top">
                    <h4>{bus.busNumber}</h4>
                    <span className="capacity">{bus.capacity} seats</span>
                  </div>

                  <p className="muted small">
                    {bus.busType} ·{" "}
                    {bus.route?.routeName || bus.routeName || "—"}
                  </p>

                  <div className="bus-meta">
                    <div className="meta-item">
                      Plate: {bus.licensePlate || "—"}
                    </div>
                    <div className="meta-item">
                      Driver: {bus.driver?.name || bus.driverName || "—"}
                    </div>
                  </div>

                  <div className="bus-card-actions">
                    <Link
                      to={`/bus/${encodeURIComponent(bus.busNumber)}`}
                      className="btn primary"
                    >
                      View
                    </Link>
                    <button className="btn outline">Book</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
      <Fottter />
    </div>
  );
};

export default BusList;
