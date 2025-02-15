const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

// Allowed origins for CORS
const allowedOrigins = [
  "http://localhost:3001",
  "https://chat-app-sandy-mu.vercel.app",
  "https://chat-app-6-9b0u.onrender.com",
];

app.use(cors({ origin: allowedOrigins, methods: ["GET", "POST"], credentials: true }));

// Initialize Socket.io with CORS support
const io = new Server(server, {
  cors: { origin: allowedOrigins, methods: ["GET", "POST"], credentials: true },
});

io.on("connection", (socket) => {
  console.log("New user connected:", socket.id);

  // Listen for incoming messages with event "message"
  socket.on("message", (data) => {
    console.log("Received message:", data);
    // Broadcast the message to all connected clients
    io.emit("message", data);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5004;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
