import { useRef, useState } from "react";

import { api } from "../api/client";
import { Spinner } from "./Spinner";

const API_URL = import.meta.env.VITE_API_URL;
const MAX_PHOTO_SIZE = 5 * 1024 * 1024;

export function PhotoGrid({ photos, onChange }) {
  const fileInput = useRef(null);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [pendingId, setPendingId] = useState(null);

  async function handleFileChange(e) {
    const file = e.target.files[0];
    e.target.value = "";
    if (!file) return;

    setError(null);

    if (file.size > MAX_PHOTO_SIZE) {
      setError("Photo must be smaller than 5MB.");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("photo", file);
      await api.upload("/profile/photos", formData);
      onChange();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id) {
    setError(null);
    setPendingId(id);

    try {
      await api.delete(`/profile/photos/${id}`);
      onChange();
    } catch (err) {
      setError(err.message);
    } finally {
      setPendingId(null);
    }
  }

  async function handleSetProfile(id) {
    setError(null);
    setPendingId(id);

    try {
      await api.put(`/profile/photos/${id}/profile`, {});
      onChange();
    } catch (err) {
      setError(err.message);
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div className="photo-grid">
      {photos.map(photo => (
        <div key={photo.id} className={`photo-tile ${photo.isProfile ? "is-profile" : ""}`}>
          <img src={`${API_URL}${photo.url}`} alt="" />

          <div className="photo-actions">
            {!photo.isProfile && (
              <button type="button" onClick={() => handleSetProfile(photo.id)} disabled={pendingId === photo.id}>
                {pendingId === photo.id && <Spinner />}
                Set as main
              </button>
            )}
            <button type="button" onClick={() => handleDelete(photo.id)} disabled={pendingId === photo.id}>
              {pendingId === photo.id && <Spinner />}
              Delete
            </button>
          </div>

          {photo.isProfile && <span className="photo-badge">Main</span>}
        </div>
      ))}

      {photos.length < 5 && (
        <button type="button" className="photo-tile add-photo" onClick={() => fileInput.current.click()} disabled={uploading}>
          {uploading && <Spinner />}
          {uploading ? "Uploading..." : "+ Add photo"}
        </button>
      )}

      <input
        ref={fileInput}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        hidden
      />

      {error && <p className="error">{error}</p>}
    </div>
  );
}
