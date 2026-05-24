const NOMINATIM_HEADERS = {
  Accept: "application/json",
  "User-Agent": "CallATaxi/1.0 (local development)",
};

export async function reverseGeocode(lat, lng) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;
  const res = await fetch(url, { headers: NOMINATIM_HEADERS });
  if (!res.ok) return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  const data = await res.json();
  return data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
}

export async function forwardGeocode(query) {
  const trimmed = query?.trim();
  if (!trimmed) {
    throw new Error("Please enter an address or landmark");
  }

  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(trimmed)}&limit=1`;
  const res = await fetch(url, { headers: NOMINATIM_HEADERS });
  if (!res.ok) {
    throw new Error("Address search failed. Please try again.");
  }

  const data = await res.json();
  if (!data?.length) {
    throw new Error("No results found for that address");
  }

  const result = data[0];
  return {
    lat: parseFloat(result.lat),
    lng: parseFloat(result.lon),
    label: result.display_name,
  };
}
