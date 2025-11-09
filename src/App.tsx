import { Routes, Route } from "react-router-dom";
import "./App.css";
import Simulator from "./pages/Sim/Sim";
import Home from "./pages/Home/Home";
import { useState } from "react";

function App() {
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            <Home
              selectedScenario={selectedScenario}
              setSelectedScenario={setSelectedScenario}
            />
          }
        />
        <Route path="/sim" element={<Simulator />} />
      </Routes>
    </>
  );
}

export default App;
