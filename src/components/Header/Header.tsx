import { Button } from "@mui/joy";
import styles from "./Header.module.css";
import { useNavigate } from "react-router-dom";
import { makeTextMakeSense } from "../../utils/makeTextmakeSense";

type HeaderProps = {
  scenario?: string | null;
  legIds?: string[];
  legIndex?: number;
  handleNext?: () => void;
  isCompleted?: boolean;
  onShowStats?: () => void;
};

export default function Header(props: HeaderProps) {
  const {
    scenario,
    legIds = [],
    legIndex = 0,
    // handleNext,
    isCompleted = false,
    onShowStats,
  } = props;
  const navigate = useNavigate();

  return (
    <div className={styles.simHUD}>
      <Button
        onClick={() => navigate("/")}
        className={styles.homeButton}
        color="neutral"
        variant="soft"
      >
        Home
      </Button>
      {/* <Button onClick={handleNext} variant="outlined">
        Next
      </Button> */}
      {isCompleted && onShowStats && (
        <Button onClick={onShowStats} variant="outlined" color="neutral">
          Stats
        </Button>
      )}
      <p>
        <span className={styles.infoTitle}>Scenario:</span> {scenario}
      </p>
      <p>
        <span className={styles.infoTitle}>Current Leg:</span>{" "}
        {makeTextMakeSense(legIds[legIndex - 1] ?? "") || "None"}
      </p>
    </div>
  );
}
