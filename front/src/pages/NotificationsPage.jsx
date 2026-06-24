import { useEffect, useState } from "react";

import { api } from "../api/client";

const TYPE_LABELS = {
  like: "liked you",
  unlike: "is no longer connected with you",
  profile_view: "viewed your profile",
  message: "sent you a message",
  match: "matched with you"
};

export function NotificationsPage() {
  const [notifications, setNotifications] = useState(null);

  async function load() {
    setNotifications(await api.get("/notifications"));
  }

  useEffect(() => {
    load();
  }, []);

  async function handleMarkAllRead() {
    await api.post("/notifications/read-all");
    load();
  }

  if (!notifications) {
    return <p className="status">Loading notifications...</p>;
  }

  return (
    <div className="card notifications-card">
      <h1>Notifications</h1>

      {notifications.length > 0 && (
        <button type="button" onClick={handleMarkAllRead}>Mark all as read</button>
      )}

      {notifications.length === 0 && <p className="status">No notifications yet.</p>}

      <ul className="notification-list">
        {notifications.map(n => (
          <li key={n.id} className={n.isRead ? "" : "unread"}>
            <strong>{n.actor?.username || "Someone"}</strong> {TYPE_LABELS[n.type] || n.type}
            <span className="notification-time">{new Date(n.createdAt).toLocaleString()}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
