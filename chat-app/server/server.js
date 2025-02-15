require("dotenv").config(); // Load environment variables from .env file

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const axios = require("axios");

const app = express();
const server = http.createServer(app);

// Use environment variable for PORT (default to 5000)
const PORT = process.env.PORT || 5000;

// Use environment variable for Strapi URL
const strapiUrl = process.env.STRAPI_URL || "https://chat-app-5-ojta.onrender.com" // Fallback for local development

// Set up Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "https://chat-app-sandy-mu.vercel.app/", // Allow frontend access
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// WebSocket event handlers
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("message", async (msg) => {
    console.log("Message received:", msg);

    const { sender, content, timestamp } = msg;

    // Save the message to Strapi
    try {
      const response = await axios.post(`${strapiUrl}/api/messages`, {
        data: { sender, content, timestamp },
      });

      console.log("Message saved to Strapi:", response.data);
    } catch (error) {
      console.error("Error saving message to Strapi:", error);
    }

    // Broadcast message to all clients
    io.emit("message", { sender: "server", content, timestamp });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});