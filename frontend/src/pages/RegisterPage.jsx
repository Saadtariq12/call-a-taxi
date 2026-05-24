import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(form);
      navigate("/login", { state: { message: "Account created. Please sign in." } });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-xl">
        <h1 className="text-2xl font-bold text-amber-400">Create Account</h1>
        <p className="mt-1 text-slate-400">Join Call A Taxi</p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-sm text-slate-400">Username</label>
            <input
              required
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-amber-500"
            />
          </div>
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
              minLength={6}
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
            className="w-full rounded-lg bg-emerald-600 py-2.5 font-semibold text-white hover:bg-emerald-500 disabled:opacity-60"
          >
            {loading ? "Creating…" : "Register"}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-400">
          Already have an account?{" "}
          <Link to="/login" className="text-amber-400 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
