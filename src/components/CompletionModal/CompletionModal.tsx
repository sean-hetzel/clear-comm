import { useNavigate } from "react-router-dom";
import { Button } from "@mui/joy";
import styles from "./CompletionModal.module.css";

interface CompletionModalProps {
  correctCount: number;
  incorrectCount: number;
  onClose: () => void;
}

export default function CompletionModal({
  correctCount,
  incorrectCount,
  onClose,
}: CompletionModalProps) {
  const navigate = useNavigate();
  const total = correctCount + incorrectCount;
  const percentage = total > 0 ? Math.round((correctCount / total) * 100) : 0;

  const handleHome = () => {
    onClose();
    navigate("/");
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button
          className={styles.closeBtn}
          onClick={onClose}
          aria-label="Close modal"
        >
          ×
        </button>
        <h2>Congratulations! ✈️🎉</h2>
        <p>You've completed the scenario!</p>

        <div className={styles.stats}>
          <h3>Your Stats</h3>
          <div className={styles.statRow}>
            <span>Correct Readbacks:</span>
            <span className={styles.correct}>{correctCount}</span>
          </div>
          <div className={styles.statRow}>
            <span>Incorrect Readbacks:</span>
            <span className={styles.incorrect}>{incorrectCount}</span>
          </div>
          <div className={styles.statRow}>
            <span>Total Attempts:</span>
            <span>{total}</span>
          </div>
          <div className={styles.percentage}>
            <strong>{percentage}%</strong> Accuracy
          </div>
        </div>

        <div className={styles.actions}>
          <Button onClick={handleHome} variant="soft" color="neutral" size="lg">
            Return Home
          </Button>
        </div>
      </div>
    </div>
  );
}
