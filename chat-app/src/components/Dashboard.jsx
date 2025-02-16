import React from "react";
import { AppBar, Toolbar, Button, Typography, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import AppRegistrationIcon from "@mui/icons-material/AppRegistration";
import LoginIcon from "@mui/icons-material/Login";

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        height: "110vh",
        backgroundImage: `url("https://cdn.analyticsvidhya.com/wp-content/uploads/2023/07/ck340ov180hsy65g0yxb6gbhb-1-chatbots-for-marketing-smm.one-half_4fnXbfN.png")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <AppBar
        position="static"
        sx={{
          backgroundColor: "rgba(19, 146, 210, 0.7)", // Blue with 70% transparency
          boxShadow: "none",
        }}
      >
        <Toolbar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" sx={{ color: "white" }}>
              Dashboard
            </Typography>
          </Box>
          <Button
            sx={{ color: "white" }}
            startIcon={<AppRegistrationIcon />}
            onClick={() => navigate("/register")}
          >
            Register
          </Button>
          <Button
            sx={{ color: "white" }}
            startIcon={<LoginIcon />}
            onClick={() => navigate("/login")}
          >
            Login
          </Button>
        </Toolbar>
      </AppBar>
      <Box sx={{ p: 3 }}></Box>
    </Box>
  );
};

export default Dashboard;
