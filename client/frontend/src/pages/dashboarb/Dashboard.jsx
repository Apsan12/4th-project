import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { userProfile } from "../../Services/auth";
import Navbar from "../../component/Navbar";
import SideBar from "../../component/SideBar";
import Footer from "../../component/Fottter";
import "./Dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Dashboard stats
  const [dashboardStats, setDashboardStats] = useState({
    totalBookings: 24,
    activeRoutes: 12,
    completedTrips: 156,
    totalDistance: 2840,
  });

  // Recent activities
  const [recentActivities] = useState([
    {
      id: 1,
      type: "booking",
      message: "New booking confirmed",
      time: "2 minutes ago",
      icon: "🎫",
    },
    {
      id: 2,
      type: "route",
      message: "Route #45 completed",
      time: "15 minutes ago",
      icon: "🛣️",
    },
    {
      id: 3,
      type: "payment",
      message: "Payment received",
      time: "1 hour ago",
      icon: "💳",
    },
    {
      id: 4,
      type: "bus",
      message: "Bus #12 maintenance completed",
      time: "2 hours ago",
      icon: "🚌",
    },
    {
      id: 5,
      type: "user",
      message: "Profile updated successfully",
      time: "1 day ago",
      icon: "👤",
    },
  ]);

  // Quick stats for charts
  const [weeklyBookings] = useState([45, 52, 48, 61, 55, 67, 73]);
  const [routePopularity] = useState([
    { route: "City Center - Airport", bookings: 89 },
    { route: "Downtown - University", bookings: 76 },
    { route: "Mall - Residential", bookings: 63 },
    { route: "Station - Business District", bookings: 52 },
  ]);

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    fetchUserData();

    // Update time every second
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timeInterval);
  }, [navigate]);

  const fetchUserData = async () => {
    try {
      const response = await userProfile();
      setUser(response.user);
    } catch (error) {
      console.error("Failed to fetch user data:", error);
      // If token is invalid, redirect to login
      if (error.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString("en-US", {
      hour12: true,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <SideBar />

      {/* Main Content Area */}
      <div
        className={`dashboard-main ${
          sidebarCollapsed ? "sidebar-collapsed" : ""
        }`}
      >
        {/* Navbar */}
        <Navbar />

        {/* Dashboard Content */}
        <div className="dashboard-content">
          {/* Welcome Section */}
          <div className="dashboard-welcome">
            <div className="welcome-content">
              <div className="welcome-text">
                <h1>
                  Welcome back, {user?.firstName || user?.username || "User"}!
                  👋
                </h1>
                <p>
                   Hey there! We have the booking details for you!
                </p>
              </div>
              <div className="welcome-time">
                <div className="current-time">{formatTime(currentTime)}</div>
                <div className="current-date">{formatDate(currentTime)}</div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card bookings">
              <div className="stat-icon">🎫</div>
              <div className="stat-content">
                <h3>Total Bookings</h3>
                <div className="stat-number">
                  {dashboardStats.totalBookings}
                </div>
                <div className="stat-change positive">+12% from last month</div>
              </div>
            </div>

            <div className="stat-card routes">
              <div className="stat-icon">🛣️</div>
              <div className="stat-content">
                <h3>Active Routes</h3>
                <div className="stat-number">{dashboardStats.activeRoutes}</div>
                <div className="stat-change positive">+3 new routes</div>
              </div>
            </div>

            <div className="stat-card trips">
              <div className="stat-icon">🚌</div>
              <div className="stat-content">
                <h3>Completed Trips</h3>
                <div className="stat-number">
                  {dashboardStats.completedTrips}
                </div>
                <div className="stat-change positive">+8% efficiency</div>
              </div>
            </div>

            <div className="stat-card distance">
              <div className="stat-icon">📍</div>
              <div className="stat-content">
                <h3>Total Distance</h3>
                <div className="stat-number">
                  {dashboardStats.totalDistance}km
                </div>
                <div className="stat-change neutral">This month</div>
              </div>
            </div>
          </div>

          {/* Main Dashboard Widgets */}
          <div className="dashboard-widgets">
            {/* Chart Section */}
            <div className="widget chart-widget">
              <div className="widget-header">
                <h3>📊 Weekly Bookings</h3>
                <div className="widget-actions">
                  <button className="widget-btn">View Details</button>
                </div>
              </div>
              <div className="chart-container">
                <div className="chart-bars">
                  {weeklyBookings.map((value, index) => (
                    <div key={index} className="chart-bar">
                      <div
                        className="chart-bar-fill"
                        style={{
                          height: `${
                            (value / Math.max(...weeklyBookings)) * 100
                          }%`,
                        }}
                      ></div>
                      <div className="chart-label">
                        {
                          ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][
                            index
                          ]
                        }
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Activities */}
            <div className="widget activity-widget">
              <div className="widget-header">
                <h3>⚡ Recent Activities</h3>
                <div className="widget-actions">
                  <button className="widget-btn">View All</button>
                </div>
              </div>
              <div className="activity-list">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="activity-item">
                    <div className="activity-icon">{activity.icon}</div>
                    <div className="activity-content">
                      <div className="activity-message">{activity.message}</div>
                      <div className="activity-time">{activity.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Route Popularity & Quick Actions */}
          <div className="dashboard-bottom">
            {/* Route Popularity */}
            <div className="widget route-widget">
              <div className="widget-header">
                <h3>🏆 Popular Routes</h3>
              </div>
              <div className="route-list">
                {routePopularity.map((route, index) => (
                  <div key={index} className="route-item">
                    <div className="route-rank">#{index + 1}</div>
                    <div className="route-details">
                      <div className="route-name">{route.route}</div>
                      <div className="route-stats">
                        {route.bookings} bookings
                      </div>
                    </div>
                    <div className="route-progress">
                      <div
                        className="route-progress-bar"
                        style={{
                          width: `${
                            (route.bookings /
                              Math.max(
                                ...routePopularity.map((r) => r.bookings)
                              )) *
                            100
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="widget actions-widget">
              <div className="widget-header">
                <h3>🚀 Quick Actions</h3>
              </div>
              <div className="actions-grid">
                <button
                  className="action-btn booking-btn"
                  onClick={() => navigate("/booking")}
                >
                  <div className="action-icon">🎫</div>
                  <div className="action-text">Book Ticket</div>
                </button>
                <button
                  className="action-btn routes-btn"
                  onClick={() => navigate("/routes")}
                >
                  <div className="action-icon">🛣️</div>
                  <div className="action-text">View Routes</div>
                </button>
                <button
                  className="action-btn profile-btn"
                  onClick={() => navigate("/profile")}
                >
                  <div className="action-icon">👤</div>
                  <div className="action-text">My Profile</div>
                </button>
                <button
                  className="action-btn help-btn"
                  onClick={() => navigate("/help")}
                >
                  <div className="action-icon">❓</div>
                  <div className="action-text">Get Help</div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
};

export default Dashboard;
