import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import IncomingRequestsPanel from "../components/IncomingRequestsPanel";
import { driverApi } from "../api/client";
import { useSocket } from "../context/SocketContext";

export default function DriverDashboard() {
  const { connected, on, joinDriversRoom } = useSocket();
  const [requests, setRequests] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [fareInputs, setFareInputs] = useState({});
  const [proposingId, setProposingId] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!connected) return;
    joinDriversRoom();
  }, [connected, joinDriversRoom]);

  useEffect(() => {
    const unsubRide = on("new_ride_offer", (payload) => {
      setRequests((prev) => {
        const exists = prev.some(
          (r) => String(r.ride_id) === String(payload.ride_id),
        );
        if (exists) return prev;
        return [payload, ...prev];
      });
      setNotifications((n) => [
        { type: "info", text: "New ride request received", id: Date.now() },
        ...n.slice(0, 4),
      ]);
    });

    const handleAccepted = (payload) => {
      setNotifications((n) => [
        {
          type: "success",
          text: payload.msg || "Passenger accepted your offer!",
          id: Date.now(),
        },
        ...n.slice(0, 4),
      ]);
      setRequests((prev) =>
        prev.filter((r) => String(r.ride_id) !== String(payload.ride_id)),
      );
    };

    const handleRejected = (payload) => {
      setNotifications((n) => [
        {
          type: "error",
          text: payload.msg || "Passenger rejected your offer.",
          id: Date.now(),
        },
        ...n.slice(0, 4),
      ]);
    };

    const unsubAccepted = on("offer_accepted", handleAccepted);
    const unsubCancelled = on("offer_cancelled", handleRejected);
    const unsubRejected = on("offer_rejected", handleRejected);

    return () => {
      unsubRide();
      unsubAccepted();
      unsubCancelled();
      unsubRejected();
    };
  }, [on]);

  const onFareChange = (rideId, value) => {
    setFareInputs((prev) => ({ ...prev, [rideId]: value }));
  };

  const onPropose = async (req) => {
    const fare = fareInputs[req.ride_id];
    if (!fare || Number(fare) <= 0) {
      setError("Enter a valid fare amount.");
      return;
    }
    setError("");
    setProposingId(req.ride_id);
    try {
      await driverApi.proposeFare({
        ride_id: req.ride_id,
        fare: Number(fare),
      });
      setNotifications((n) => [
        {
          type: "info",
          text: `Fare offer sent for ride #${String(req.ride_id).slice(-6)}`,
          id: Date.now(),
        },
        ...n.slice(0, 4),
      ]);
    } catch (err) {
      setError(err.message);
    } finally {
      setProposingId(null);
    }
  };

  return (
    <Layout title="driver">
      <div className="grid gap-6 lg:grid-cols-2">
        <section>
          <IncomingRequestsPanel
            requests={requests}
            selectedId={selectedId}
            onSelect={setSelectedId}
            fareInputs={fareInputs}
            onFareChange={onFareChange}
            onPropose={onPropose}
            proposingId={proposingId}
          />
          {error && (
            <p className="mt-3 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {error}
            </p>
          )}
        </section>
        <section className="space-y-3">
          <h3 className="text-lg font-semibold text-amber-400">Notifications</h3>
          {!connected && (
            <p className="text-sm text-amber-300">Connecting to server…</p>
          )}
          {notifications.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-700 p-6 text-center text-slate-500">
              Offer responses will appear here.
            </div>
          ) : (
            notifications.map((note) => (
              <div
                key={note.id}
                className={`rounded-xl border px-4 py-3 text-sm ${
                  note.type === "success"
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
                    : note.type === "error"
                      ? "border-red-500/30 bg-red-500/10 text-red-200"
                      : "border-slate-700 bg-slate-900 text-slate-300"
                }`}
              >
                {note.text}
              </div>
            ))
          )}
        </section>
      </div>
    </Layout>
  );
}
