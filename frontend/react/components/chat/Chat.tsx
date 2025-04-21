import React, { useState, useRef, useEffect } from "react";
import { useWorkspace } from "../../context/WorkspaceContext";
import UserAvatar from "../shared/UserAvatar";
import "./Chat.css";

const Chat: React.FC = () => {
  const { state, sendMessage, setTyping } = useWorkspace();
  const { messages, users, currentUser, typingUsers } = state;

  const [isExpanded, setIsExpanded] = useState(false);
  const [messageInput, setMessageInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isExpanded && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isExpanded]);

  useEffect(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (isTyping) {
      setTyping(true);
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        setTyping(false);
      }, 2000);
    } else {
      setTyping(false);
    }

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [isTyping, setTyping]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageInput(e.target.value);
    if (!isTyping && e.target.value.length > 0) {
      setIsTyping(true);
    } else if (e.target.value.length === 0) {
      setIsTyping(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageInput.trim()) {
      sendMessage(messageInput);
      setMessageInput("");
      setIsTyping(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // Filter out typing indicators for users who have messages as the most recent actions
  const getTypingUsers = () => {
    if (!messages.length)
      return Object.keys(typingUsers).filter((id) => typingUsers[id]);

    return Object.keys(typingUsers).filter((id) => {
      if (!typingUsers[id]) return false;

      // Don't show typing for the current user
      if (id === currentUser?.id) return false;

      // Check if the user's last message is the most recent activity
      const userLastMessageIndex = messages
        .map((msg) => msg.userId)
        .lastIndexOf(id);

      return userLastMessageIndex !== messages.length - 1;
    });
  };

  const typingUsersList = getTypingUsers();

  return (
    <div className={`chat-container ${isExpanded ? "expanded" : "collapsed"}`}>
      <div className="chat-header" onClick={() => setIsExpanded(!isExpanded)}>
        <h3>Team Chat</h3>
        <button className="toggle-button">{isExpanded ? "▼" : "▲"}</button>
      </div>

      {isExpanded && (
        <>
          <div className="messages-container">
            {messages.length === 0 ? (
              <div className="no-messages">
                No messages yet. Start the conversation!
              </div>
            ) : (
              messages.map((message) => {
                const sender = users.find(
                  (user) => user.id === message.userId
                ) || {
                  id: message.userId,
                  name: message.userId === "system" ? "System" : "Unknown User",
                  avatar: "default",
                  status: "active" as const,
                };

                const isCurrentUser = sender.id === currentUser?.id;

                return (
                  <div
                    key={message.id}
                    className={`message ${isCurrentUser ? "current-user" : ""}`}
                  >
                    <div className="message-avatar">
                      <UserAvatar
                        name={sender.name}
                        avatar={sender.avatar}
                        status={sender.status}
                        size="small"
                        showStatus={false}
                      />
                    </div>
                    <div className="message-content">
                      <div className="message-header">
                        <span className="sender-name">{sender.name}</span>
                        <span className="timestamp">
                          {formatTime(message.createdAt)}
                        </span>
                      </div>
                      <div className="message-text">{message.text}</div>
                    </div>
                  </div>
                );
              })
            )}

            {typingUsersList.length > 0 && (
              <div className="typing-indicators">
                {typingUsersList.map((userId) => {
                  const typingUser = users.find((user) => user.id === userId);
                  if (!typingUser) return null;

                  return (
                    <div key={`typing-${userId}`} className="typing-indicator">
                      <UserAvatar
                        name={typingUser.name}
                        avatar={typingUser.avatar}
                        status={typingUser.status}
                        size="small"
                        showStatus={false}
                      />
                      <span>{typingUser.name} is typing...</span>
                    </div>
                  );
                })}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className="message-input-form" onSubmit={handleSubmit}>
            <input
              type="text"
              value={messageInput}
              onChange={handleInputChange}
              placeholder="Type a message..."
              className="message-input"
            />
            <button
              type="submit"
              className="send-button"
              disabled={!messageInput.trim()}
            >
              Send
            </button>
          </form>
        </>
      )}
    </div>
  );
};

export default Chat;
