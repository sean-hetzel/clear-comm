import { Autocomplete, Button } from "@mui/joy";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Home.module.css";
import clearCommLogo from "../../assets/airplane.svg";

interface HomeProps {
  selectedScenario: string | null;
  setSelectedScenario: (scenario: string | null) => void;
}

export default function Home(props: HomeProps) {
  const { selectedScenario, setSelectedScenario } = props;

  const options = [
    "IWA - Departure",
    "IWA - Arrival",
    "IWA - Closed Traffic",
    "TUS - Departure",
    "TUS - Arrival",
  ];

  // Optionally store selected scenario
  const [isError, setIsError] = useState(false);
  const navigate = useNavigate();

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

  return (
    <div className={styles.container}>
      <div className={styles.mainMenu}>
        <div className={styles.clearCommContainer}>
          <h1>Clear Comm</h1>
          <img
            src={clearCommLogo}
            className={styles.clearCommLogo}
            alt="Clear Comm Logo"
          />
        </div>
        <Autocomplete
          placeholder="Select Scenario"
          options={options}
          variant="soft"
          value={selectedScenario}
          error={isError}
          onChange={(_, newValue) => setSelectedScenario(newValue)}
        />
        <Button onClick={handleStart}>Start</Button>
        <Button variant="outlined">Test Microphone</Button>
      </div>
      <span className={styles.photoCredit}>
        Photo by{" "}
        <a
          href="https://unsplash.com/@castroalves?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText"
          target="_none"
        >
          Cadu de Castro Alves
        </a>{" "}
        on{" "}
        <a
          href="https://unsplash.com/photos/an-airplane-is-flying-in-the-blue-sky-A85EFURRFLU?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText"
          target="_none"
        >
          Unsplash
        </a>
      </span>
    </div>
  );
}
