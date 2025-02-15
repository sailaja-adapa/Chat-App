import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";  // Assuming you're using React state
import ChatApp from "./components/ChatApp";
import Register from "./components/Register";
import Login from "./components/Login";

function App() {
  // Define isAuthenticated state (for demonstration)
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Set to true if the user is authenticated

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/chat" element={<ChatApp /> }/>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
