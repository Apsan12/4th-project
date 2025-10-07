import React from "react";
import "./Footer.css";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Company Section */}
        <div className="footer-section">
          <h3 className="footer-title">Jam Jam Bus</h3>
          <p className="footer-description">
            Your trusted partner for safe, reliable, and comfortable bus
            transportation services. We connect people to their destinations
            with excellence and care.
          </p>
          <div className="social-links">
            <a href="https://www.facebook.com/profile.php?id=61581515226737" className="social-link" aria-label="Facebook">
              📘
            </a>
            <a href="#" className="social-link" aria-label="Twitter">
              🐦
            </a>
            <a href="#" className="social-link" aria-label="Instagram">
              📷
            </a>
            <a href="#" className="social-link" aria-label="LinkedIn">
              💼
            </a>
          </div>
        </div>

        {/* Contact Info */}
        <div className="footer-section">
          <h4 className="footer-subtitle">Contact Info</h4>
          <div className="contact-info">
            <div className="contact-item">
              <span className="contact-icon">📍</span>
              <span>123 Transport Street, City, </span>
            </div>
            <div className="contact-item">
              <span className="contact-icon">📞</span>
              <span>+1 (555) 123-4567</span>
            </div>
            <div className="contact-item">
              <span className="contact-icon">✉️</span>
              <span>info@busmanagement.com</span>
            </div>
            <div className="contact-item">
              <span className="contact-icon">🕒</span>
              <span>24/7 Customer Support</span>
            </div>
          </div>
        </div>

        {/* About Us */}
        <div className="footer-section">
          <h4 className="footer-subtitle">About Us</h4>
          <p className="footer-text">
            Established in 2020, we provide reliable transportation solutions
            with a focus on safety, comfort, and punctuality. Our modern fleet
            serves thousands of passengers daily.
          </p>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom">
        <div className="footer-bottom-container">
          <div className="footer-bottom-left">
            <p>
              &copy; {currentYear} Bus Management System. All rights reserved.
            </p>
          </div>
          <div className="footer-bottom-right">
            <span>Made with ❤️ for better transportation</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
