import { useEffect, useRef } from "react";
import styles from "./Chat.module.css";

export type ChatEntry = {
  sender: "ATC" | "User";
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

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [history.length]);

  return (
    <div className={styles.chatBox} role="log" aria-live="polite">
      <div className={styles.header}>{title}</div>
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
              <span>{entry.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
