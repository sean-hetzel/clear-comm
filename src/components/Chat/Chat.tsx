import { useEffect, useRef, useState } from "react";
import styles from "./Chat.module.css";
import { makeTextMakeSense } from "../../utils/makeTextmakeSense";

export type ChatEntry = {
  sender: "ATC" | "You";
  message: string;
};

export default function Chat({
  history,
  title = "Radio",
}: {
  history: ChatEntry[];
  title?: string;
}) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [history.length]);

  return (
    <div
      className={`${styles.chatBox} ${isMinimized ? styles.minimized : ""}`}
      role="log"
      aria-live="polite"
    >
      <div className={styles.header}>
        <span>{title}</span>
        <button
          className={styles.minimizeBtn}
          onClick={() => setIsMinimized(!isMinimized)}
          aria-label={isMinimized ? "Expand chat" : "Minimize chat"}
        >
          {isMinimized ? "+" : "−"}
        </button>
      </div>
      {!isMinimized && (
        <div ref={scrollerRef} className={styles.chatHistory}>
          {history.length === 0 ? (
            <div className={styles.empty}>No transmissions yet.</div>
          ) : (
            history.map((entry, idx) => (
              <div key={idx} className={styles.line}>
                <strong
                  className={`${styles.role} ${
                    entry.sender === "ATC" ? styles.atc : styles.user
                  }`}
                >
                  {entry.sender}:
                </strong>
                <span>{makeTextMakeSense(entry.message)}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
