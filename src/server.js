import jwt from "jsonwebtoken";
import { app } from "./app.js"; // Added .js extension if using modern ES modules
import { Server } from "socket.io";
import { createServer } from "http";

const http = createServer(app); // This is your HTTP server wrapping Express

const io = new Server(http, {
  cors: {
    origin: "http://localhost:5173", // ✅ all three properties now INSIDE cors
    methods: ["GET", "POST", "PATCH"],
    credentials: true,
  },
});
app.set("io", io); // Share 'io' globally across Express

io.use((socket, next) => {
  const token = socket.handshake.auth.token; // frontend sends: { auth: { token } }

  if (!token) {
    console.log("Socket rejected: No token provided");
    return next(new Error("Authentication error: No token"));
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    socket.user = decoded; //  now available as socket.user in all event handlers
    console.log(
      `Socket authenticated for user: ${decoded._id}, role: ${decoded.role}`,
    );
    next(); // allow the connection
  } catch (err) {
    console.log("Socket rejected: Invalid token", err.message);
    return next(new Error("Authentication error: Invalid token"));
  }
});

io.on("connection", (socket) => {

  // --- STRATEGY FOR DRIVERS ---
  // When a driver logs into their app, their frontend will send an event to join this room.
  // This allows the server to broadcast new requests to all active drivers at once.
  socket.on("join_drivers_global_room", () => {
    socket.join("drivers_room");
    console.log(`Driver socket ${socket.id} joined the global drivers pool.`);
  });

  // --- STRATEGY FOR ONGOING RIDES ---
  // Once a driver accepts a specific ride, both passenger and driver join this private room
  socket.on("join_private_room", (data) => {
    const { user_ride_id } = data;
    socket.join(user_ride_id);
    console.log(`Socket ${socket.id} joined private ride room: ${user_ride_id}`);
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

export { http };
