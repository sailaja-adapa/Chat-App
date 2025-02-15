const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const axios = require("axios");
const app = express();
const server = http.createServer(app);

// Set up Socket.IO server
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // React frontend URL
    methods: ["GET", "POST"],
  },
});

// Use CORS middleware to allow cross-origin requests
app.use(cors());
app.use(express.json()); // Middleware to parse JSON bodies

// Strapi API endpoint URL (adjust if your Strapi is running on a different port)
const strapiUrl = "http://localhost:1337"; // Default Strapi URL

// WebSocket event handler
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Handle incoming messages from the client
  socket.on("message", async (msg) => {
    console.log("Message received:", msg);

    // Destructure sender, content, and timestamp from the incoming message
    const { sender, content, timestamp } = msg;

    // Save the message to Strapi
    try {
      const response = await axios.post(`${strapiUrl}/api/messages`, {
        data: {
          sender,
          content,
          timestamp, // Save the timestamp as well
        },
      });

      if (response.status === 200) {
        console.log("Message saved to Strapi:", response.data);
      }
    } catch (error) {
      console.error("Error saving message to Strapi:", error);
    }

    // Echo the message back to the client with sender 'server'
    io.emit("message", { sender: "server", content, timestamp }); // Send timestamp back
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Start the server on port 5000
server.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});
