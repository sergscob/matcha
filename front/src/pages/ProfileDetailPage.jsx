import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { api } from "../api/client";
import { Spinner } from "../components/Spinner";

const API_URL = import.meta.env.VITE_API_URL;

export function ProfileDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [pendingAction, setPendingAction] = useState(null);

  const load = useCallback(async () => {
    setError(null);

    try {
      setProfile(await api.get(`/discover/${id}`));
    } catch (err) {
      setError(err.message);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleLikeToggle() {
    setPendingAction("like");
    setMessage(null);

    try {
      if (profile.hasLiked) {
        await api.delete(`/discover/${id}/like`);
      } else {
        await api.post(`/discover/${id}/like`);
      }
      await load();
    } catch (err) {
      setMessage(err.message);
    } finally {
      setPendingAction(null);
    }
  }

  async function handleBlock() {
    setPendingAction("block");

    try {
      await api.post(`/discover/${id}/block`);
      navigate(-1);
    } catch (err) {
      setMessage(err.message);
      setPendingAction(null);
    }
  }

  async function handleReport() {
    setPendingAction("report");
    setMessage(null);

    try {
      await api.post(`/discover/${id}/report`);
      setMessage("Thanks, this account has been reported.");
    } catch (err) {
      setMessage(err.message);
    } finally {
      setPendingAction(null);
    }
  }

  if (error) {
    return <p className="error">{error}</p>;
  }

  if (!profile) {
    return <p className="status">Loading profile...</p>;
  }

  return (
    <div className="card profile-card">
      <div className="photo-grid">
        {profile.photos.map(photo => (
          <div key={photo.id} className="photo-tile">
            <img src={`${API_URL}${photo.url}`} alt="" />
          </div>
        ))}
        {profile.photos.length === 0 && <p className="status">No photos yet.</p>}
      </div>

      <h1>
        {profile.firstName} {profile.lastName} <span className="status">@{profile.username}</span>
      </h1>

      <p className="status">
        {profile.gender=='female' ? "F" : profile.gender=='male' ? "M" : "?"}
        {" · "}
        {profile.sexualOrientation=='bisexual' ? "bisexual" : 
          profile.sexualOrientation=='heterosexual' ? "heterosexual" : profile.sexualOrientation=='homosexual' ? "homosexual" : "?"}
      </p>
      <p className="status">

        {profile.locationLabel || "Location not set"} · Popularity {profile.popularityScore}
        {" · "}
        {profile.isOnline
          ? "Online now"
          : profile.lastSeen
            ? `Last seen ${new Date(profile.lastSeen).toLocaleString()}`
            : "Never connected"}
      </p>

      {profile.isConnected && <p className="status liked">You are connected with {profile.firstName}.</p>}
      {!profile.isConnected && profile.likedByThem && <p className="status liked">{profile.firstName} liked you!</p>}

      {profile.bio && <p>{profile.bio}</p>}

      <div className="tag-list">
        {profile.tags.map(tag => <span key={tag} className="tag-chip"><span className="tag-chip-label">#{tag}</span></span>)}
      </div>


      <div className="profile-actions-row">
        <button type="button" onClick={handleLikeToggle} disabled={Boolean(pendingAction)}>
          {pendingAction === "like" && <Spinner />}
          {profile.hasLiked ? "Unlike" : "Like"}
        </button>
        {profile.isConnected && (
          <button type="button" onClick={() => navigate(`/chat/${id}`)}>Message</button>
        )}
        <button type="button" className="btn-secondary" onClick={handleBlock} disabled={Boolean(pendingAction)}>
          {pendingAction === "block" && <Spinner />}
          Block
        </button>
        <button type="button" className="btn-secondary" onClick={handleReport} disabled={Boolean(pendingAction)}>
          {pendingAction === "report" && <Spinner />}
          Report fake account
        </button>
      </div>
        {message && <p className="status">{message}</p>}
    </div>
  );
}
