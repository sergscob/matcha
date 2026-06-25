import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { api } from "../api/client";
import { ProfileCard } from "./ProfileCard";
import { Spinner } from "./Spinner";

const PAGE_SIZE = 20;

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

function filtersFromParams(searchParams) {
  const result = { ...initialFilters };

  for (const key of Object.keys(initialFilters)) {
    const value = searchParams.get(key);
    if (value !== null) result[key] = value;
  }

  return result;
}

function toQueryObject(activeFilters) {
  return Object.fromEntries(Object.entries(activeFilters).filter(([, value]) => value !== ""));
}

export function DiscoverList({ endpoint }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState(() => filtersFromParams(searchParams));
  const [profiles, setProfiles] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const appliedFiltersRef = useRef(initialFilters);

  const load = useCallback(async (activeFilters, { offset = 0, append = false } = {}) => {
    setError(null);
    append ? setLoadingMore(true) : setLoading(true);

    const params = new URLSearchParams(toQueryObject(activeFilters));
    params.set("limit", PAGE_SIZE);
    params.set("offset", offset);

    try {
      const page = await api.get(`${endpoint}?${params.toString()}`);
      appliedFiltersRef.current = activeFilters;
      setProfiles(prev => (append ? [...prev, ...page] : page));
      setHasMore(page.length === PAGE_SIZE);
    } catch (err) {
      setError(err.message);
    } finally {
      append ? setLoadingMore(false) : setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    const urlFilters = filtersFromParams(searchParams);
    setFilters(urlFilters);
    load(urlFilters);
    // mount-only: restores filters from the URL (so browser back/forward
    // brings them back) without re-running on every keystroke -- submitted
    // filters are pushed to the URL from handleSubmit, not read back from it.
  }, [load]);

  function handleChange(e) {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    setSearchParams(toQueryObject(filters), { replace: true });
    load(filters);
  }

  function handleShowMore() {
    load(appliedFiltersRef.current, { offset: profiles.length, append: true });
  }

  return (
    <div className="discover">
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

        <button type="submit" disabled={loading}>
          Apply filters
        </button>
      </form>
     { loading && <Spinner className="big-loading" />}

      {error && <p className="error">{error}</p>}

      {profiles && profiles.length === 0 && <p className="status">No profiles match your filters.</p>}

      { !loading && profiles && (
        <div className="discover-grid">
          {profiles.map(profile => <ProfileCard key={profile.id} profile={profile} />)}
        </div>
      )}

      { !loading && hasMore && (
        <button type="button" className="show-more" onClick={handleShowMore} disabled={loadingMore}>
          {loadingMore ? "Loading..." : "Show more"}
        </button>
      )}
    </div>
  );
}
