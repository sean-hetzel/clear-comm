import { useEffect, useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import "./App.css";

import { Autocomplete, Button } from "@mui/joy";
import Simulator from "./pages/Sim";

function App() {
  const navigate = useNavigate();

  const options = [
    "IWA - Departure",
    "IWA - Arrival",
    "IWA - Closed Traffic",
    "TUS - Departure",
    "TUS - Arrival",
  ];

  // Optionally store selected scenario
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);

  useEffect(() => {
    if (selectedScenario) {
      setIsError(false);
    }
  }, [selectedScenario]);

  const handleStart = () => {
    if (!selectedScenario) {
      setIsError(true);
      return;
    }

    // Convert the scenario name to a URL-friendly format and navigate with query param
    const scenarioParam = encodeURIComponent(selectedScenario);
    navigate(`/sim?scenario=${scenarioParam}`);
  };

  const [isError, setIsError] = useState(false);

  return (
    <>
      <Routes>
        {/* Main Menu Page */}
        <Route
          path="/"
          element={
            <div className="main-menu">
              <h1>Clear Comm</h1>

              <Autocomplete
                placeholder="Select Scenario"
                options={options}
                variant="soft"
                value={selectedScenario}
                error={isError}
                onChange={(_, newValue) => setSelectedScenario(newValue)}
              />
              <Button onClick={handleStart}>Start</Button>
            </div>
          }
        />

        {/* Simulator Page */}
        <Route path="/sim" element={<Simulator />} />
      </Routes>
      <span className="photo-credit">
        Photo by{" "}
        <a
          href="https://unsplash.com/@abderrahmanemeftah?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText"
          target="_none"
        >
          Abderrahmane Meftah
        </a>{" "}
        on{" "}
        <a
          href="https://unsplash.com/photos/white-clouds-and-blue-sky-during-daytime-K31pxnUmaRE?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText"
          target="_none"
        >
          Unsplash
        </a>
      </span>
    </>
  );
}

export default App;
