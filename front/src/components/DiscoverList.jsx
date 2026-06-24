import { useCallback, useEffect, useState } from "react";

import { api } from "../api/client";
import { ProfileCard } from "./ProfileCard";

const initialFilters = {
  ageMin: "",
  ageMax: "",
  popularityMin: "",
  popularityMax: "",
  location: "",
  tags: "",
  sortBy: "",
  sortOrder: ""
};

export function DiscoverList({ endpoint }) {
  const [filters, setFilters] = useState(initialFilters);
  const [profiles, setProfiles] = useState(null);
  const [error, setError] = useState(null);

  const load = useCallback(async activeFilters => {
    setError(null);

    const params = new URLSearchParams();
    Object.entries(activeFilters).forEach(([key, value]) => {
      if (value !== "") params.set(key, value);
    });

    try {
      setProfiles(await api.get(`${endpoint}?${params.toString()}`));
    } catch (err) {
      setError(err.message);
    }
  }, [endpoint]);

  useEffect(() => {
    setFilters(initialFilters);
    load(initialFilters);
  }, [load]);

  function handleChange(e) {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    load(filters);
  }

  return (
    <div className="discover">
      <form className="filters" onSubmit={handleSubmit}>
        <label>
          Age min
          <input type="number" name="ageMin" value={filters.ageMin} onChange={handleChange} min="18" />
        </label>

        <label>
          Age max
          <input type="number" name="ageMax" value={filters.ageMax} onChange={handleChange} min="18" />
        </label>

        <label>
          Popularity min
          <input type="number" name="popularityMin" value={filters.popularityMin} onChange={handleChange} />
        </label>

        <label>
          Popularity max
          <input type="number" name="popularityMax" value={filters.popularityMax} onChange={handleChange} />
        </label>

        <label>
          Location
          <input type="text" name="location" value={filters.location} onChange={handleChange} placeholder="city" />
        </label>

        <label>
          Tags
          <input type="text" name="tags" value={filters.tags} onChange={handleChange} placeholder="vegan,geek" />
        </label>

        <label>
          Sort by
          <select name="sortBy" value={filters.sortBy} onChange={handleChange}>
            <option value="">Best match</option>
            <option value="age">Age</option>
            <option value="location">Distance</option>
            <option value="popularity">Popularity</option>
            <option value="tags">Common tags</option>
          </select>
        </label>

        <label>
          Order
          <select name="sortOrder" value={filters.sortOrder} onChange={handleChange}>
            <option value="">Default</option>
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </label>

        <button type="submit">Apply filters</button>
      </form>

      {error && <p className="error">{error}</p>}

      {profiles && profiles.length === 0 && <p className="status">No profiles match your filters.</p>}

      <div className="discover-grid">
        {profiles?.map(profile => <ProfileCard key={profile.id} profile={profile} />)}
      </div>
    </div>
  );
}
