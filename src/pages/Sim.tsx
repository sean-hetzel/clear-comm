import { useSearchParams } from "react-router-dom";
import kiwaImage from "../assets/airports/KIWA.png";
import styles from "./Sim.module.css";

export default function Sim() {
  const [searchParams] = useSearchParams();
  const scenario = searchParams.get("scenario");

  return (
    <div className={styles.container}>
      <p>Selected Scenario: {scenario}</p>
      <img
        src={kiwaImage}
        alt="Phoenix-Mesa Gateway Airport (KIWA)"
        className={styles.airportImage}
      />
    </div>
  );
}
