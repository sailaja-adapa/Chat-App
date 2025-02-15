import React, { useState } from "react";
import {
  Container,
  TextField,
  Button,
  Paper,
  Typography,
  Box,
  Link,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async () => {
    try {
      const response = await axios.post(
        "https://chat-app-6-9b0u.onrender.com/api/auth/local/register",
        {
          username: formData.username,
          email: formData.email,
          password: formData.password,
        }
      );

      if (response.status === 200) {
        toast.success("🎉 Registration Successful! Redirecting to login...", {
          position: "top-center",
          autoClose: 3000,
        });
        setTimeout(() => navigate("/login"), 3000);
      }
    } catch (error) {
      console.error("Error registering user:", error.response?.data || error.message);
      toast.error(
        error.response?.data?.error?.message || "❌ Registration failed. Try again.",
        { position: "top-center", autoClose: 3000 }
      );
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        backgroundImage: `url('https://img.freepik.com/premium-vector/abstract-background-blue-light-colour-vector-banner-background-design_8499-2007.jpg')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <ToastContainer />
      <Typography
        variant="h2"
        fontWeight="bold"
        color="black"
        sx={{ mb: 3 }}
      >
        Registration
      </Typography>
      
      <Container
        maxWidth="xs"
        sx={{
          transition: "0.5s",
          "&:hover": {
            transform: "scale(1.05)",
          },
        }}
      >
        <Paper
          elevation={10}
          sx={{
            p: 4,
            borderRadius: 4,
            backdropFilter: "blur(10px)",
            background: "rgba(255, 255, 255, 0.6)",
            textAlign: "center",
            border: "1px solid rgba(0, 0, 0, 0.2)",
            color: "black",
          }}
        >
          <Typography variant="h4" fontWeight="bold" color="black" gutterBottom>
            Create an Account
          </Typography>

          <TextField
            fullWidth
            label="Username"
            name="username"
            variant="outlined"
            margin="normal"
            InputProps={{
              style: {
                color: "black",
                backgroundColor: "rgba(255,255,255,0.8)",
                borderRadius: "5px",
              },
            }}
            InputLabelProps={{ style: { color: "black" } }}
            onChange={handleChange}
          />
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            variant="outlined"
            margin="normal"
            InputProps={{
              style: {
                color: "black",
                backgroundColor: "rgba(255,255,255,0.8)",
                borderRadius: "5px",
              },
            }}
            InputLabelProps={{ style: { color: "black" } }}
            onChange={handleChange}
          />
          <TextField
            fullWidth
            label="Password"
            name="password"
            type="password"
            variant="outlined"
            margin="normal"
            InputProps={{
              style: {
                color: "black",
                backgroundColor: "rgba(255,255,255,0.8)",
                borderRadius: "5px",
              },
            }}
            InputLabelProps={{ style: { color: "black" } }}
            onChange={handleChange}
          />

          <Button
            fullWidth
            variant="contained"
            sx={{
              mt: 3,
              py: 1.5,
              fontSize: "1rem",
              background: "linear-gradient(135deg, #0033cc, #0099ff)",
              color: "white",
              transition: "0.3s",
              "&:hover": {
                background: "linear-gradient(135deg, #0099ff, #0033cc)",
                transform: "scale(1.05)",
              },
            }}
            onClick={handleRegister}
          >
            Register
          </Button>

          <Typography variant="body2" color="black" sx={{ mt: 2 }}>
            Already have an account?{" "}
            <Link
              href="/login"
              sx={{
                color: "#0033cc",
                fontWeight: "bold",
                textDecoration: "none",
                "&:hover": { textDecoration: "underline" },
              }}
            >
              Login here
            </Link>
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default Register;