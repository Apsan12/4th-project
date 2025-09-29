import React from "react";
import Navbar from "../../component/Navbar";
import Footer from "../../component/Fottter";
import "./AboutUs.css";

const AboutUs = () => {
  return (
    <div className="about-page">
      <Navbar />
      <div className="about-main-content">
        <div className="about-container">
          {/* Hero Section */}
          <section className="about-hero">
            <h1 className="about-title">About Bus Management</h1>
            <p className="about-subtitle">
              Your trusted partner in safe, reliable, and comfortable
              transportation
            </p>
          </section>

          {/* Company Story */}
          <section className="about-section">
            <h2 className="section-title">Our Story</h2>
            <div className="story-content">
              <p>
                Founded in 2020, Bus Management has grown from a small local
                transport service to a comprehensive bus management system
                serving thousands of passengers daily. Our journey began with a
                simple mission: to provide safe, reliable, and comfortable
                transportation solutions for everyone.
              </p>
              <p>
                Over the years, we have expanded our fleet, upgraded our
                technology, and enhanced our services to meet the evolving needs
                of our customers. Today, we operate across multiple routes,
                connecting communities and making travel accessible for all.
              </p>
            </div>
          </section>

          {/* Mission & Vision */}
          <section className="about-section">
            <div className="mission-vision">
              <div className="mission">
                <h3 className="subsection-title">Our Mission</h3>
                <p>
                  To provide exceptional transportation services that prioritize
                  safety, reliability, and customer satisfaction while
                  contributing to sustainable urban mobility solutions.
                </p>
              </div>
              <div className="vision">
                <h3 className="subsection-title">Our Vision</h3>
                <p>
                  To be the leading bus management company, setting industry
                  standards for service excellence and innovation in public
                  transportation.
                </p>
              </div>
            </div>
          </section>

          {/* Values */}
          <section className="about-section">
            <h2 className="section-title">Our Values</h2>
            <div className="values-grid">
              <div className="value-item">
                <div className="value-icon">🛡️</div>
                <h4>Safety First</h4>
                <p>
                  We prioritize the safety of our passengers and staff above all
                  else.
                </p>
              </div>
              <div className="value-item">
                <div className="value-icon">⏰</div>
                <h4>Reliability</h4>
                <p>Punctual services you can depend on, every single day.</p>
              </div>
              <div className="value-item">
                <div className="value-icon">😊</div>
                <h4>Customer Focus</h4>
                <p>
                  Your comfort and satisfaction are at the heart of everything
                  we do.
                </p>
              </div>
              <div className="value-item">
                <div className="value-icon">🌱</div>
                <h4>Sustainability</h4>
                <p>
                  Committed to eco-friendly practices and reducing our carbon
                  footprint.
                </p>
              </div>
            </div>
          </section>

          {/* Statistics */}
          <section className="about-section stats-section">
            <h2 className="section-title">Our Impact</h2>
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-number">50+</div>
                <div className="stat-label">Buses in Fleet</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">100K+</div>
                <div className="stat-label">Happy Passengers</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">25+</div>
                <div className="stat-label">Routes Covered</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">99%</div>
                <div className="stat-label">On-Time Performance</div>
              </div>
            </div>
          </section>

          {/* Team */}
          <section className="about-section">
            <h2 className="section-title">Leadership Team</h2>
            <div className="team-grid">
              <div className="team-member">
                <div className="member-photo">👨‍💼</div>
                <h4>John Smith</h4>
                <p className="member-role">Chief Executive Officer</p>
                <p className="member-bio">
                  With over 15 years in transportation management, John leads
                  our strategic vision and operational excellence.
                </p>
              </div>
              <div className="team-member">
                <div className="member-photo">👩‍💼</div>
                <h4>Sarah Johnson</h4>
                <p className="member-role">Operations Director</p>
                <p className="member-bio">
                  Sarah oversees daily operations and ensures our high standards
                  of service delivery across all routes.
                </p>
              </div>
              <div className="team-member">
                <div className="member-photo">👨‍🔧</div>
                <h4>Mike Wilson</h4>
                <p className="member-role">Safety Manager</p>
                <p className="member-bio">
                  Mike is responsible for maintaining our fleet and implementing
                  safety protocols to protect our passengers.
                </p>
              </div>
            </div>
          </section>

          {/* Call to Action */}
          <section className="about-cta">
            <h2>Ready to Travel with Us?</h2>
            <p>
              Experience the difference of reliable, comfortable transportation.
            </p>
            <div className="cta-buttons">
              <button className="cta-button primary">Book Your Ticket</button>
              <button className="cta-button secondary">Contact Us</button>
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AboutUs;
