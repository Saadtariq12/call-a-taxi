export default function IncomingRequestsPanel({
  requests,
  selectedId,
  onSelect,
  fareInputs,
  onFareChange,
  onPropose,
  proposingId,
}) {
  if (!requests.length) {
    return (
      <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/50 p-6 text-center text-slate-400">
        No ride requests yet. Stay online in the drivers pool.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-amber-400">Incoming Requests</h3>
      {requests.map((req) => (
        <div
          key={req.ride_id}
          className={`rounded-xl border p-4 transition ${
            selectedId === req.ride_id
              ? "border-amber-500/50 bg-slate-900"
              : "border-slate-800 bg-slate-900/60"
          }`}
        >
          <button
            type="button"
            className="w-full text-left"
            onClick={() => onSelect(req.ride_id)}
          >
            <p className="text-xs text-slate-500">Ride #{String(req.ride_id).slice(-6)}</p>
            <p className="mt-1 text-sm">
              <span className="text-emerald-400">From:</span> {req.pickup_location}
            </p>
            <p className="text-sm">
              <span className="text-amber-400">To:</span> {req.destination}
            </p>
          </button>
          {selectedId === req.ride_id && (
            <div className="mt-3 flex gap-2">
              <input
                type="number"
                min="1"
                placeholder="Fare (Rs)"
                value={fareInputs[req.ride_id] ?? ""}
                onChange={(e) => onFareChange(req.ride_id, e.target.value)}
                className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-amber-500"
              />
              <button
                type="button"
                disabled={proposingId === req.ride_id}
                onClick={() => onPropose(req)}
                className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-amber-400 disabled:opacity-50"
              >
                {proposingId === req.ride_id ? "Sending…" : "Send Offer"}
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
