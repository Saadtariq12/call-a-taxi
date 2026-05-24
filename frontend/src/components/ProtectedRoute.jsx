import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, role, pendingOnly }) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (pendingOnly && user?.role !== "pending") {
    return <Navigate to="/" replace />;
  }

  if (user?.role === "pending" && !pendingOnly) {
    return <Navigate to="/role" replace />;
  }

  if (role && user?.role !== role) {
    const redirect = user?.role === "driver" ? "/driver" : "/passenger";
    return <Navigate to={redirect} replace />;
  }

  return children;
}
