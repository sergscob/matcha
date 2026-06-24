const NOMINATIM_BASE = "https://nominatim.openstreetmap.org";
const USER_AGENT = "Matcha-School-Project/1.0 (educational use)";

function buildLabel(address) {
  const area = address.suburb || address.neighbourhood || address.city_district || address.borough;
  const city = address.city || address.town || address.village || address.municipality;

  return [area, city].filter(Boolean).join(", ") || address.state || address.country || null;
}

export async function reverseGeocode(latitude, longitude) {
  try {
    const url = `${NOMINATIM_BASE}/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=14`;
    const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
    if (!res.ok) return null;

    const data = await res.json();
    return data.address ? buildLabel(data.address) : null;
  } catch {
    return null;
  }
}

export async function forwardGeocode(query) {
  try {
    const url = `${NOMINATIM_BASE}/search?format=jsonv2&limit=1&q=${encodeURIComponent(query)}`;
    const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
    if (!res.ok) return null;

    const [result] = await res.json();
    return result ? { latitude: Number(result.lat), longitude: Number(result.lon) } : null;
  } catch {
    return null;
  }
}
