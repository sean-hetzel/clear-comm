import { Button } from "@mui/joy";
import styles from "./Header.module.css";
import { useNavigate } from "react-router-dom";

type HeaderProps = {
  scenario?: string | null;
  legIds?: string[];
  legIndex?: number;
  handleNext?: () => void;
  isCompleted?: boolean;
  onShowStats?: () => void;
  tailNumber?: string;
};

export default function Header(props: HeaderProps) {
  const {
    scenario,
    handleNext,
    isCompleted = false,
    onShowStats,
    tailNumber = "",
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
      <Button onClick={handleNext} variant="outlined">
        Next
      </Button>
      {isCompleted && onShowStats && (
        <Button onClick={onShowStats} variant="outlined" color="neutral">
          Stats
        </Button>
      )}
      <p>
        <span className={styles.infoTitle}>Scenario:</span> {scenario}
      </p>
      <p>
        <span className={styles.infoTitle}>Reg:</span> {tailNumber || "N/A"}
      </p>
    </div>
  );
}
