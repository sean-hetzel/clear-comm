import { useEffect, useRef } from "react";

function normalizeText(s: string) {
  return s
    .toLowerCase()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export type VoiceMatchMode = "equals" | "includes" | "tokens";
export interface UseVoiceOptions {
  matchMode?: VoiceMatchMode;
  threshold?: number; // 0..1 for tokens match
  onTranscript?: (transcript: string, raw: string) => void;
  onMatch?: (transcript: string, raw: string, matchedCommand: string) => void;
  onNotMatch?: (transcript: string, raw: string) => void;
}

export default function useVoiceCommand(
  onCommand: () => void,
  commands?: string | string[],
  options?: UseVoiceOptions
) {
  const recognitionRef = useRef<any>(null);
  const isActiveRef = useRef(false);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn("Web Speech API is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.continuous = true; // keep listening
    recognition.lang = "en-US";
    recognition.interimResults = false;

    const {
      matchMode = "equals",
      threshold = 0.5,
      onTranscript,
      onMatch,
      onNotMatch,
    } = options ?? {};

    // Check if commands is empty string before any processing
    const commandsArray = commands
      ? Array.isArray(commands)
        ? commands
        : [commands]
      : null;

    // If any command is an empty string, trigger onCommand immediately
    if (commandsArray && commandsArray.some((cmd) => cmd === "")) {
      try {
        onCommand();
      } catch (err) {
        console.error(err);
      }
      return; // no need to start listening
    }

    // Normalize commands if provided
    let normalizedCommands: string[] | null = null;
    if (commandsArray) {
      normalizedCommands = commandsArray.map((c) => normalizeText(c));
    }

    // If no commands were passed in, do not listen. This removes the old
    // fallback behavior that treated "next" as a special case.
    if (!normalizedCommands) {
      return;
    }

    function tokenMatch(transcript: string, cmd: string, threshold: number) {
      const tTokens = transcript.split(" ").filter(Boolean);
      const cTokens = cmd.split(" ").filter(Boolean);
      if (cTokens.length === 0) return transcript === "";
      let matches = 0;
      const cSet = new Set(cTokens);
      for (const t of tTokens) if (cSet.has(t)) matches++;
      const ratio = matches / cTokens.length;
      return ratio >= threshold;
    }

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const rawTranscript = event.results[i][0].transcript.trim();
        const transcript = normalizeText(rawTranscript);
        console.log("Heard command:", rawTranscript);
        try {
          onTranscript?.(transcript, rawTranscript);
        } catch (e) {
          console.error(e);
        }

        // Track if any command matched
        let matched = false;

        // Only match commands that were explicitly provided.
        for (const cmd of normalizedCommands) {
          if (!cmd) continue;
          if (matchMode === "equals" && transcript === cmd) {
            matched = true;
            try {
              onMatch?.(transcript, rawTranscript, cmd);
            } catch (err) {
              console.error(err);
            }
            try {
              onCommand();
            } catch (err) {
              console.error(err);
            }
            break;
          }
          if (matchMode === "includes" && transcript.includes(cmd)) {
            matched = true;
            try {
              onMatch?.(transcript, rawTranscript, cmd);
            } catch (err) {
              console.error(err);
            }
            try {
              onCommand();
            } catch (err) {
              console.error(err);
            }
            break;
          }
          if (
            matchMode === "tokens" &&
            tokenMatch(transcript, cmd, threshold)
          ) {
            matched = true;
            try {
              onMatch?.(transcript, rawTranscript, cmd);
            } catch (err) {
              console.error(err);
            }
            try {
              onCommand();
            } catch (err) {
              console.error(err);
            }
            break;
          }
        }

        // If no command matched, trigger onNotMatch
        if (!matched && onNotMatch) {
          try {
            onNotMatch(transcript, rawTranscript);
          } catch (err) {
            console.error(err);
          }
        }
      }
    };

    isActiveRef.current = true;

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error("Speech recognition error:", event.error);
      // Restart on certain errors (but not on abort which happens during cleanup)
      if (
        isActiveRef.current &&
        event.error !== "aborted" &&
        event.error !== "not-allowed"
      ) {
        console.log("Restarting speech recognition after error...");
        setTimeout(() => {
          if (isActiveRef.current) {
            try {
              recognition.start();
            } catch (e) {
              console.error("Failed to restart recognition:", e);
            }
          }
        }, 100);
      }
    };

    recognition.onend = () => {
      // Auto-restart when recognition stops (e.g., from timeout)
      if (isActiveRef.current) {
        console.log("Speech recognition ended, restarting...");
        setTimeout(() => {
          if (isActiveRef.current) {
            try {
              recognition.start();
            } catch (e) {
              console.error("Failed to restart recognition:", e);
            }
          }
        }, 100);
      }
    };

    // Handle speech synthesis events
    const handleSpeechStart = () => {
      console.log("Speech started, stopping recognition...");
      try {
        recognition.stop();
      } catch (err) {
        console.error("Error stopping recognition:", err);
      }
    };

    const handleSpeechEnd = () => {
      console.log("Speech ended, restarting recognition...");
      if (isActiveRef.current) {
        try {
          recognition.start();
        } catch (err) {
          console.error("Error restarting recognition:", err);
        }
      }
    };

    window.addEventListener("speechStart", handleSpeechStart);
    window.addEventListener("speechEnd", handleSpeechEnd);

    recognition.start();

    return () => {
      isActiveRef.current = false;
      window.removeEventListener("speechStart", handleSpeechStart);
      window.removeEventListener("speechEnd", handleSpeechEnd);
      try {
        recognition.stop();
      } catch (err) {
        // ignore
      }
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
    };
  }, [onCommand, JSON.stringify(commands), JSON.stringify(options)]);
}
