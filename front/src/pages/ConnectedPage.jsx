import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { api } from "../api/client";

const API_URL = import.meta.env.VITE_API_URL;

export function ConnectedPage() {
  const [connections, setConnections] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const load = useCallback(async () => {
    setError(null);

    try {
      setConnections(await api.get("/discover/connected"));
    } catch (err) {
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (error) {
    return <p className="error">{error}</p>;
  }

  if (!connections) {
    return <p className="status">Loading connections...</p>;
  }

  return (
    <div className="card chat-list-card">
      <h1>Connected</h1>

      {connections.length === 0 && (
        <p className="status">No connections yet. You're connected once you and someone else like each other.</p>
      )}

      <ul className="conversation-list">
        {connections.map(c => (
          <li key={c.id} className="visitor-row">
            <Link to={`/users/${c.id}`} className="conversation-link">
              <div className="discover-card-photo conversation-photo">
                {c.photoUrl
                  ? <img src={`${API_URL}${c.photoUrl}`} alt="" />
                  : <div className="discover-card-placeholder" />}
                {c.isOnline && <span className="online-dot" title="Online now" />}
              </div>

              <div className="conversation-info">
                <strong>{c.firstName} {c.lastName}</strong>
                <span className="status conversation-preview">
                  Connected since {new Date(c.connectedAt).toLocaleDateString()}
                </span>
              </div>
            </Link>

            <button type="button" onClick={() => navigate(`/chat/${c.id}`)}>Message</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
