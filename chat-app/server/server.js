const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

// Enable CORS for both frontend URLs
app.use(
  cors({
    origin: ["http://localhost:3000", "https://chat-app-sandy-mu.vercel.app"],
    methods: ["GET", "POST"],
    credentials: true,
  })
);


// Initialize Socket.io with CORS support
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "https://chat-app-6-9b0u.onrender.com"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("New user connected:", socket.id);

  // Listen for chat messages
  socket.on("send_message", (data) => {
    io.emit("receive_message", data); // Broadcast to all clients
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
