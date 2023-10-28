import React from "react";
import Summary from "./summary";
import Home from "./home";
import Progress from "./progress"
import "./styles.css";

function App() {
  return (
    <div className="h-screen">
      <Home />
      <Progress/>
      {/* <Summary /> */}
    </div>
  );
}

export default App;
