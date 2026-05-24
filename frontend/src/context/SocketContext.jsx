import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { io } from "socket.io-client";
import { API_BASE } from "../api/client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { accessToken, isAuthenticated } = useAuth();
  const socketRef = useRef(null);
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !accessToken) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setSocket(null);
      setConnected(false);
      return;
    }

    const instance = io(API_BASE, {
      auth: { token: accessToken },
      transports: ["websocket", "polling"],
    });

    socketRef.current = instance;
    setSocket(instance);

    instance.on("connect", () => setConnected(true));
    instance.on("disconnect", () => setConnected(false));
    instance.on("connect_error", () => setConnected(false));

    return () => {
      instance.disconnect();
      socketRef.current = null;
      setSocket(null);
      setConnected(false);
    };
  }, [accessToken, isAuthenticated]);

  const emit = useCallback(
    (event, data) => {
      socketRef.current?.emit(event, data);
    },
    [socket],
  );

  const on = useCallback(
    (event, handler) => {
      if (!socketRef.current) return () => {};
      socketRef.current.on(event, handler);
      return () => socketRef.current?.off(event, handler);
    },
    [socket],
  );

  const joinDriversRoom = useCallback(() => {
    emit("join_drivers_global_room");
  }, [emit]);

  const joinRideRoom = useCallback(
    (rideId) => {
      emit("join_private_room", { ride_id: rideId, user_ride_id: rideId });
    },
    [emit],
  );

  const value = useMemo(
    () => ({
      socket,
      connected,
      emit,
      on,
      joinDriversRoom,
      joinRideRoom,
    }),
    [connected, emit, on, joinDriversRoom, joinRideRoom],
  );

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
}

export function useSocket() {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error("useSocket must be used within SocketProvider");
  return ctx;
}
