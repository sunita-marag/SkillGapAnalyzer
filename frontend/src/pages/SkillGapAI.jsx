import React, { useState } from "react";
import "../styles/SkillGapAI.css";

function SkillGapAI() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      type: "ai",
      text: "Hello! I'm SkillGap AI. Ask me about skills, learning paths, projects or career preparation."
    }
  ]);

  const sendMessage = () => {
    if (!message.trim()) return;

    setMessages([
      ...messages,
      {
        type: "user",
        text: message
      },
      {
        type: "ai",
        text: "That's a great question. Based on your current profile, I recommend focusing on practical projects, problem solving and the skills required for your target career."
      }
    ]);

    setMessage("");
  };

  return (
    <div className="ai-page">

      <div className="ai-header">

        <div>
          <h1>SkillGap AI</h1>
          <p>Your AI-powered learning and career assistant.</p>
        </div>

        <div className="ai-status">
          ● AI Online
        </div>

      </div>


      <div className="ai-container">

        <div className="chat-area">

          {messages.map((item, index) => (
            <div
              key={index}
              className={`chat-message ${item.type}`}
            >
              <div className="chat-avatar">
                {item.type === "ai" ? "🤖" : "👤"}
              </div>

              <div className="chat-bubble">
                {item.text}
              </div>
            </div>
          ))}

        </div>


        <div className="ai-input-area">

          <input
            type="text"
            placeholder="Ask SkillGap AI..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                sendMessage();
              }
            }}
          />

          <button onClick={sendMessage}>
            Send →
          </button>

        </div>

      </div>

    </div>
  );
}

export default SkillGapAI;