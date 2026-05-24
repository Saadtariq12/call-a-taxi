import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(form);
      if (user.role === "pending") navigate("/role");
      else if (user.role === "driver") navigate("/driver");
      else navigate("/passenger");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-xl">
        <h1 className="text-2xl font-bold text-amber-400">Call A Taxi</h1>
        <p className="mt-1 text-slate-400">Sign in to continue</p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-sm text-slate-400">Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-amber-500"
            />
          </div>
          <div>
            <label className="text-sm text-slate-400">Password</label>
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-amber-500"
            />
          </div>
          {error && (
            <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-amber-500 py-2.5 font-semibold text-slate-950 hover:bg-amber-400 disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-400">
          New here?{" "}
          <Link to="/register" className="text-amber-400 hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
