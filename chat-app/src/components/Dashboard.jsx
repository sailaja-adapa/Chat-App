import React from "react";
import { AppBar, Toolbar, Button, Typography, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        height: "110vh",
        backgroundImage: `url("https://img.freepik.com/premium-vector/chatbot-customer-service-abstract-concept-vector-illustration_107173-25718.jpg?ga=GA1.1.494612788.1718189209&semt=ais_hybrid")`, // Add full Base64 string
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <AppBar position="static">
        <Toolbar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6">Dashboard</Typography>
          </Box>
          <Button color="inherit" onClick={() => navigate("/register")}>
            Register
          </Button>
          <Button color="inherit" onClick={() => navigate("/login")}>
            Login
          </Button>
        </Toolbar>
      </AppBar>
      <Box sx={{ p: 3 }}>
      </Box>
    </Box>
  );
};

export default Dashboard;
