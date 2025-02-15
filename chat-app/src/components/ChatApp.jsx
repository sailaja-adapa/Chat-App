import React, { useState, useEffect, useRef } from "react";
import {
  Container,
  TextField,
  Button,
  Paper,
  Typography,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import SendIcon from "@mui/icons-material/Send";
import AddIcon from "@mui/icons-material/Add";
import io from "socket.io-client";

// Connect to WebSocket
const socket = io("https://chat-app-7-nxw2.onrender.com");

const ChatApp = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]); // Active chat messages
  const [historyChats, setHistoryChats] = useState([]); // Message history for the logged-in user
  const [username, setUsername] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const messagesEndRef = useRef(null);

  // Retrieve the logged-in user and set the username
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.username) {
      setUsername(user.username);
      console.log("Logged in as:", user.username);
    } else {
      navigate("/login");
    }

    socket.on("connect", () => console.log("Connected to socket", socket.id));

    socket.on("message", (newMessage) => {
      console.log("New incoming message:", newMessage);
      setMessages((prev) => [...prev, newMessage]);
      scrollToBottom();
    });

    return () => {
      socket.off("message");
    };
  }, [navigate]);

  // Fetch chat history once the username is set
  useEffect(() => {
    if (username) {
      fetchChatHistory();
    }
  }, [username]);

  // Fetch messages from Strapi's "Message" collection
  const fetchChatHistory = async () => {
    try {
      const url = "https://chat-app-6-9b0u.onrender.com/api/messages";
      console.log("Fetching all messages from:", url);
      const response = await fetch(url);
      const data = await response.json();
      console.log("Fetched Chat History (all):", data);

      if (data.data) {
        const allMessages = data.data.map((item) => item.attributes || item);
        console.log("All Messages after mapping:", allMessages);

        const userHistory = allMessages.filter((msg) =>
          msg.sender?.trim().toLowerCase() === username.trim().toLowerCase()
        );

        console.log("Filtered History for user", username, ":", userHistory);
        setHistoryChats(userHistory);
      } else {
        console.log("No data property in response");
      }
    } catch (err) {
      console.error("Error fetching chats:", err);
    }
  };

  // Start new chat (clears active messages)
  const startNewChat = () => {
    setMessages([]); // Clear active messages
    fetchChatHistory(); // Refresh chat history immediately
  };const sendMessage = async () => {
    if (message.trim()) {
      const newMessage = {
        sender: username,
        content: message,
        timestamp: new Date().toISOString(), // Format correctly
      };
  
      // Send message to WebSocket server
      setMessages((prev) => [...prev, newMessage]);
      socket.emit("message", newMessage);
      setMessage("");
  
      try {
        const response = await fetch("https://chat-app-6-9b0u.onrender.com/api/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // If authentication is required:
            // "Authorization": `Bearer ${localStorage.getItem("jwt")}`,
          },
          body: JSON.stringify({ data: newMessage }), // ✅ Correct payload format for Strapi
        });
  
        const result = await response.json();
        console.log("API Response:", result);
  
        if (!response.ok) {
          console.error("Failed to store message in Strapi:", result.error);
        } else {
          console.log("Message successfully stored in Strapi.");
        }
      } catch (error) {
        console.error("Error storing message:", error);
      }
  
      scrollToBottom();
    }
  };
  
  const handleProfileClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("jwt");
    navigate("/login");
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, display: "flex" }}>
      {/* History Sidebar */}
      <Paper elevation={3} sx={{ width: 250, p: 2, mr: 2, borderRadius: 3 }}>
        <Typography variant="h6" fontWeight="bold">
          Chat History
        </Typography>
        <List>
          {historyChats.length > 0 ? (
            historyChats.map((chat, index) =>
              chat?.content ? (
                <ListItem key={index}>
                  <ListItemText primary={chat.content} secondary={`From: ${chat.sender}`} />
                </ListItem>
              ) : (
                <ListItem key={index}>
                  <ListItemText primary="Invalid message data" />
                </ListItem>
              )
            )
          ) : (
            <Typography variant="body2" color="gray">
              No chat history
            </Typography>
          )}
        </List>
        <Divider sx={{ my: 1 }} />
        <Button startIcon={<AddIcon />} fullWidth variant="contained" onClick={startNewChat}>
          New Chat
        </Button>
      </Paper>

      {/* Chat Window */}
      <Paper elevation={6} sx={{ flex: 1, p: 3, borderRadius: 3, bgcolor: "#f4f6f8" }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" pb={2}>
          <Typography variant="h5" fontWeight="bold" color="primary">
            Active Chat
          </Typography>
          <Box>
            <IconButton onClick={handleProfileClick}>
              <Avatar>
                <AccountCircleIcon />
              </Avatar>
            </IconButton>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
              <MenuItem disabled>Signed in as: {username}</MenuItem>
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </Box>
        </Box>

        {/* Chat Messages */}
        <Box sx={{ maxHeight: 400, overflowY: "auto", p: 2, borderRadius: 2, bgcolor: "#ffffff" }}>
          {messages.map((msg, index) => (
            <Box key={index} sx={{ my: 1, p: 1.5, borderRadius: 2, bgcolor: msg.sender === username ? "#dcf8c6" : "#e3f2fd" }}>
              <Typography variant="body2">{msg.content}</Typography>
              <Typography variant="caption" sx={{ display: "block", textAlign: "right", color: "gray" }}>
                {new Date(msg.timestamp).toLocaleTimeString()}
              </Typography>
            </Box>
          ))}
          <div ref={messagesEndRef} />
        </Box>

        {/* Message Input */}
        <Box display="flex" gap={1} mt={2}>
          <TextField fullWidth variant="outlined" placeholder="Type a message..." value={message} onChange={(e) => setMessage(e.target.value)} />
          <Button variant="contained" color="primary" onClick={sendMessage}>
            <SendIcon />
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default ChatApp;
