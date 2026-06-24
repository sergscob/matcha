import { DiscoverList } from "../components/DiscoverList";

export function SearchPage() {
  return (
    <div className="card discover-page">
      <h1>Search</h1>
      <DiscoverList endpoint="/discover/search" />
    </div>
  );
}
