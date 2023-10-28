import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Summary from "./summary";
import Home from "./home";
import Progress from "./progress";
import "./styles.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/summary" element={<Summary />} />
      </Routes>
    </Router>
  );
}

export default App;
