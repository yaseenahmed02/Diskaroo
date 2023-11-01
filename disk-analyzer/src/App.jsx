import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Summary from "./summary";
import Home from "./home";
import Progress from "./progress";
import "./styles.css";

const DirectoryContext = React.createContext();

function DirectoryProvider({ children }) {
  const [dirPath, setDirPath] = useState("");
  return (
    <DirectoryContext.Provider value={{ dirPath, setDirPath }}>
      {children}
    </DirectoryContext.Provider>
  );
}

function App() {
  return (
    <DirectoryProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/summary" element={<Summary />} />
        </Routes>
      </Router>
    </DirectoryProvider>
  );
}

export { DirectoryContext }; // So that it can be imported and used in other components.
export default App;
