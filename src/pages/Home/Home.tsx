import { Autocomplete, Button } from "@mui/joy";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Home.module.css";

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
      <span className={styles.photoCredit}>
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
    </div>
  );
}
