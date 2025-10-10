import React, { useState } from "react";
import "./botchat.css";
import Navbar from "../component/Navbar";
import Footer from "../component/Fottter";


const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hi! How can I assist you with your bus booking today?" }
  ]);
  const [input, setInput] = useState("");

  const toggleChat = () => setIsOpen(!isOpen);

  const handleSend = () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { sender: "user", text: input }];

    // Simple rule-based responses
    let reply = "Sorry, I didn't understand that.";
    if (input.toLowerCase().includes("ticket")) reply = "You can book tickets from the Home page.";
    if (input.toLowerCase().includes("cancel")) reply = "Visit the 'My Bookings' section to cancel tickets.";
    if (input.toLowerCase().includes("price")) reply = "Ticket prices depend on the route and bus type.";

    newMessages.push({ sender: "bot", text: reply });

    setMessages(newMessages);
    setInput("");
  };

  return (
    <>
      <div className="chat-button" onClick={toggleChat}>
        💬
      </div>

      {isOpen && (
        <div className="chat-container">
          <div className="chat-header">
            Support Bot
            <span className="close-btn" onClick={toggleChat}>×</span>
          </div>

          <div className="chat-body">
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.sender}`}>
                {msg.text}
              </div>
            ))}
          </div>

          <div className="chat-input">
            <input
              type="text"
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <button onClick={handleSend}>Send</button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;
