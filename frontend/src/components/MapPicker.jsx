import { useEffect, useState } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { forwardGeocode, reverseGeocode } from "../utils/geocode";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const DEFAULT_CENTER = [31.5204, 74.3587];

const pickupIcon = new L.Icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  className: "pickup-marker",
});

const destIcon = new L.Icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  className: "dest-marker",
});

function MapClickHandler({ activeMode, onLocationPicked }) {
  useMapEvents({
    async click(e) {
      const { lat, lng } = e.latlng;
      const label = await reverseGeocode(lat, lng);
      onLocationPicked(activeMode, { lat, lng, label });
    },
  });
  return null;
}

function MapFlyTo({ target }) {
  const map = useMap();

  useEffect(() => {
    if (target?.lat != null && target?.lng != null) {
      map.flyTo([target.lat, target.lng], 15, { duration: 0.8 });
    }
  }, [target?.lat, target?.lng, target?.key, map]);

  return null;
}

function AddressSearchField({
  id,
  label,
  placeholder,
  value,
  onChange,
  onSearch,
  searching,
  error,
  accentClass,
}) {
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onSearch();
    }
  };

  return (
    <div>
      <label htmlFor={id} className="text-sm text-slate-400">
        {label}
      </label>
      <div className="mt-1 flex gap-2">
        <input
          id={id}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-amber-500"
        />
        <button
          type="button"
          onClick={onSearch}
          disabled={searching}
          className={`shrink-0 rounded-lg px-4 py-2 text-sm font-semibold text-slate-950 disabled:opacity-50 ${accentClass}`}
        >
          {searching ? "…" : "Search"}
        </button>
      </div>
      {error && (
        <p className="mt-1 text-xs text-red-300">{error}</p>
      )}
    </div>
  );
}

export default function MapPicker({ pickup, destination, onChange }) {
  const [activeMode, setActiveMode] = useState("pickup");
  const [pickupQuery, setPickupQuery] = useState("");
  const [destinationQuery, setDestinationQuery] = useState("");
  const [pickupSearching, setPickupSearching] = useState(false);
  const [destinationSearching, setDestinationSearching] = useState(false);
  const [pickupSearchError, setPickupSearchError] = useState("");
  const [destinationSearchError, setDestinationSearchError] = useState("");
  const [flyTarget, setFlyTarget] = useState(null);

  const handleLocationPicked = (mode, location) => {
    if (mode === "pickup") {
      setPickupQuery(location.label);
      setPickupSearchError("");
      onChange({ pickup: location, destination });
      setFlyTarget({ ...location, key: Date.now() });
      setActiveMode("destination");
    } else {
      setDestinationQuery(location.label);
      setDestinationSearchError("");
      onChange({ pickup, destination: location });
      setFlyTarget({ ...location, key: Date.now() });
    }
  };

  const searchPickup = async () => {
    setPickupSearchError("");
    setPickupSearching(true);
    try {
      const location = await forwardGeocode(pickupQuery);
      setPickupQuery(location.label);
      onChange({ pickup: location, destination });
      setFlyTarget({ ...location, key: Date.now() });
      setActiveMode("destination");
    } catch (err) {
      setPickupSearchError(err.message);
    } finally {
      setPickupSearching(false);
    }
  };

  const searchDestination = async () => {
    setDestinationSearchError("");
    setDestinationSearching(true);
    try {
      const location = await forwardGeocode(destinationQuery);
      setDestinationQuery(location.label);
      onChange({ pickup, destination: location });
      setFlyTarget({ ...location, key: Date.now() });
    } catch (err) {
      setDestinationSearchError(err.message);
    } finally {
      setDestinationSearching(false);
    }
  };

  const center =
    pickup?.lat && pickup?.lng
      ? [pickup.lat, pickup.lng]
      : destination?.lat && destination?.lng
        ? [destination.lat, destination.lng]
        : DEFAULT_CENTER;

  return (
    <div className="space-y-3">
      <div className="grid gap-3">
        <AddressSearchField
          id="pickup-address"
          label="Pickup Address"
          placeholder="e.g. Lahore Railway Station"
          value={pickupQuery}
          onChange={setPickupQuery}
          onSearch={searchPickup}
          searching={pickupSearching}
          error={pickupSearchError}
          accentClass="bg-emerald-600 hover:bg-emerald-500"
        />
        <AddressSearchField
          id="destination-address"
          label="Destination Address"
          placeholder="e.g. Allama Iqbal International Airport"
          value={destinationQuery}
          onChange={setDestinationQuery}
          onSearch={searchDestination}
          searching={destinationSearching}
          error={destinationSearchError}
          accentClass="bg-amber-500 hover:bg-amber-400"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setActiveMode("pickup")}
          className={`rounded-lg px-4 py-2 text-sm font-medium ${
            activeMode === "pickup"
              ? "bg-emerald-600 text-white"
              : "bg-slate-800 text-slate-300"
          }`}
        >
          Set Pickup on Map
        </button>
        <button
          type="button"
          onClick={() => setActiveMode("destination")}
          className={`rounded-lg px-4 py-2 text-sm font-medium ${
            activeMode === "destination"
              ? "bg-amber-600 text-white"
              : "bg-slate-800 text-slate-300"
          }`}
        >
          Set Destination on Map
        </button>
      </div>
      <p className="text-sm text-slate-400">
        Search an address above, or click the map to set your{" "}
        <span className="font-semibold text-slate-200">{activeMode}</span> point.
      </p>
      <div className="h-[420px] overflow-hidden rounded-xl border border-slate-800">
        <MapContainer center={center} zoom={13} scrollWheelZoom className="h-full">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapFlyTo target={flyTarget} />
          <MapClickHandler
            activeMode={activeMode}
            onLocationPicked={handleLocationPicked}
          />
          {pickup?.lat != null && (
            <Marker position={[pickup.lat, pickup.lng]} icon={pickupIcon}>
              <Popup>Pickup: {pickup.label}</Popup>
            </Marker>
          )}
          {destination?.lat != null && (
            <Marker position={[destination.lat, destination.lng]} icon={destIcon}>
              <Popup>Destination: {destination.label}</Popup>
            </Marker>
          )}
        </MapContainer>
      </div>
      <div className="grid gap-2 text-sm md:grid-cols-2">
        <div className="rounded-lg bg-slate-900 p-3">
          <p className="text-xs uppercase text-slate-500">Pickup</p>
          <p className="text-slate-200">
            {pickup?.label || "Not selected"}
          </p>
        </div>
        <div className="rounded-lg bg-slate-900 p-3">
          <p className="text-xs uppercase text-slate-500">Destination</p>
          <p className="text-slate-200">
            {destination?.label || "Not selected"}
          </p>
        </div>
      </div>
    </div>
  );
}
