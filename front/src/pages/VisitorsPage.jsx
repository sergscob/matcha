import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { api } from "../api/client";
import { Spinner } from "../components/Spinner";

const API_URL = import.meta.env.VITE_API_URL;

export function VisitorsPage() {
  const [visitors, setVisitors] = useState(null);
  const [error, setError] = useState(null);
  const [pendingId, setPendingId] = useState(null);

  const load = useCallback(async () => {
    setError(null);

    try {
      setVisitors(await api.get("/profile/visitors"));
    } catch (err) {
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleLikeToggle(visitor) {
    setPendingId(visitor.id);
    setError(null);

    try {
      if (visitor.likedByMe) {
        await api.delete(`/discover/${visitor.id}/like`);
      } else {
        await api.post(`/discover/${visitor.id}/like`);
      }
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

  if (!visitors) {
    return <p className="status">Loading visitors...</p>;
  }

  return (
    <div className="card chat-list-card">
      <h1>Profile visitors</h1>

      {visitors.length === 0 && <p className="status">No one has viewed your profile yet.</p>}

      <ul className="conversation-list">
        {visitors.map(v => (
          <li key={v.id} className="visitor-row">
            <Link to={`/users/${v.id}`} className="conversation-link">
              <div className="discover-card-photo conversation-photo">
                {v.photoUrl
                  ? <img src={`${API_URL}${v.photoUrl}`} alt="" />
                  : <div className="discover-card-placeholder" />}
                {v.isOnline && <span className="online-dot" title="Online now" />}
              </div>

              <div className="conversation-info">
                <strong>{v.firstName} {v.lastName}</strong>
                <span className="status conversation-preview">
                  Viewed your profile on {new Date(v.viewedAt).toLocaleString()}
                </span>
                {v.likedMe && <span className="liked-you-badge">Liked you!</span>}
              </div>
            </Link>

            <button type="button" onClick={() => handleLikeToggle(v)} disabled={pendingId === v.id}>
              {pendingId === v.id && <Spinner />}
              {v.likedByMe ? "Unlike" : "Like"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
