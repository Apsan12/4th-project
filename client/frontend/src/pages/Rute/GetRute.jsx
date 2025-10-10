import React, { useState, useEffect } from "react";
import { getAllRutes, getRuteById, searchRutes } from "../../Services/rute";
import { getBusesByRoute } from "../../Services/bus";
import "./GetRute.css";

const GetRute = () => {
  const [routes, setRoutes] = useState([]);
  // don't show global loading on initial mount (we fetch only on user action)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState({
    origin: "",
    destination: "",
  });
  const [isSearching, setIsSearching] = useState(false);
  const [showAllMode, setShowAllMode] = useState(false);
  const [rawResponseText, setRawResponseText] = useState(null);
  const [isFetchingAll, setIsFetchingAll] = useState(false);

  // Fetch all routes on component mount
  // Do NOT fetch all routes on mount. Keep the page simple until user requests.
  useEffect(() => {
    // no-op
  }, []);

  const fetchAllRoutes = async () => {
    try {
      setLoading(true);
      setIsFetchingAll(true);
      setError("");

      // timeout wrapper to avoid long buffering
      const timeoutMs = 12000; // 12s
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Request timed out")), timeoutMs)
      );

      // our service now normalizes to an array
      const response = await Promise.race([getAllRutes(), timeoutPromise]);
      console.log("Routes fetched:", response);
      // response is expected to be an array
      setRoutes(Array.isArray(response) ? response : []);
    } catch (err) {
      console.error("Error fetching routes:", err);
      setError("Failed to fetch routes. " + (err?.message || ""));
      // if timeout or network error, exit show-all mode so UI isn't stuck
      if (
        String(err?.message || "")
          .toLowerCase()
          .includes("timed out") ||
        String(err?.message || "")
          .toLowerCase()
          .includes("network")
      ) {
        setShowAllMode(false);
      }
      setRoutes([]);
    } finally {
      setLoading(false);
      setIsFetchingAll(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.origin && !searchQuery.destination) {
      fetchAllRoutes();
      return;
    }

    try {
      setIsSearching(true);
      setError("");
      const response = await searchRutes(
        searchQuery.origin,
        searchQuery.destination
      );
      setRoutes(Array.isArray(response) ? response : []);
      if (!Array.isArray(response) || response.length === 0) {
        setError("No routes found for the selected criteria.");
      }
    } catch (err) {
      console.error("Error searching routes:", err);
      setError("Failed to search routes. Please try again.");
      setRoutes([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleRouteClick = async (route) => {
    try {
      setSelectedRoute(null);
      const response = await getRuteById(route.id);

      if (response.success && response.route) {
        const routeData = response.route;
        // fetch buses for this route
        try {
          const busesRes = await getBusesByRoute(route.id);
          if (busesRes && busesRes.success) {
            routeData.availableBuses = busesRes.buses || [];
            routeData.availableCount = (busesRes.buses || []).length;
          } else {
            routeData.availableBuses = [];
            routeData.availableCount = 0;
          }
        } catch (busErr) {
          console.warn("Error fetching buses for route", busErr);
          routeData.availableBuses = [];
          routeData.availableCount = 0;
        }

        setSelectedRoute(routeData);
        setShowModal(true);
      }
    } catch (err) {
      console.error("Error fetching route details:", err);
      setError("Failed to fetch route details.");
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedRoute(null);
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${remainingMinutes}m`;
  };

  const formatFare = (fare) => {
    return `NPR ${parseFloat(fare).toFixed(2)}`;
  };

  const clearSearch = () => {
    // Toggle show-all mode: when activated, fetch all routes and disable filters
    setSearchQuery({ origin: "", destination: "" });
    setError("");
    setIsSearching(false);
    setShowAllMode(true);
    fetchAllRoutes();
  };

  if (loading) {
    return (
      <div className="route-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading routes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="route-container">
      <div className="route-header">
        <h1>🚌 Bus Routes</h1>
        <p>Find and explore available bus routes</p>
      </div>

      {showAllMode && rawResponseText && (
        <div
          style={{
            background: "#f8fafc",
            padding: 10,
            borderRadius: 8,
            margin: "10px 0",
            whiteSpace: "pre-wrap",
          }}
        >
          <strong>API raw response (preview, truncated):</strong>
          <pre style={{ maxHeight: 200, overflow: "auto", fontSize: 12 }}>
            {rawResponseText}
          </pre>
        </div>
      )}

      {/* Search Section */}
      <div className="search-section">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-inputs">
            <div className="input-group">
              <label htmlFor="origin">From:</label>
              <input
                type="text"
                id="origin"
                value={searchQuery.origin}
                onChange={(e) =>
                  setSearchQuery({ ...searchQuery, origin: e.target.value })
                }
                placeholder="Enter origin city"
                className="search-input"
              />
            </div>

            <div className="input-group">
              <label htmlFor="destination">To:</label>
              <input
                type="text"
                id="destination"
                value={searchQuery.destination}
                onChange={(e) =>
                  setSearchQuery({
                    ...searchQuery,
                    destination: e.target.value,
                  })
                }
                placeholder="Enter destination city"
                className="search-input"
              />
            </div>
          </div>

          <div className="search-buttons">
            <button
              type="submit"
              className="search-btn"
              disabled={isSearching || showAllMode}
            >
              {isSearching ? "Searching..." : "🔍 Search Routes"}
            </button>

            <button
              type="button"
              onClick={async () => {
                if (showAllMode) {
                  // exit show-all mode and clear list
                  setShowAllMode(false);
                  setSearchQuery({ origin: "", destination: "" });
                  setRoutes([]);
                  setError("");
                } else {
                  // enable show-all mode and fetch
                  setShowAllMode(true);
                  setError("");
                  await fetchAllRoutes();
                }
              }}
              className="clear-btn"
              disabled={isFetchingAll}
            >
              {isFetchingAll
                ? "Loading all..."
                : showAllMode
                ? "✖ Exit Show All"
                : "📋 Show All Routes"}
            </button>
          </div>
        </form>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      {/* Routes Grid */}
      {/* Debug info: shows what's currently in state (helps diagnose rendering issues) */}
      {/* <div
        className="debug-info"
        style={{
          marginBottom: 12,
          padding: 10,
          background: "#fff7ed",
          borderRadius: 8,
        }}
      >
        <strong>Debug:</strong> routes in state = {routes.length}
        <div
          style={{
            marginTop: 8,
            maxHeight: 160,
            overflow: "auto",
            fontSize: 12,
          }}
        >
          <pre style={{ whiteSpace: "pre-wrap" }}>
            {JSON.stringify(routes.slice(0, 3), null, 2)}
          </pre>
        </div>
      </div> */}
      <div className="routes-grid">
        {routes.length === 0 ? (
          <div className="no-routes">
            <div className="no-routes-icon">🚌</div>
            <h3>No Routes Available</h3>
            <p>No bus routes found matching your criteria.</p>
          </div>
        ) : (
          routes.map((route) => (
            <div
              key={route.id}
              className="route-card"
              onClick={() => handleRouteClick(route)}
            >
              <div className="route-header-card">
                <div className="route-code">{route.routeCode}</div>
                <div className="route-status">
                  <span
                    className={`status-badge ${
                      route.isActive ? "active" : "inactive"
                    }`}
                  >
                    {route.isActive ? "✅ Active" : "❌ Inactive"}
                  </span>
                </div>
              </div>

              <div className="route-title">
                <h3>{route.routeName}</h3>
              </div>

              <div className="route-journey">
                <div className="journey-points">
                  <div className="origin">
                    <span className="point-label">FROM</span>
                    <span className="point-name">{route.origin}</span>
                  </div>

                  <div className="journey-arrow">
                    <span>→</span>
                  </div>

                  <div className="destination">
                    <span className="point-label">TO</span>
                    <span className="point-name">{route.destination}</span>
                  </div>
                </div>
              </div>

              <div className="route-details">
                <div className="detail-item">
                  <span className="detail-icon">📏</span>
                  <span className="detail-label">Distance:</span>
                  <span className="detail-value">{route.distance} km</span>
                </div>

                <div className="detail-item">
                  <span className="detail-icon">⏱️</span>
                  <span className="detail-label">Duration:</span>
                  <span className="detail-value">
                    {formatDuration(route.estimatedDuration)}
                  </span>
                </div>

                <div className="detail-item">
                  <span className="detail-icon">💰</span>
                  <span className="detail-label">Fare:</span>
                  <span className="detail-value">{formatFare(route.fare)}</span>
                </div>
              </div>

              {route.stops && route.stops.length > 0 && (
                <div className="stops-preview">
                  <span className="stops-icon">🚏</span>
                  <span className="stops-text">{route.stops.length} stops</span>
                </div>
              )}

              <div className="route-footer">
                <button className="view-details-btn">👁️ View Details</button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Route Details Modal */}
      {showModal && selectedRoute && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedRoute.routeName}</h2>
              <button className="close-btn" onClick={closeModal}>
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="route-info-grid">
                <div className="info-section">
                  <h4>🚌 Route Information</h4>
                  <div className="info-details">
                    <p>
                      <strong>Route Code:</strong> {selectedRoute.routeCode}
                    </p>
                    <p>
                      <strong>Origin:</strong> {selectedRoute.origin}
                    </p>
                    <p>
                      <strong>Destination:</strong> {selectedRoute.destination}
                    </p>
                    <p>
                      <strong>Distance:</strong> {selectedRoute.distance} km
                    </p>
                    <p>
                      <strong>Estimated Duration:</strong>{" "}
                      {formatDuration(selectedRoute.estimatedDuration)}
                    </p>
                    <p>
                      <strong>Fare:</strong> {formatFare(selectedRoute.fare)}
                    </p>
                    <p>
                      <strong>Status:</strong>
                      <span
                        className={`status-badge ${
                          selectedRoute.isActive ? "active" : "inactive"
                        }`}
                      >
                        {selectedRoute.isActive ? "✅ Active" : "❌ Inactive"}
                      </span>
                    </p>
                  </div>
                </div>

                {selectedRoute.description && (
                  <div className="info-section">
                    <h4>📝 Description</h4>
                    <div className="description-content">
                      <p>{selectedRoute.description}</p>
                    </div>
                  </div>
                )}

                {selectedRoute.stops && selectedRoute.stops.length > 0 && (
                  <div className="info-section">
                    <h4>🚏 Bus Stops ({selectedRoute.stops.length})</h4>
                    <div className="stops-list">
                      {selectedRoute.stops.map((stop, index) => (
                        <div key={index} className="stop-item">
                          <span className="stop-number">
                            {stop.order || index + 1}
                          </span>
                          <span className="stop-name">{stop.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="info-section">
                  <h4>🕐 Schedule Information</h4>
                  <div className="schedule-note">
                    <p>
                      📅 <strong>Operating Days:</strong> Daily
                    </p>
                    <p>
                      🕕 <strong>Service Hours:</strong> 6:00 AM - 10:00 PM
                    </p>
                    <p>
                      ⏰ <strong>Frequency:</strong> Every 30-45 minutes
                    </p>
                    <p className="note-text">
                      <em>
                        Note: Actual departure times may vary based on traffic
                        and weather conditions. Please check with the bus
                        station for real-time schedules.
                      </em>
                    </p>
                  </div>
                </div>

                {/* Available buses for this route */}
                <div className="info-section">
                  <h4>
                    🚌 Available Buses ({selectedRoute.availableCount || 0})
                  </h4>
                  <div className="buses-list">
                    {selectedRoute.availableBuses &&
                    selectedRoute.availableBuses.length > 0 ? (
                      selectedRoute.availableBuses.map((bus) => (
                        <div key={bus.id} className="bus-item">
                          <img
                            src={bus.imageUrl || "/placeholder-bus.png"}
                            alt={bus.busNumber}
                            className="bus-thumb"
                          />
                          <div className="bus-info">
                            <div className="bus-number">
                              {bus.busNumber} · {bus.busType}
                            </div>
                            <div className="bus-meta">
                              Capacity: {bus.capacity} · Status: {bus.status}
                            </div>
                            <div className="bus-desc">
                              {bus.description || ""}
                            </div>
                          </div>
                          <div className="bus-action">
                            <button className="select-bus-btn">
                              Select / Book
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p>No buses available for this route right now.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="close-modal-btn" onClick={closeModal}>
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GetRute;
