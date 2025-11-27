import { Button } from "@mui/joy";
import styles from "./Header.module.css";
import { useNavigate } from "react-router-dom";

type HeaderProps = {
  scenario?: string | null;
  legIds?: string[];
  legIndex?: number;
  handleNext?: () => void;
};

export default function Header(props: HeaderProps) {
  const { scenario, legIds = [], legIndex = 0, handleNext } = props;
  const navigate = useNavigate();

  return (
    <div className={styles.simHUD}>
      <Button
        onClick={() => navigate("/")}
        className={styles.homeButton}
        color="primary"
      >
        Home
      </Button>
      {/* Temp: */}
      <Button onClick={handleNext} variant="outlined">
        Next
      </Button>
      <p>
        <span className={styles.infoTitle}>Scenario:</span> {scenario}
      </p>
      <p>
        <span className={styles.infoTitle}>Current Leg:</span>{" "}
        {legIds[legIndex - 1] || "None"}
      </p>
    </div>
  );
}
