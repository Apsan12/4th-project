import React, { useState } from "react";
import "./HelpAnSupport.css";

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
    <section className="p-6 md:p-10 bg-gray-50 text-gray-800 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-700 mb-2">
            Help & Support
          </h1>
          <p className="text-gray-600">
            Find answers, contact support, and learn how to use our system.
          </p>
        </header>

        {/* ✅ How to Use Guide */}
        <div className="bg-white shadow-md rounded-2xl p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-3 text-blue-600">
            How to Book a Ticket
          </h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>Go to the Home Page and choose your source and destination.</li>
            <li>Select your preferred travel date and number of seats.</li>
            <li>Pick your bus and seat layout.</li>
            <li>Make a secure payment using your preferred method.</li>
            <li>Download or view your e-ticket under “My Bookings”.</li>
          </ol>
        </div>

        {/* ✅ FAQs Section */}
        <div className="bg-white shadow-md rounded-2xl p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4 text-blue-600">
            Frequently Asked Questions (FAQs)
          </h2>
          {faqs.map((faq, index) => (
            <div key={index} className="border-b py-3">
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full text-left flex justify-between items-center"
              >
                <span className="font-medium text-gray-800">
                  {faq.question}
                </span>
                <span>{activeFAQ === index ? "−" : "+"}</span>
              </button>
              {activeFAQ === index && (
                <p className="text-gray-600 mt-2">{faq.answer}</p>
              )}
            </div>
          ))}
        </div>

        {/* ✅ Contact Section */}
        <div className="bg-white shadow-md rounded-2xl p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4 text-blue-600">
            Contact Support
          </h2>
          <p className="text-gray-700 mb-2">
            📞 Phone: <span className="font-medium">+977-9800000000</span>
          </p>
          <p className="text-gray-700 mb-2">
            📧 Email: <span className="font-medium">support@busticket.com</span>
          </p>
          <p className="text-gray-700 mb-2">
            💬 Live Chat: Available 24/7 on the bottom-right corner of website.
          </p>
        </div>

        {/* ✅ Feedback Form */}
        <div className="bg-white shadow-md rounded-2xl p-6">
          <h2 className="text-2xl font-semibold mb-4 text-blue-600">
            Send Feedback
          </h2>
          <form className="space-y-4">
            <input
              type="text"
              placeholder="Your Name"
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400"
              required
            />
            <input
              type="email"
              placeholder="Your Email"
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400"
              required
            />
            <textarea
              rows="4"
              placeholder="Write your message..."
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400"
              required
            ></textarea>
            <button
              type="submit"
              className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition-all"
            >
              Submit Feedback
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default HelpAndSupport;
