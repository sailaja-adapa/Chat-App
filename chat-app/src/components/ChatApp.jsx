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

// Connect to the Socket.io server on port 5004
const socket = io("https://serverurl.onrender.com");

const ChatApp = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]); // Active chat messages
  const [historyChats, setHistoryChats] = useState([]); // Chat history
  const [anchorEl, setAnchorEl] = useState(null);
  const messagesEndRef = useRef(null);

  // Retrieve logged-in user and connect socket
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.username) {
      setUsername(user.username);
    } else {
      navigate("/login");
    }

    socket.on("connect", () =>
      console.log("Connected to socket with ID:", socket.id)
    );

    // Listen for incoming messages from server/others
    socket.on("message", (newMessage) => {
      // If the message is from the current user, mark it as a server echo.
      if (newMessage.sender === username) {
        newMessage.isServerEcho = true;
      }
      setMessages((prev) => [...prev, newMessage]);
      scrollToBottom();
    });

    return () => {
      socket.off("message");
    };
  }, [navigate, username]);

  // Fetch chat history from your API
  useEffect(() => {
    if (username) {
      fetchChatHistory();
    }
  }, [username]);

  const fetchChatHistory = async () => {
    try {
      const url = "https://chat-app-6-9b0u.onrender.com/api/messages";
      const response = await fetch(url);
      const data = await response.json();
      if (data.data) {
        // Map data to message objects
        const allMessages = data.data.map((item) => item.attributes || item);
        // Optionally, filter messages for chat history if needed
        const userHistory = allMessages.filter(
          (msg) =>
            msg.sender?.trim().toLowerCase() === username.trim().toLowerCase()
        );
        setHistoryChats(userHistory);
      }
    } catch (error) {
      console.error("Error fetching chat history:", error);
    }
  };

  // Send message (triggered by button click or Enter key)
  const sendMessage = async () => {
    if (message.trim()) {
      const newMessage = {
        sender: username,
        content: message,
        timestamp: new Date().toISOString(),
      };

      // Optimistic update: show user message immediately on the right
      setMessages((prev) => [...prev, newMessage]);
      socket.emit("message", newMessage);
      setMessage("");

      try {
        const response = await fetch(
          "https://chat-app-6-9b0u.onrender.com/api/messages",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ data: newMessage }),
          }
        );
        const result = await response.json();
        if (!response.ok) {
          console.error("Failed to store message:", result.error);
        }
      } catch (error) {
        console.error("Error storing message:", error);
      }

      scrollToBottom();
    }
  };

  // Handle Enter key press to send message
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Scroll to the bottom of the chat window
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Profile menu handlers
  const handleProfileClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("jwt");
    navigate("/login");
  };

  // Start a new chat (clears active chat and refreshes history)
  const startNewChat = () => {
    setMessages([]);
    fetchChatHistory();
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, display: "flex" }}>
      {/* Sidebar: Chat History */}
      <Paper elevation={3} sx={{ width: 250, p: 2, mr: 2, borderRadius: 3 }}>
        <Typography variant="h6" fontWeight="bold">
          Chat History
        </Typography>
        <List>
          {historyChats.length > 0 ? (
            historyChats.map((chat, index) =>
              chat?.content ? (
                <ListItem key={index}>
                  <ListItemText
                    primary={chat.content}
                    secondary={`From: ${chat.sender}`}
                  />
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
        <Button
          startIcon={<AddIcon />}
          fullWidth
          variant="contained"
          onClick={startNewChat}
        >
          New Chat
        </Button>
      </Paper>

      {/* Main Chat Window */}
      <Paper
        elevation={6}
        sx={{ flex: 1, p: 3, borderRadius: 3, bgcolor: "#f4f6f8" }}
      >
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          pb={2}
        >
          <Typography variant="h5" fontWeight="bold" color="primary">
            Active Chat
          </Typography>
          <Box>
            <IconButton onClick={handleProfileClick}>
              <Avatar>
                <AccountCircleIcon />
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem disabled>Signed in as: {username}</MenuItem>
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </Box>
        </Box>

        {/* Chat Messages */}
        <Box
          sx={{
            maxHeight: 400,
            overflowY: "auto",
            p: 2,
            borderRadius: 2,
            bgcolor: "#ffffff",
          }}
        >
          {messages.map((msg, index) => (
            <Box
              key={index}
              sx={{
                display: "flex",
                // If the message is from the user and not a server echo, align right;
                // otherwise (server echo or messages from others), align left.
                justifyContent:
                  msg.sender === username && !msg.isServerEcho
                    ? "flex-end"
                    : "flex-start",
                mb: 1,
              }}
            >
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  maxWidth: "70%",
                  // Use a different background color for the user’s optimistic messages
                  // and server echoes (which appear on the left).
                  backgroundColor:
                    msg.sender === username && !msg.isServerEcho
                      ? "#dcf8c6"
                      : "#e3f2fd",
                  boxShadow: 1,
                }}
              >
                <Typography variant="body2" sx={{ wordWrap: "break-word" }}>
                  {msg.content}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ display: "block", textAlign: "right", color: "gray" }}
                >
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </Typography>
              </Box>
            </Box>
          ))}
          <div ref={messagesEndRef} />
        </Box>

        {/* Message Input */}
        <Box display="flex" gap={1} mt={2}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            multiline
            maxRows={4}
          />
          <Button variant="contained" color="primary" onClick={sendMessage}>
            <SendIcon />
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default ChatApp;
