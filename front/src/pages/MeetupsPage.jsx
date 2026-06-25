import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { api } from "../api/client";
import { useSocket } from "../context/useSocket";
import { Spinner } from "../components/Spinner";

const API_URL = import.meta.env.VITE_API_URL;

const STATUS_LABELS = {
  pending: "Pending",
  accepted: "Accepted",
  declined: "Declined",
  cancelled: "Cancelled"
};

export function MeetupsPage() {
  const [meetups, setMeetups] = useState(null);
  const [error, setError] = useState(null);
  const [pendingId, setPendingId] = useState(null);
  const { socket } = useSocket();

  const load = useCallback(async () => {
    try {
      setMeetups(await api.get("/meetups"));
    } catch (err) {
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!socket) return;

    socket.on("meetup:new", load);
    socket.on("meetup:updated", load);

    return () => {
      socket.off("meetup:new", load);
      socket.off("meetup:updated", load);
    };
  }, [socket, load]);

  async function handleAction(id, action) {
    setPendingId(id);
    setError(null);

    try {
      await api.patch(`/meetups/${id}/${action}`);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setPendingId(null);
    }
  }

  if (error) {
    return <p className="error">{error}</p>;
  }

  if (!meetups) {
    return <p className="status">Loading meetups...</p>;
  }

  return (
    <div className="card chat-list-card">
      <h1>Meetups</h1>

      {!meetups.length && (
        <p className="status">No meetups yet. Propose one from a connected user's profile.</p>
      )}

      <ul className="conversation-list">
        { !!meetups.length && meetups.map(m => (
          <li key={m.id} className="visitor-row">
            <Link to={`/users/${m.otherUser.id}`} className="conversation-link">
              <div className="discover-card-photo conversation-photo">
                {m.otherUser.photoUrl
                  ? <img src={`${API_URL}${m.otherUser.photoUrl}`} alt="" />
                  : <div className="discover-card-placeholder" />}
                {m.otherUser.isOnline && <span className="online-dot" title="Online now" />}
              </div>

              <div className="conversation-info">
                <strong>{m.otherUser.firstName} {m.otherUser.lastName}</strong>
                <span className="status conversation-preview">
                  {m.locationLabel} · {new Date(m.scheduledAt).toLocaleString()}
                </span>
                <span className={`meetup-status meetup-status-${m.status}`}>{STATUS_LABELS[m.status]}</span>
              </div>
            </Link>

            <div className="meetup-actions">
              {m.status === "pending" && !m.isProposer && (
                <>
                  <button type="button" onClick={() => handleAction(m.id, "accept")} disabled={pendingId === m.id}>
                    {pendingId === m.id && <Spinner />} Accept
                  </button>
                  <button type="button" className="btn-secondary" onClick={() => handleAction(m.id, "decline")} disabled={pendingId === m.id}>
                    Decline
                  </button>
                </>
              )}
              {(m.status === "pending" || m.status === "accepted") && (
                <button type="button" className="btn-secondary" onClick={() => handleAction(m.id, "cancel")} disabled={pendingId === m.id}>
                  Cancel
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
