import { useEffect } from "react";

function normalizeText(s: string) {
  return s
    .toLowerCase()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export default function useVoiceCommand(
  onCommand: () => void,
  commands?: string | string[]
) {
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn("Web Speech API is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true; // keep listening
    recognition.lang = "en-US";
    recognition.interimResults = false;

    // Normalize commands if provided
    let normalizedCommands: string[] | null = null;
    if (commands) {
      normalizedCommands = (
        Array.isArray(commands) ? commands : [commands]
      ).map((c) => normalizeText(c));
    }

    // If commands contains an empty string we should trigger onCommand immediately
    if (normalizedCommands && normalizedCommands.includes("")) {
      try {
        onCommand();
      } catch (err) {
        console.error(err);
      }
      return; // no need to start listening
    }

    // If no commands were passed in, do not listen. This removes the old
    // fallback behavior that treated "next" as a special case.
    if (!normalizedCommands) {
      return;
    }

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const rawTranscript = event.results[i][0].transcript.trim();
        const transcript = normalizeText(rawTranscript);
        console.log("Heard command:", rawTranscript);

        // Only match commands that were explicitly provided.
        for (const cmd of normalizedCommands) {
          if (cmd && transcript === cmd) {
            try {
              onCommand();
            } catch (err) {
              console.error(err);
            }
            break;
          }
        }
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error("Speech recognition error:", event);
    };

    recognition.start();

    return () => {
      try {
        recognition.stop();
      } catch (err) {
        // ignore
      }
      recognition.onresult = null;
      recognition.onerror = null;
    };
  }, [onCommand, JSON.stringify(commands)]);
}
