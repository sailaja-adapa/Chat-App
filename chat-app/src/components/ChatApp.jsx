import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
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

// Connect to your Socket.io server
const socket = io("https://serverurl.onrender.com");

const ChatApp = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]); // Active chat messages
  const [historyChats, setHistoryChats] = useState([]); // Chat history
  const [anchorEl, setAnchorEl] = useState(null);
  const messagesEndRef = useRef(null);

  // On mount: get user info & setup socket connection
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.username) {
      setUsername(user.username);
    } else {
      navigate("/login");
    }

    socket.on("connect", () =>
      console.log("Connected with ID:", socket.id)
    );

    socket.on("message", (newMessage) => {
      // Previously, we marked own messages as server echo.
      // Now, we want to show all messages from the user on the right.
      setMessages((prev) => [...prev, newMessage]);
      scrollToBottom();
    });

    return () => {
      socket.off("message");
    };
  }, [navigate, username]);

  // Fetch chat history once username is set
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
        const allMessages = data.data.map((item) => item.attributes || item);
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

  // Send message via button click or Enter key press
  const sendMessage = async () => {
    if (message.trim()) {
      const newMessage = {
        sender: username,
        content: message,
        timestamp: new Date().toISOString(),
      };

      // Optimistically update messages
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

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

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

  const startNewChat = () => {
    setMessages([]);
    fetchChatHistory();
  };

  return (
    <Box
      sx={{
        backgroundImage:
          'url(https://botnation.ai/site/wp-content/uploads/2024/01/chatbot-leads.webp)',
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: "100vh",
        p: 4,
      }}
    >
      <Paper
        sx={{
          maxWidth: 900,
          mx: "auto",
          p: 4,
          borderRadius: 3,
          backgroundColor: "rgba(255,255,255,0.7)",
        }}
      >
        <Box sx={{ display: "flex", gap: 2 }}>
          {/* Chat History Container */}
          <Paper
            sx={{
              flex: "0 0 250px",
              p: 2,
              border: "2px solid black",
              borderRadius: 2,
            }}
          >
            <Typography variant="h6" fontWeight="bold" mb={1}>
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

          {/* Active Chat Container */}
          <Paper
            sx={{
              flex: 1,
              p: 2,
              border: "2px solid black",
              borderRadius: 2,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
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

            <Paper
              sx={{
                p: 2,
                bgcolor: "#ffffff",
                overflowY: "auto",
                maxHeight: 400,
                borderRadius: 2,
              }}
            >
              {messages.map((msg, index) => (
                <Box
                  key={index}
                  sx={{
                    display: "flex",
                    justifyContent:
                      msg.sender === username ? "flex-end" : "flex-start",
                    mb: 1,
                  }}
                >
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      maxWidth: "70%",
                      backgroundColor:
                        msg.sender === username ? "#dcf8c6" : "#e3f2fd",
                      boxShadow: 1,
                    }}
                  >
                    <Typography variant="body2" sx={{ wordWrap: "break-word" }}>
                      {msg.content}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        display: "block",
                        textAlign: "right",
                        color: "gray",
                      }}
                    >
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </Typography>
                  </Box>
                </Box>
              ))}
              <div ref={messagesEndRef} />
            </Paper>

            <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
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
        </Box>
      </Paper>
    </Box>
  );
};
export default ChatApp;
