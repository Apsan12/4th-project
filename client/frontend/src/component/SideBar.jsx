import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./SideBar.css";

const SideBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const sidebarItems = [
    {
      path: "/dashboard",
      icon: "📊",
      label: "Dashboard",
      description: "Overview & Analytics",
    },
    {
      path: "/buses",
      icon: "🚌",
      label: "Buses",
      description: "Manage Bus Fleet",
    },
    {
      path: "/routes",
      icon: "🛣️",
      label: "Routes",
      description: "Bus Routes & Schedules",
    },
    {
      path: "/booking",
      icon: "🎫",
      label: "Booking",
      description: "Book Your Tickets",
    },
    {
      path: "/my-bookings",
      icon: "📋",
      label: "My Bookings",
      description: "View Your Reservations",
    },
    {
      path: "/profile",
      icon: "👤",
      label: "My Profile",
      description: "Account Settings",
    },
    {
      path: "/notifications",
      icon: "🔔",
      label: "Notifications",
      description: "Updates & Alerts",
    },
    {
      path: "/help-support",
      icon: "❓",
      label: "Help & Support",
      description: "Get Assistance",
    },
  ];

  return (
    <div className={`sidebar ${isCollapsed ? "collapsed" : ""}`}>
      {/* Sidebar Header */}
      <div className="sidebar-header">
        <div className="sidebar-brand">
          {!isCollapsed && (
            <>
              <div className="brand-icon">🚌</div>
              <div className="brand-text">
                <h3>Bus Manager</h3>
                <span>Control Panel</span>
              </div>
            </>
          )}
        </div>
        <button
          className="sidebar-toggle"
          onClick={toggleSidebar}
          aria-label="Toggle Sidebar"
        >
          {isCollapsed ? "→" : "←"}
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="sidebar-nav">
        <ul className="sidebar-menu">
          {sidebarItems.map((item, index) => (
            <li key={index} className="sidebar-menu-item">
              <Link
                to={item.path}
                className={`sidebar-link ${
                  isActive(item.path) ? "active" : ""
                }`}
                title={isCollapsed ? item.label : ""}
              >
                <span className="sidebar-icon">{item.icon}</span>
                {!isCollapsed && (
                  <div className="sidebar-content">
                    <span className="sidebar-label">{item.label}</span>
                    <span className="sidebar-description">
                      {item.description}
                    </span>
                  </div>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Sidebar Footer */}
    </div>
  );
};

export default SideBar;
