import React, { useState, useEffect } from "react";
import { getAllRutes, getRuteById, searchRutes } from "../../Services/rute";
import "./GetRute.css";

const GetRute = () => {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState({
    origin: "",
    destination: "",
  });
  const [isSearching, setIsSearching] = useState(false);

  // Fetch all routes on component mount
  useEffect(() => {
    fetchAllRoutes();
  }, []);

  const fetchAllRoutes = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getAllRutes();
      console.log("Routes fetched:", response);

      if (response.success && response.routes) {
        setRoutes(response.routes);
      } else {
        setRoutes([]);
      }
    } catch (err) {
      console.error("Error fetching routes:", err);
      setError("Failed to fetch routes. Please try again later.");
      setRoutes([]);
    } finally {
      setLoading(false);
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

      if (response.success && response.routes) {
        setRoutes(response.routes);
      } else {
        setRoutes([]);
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
        setSelectedRoute(response.route);
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
    setSearchQuery({ origin: "", destination: "" });
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
            <button type="submit" className="search-btn" disabled={isSearching}>
              {isSearching ? "Searching..." : "🔍 Search Routes"}
            </button>

            <button type="button" onClick={clearSearch} className="clear-btn">
              📋 Show All Routes
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
