import { DiscoverList } from "../components/DiscoverList";

export function BrowsePage() {
  return (
    <div className="card discover-page">
      <h1>Suggested for you</h1>
      <DiscoverList endpoint="/discover/suggested" />
    </div>
  );
}
