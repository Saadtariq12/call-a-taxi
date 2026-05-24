export default function RideOffersPanel({
  offers,
  onAccept,
  onReject,
  rideStatus,
}) {
  if (!offers.length) {
    return (
      <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/50 p-6 text-center text-slate-400">
        Waiting for driver fare offers…
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-amber-400">Incoming Offers</h3>
      {offers.map((offer) => {
        const driverId = offer.driverId || offer.driver_id;
        const key = `${driverId}-${offer.fare}`;
        const resolved = offer.status;

        return (
          <div
            key={key}
            className="rounded-xl border border-slate-800 bg-slate-900 p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium text-slate-100">
                  {offer.driverName || "Driver"}
                </p>
                <p className="text-2xl font-bold text-emerald-400">
                  Rs {offer.fare}
                </p>
              </div>
              {resolved === "accepted" && (
                <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs text-emerald-300">
                  Accepted
                </span>
              )}
              {resolved === "rejected" && (
                <span className="rounded-full bg-red-500/20 px-3 py-1 text-xs text-red-300">
                  Rejected
                </span>
              )}
            </div>
            {!resolved && rideStatus === "pending" && (
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => onAccept(offer)}
                  className="flex-1 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium hover:bg-emerald-500"
                >
                  Accept
                </button>
                <button
                  type="button"
                  onClick={() => onReject(offer)}
                  className="flex-1 rounded-lg border border-slate-600 px-4 py-2 text-sm font-medium hover:bg-slate-800"
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
