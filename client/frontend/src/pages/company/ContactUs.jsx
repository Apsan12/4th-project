import React, { useState } from "react";
import Navbar from "../../component/Navbar";
import Footer from "../../component/Fottter";
import "./ContactUs.css";

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setSubmitMessage(
        "Thank you! Your message has been sent successfully. We will get back to you soon."
      );
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
    } catch (error) {
      setSubmitMessage(
        "Sorry, there was an error sending your message. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-page">
      <Navbar />
      <div className="contact-main-content">
        <div className="contact-container">
          {/* Hero Section */}
          <section className="contact-hero">
            <h1 className="contact-title">Contact Us</h1>
            <p className="contact-subtitle">
              Get in touch with us for any questions, support, or feedback
            </p>
          </section>

          <div className="contact-content">
            {/* Contact Information */}
            <div className="contact-info-section">
              <h2 className="section-title">Get In Touch</h2>

              <div className="contact-methods">
                <div className="contact-method">
                  <div className="method-icon">📍</div>
                  <div className="method-details">
                    <h3>Visit Us</h3>
                    <p>Kathmandu, Nepal</p>
                    <p>United States</p>
                  </div>
                </div>

                <div className="contact-method">
                  <div className="method-icon">📞</div>
                  <div className="method-details">
                    <h3>Call Us</h3>
                    <p>
                      <strong>Main:</strong> +977 981-6653664
                    </p>
                    <p>
                      <strong>Support:</strong> +977 986-6108306
                    </p>
                    <p>
                      <strong>Emergency:</strong> +977 976-2861032
                    </p>
                  </div>
                </div>

                <div className="contact-method">
                  <div className="method-icon">✉️</div>
                  <div className="method-details">
                    <h3>Email Us</h3>
                    <p>
                      <strong>General:</strong> attenhng9703gmail.com
                    </p>
                    <p>
                      <strong>Support:</strong> bhattadipendra27gmail.com
                    </p>
                    <p>
                      <strong>Bookings:</strong> apsanneupane123gmail.com
                    </p>
                  </div>
                </div>

                <div className="contact-method">
                  <div className="method-icon">🕒</div>
                  <div className="method-details">
                    <h3>Business Hours</h3>
                    <p>24/7 Open</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="contact-form-section">
              <h2 className="section-title">Send Us a Message</h2>

              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name">Full Name *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="email">Email Address *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="phone">Phone Number</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Enter your phone number"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="subject">Subject *</label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select a subject</option>
                      <option value="general">General Inquiry</option>
                      <option value="booking">Booking Support</option>
                      <option value="complaint">Complaint</option>
                      <option value="feedback">Feedback</option>
                      <option value="lost-found">Lost & Found</option>
                      <option value="partnership">Partnership</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="message">Message *</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows="6"
                    placeholder="Enter your message here..."
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="submit-button"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="loading-spinner"></span>
                      Sending Message...
                    </>
                  ) : (
                    "Send Message"
                  )}
                </button>

                {submitMessage && (
                  <div
                    className={`submit-message ${
                      submitMessage.includes("error") ? "error" : "success"
                    }`}
                  >
                    {submitMessage}
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* FAQ Section */}
          <section className="faq-section">
            <h2 className="section-title">Frequently Asked Questions</h2>
            <div className="faq-grid">
              <div className="faq-item">
                <h3>How can I book a ticket?</h3>
                <p>
                  You can book tickets online through our website, mobile app,
                  or by visiting our ticket counters at bus stations.
                </p>
              </div>
              <div className="faq-item">
                <h3>What is your cancellation policy?</h3>
                <p>
                  Tickets can be cancelled up to 2 hours before departure time.
                  Cancellation charges may apply based on the time of
                  cancellation.
                </p>
              </div>
              <div className="faq-item">
                <h3>Do you provide refunds?</h3>
                <p>
                  Yes, refunds are provided according to our refund policy. The
                  amount depends on when you cancel your booking.
                </p>
              </div>
              <div className="faq-item">
                <h3>How can I track my bus?</h3>
                <p>
                  You can track your bus in real-time using our mobile app or
                  website by entering your ticket number or route details.
                </p>
              </div>
            </div>
          </section>

          {/* Emergency Contact */}
          <section className="emergency-section">
            <div className="emergency-content">
              <h2>Emergency Contact</h2>
              <p>For any emergencies or urgent assistance while traveling:</p>
              <div className="emergency-number">📞 +977</div>
              <p>Available 24/7 for passenger safety and support</p>
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ContactUs;
