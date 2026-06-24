import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { api } from "../api/client";
import { useSocket } from "../context/useSocket";

const API_URL = import.meta.env.VITE_API_URL;

export function ChatPage() {
  const [conversations, setConversations] = useState(null);
  const [error, setError] = useState(null);
  const { socket } = useSocket();

  const load = useCallback(async () => {
    try {
      setConversations(await api.get("/chat/conversations"));
    } catch (err) {
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!socket) return;

    socket.on("message:new", load);
    return () => socket.off("message:new", load);
  }, [socket, load]);

  if (error) {
    return <p className="error">{error}</p>;
  }

  if (!conversations) {
    return <p className="status">Loading conversations...</p>;
  }

  return (
    <div className="card chat-list-card">
      <h1>Messages</h1>

      {conversations.length === 0 && (
        <p className="status">No conversations yet. You can chat once you and someone else like each other.</p>
      )}

      <ul className="conversation-list">
        {conversations.map(c => (
          <li key={c.id}>
            <Link to={`/chat/${c.id}`} className={`conversation-link${c.unreadCount > 0 ? " unread" : ""}`}>
              <div className="discover-card-photo conversation-photo">
                {c.photoUrl
                  ? <img src={`${API_URL}${c.photoUrl}`} alt="" />
                  : <div className="discover-card-placeholder" />}
                {c.isOnline && <span className="online-dot" title="Online now" />}
              </div>

              <div className="conversation-info">
                <strong>{c.firstName} {c.lastName}</strong>
                <span className="status conversation-preview">
                  {c.lastMessage ? c.lastMessage.body : "Say hello!"}
                </span>
              </div>

              {c.unreadCount > 0 && <span className="notification-badge conversation-badge">{c.unreadCount}</span>}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
