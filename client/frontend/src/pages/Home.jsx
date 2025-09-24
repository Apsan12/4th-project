import { Link } from "react-router-dom";
import "./Home.css";

export default function Home() {
  return (
    <div className="home-container">
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-brand">
          <h2>Jam Jam</h2>
        </div>
        <div className="navbar-buttons">
          <Link to="/login" className="navbar-button">
            Sign In
          </Link>
          <Link to="/register" className="navbar-button sign-up">
            Sign Up
          </Link>
        </div>
      </nav>

      <main className="main-content">
        <h1 className="main-title">Welcome to Jam Jam</h1>
        <p className="main-subtitle">
          Your ultimate solution for seamless bus booking and travel management.
          Book your seats, track your journey, and travel with confidence.
        </p>

        <div className="cta-section">
          <div className="cta-buttons">
            <Link to="/register" className="cta-button primary">
              Get Started
            </Link>
            <Link to="/login" className="cta-button">
              Sign In
            </Link>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🚌</div>
              <h3 className="feature-title">Easy Booking</h3>
              <p className="feature-description">
                Book your bus tickets in just a few clicks with our resposive
                interface
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">📍</div>
              <h3 className="feature-title">Real-time Tracking</h3>
              <p className="feature-description">
                Track your bus location and get live updates on arrival times
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">💳</div>
              <h3 className="feature-title">Secure Payments</h3>
              <p className="feature-description">
                Multiple payment options with bank-level security for your
                transactions
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3 className="feature-title">Route Planning</h3>
              <p className="feature-description">
                Find the best routes and schedules that fit your travel needs
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
