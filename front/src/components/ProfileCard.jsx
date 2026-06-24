import { Link } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

export function ProfileCard({ profile }) {
  return (
    <Link to={`/users/${profile.id}`} className="discover-card">
      <div className="discover-card-photo">
        {profile.photoUrl
          ? <img src={`${API_URL}${profile.photoUrl}`} alt="" />
          : <div className="discover-card-placeholder" />}
        {profile.isOnline && <span className="online-dot" title="Online now" />}
      </div>

      <div className="discover-card-info">
        <strong>{profile.firstName}{profile.age != null ? `, ${profile.age}` : ""}</strong>
        <span className="status">
          {profile.locationLabel || "Unknown location"}
          {profile.distanceKm != null ? ` · ${profile.distanceKm} km` : ""}
        </span>
        <span className="status">Popularity {profile.popularityScore} · {profile.commonTags} shared tags</span>
      </div>
    </Link>
  );
}
