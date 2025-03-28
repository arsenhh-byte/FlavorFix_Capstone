// components/ChatAssistant.jsx
import React, { useState } from "react";
import styles from "../styles/chatAssistant.module.css";

const ChatAssistant = ({ onClose }) => {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hello, I'm your cooking assistant. How can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const userMessage = { role: "user", content: input.trim() };
    const newConversation = [...messages, userMessage];
    setMessages(newConversation);
    setInput("");
    setLoading(true);

    try {
      // POST the entire conversation
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversation: newConversation }),
      });

      if (!response.ok) {
        throw new Error("Chat API error");
      }

      // Log the returned JSON for debugging
      const data = await response.json();
      console.log("Chat API data:", data);

      // data.reply is the text we returned from /api/chat
      const assistantMessage = { role: "assistant", content: data.reply };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, something went wrong with the AIML API." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.chatModalOverlay}>
      <div className={styles.chatModal}>
        <button className={styles.closeButton} onClick={onClose}>×</button>
        <div className={styles.messagesContainer}>
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`${styles.message} ${msg.role === "assistant" ? styles.assistant : styles.user}`}
            >
              {msg.content}
            </div>
          ))}
          {loading && <div className={styles.loading}>Typing...</div>}
        </div>
        <form onSubmit={handleSend} className={styles.inputForm}>
          <input
            type="text"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className={styles.inputField}
          />
          <button type="submit" className={styles.sendButton}>Send</button>
        </form>
      </div>
    </div>
  );
};

export default ChatAssistant;