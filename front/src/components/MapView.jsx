import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "leaflet.markercluster";

const TILE_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const TILE_ATTRIBUTION = "&copy; OpenStreetMap contributors";
const API_URL = import.meta.env.VITE_API_URL;

const dotIcon = L.divIcon({ className: "map-marker-dot", iconSize: [16, 16], iconAnchor: [8, 8] });
const viewerIcon = L.divIcon({ className: "map-marker-viewer", iconSize: [18, 18], iconAnchor: [9, 9] });

function buildPopup(point, navigate) {
  const container = document.createElement("div");
  container.className = "map-popup";

  if (point.photoUrl) {
    const img = document.createElement("img");
    img.src = `${API_URL}${point.photoUrl}`;
    img.alt = "";
    container.appendChild(img);
  }

  const name = document.createElement("strong");
  name.textContent = point.firstName + (point.age != null ? `, ${point.age}` : "");
  container.appendChild(name);

  const button = document.createElement("button");
  button.type = "button";
  button.textContent = "View profile";
  button.onclick = () => navigate(`/users/${point.id}`);
  container.appendChild(button);

  return container;
}

export function MapView({ points, center }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const clusterRef = useRef(null);
  const viewerMarkerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const map = L.map(containerRef.current, { center: [20, 0], zoom: 2 });
    L.tileLayer(TILE_URL, { attribution: TILE_ATTRIBUTION, maxZoom: 19 }).addTo(map);

    const clusterGroup = L.markerClusterGroup({ maxClusterRadius: 50 });
    clusterGroup.addTo(map);

    mapRef.current = map;
    clusterRef.current = clusterGroup;

    return () => map.remove();
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const clusterGroup = clusterRef.current;
    if (!map || !clusterGroup) return;

    clusterGroup.clearLayers();
    viewerMarkerRef.current?.remove();
    viewerMarkerRef.current = null;

    if (center) {

      viewerMarkerRef.current = L.marker(center, { icon: viewerIcon }).addTo(map).bindPopup("You are here");
    }

    const markers = points.map(point =>
      L.marker([point.latitude, point.longitude], { icon: dotIcon }).bindPopup(buildPopup(point, navigate))
    );
    clusterGroup.addLayers(markers);

    const bounds = L.latLngBounds(points.map(point => [point.latitude, point.longitude]));
    if (center) bounds.extend(center);
    if (bounds.isValid()) map.fitBounds(bounds, { maxZoom: 13, padding: [20, 20] });
  }, [points, center, navigate]);

  return <div ref={containerRef} className="map-container" />;
}
