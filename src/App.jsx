import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./components/Home";
import Templates from "./components/Templates";
function App() {
  return (
    <Router>
      <div className="bg-background font-sans antialiased text-foreground">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/templates" element={<Templates />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;