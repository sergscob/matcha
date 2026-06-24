import { useEffect, useState } from "react";

import { api } from "../api/client";
import { TagInput } from "../components/TagInput";
import { PhotoGrid } from "../components/PhotoGrid";

const emptyForm = {
  firstName: "",
  lastName: "",
  email: "",
  gender: "",
  sexualOrientation: "bisexual",
  bio: "",
  birthDate: "",
  tags: []
};

function toForm(data) {
  return {
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    gender: data.gender || "",
    sexualOrientation: data.sexualOrientation,
    bio: data.bio || "",
    birthDate: data.birthDate || "",
    tags: data.tags
  };
}

export function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [saving, setSaving] = useState(false);
  const [manualLocation, setManualLocation] = useState("");
  const [locationStatus, setLocationStatus] = useState(null);

  async function loadProfile() {
    const data = await api.get("/profile/me");
    setProfile(data);
    setForm(toForm(data));
  }

  useEffect(() => {
    loadProfile();
  }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSaving(true);

    try {
      const payload = { ...form };
      if (!payload.gender) delete payload.gender;
      if (!payload.birthDate) delete payload.birthDate;

      const updated = await api.patch("/profile/me", payload);
      setProfile(updated);
      setForm(toForm(updated));
      setSuccess(
        updated.verified
          ? "Profile updated."
          : "Profile updated. Check your new email to re-verify your account."
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function handleUseLocation() {
    setLocationStatus("Requesting your location...");

    if (!navigator.geolocation) {
      setLocationStatus("Geolocation isn't supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async position => {
        try {
          const updated = await api.put("/profile/location/gps", {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          setProfile(updated);
          setLocationStatus(null);
        } catch (err) {
          setLocationStatus(err.message);
        }
      },
      () => setLocationStatus("Location permission denied. You can enter your city manually below."),
      { timeout: 10000 }
    );
  }

  async function handleManualLocation(e) {
    e.preventDefault();
    setLocationStatus("Saving...");

    try {
      const updated = await api.put("/profile/location/manual", { locationLabel: manualLocation });
      setProfile(updated);
      setManualLocation("");
      setLocationStatus(null);
    } catch (err) {
      setLocationStatus(err.message);
    }
  }

  if (!profile) {
    return <p className="status">Loading your profile...</p>;
  }

  return (
    <div className="card profile-card">
      <h1>Your profile</h1>

      <section>
        <h2>Photos</h2>
        <PhotoGrid photos={profile.photos} onChange={loadProfile} />
      </section>

      <section>
        <h2>Location</h2>
        <p className="status">Current: {profile.locationLabel || "not set"}</p>
        <button type="button" onClick={handleUseLocation}>Use my current location</button>
        <form onSubmit={handleManualLocation} className="inline-form">
          <input
            type="text"
            placeholder="Or enter your city manually"
            value={manualLocation}
            onChange={e => setManualLocation(e.target.value)}
            required
          />
          <button type="submit">Set</button>
        </form>
        {locationStatus && <p className="status">{locationStatus}</p>}
      </section>

      <section>
        <h2>About you</h2>

        <form onSubmit={handleSubmit}>
          <label>
            First name
            <input type="text" name="firstName" value={form.firstName} onChange={handleChange} required />
          </label>

          <label>
            Last name
            <input type="text" name="lastName" value={form.lastName} onChange={handleChange} required />
          </label>

          <label>
            Email
            <input type="email" name="email" value={form.email} onChange={handleChange} required />
          </label>

          <label>
            Gender
            <select name="gender" value={form.gender} onChange={handleChange} required>
              <option value="" disabled>Select...</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </label>

          <label>
            Sexual preference
            <select name="sexualOrientation" value={form.sexualOrientation} onChange={handleChange}>
              <option value="heterosexual">Heterosexual</option>
              <option value="homosexual">Homosexual</option>
              <option value="bisexual">Bisexual</option>
            </select>
          </label>

          <label>
            Birth date
            <input type="date" name="birthDate" value={form.birthDate} onChange={handleChange} required />
          </label>

          <label>
            Bio
            <textarea name="bio" value={form.bio} onChange={handleChange} maxLength={500} rows={4} />
          </label>

          <label>
            Interests
            <TagInput tags={form.tags} onChange={tags => setForm({ ...form, tags })} />
          </label>

          {error && <p className="error">{error}</p>}
          {success && <p className="status">{success}</p>}

          <button type="submit" disabled={saving}>{saving ? "Saving..." : "Save profile"}</button>
        </form>
      </section>

      <section>
        <h2>Popularity score</h2>
        <p className="status">{profile.popularityScore}</p>
      </section>
    </div>
  );
}
