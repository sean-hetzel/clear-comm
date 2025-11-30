import { useSearchParams } from "react-router-dom";
import { useState, useRef, useEffect, useCallback } from "react";
import styles from "./Sim.module.css";
import KIWAImage from "../../assets/flightPaths/KIWA-Closed-Traffic.svg?react";
import AirplaneIcon from "../../assets/AirplaneIcon.svg?react";
import useVoiceCommand from "../../utils/useVoiceCommand";
import { useSpeakText } from "../../utils/useSpeakText";
import { isMobile } from "../../utils/isMobile";
import scenarios from "../../data/scenarios.json";
import Chat from "../../components/Chat/Chat";
import type { ChatEntry } from "../../components/Chat/Chat";
import Header from "../../components/Header/Header";
import CompletionModal from "../../components/CompletionModal/CompletionModal";

export default function Sim() {
  const [searchParams] = useSearchParams();
  const scenario = searchParams.get("scenario");
  const [legIndex, setLegIndex] = useState(0); // which leg the user is on
  const [chatHistory, setChatHistory] = useState<ChatEntry[]>([]);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const airplaneRef = useRef<HTMLDivElement | null>(null);
  const announcedLegRef = useRef<number | null>(null);
  const chatAddedRef = useRef<Set<number>>(new Set());

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
    setLegIndex((i) => {
      const nextIndex = i < legIds.length ? i + 1 : i;
      // Check if we've reached the end
      if (nextIndex === legIds.length) {
        setShowCompletionModal(true);
      }
      return nextIndex;
    });
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
    threshold: 0.3,
    onMatch: (_t, raw) => {
      // Append the user's readback (what was heard) to the chat
      setChatHistory((prev) => [...prev, { sender: "You", message: raw }]);
      setCorrectCount((c) => c + 1);
    },
    onNotMatch: (_t, raw) => {
      // Add the incorrect readback to chat
      setChatHistory((prev) => [...prev, { sender: "You", message: raw }]);
      setIncorrectCount((c) => c + 1);

      // Repeat the current instruction when readback doesn't match
      const currentInstruction =
        selectedScenarioObj?.legs?.[legIndex]?.instruction;
      const currentSender =
        selectedScenarioObj?.legs?.[legIndex]?.sender ?? "ATC";
      
      if (currentInstruction) {
        // Special handling for Hint - determine sender based on readback content
        if (currentSender === "Hint") {
          // Check if readback contains "Ground" or "Tower" to determine who responds
          const respondingSender = currentReadback.toLowerCase().includes("ground")
            ? "Gateway Ground"
            : currentReadback.toLowerCase().includes("tower")
            ? "Gateway Tower"
            : "Gateway Ground"; // Default to Ground if neither found
          
          const sayAgainMessage = "Aircraft calling, say again.";
          useSpeakText(sayAgainMessage).catch((err) => console.error(err));
          setChatHistory((prev) => [
            ...prev,
            { sender: respondingSender, message: sayAgainMessage },
          ]);
        } else {
          // Add "negative" after callsign pattern (e.g., "Sue 7 18" -> "Sue 7 18, negative")
          // Match "Sue" followed by digits/spaces pattern
          const modifiedInstruction = currentInstruction.replace(
            /(Sue(?:\s+\d+)+)/i,
            "$1, negative,"
          );
          useSpeakText(modifiedInstruction).catch((err) => console.error(err));
          // Add to chat history
          setChatHistory((prev) => [
            ...prev,
            { sender: currentSender, message: modifiedInstruction },
          ]);
        }
      }
    },
  });

  // Separate effect for announcing instructions (runs when legIndex changes)
  useEffect(() => {
    const currentInstruction =
      selectedScenarioObj?.legs?.[legIndex]?.instruction;
    const currentSender =
      selectedScenarioObj?.legs?.[legIndex]?.sender ?? "ATC";

    // Announce if we haven't announced this leg yet
    if (currentInstruction && announcedLegRef.current !== legIndex) {
      announcedLegRef.current = legIndex;

      // Only speak if not a Hint (hints are silent)
      if (currentSender !== "Hint") {
        // Small delay to ensure speech synthesis is ready when navigating from homepage
        setTimeout(() => {
          useSpeakText(currentInstruction).catch((err) => console.error(err));
        }, 100);
      }

      // Only add to chat if we haven't added this leg before
      if (!chatAddedRef.current.has(legIndex)) {
        chatAddedRef.current.add(legIndex);
        setChatHistory((prev) => [
          ...prev,
          { sender: currentSender, message: currentInstruction },
        ]);
      }
    }
  }, [legIndex, selectedScenarioObj]);

  useEffect(() => {
    const svg = svgRef.current;
    const airplane = airplaneRef.current;

    if (!svg || !airplane) return;

    const airplaneEl = airplane as HTMLDivElement;
    const svgEl = svg as SVGSVGElement;

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
      } else {
        // Animation complete - if readback is empty, automatically advance
        if (currentReadback === "") {
          handleNext();
        }
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
      <Header
        scenario={scenario}
        legIds={legIds}
        legIndex={legIndex}
        handleNext={handleNext}
        isCompleted={legIndex === legIds.length}
        onShowStats={() => setShowCompletionModal(true)}
      />
      <div className={styles.simArea}>
        <div className={styles.stage}>
          {/* SVG flight path */}
          <KIWAImage ref={svgRef} className={styles.airportImage} />
          {/* Airplane marker */}
          <div ref={airplaneRef} className={styles.airplane}>
            <AirplaneIcon
              width={isMobile() ? 20 : 30}
              height={isMobile() ? 20 : 30}
            />
          </div>
        </div>
      </div>
      {/* Chat overlay */}
      <Chat history={chatHistory} />
      {/* Completion modal */}
      {showCompletionModal && (
        <CompletionModal
          correctCount={correctCount}
          incorrectCount={incorrectCount}
          onClose={() => setShowCompletionModal(false)}
        />
      )}
    </div>
  );
}
