import { useCallback, useEffect, useState } from "react";
import Layout from "../components/Layout";
import MapPicker from "../components/MapPicker";
import RideOffersPanel from "../components/RideOffersPanel";
import { passengerApi } from "../api/client";
import { useSocket } from "../context/SocketContext";

export default function PassengerDashboard() {
  const { connected, on, joinRideRoom } = useSocket();
  const [pickup, setPickup] = useState(null);
  const [destination, setDestination] = useState(null);
  const [rideId, setRideId] = useState(null);
  const [rideStatus, setRideStatus] = useState(null);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleMapChange = ({ pickup: p, destination: d }) => {
    if (p !== undefined) setPickup(p);
    if (d !== undefined) setDestination(d);
  };

  const addOffer = useCallback((payload) => {
    const offer = payload?.offer;
    if (!offer) return;
    const driverId = String(offer.driverId || offer.driver_id);
    setOffers((prev) => {
      const exists = prev.some(
        (o) => String(o.driverId || o.driver_id) === driverId,
      );
      if (exists) return prev;
      return [...prev, { ...offer, status: null }];
    });
  }, []);

  useEffect(() => {
    if (!rideId) return;
    const unsub = on("new_fair_offer", (payload) => {
      if (String(payload?.ride_id) !== String(rideId)) return;
      addOffer(payload);
    });
    return unsub;
  }, [rideId, on, addOffer]);

  const requestRide = async () => {
    setError("");
    setSuccess("");
    if (!pickup?.lat || !destination?.lat) {
      setError("Set both pickup and destination (search or map).");
      return;
    }
    setLoading(true);
    try {
      const res = await passengerApi.requestRide({
        pickup_location: pickup.label,
        destination: destination.label,
        pickup_coords: { lat: pickup.lat, lng: pickup.lng },
        destination_coords: {
          lat: destination.lat,
          lng: destination.lng,
        },
      });
      const ride = res.data?.ride;
      const id = ride?._id || ride?.id;
      setRideId(id);
      setRideStatus("pending");
      setOffers([]);
      joinRideRoom(id);
      setSuccess(res.message || "Ride requested. Waiting for driver offers.");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (offer) => {
    const driverId = offer.driverId || offer.driver_id;
    try {
      await passengerApi.acceptRide({ ride_id: rideId, driver_id: driverId });
      setRideStatus("accepted");
      setOffers((prev) =>
        prev.map((o) =>
          String(o.driverId || o.driver_id) === String(driverId)
            ? { ...o, status: "accepted" }
            : o,
        ),
      );
      setSuccess("Ride accepted! The driver has been notified.");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleReject = async (offer) => {
    const driverId = offer.driverId || offer.driver_id;
    try {
      await passengerApi.rejectOffer({ ride_id: rideId, driver_id: driverId });
      setOffers((prev) =>
        prev.map((o) =>
          String(o.driverId || o.driver_id) === String(driverId)
            ? { ...o, status: "rejected" }
            : o,
        ),
      );
      setSuccess("Offer rejected. Driver notified.");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Layout title="passenger">
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Plan Your Trip</h2>
          <MapPicker
            pickup={pickup}
            destination={destination}
            onChange={handleMapChange}
          />
          <button
            type="button"
            disabled={loading || !connected}
            onClick={requestRide}
            className="w-full rounded-xl bg-emerald-600 py-3 font-semibold hover:bg-emerald-500 disabled:opacity-50"
          >
            {loading ? "Requesting…" : "Request Ride"}
          </button>
          {!connected && (
            <p className="text-sm text-amber-300">
              Connecting to live server… offers need an active socket.
            </p>
          )}
          {error && (
            <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {error}
            </p>
          )}
          {success && (
            <p className="rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
              {success}
            </p>
          )}
        </section>
        <section>
          <RideOffersPanel
            offers={offers}
            rideStatus={rideStatus}
            onAccept={handleAccept}
            onReject={handleReject}
          />
        </section>
      </div>
    </Layout>
  );
}
