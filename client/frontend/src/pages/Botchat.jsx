import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./botchat.css";

const STORAGE_KEY = "botchat_messages_v1";
const OPEN_KEY = "botchat_open_v1";

const intents = [
  {
    id: "greeting",
    patterns: ["hi", "hello", "hey", "good morning", "good afternoon"],
    response: () => ({
      text: "Hi! 👋 I can help with bookings, cancellations, prices, routes and more. What do you want to do?",
      quick: ["Book tickets", "Find routes", "My bookings", "Contact support"],
    }),
  },
  {
    id: "booking",
    patterns: ["book", "ticket", "buy", "reserve"],
    response: () => ({
      text: "You can book tickets through our booking page. Do you want me to open it for you?",
      quick: ["Open booking page", "How to pick seats"],
    }),
  },
  {
    id: "cancel",
    patterns: ["cancel", "refund", "change my booking"],
    response: () => ({
      text: "To cancel or modify a booking, go to 'My Bookings'. I can open it for you.",
      quick: ["Open My Bookings"],
    }),
  },
  {
    id: "price",
    patterns: ["price", "fare", "cost", "how much"],
    response: () => ({
      text: "Ticket prices depend on route and bus type. Tell me the route or click 'Find routes' to search.",
      quick: ["Find routes"],
    }),
  },
  {
    id: "routes",
    patterns: ["route", "routes", "where", "rute"],
    response: () => ({
      text: "I can show available routes. Open the Routes page?",
      quick: ["Open routes"],
    }),
  },
  {
    id: "buses",
    patterns: ["bus", "buses", "bus number", "find bus"],
    response: () => ({
      text: "Search buses by number, type or plate on the Buses page.",
      quick: ["Open buses"],
    }),
  },
  {
    id: "password",
    patterns: ["password", "reset", "forgot"],
    response: () => ({
      text: "To reset your password open the Reset page and follow the instructions. Need me to open it?",
      quick: ["Open reset page"],
    }),
  },
  {
    id: "upload_error",
    patterns: ["multer", "unexpected field", "upload failed", "file"],
    response: () => ({
      text: "If you see 'Unexpected field' ensure the file field name is 'image' or use the upload button in the form. I can show upload docs.",
    }),
  },
  {
    id: "support",
    patterns: ["support", "contact", "help", "customer"],
    response: () => ({
      text: "You can contact support at support@example.com or open the Help & Support page.",
      quick: ["Open Help & Support"],
    }),
  },
];

function matchIntent(text) {
  const t = text.toLowerCase();
  // exact keyword match or contains
  for (const intent of intents) {
    for (const p of intent.patterns) {
      if (t.includes(p)) return intent.response();
    }
  }
  // fallback: try token overlap
  const tokens = t.split(/\W+/).filter(Boolean);
  let best = null;
  let bestScore = 0;
  for (const intent of intents) {
    const patTokens = intent.patterns.join(" ").split(/\W+/).filter(Boolean);
    const score = tokens.filter((tk) => patTokens.includes(tk)).length;
    if (score > bestScore) {
      bestScore = score;
      best = intent;
    }
  }
  if (best && bestScore > 0) return best.response();
  return null;
}

const ChatBot = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(OPEN_KEY)) ?? false;
    } catch {
      return false;
    }
  });
  const [messages, setMessages] = useState(() => {
    try {
      return (
        JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? [
          {
            sender: "bot",
            text: "Hi! I am here to help you with bookings, routes and support.",
          },
        ]
      );
    } catch {
      return [
        {
          sender: "bot",
          text: "Hi! I am here to help you with bookings, routes and support.",
        },
      ];
    }
  });
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const bodyRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem(OPEN_KEY, JSON.stringify(isOpen));
  }, [isOpen]);

  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [messages, isOpen, isTyping]);

  const toggleChat = () => setIsOpen((s) => !s);

  function pushMessage(msg) {
    setMessages((m) => [...m, msg]);
  }

  const handleQuick = (txt) => {
    // quick replies may be actions
    if (!txt) return;
    if (txt.toLowerCase().startsWith("open")) {
      // open pages based on keyword
      if (txt.toLowerCase().includes("booking")) return navigate("/booking");
      if (txt.toLowerCase().includes("routes")) return navigate("/routes");
      if (txt.toLowerCase().includes("buses")) return navigate("/buses");
      if (txt.toLowerCase().includes("help")) return navigate("/help-support");
      if (txt.toLowerCase().includes("book")) return navigate("/booking");
      if (txt.toLowerCase().includes("my bookings"))
        return navigate("/my-bookings");
      return;
    }
    // otherwise send as user message
    sendMessage(txt);
  };

  const sendMessage = (text) => {
    const trimmed = (text || input || "").trim();
    if (!trimmed) return;
    pushMessage({ sender: "user", text: trimmed });
    setInput("");
    // bot processes
    const intentResponse = matchIntent(trimmed);
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      if (intentResponse) {
        pushMessage({ sender: "bot", text: intentResponse.text });
        if (intentResponse.quick && intentResponse.quick.length) {
          pushMessage({
            sender: "bot",
            text: "Quick actions:",
            quick: intentResponse.quick,
          });
        }
      } else {
        pushMessage({
          sender: "bot",
          text: "I'm not sure I understood. You can try: 'Book tickets', 'Find routes', or 'Contact support'.",
        });
        pushMessage({
          sender: "bot",
          text: "Quick actions:",
          quick: ["Book tickets", "Find routes", "Contact support"],
        });
      }
    }, 600 + Math.random() * 400);
  };

  return (
    <>
      <div
        className="chat-button"
        onClick={toggleChat}
        aria-label="Open support chat"
      >
        💬
      </div>

      {isOpen && (
        <div className="chat-container" role="dialog" aria-label="Support chat">
          <div className="chat-header">
            Support Bot
            <span className="close-btn" onClick={toggleChat} aria-hidden>
              ×
            </span>
          </div>

          <div className="chat-body" ref={bodyRef}>
            {messages.map((msg, idx) => (
              <div key={idx} className={`message ${msg.sender}`}>
                <div className="message-text">{msg.text}</div>
                {msg.quick && (
                  <div className="quick-row">
                    {msg.quick.map((q, i) => (
                      <button
                        key={i}
                        className="quick-btn"
                        onClick={() => handleQuick(q)}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isTyping && <div className="message bot typing">Typing...</div>}
          </div>

          <div className="chat-input">
            <input
              type="text"
              placeholder="Ask anything... e.g. 'How to book'"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              aria-label="Chat input"
            />
            <button onClick={() => sendMessage()} aria-label="Send message">
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;
