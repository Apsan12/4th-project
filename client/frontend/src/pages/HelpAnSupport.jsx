import React, { useState } from "react";
import "./HelpAnSupport.css";
import Navbar from "../component/Navbar";
import Footer from "../component/Fottter";

const HelpAndSupport = () => {
  const [activeFAQ, setActiveFAQ] = useState(null);

  const toggleFAQ = (index) => {
    setActiveFAQ(activeFAQ === index ? null : index);
  };

  const faqs = [
    {
      question: "How do I book a bus ticket?",
      answer:
        "Go to the Home page, select your source, destination, date, and number of passengers. Then choose a bus and complete payment securely.",
    },
    {
      question: "Can I cancel or reschedule my ticket?",
      answer:
        "Yes, you can cancel or reschedule your ticket under 'My Bookings' before the bus departure time. Cancellation charges may apply.",
    },
    {
      question: "How do I contact customer support?",
      answer:
        "You can reach us anytime via the live chat or by calling our 24/7 helpline: +977-9800000000.",
    },
    {
      question: "Is online payment safe?",
      answer:
        "Yes. All payments are processed securely using SSL encryption and trusted payment gateways.",
    },
  ];

  return (
    <>
      <Navbar />
      <section className="help-container">
        <div className="help-inner">
          <header className="help-header">
            <h1 className="help-title">Help & Support</h1>
            <p className="help-sub">
              Find answers, contact support, and learn how to use our system.
            </p>
          </header>

          <div className="grid-col">
            <div>
              {/* How to Use Guide */}
              <div className="card">
                <h2>How to Book a Ticket</h2>
                <ol className="ol-list">
                  <li>
                    Go to the Home Page and choose your source and destination.
                  </li>
                  <li>
                    Select your preferred travel date and number of seats.
                  </li>
                  <li>Pick your bus and seat layout.</li>
                  <li>Make a secure payment using your preferred method.</li>
                  <li>Download or view your e-ticket under “My Bookings”.</li>
                </ol>
              </div>

              {/* FAQs Section */}
              <div className="card">
                <h2>Frequently Asked Questions (FAQs)</h2>
                <div className="faq-list">
                  {faqs.map((faq, index) => (
                    <div key={index} className="faq-item">
                      <button
                        onClick={() => toggleFAQ(index)}
                        className="faq-question"
                      >
                        <span>{faq.question}</span>
                        <span className="symbol">
                          {activeFAQ === index ? "−" : "+"}
                        </span>
                      </button>
                      {activeFAQ === index && (
                        <p className="faq-answer">{faq.answer}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Feedback Form */}
              <div className="card">
                <h2>Send Feedback</h2>
                <form className="feedback-form">
                  <div className="form-field">
                    <input type="text" placeholder="Your Name" required />
                  </div>
                  <div className="form-field">
                    <input type="email" placeholder="Your Email" required />
                  </div>
                  <div className="form-field">
                    <textarea
                      rows="4"
                      placeholder="Write your message..."
                      required
                    ></textarea>
                  </div>
                  <button type="submit" className="btn-primary">
                    Submit Feedback
                  </button>
                </form>
              </div>
            </div>

            <aside className="right-stack">
              {/* Contact Section */}
              <div className="card">
                <h2>Contact Support</h2>
                <div className="contact-row">
                  <p>
                    📞 Phone:{" "}
                    <span className="muted-small">+977-9800000000</span>
                  </p>
                  <p>
                    📧 Email:{" "}
                    <span className="muted-small">support@busticket.com</span>
                  </p>
                  <p>
                    💬 Live Chat: Available 24/7 on the bottom-right corner of
                    website.
                  </p>
                </div>
              </div>

              <div className="card small-card">
                <h2>Quick Tips</h2>
                <ul className="muted-small">
                  <li>Always keep your booking reference handy.</li>
                  <li>Check cancellation policy before booking.</li>
                  <li>Contact us if you face any payment issues.</li>
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
};

export default HelpAndSupport;
