import { useCallback, useEffect, useState } from "react";

import { api } from "../api/client";
import { MapView } from "../components/MapView";
import { Spinner } from "../components/Spinner";

const initialFilters = { ageMin: "", ageMax: "", popularityMin: "", popularityMax: "", location: "", tags: "" };

export function MapPage() {
  const [filters, setFilters] = useState(initialFilters);
  const [points, setPoints] = useState([]);
  const [center, setCenter] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [geoStatus, setGeoStatus] = useState(null);

  const load = useCallback(async activeFilters => {
    setError(null);
    setLoading(true);

    const params = new URLSearchParams();
    Object.entries(activeFilters).forEach(([key, value]) => {
      if (value !== "") params.set(key, value);
    });

    try {
      setPoints(await api.get(`/discover/map?${params.toString()}`));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(initialFilters);
  }, [load]);

  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoStatus("Geolocation isn't supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      position => setCenter([position.coords.latitude, position.coords.longitude]),
      err => {
        const messages = {
          1: "Location permission denied — showing matches without centering on you.",
          2: "Your location is unavailable (no GPS/location service on this device).",
          3: "Location request timed out."
        };
        setGeoStatus(messages[err.code] || err.message);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  function handleChange(e) {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    load(filters);
  }

  return (
    <div className="card discover-page">
      <h1>Map</h1>

      <form className="filters" onSubmit={handleSubmit}>
        <label>
          Age min
          <input type="number" name="ageMin" value={filters.ageMin} onChange={handleChange} min="18" max="120" autoComplete="off" />
        </label>

        <label>
          Age max
          <input type="number" name="ageMax" value={filters.ageMax} onChange={handleChange} min="18" max="120" autoComplete="off" />
        </label>

        <label>
          Popularity min
          <input type="number" name="popularityMin" value={filters.popularityMin} onChange={handleChange} min="0" max="100000" autoComplete="off" />
        </label>

        <label>
          Popularity max
          <input type="number" name="popularityMax" value={filters.popularityMax} onChange={handleChange} min="0" max="100000" autoComplete="off" />
        </label>

        <label>
          Location
          <input type="text" name="location" value={filters.location} onChange={handleChange} placeholder="city" autoComplete="off" maxLength={100} />
        </label>

        <label>
          Tags
          <input type="text" name="tags" value={filters.tags} onChange={handleChange} placeholder="vegan,geek" autoComplete="off" maxLength={250} />
        </label>

        <button type="submit" disabled={loading}>
          {loading && <Spinner />}
          Apply filters
        </button>
      </form>

      {error && <p className="error">{error}</p>}
      {geoStatus && <p className="status">{geoStatus}</p>}

      <MapView points={points} center={center} />
    </div>
  );
}
