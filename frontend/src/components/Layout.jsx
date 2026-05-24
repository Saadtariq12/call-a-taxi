import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";

export default function Layout({ children, title }) {
  const { user, logout } = useAuth();
  const { connected } = useSocket();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div>
            <Link to="/" className="text-xl font-bold text-amber-400">
              Call A Taxi
            </Link>
            {title && (
              <p className="text-sm text-slate-400 capitalize">{title} dashboard</p>
            )}
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span
              className={`rounded-full px-3 py-1 ${
                connected
                  ? "bg-emerald-500/20 text-emerald-300"
                  : "bg-red-500/20 text-red-300"
              }`}
            >
              {connected ? "Live" : "Offline"}
            </span>
            <span className="text-slate-300">
              {user?.username} · {user?.role}
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg border border-slate-700 px-3 py-1.5 hover:bg-slate-800"
            >
              Logout
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
    </div>
  );
}
