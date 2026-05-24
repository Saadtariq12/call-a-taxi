import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RoleSelectPage() {
  const { setRole } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const choose = async (role) => {
    setError("");
    setLoading(true);
    try {
      await setRole(role);
      navigate(role === "driver" ? "/driver" : "/passenger");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">
        <h1 className="text-2xl font-bold text-amber-400">Choose Your Role</h1>
        <p className="mt-2 text-slate-400">
          How will you use Call A Taxi today?
        </p>
        {error && (
          <p className="mt-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        )}
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <button
            type="button"
            disabled={loading}
            onClick={() => choose("passenger")}
            className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-6 hover:bg-emerald-500/20 disabled:opacity-50"
          >
            <span className="text-3xl">🧳</span>
            <p className="mt-2 text-lg font-semibold">Passenger</p>
            <p className="mt-1 text-sm text-slate-400">Request rides on the map</p>
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => choose("driver")}
            className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-6 hover:bg-amber-500/20 disabled:opacity-50"
          >
            <span className="text-3xl">🚕</span>
            <p className="mt-2 text-lg font-semibold">Driver</p>
            <p className="mt-1 text-sm text-slate-400">Accept requests & propose fares</p>
          </button>
        </div>
      </div>
    </div>
  );
}
