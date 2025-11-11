import { useNavigate, useSearchParams } from "react-router-dom";
import kiwaImage from "../../assets/airports/KIWA.png";
import styles from "./Sim.module.css";
import { IconButton } from "@mui/joy";
import HomeIcon from "@mui/icons-material/Home";

export default function Sim() {
  const [searchParams] = useSearchParams();
  const scenario = searchParams.get("scenario");
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <div className={styles.simHUD}>
        <IconButton
          onClick={() => {
            navigate("/");
          }}
          className={styles.homeButton}
          variant="plain"
          color="primary"
        >
          <HomeIcon />
        </IconButton>
        <p>Selected Scenario: {scenario}</p>
      </div>
      <img
        src={kiwaImage}
        alt="Phoenix-Mesa Gateway Airport (KIWA)"
        className={styles.airportImage}
      />
    </div>
  );
}
