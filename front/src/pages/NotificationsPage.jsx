import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { api } from "../api/client";
import { Spinner } from "../components/Spinner";

import { useSocket } from "../context/useSocket";

const TYPE_LABELS = {
  like: "liked you",
  unlike: "is no longer connected with you",
  profile_view: "viewed your profile",
  message: "sent you a message",
  match: "matched with you",
  meetup_invite: "proposed a meetup",
  meetup_accepted: "accepted your meetup invite",
  meetup_declined: "declined your meetup invite",
  meetup_cancelled: "cancelled a meetup"
};

export function NotificationsPage() {
  const [notifications, setNotifications] = useState(null);
  const [error, setError] = useState(null);
  const [markingRead, setMarkingRead] = useState(false);

  const { refreshCounts } = useSocket();

  async function load() {
    setError(null);

    try {
      setNotifications(await api.get("/notifications"));
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleMarkAllRead() {
    setMarkingRead(true);

    try {
      await api.post("/notifications/read-all");
      await refreshCounts();
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setMarkingRead(false);
    }
  }

  if (error) {
    return <p className="error">{error}</p>;
  }

  if (!notifications) {
    return <p className="status">Loading notifications...</p>;
  }

  return (
    <div className="card notifications-card">
      <h1>Notifications</h1>

      {notifications.length > 0 && (
        <button type="button" onClick={handleMarkAllRead} disabled={markingRead}>
          {markingRead && <Spinner />}
          Mark all as read
        </button>
      )}

      {notifications.length === 0 && <p className="status">No notifications yet.</p>}

      <ul className="notification-list">
        {notifications.map(n => (
          <li key={n.id} className={n.isRead ? "" : "unread"}>
            <Link to={'/users/'+n.actor?.id}><strong>{n.actor?.username || "Someone"}</strong></Link>
            {TYPE_LABELS[n.type] || n.type}
            <span className="notification-time">{new Date(n.createdAt).toLocaleString()}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
