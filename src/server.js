import { app } from "./app.js"; // Added .js extension if using modern ES modules
import { Server } from "socket.io";
import { createServer } from "http";

const http = createServer(app); // This is your HTTP server wrapping Express

const io = new Server(http, {
  cors: { origin: "*" },
});

app.set("io", io); // Share 'io' globally across Express

io.on("connection", (socket) => {
  console.log(`User connected to WebSockets: ${socket.id}`);

  // --- STRATEGY FOR DRIVERS ---
  // When a driver logs into their app, their frontend will send an event to join this room.
  // This allows the server to broadcast new requests to all active drivers at once.
  socket.on("join_drivers_global_room", () => {
    socket.join("drivers_room");
    console.log(`Driver socket ${socket.id} joined the global drivers pool.`);
  });

  // --- STRATEGY FOR ONGOING RIDES ---
  // Once a driver accepts a specific ride, both passenger and driver join this private room
  socket.on("join_rivate_room", (data) => {
    const { user_ride_id } = data;
    socket.join(user_ride_id);
    console.log(`Socket ${socket.id} joined private ride room: ${user_ride_id}`); 
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

export { http };



