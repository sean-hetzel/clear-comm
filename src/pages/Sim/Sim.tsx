import { useNavigate, useSearchParams } from "react-router-dom";
import { useState, useRef, useEffect, useCallback } from "react";
import styles from "./Sim.module.css";
import { Button, IconButton } from "@mui/joy";
import HomeIcon from "@mui/icons-material/Home";
import KIWAImage from "../../assets/flightPaths/KIWA-Closed-Traffic-Test.svg?react";
import AirplaneIcon from "../../assets/AirplaneIcon.svg?react";
import useVoiceCommand from "../../utils/useVoiceCommand";
import { useSpeakText } from "../../utils/useSpeakText";
import scenarios from "../../data/scenarios.json";
import Chat from "../../components/Chat/Chat";
import type { ChatEntry } from "../../components/Chat/Chat";

export default function Sim() {
  const [searchParams] = useSearchParams();
  const scenario = searchParams.get("scenario");
  const navigate = useNavigate();

  const [legIndex, setLegIndex] = useState(0); // which leg the user is on
  const [chatHistory, setChatHistory] = useState<ChatEntry[]>([]);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const airplaneRef = useRef<HTMLDivElement | null>(null);

  // If scenarios.json has multiple scenarios, choose the one that matches the query param (if any),
  // otherwise fall back to the first scenario. Use the `legs` ids as a flat array of strings.
  const selectedScenarioObj =
    scenarios.data?.find((s) => s.name === scenario) || scenarios.data?.[0];
  const legIds = selectedScenarioObj?.legs?.map((l) => l.id) ?? [];
  const currentReadback = selectedScenarioObj?.legs?.[legIndex]?.readback ?? "";

  // Hook listens for "Next" and triggers handleNext
  // Keep the handler stable to avoid recreating speech recognition on each render
  const handleNext = useCallback(() => {
    // Allow advancing through all legs. legIndex values are: 0 (start) up to legIds.length
    setLegIndex((i) => (i < legIds.length ? i + 1 : i));
  }, [legIds.length]);

  useEffect(() => {
    // This effect runs on mount and sets up something if needed
    return () => {
      // Cleanup on unmount
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
    };
  }, []); // empty dependency → runs only on mount/unmount

  useVoiceCommand(handleNext, currentReadback, {
    matchMode: "tokens",
    threshold: 0.5,
    onMatch: (_t, raw) => {
      // Append the user's readback (what was heard) to the chat
      setChatHistory((prev) => [...prev, { sender: "User", message: raw }]);
    },
  });

  useEffect(() => {
    const svg = svgRef.current;
    const airplane = airplaneRef.current;

    if (!svg || !airplane) return;

    const airplaneEl = airplane as HTMLDivElement;
    const svgEl = svg as SVGSVGElement;

    // Announce instruction for the current leg if it exists
    const currentInstruction =
      selectedScenarioObj?.legs?.[legIndex]?.instruction;
    if (currentInstruction) {
      useSpeakText(currentInstruction).catch((err) => console.error(err));
      setChatHistory((prev) => [
        ...prev,
        { sender: "ATC", message: currentInstruction },
      ]);
    }

    // Determine which leg to animate
    if (legIndex === 0) {
      // Place airplane at the start of the first leg (upwind)
      const firstPath = svgEl.querySelector(
        `#${legIds[0]}`
      ) as SVGPathElement | null;

      if (firstPath) {
        const startPoint = firstPath.getPointAtLength(0);

        const bbox = svgEl.getBoundingClientRect();
        const svgWidth = svgEl.viewBox.baseVal.width;
        const svgHeight = svgEl.viewBox.baseVal.height;

        const scaleX = bbox.width / svgWidth;
        const scaleY = bbox.height / svgHeight;

        airplaneEl.style.left = `${startPoint.x * scaleX}px`;
        airplaneEl.style.top = `${startPoint.y * scaleY}px`;
        // Determine initial heading using a small offset along the path
        const nextStartPoint = firstPath.getPointAtLength(
          Math.min(1, firstPath.getTotalLength())
        );
        const dxStart = (nextStartPoint.x - startPoint.x) * scaleX;
        const dyStart = (nextStartPoint.y - startPoint.y) * scaleY;
        const angleStartRad = Math.atan2(dyStart, dxStart);
        const angleStartDeg = (angleStartRad * 180) / Math.PI;
        airplaneEl.style.transform = `translate(-50%, -50%) rotate(${angleStartDeg}deg)`;
      }

      return; // No animation yet, just position it
    }

    // Animate the current leg
    const currentPathId = legIds[legIndex - 1];
    const path = svgEl.querySelector(
      `#${currentPathId}`
    ) as SVGPathElement | null;
    if (!path) return;
    // Create a non-null local reference so the closure can use it without
    // TypeScript complaining about possible null.
    const pathEl = path as SVGPathElement;

    const total = pathEl.getTotalLength();
    let progress = 0;
    // Cancel any previous animation frame for safety
    let rafId: number | null = null;

    function animate() {
      const point = pathEl.getPointAtLength(progress);
      const nextProgress = Math.min(progress + 1, total);
      const nextPoint = pathEl.getPointAtLength(nextProgress);

      const bbox = svgEl.getBoundingClientRect();
      const svgWidth = svgEl.viewBox.baseVal.width;
      const svgHeight = svgEl.viewBox.baseVal.height;

      const scaleX = bbox.width / svgWidth;
      const scaleY = bbox.height / svgHeight;

      airplaneEl.style.left = `${point.x * scaleX}px`;
      airplaneEl.style.top = `${point.y * scaleY}px`;

      // Compute heading angle from current point to next point, convert to deg
      const dx = (nextPoint.x - point.x) * scaleX;
      const dy = (nextPoint.y - point.y) * scaleY;
      const angleRad = Math.atan2(dy, dx);
      const angleDeg = (angleRad * 180) / Math.PI;

      // Apply rotation while keeping the translate(-50%, -50%) centering
      airplaneEl.style.transform = `translate(-50%, -50%) rotate(${angleDeg}deg)`;

      progress += 3;

      if (progress <= total) {
        rafId = requestAnimationFrame(animate);
      }
    }

    // cancel previous RAF if any then start
    try {
      if (rafId) cancelAnimationFrame(rafId);
    } catch (e) {}
    rafId = requestAnimationFrame(animate);

    // cleanup: cancel animation on effect teardown
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [legIndex]);

  return (
    <div className={styles.container}>
      <div className={styles.simHUD}>
        <IconButton
          onClick={() => navigate("/")}
          className={styles.homeButton}
          variant="plain"
          color="primary"
        >
          <HomeIcon />
        </IconButton>

        <Button onClick={handleNext}>Next</Button>

        <p>Selected Scenario: {scenario}</p>
        <p>Current Leg: {legIds[legIndex - 1] || "None yet"}</p>
      </div>

      <div className={styles.simArea}>
        <div className={styles.stage}>
          {/* SVG flight path */}
          <KIWAImage ref={svgRef} className={styles.airportImage} />

          {/* Airplane marker */}
          <div ref={airplaneRef} className={styles.airplane}>
            <AirplaneIcon width={50} height={50} />
          </div>
        </div>
      </div>
      {/* Chat overlay */}
      <Chat history={chatHistory} />
    </div>
  );
}
