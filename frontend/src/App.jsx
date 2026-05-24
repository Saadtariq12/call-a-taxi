import { Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import RoleSelectPage from "./pages/RoleSelectPage";
import PassengerDashboard from "./pages/PassengerDashboard";
import DriverDashboard from "./pages/DriverDashboard";

function HomeRedirect() {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role === "pending") return <Navigate to="/role" replace />;
  if (user?.role === "driver") return <Navigate to="/driver" replace />;
  return <Navigate to="/passenger" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Routes>
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/role"
            element={
              <ProtectedRoute pendingOnly>
                <RoleSelectPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/passenger"
            element={
              <ProtectedRoute role="passenger">
                <PassengerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/driver"
            element={
              <ProtectedRoute role="driver">
                <DriverDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </SocketProvider>
    </AuthProvider>
  );
}
