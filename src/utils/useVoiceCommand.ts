import { useEffect } from "react";

function normalizeText(s: string) {
  return s
    .toLowerCase()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export type VoiceMatchMode = 'equals' | 'includes' | 'tokens';
export interface UseVoiceOptions {
  matchMode?: VoiceMatchMode;
  threshold?: number; // 0..1 for tokens match
}

export default function useVoiceCommand(
  onCommand: () => void,
  commands?: string | string[],
  options?: UseVoiceOptions,
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

    const { matchMode = 'equals', threshold = 0.5 } = options ?? {};

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

    function tokenMatch(transcript: string, cmd: string, threshold: number) {
      const tTokens = transcript.split(' ').filter(Boolean);
      const cTokens = cmd.split(' ').filter(Boolean);
      if (cTokens.length === 0) return transcript === '';
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

        // Only match commands that were explicitly provided.
        for (const cmd of normalizedCommands) {
          if (!cmd) continue;
          if (matchMode === 'equals' && transcript === cmd) {
            try { onCommand(); } catch (err) { console.error(err); }
            break;
          }
          if (matchMode === 'includes' && transcript.includes(cmd)) {
            try { onCommand(); } catch (err) { console.error(err); }
            break;
          }
          if (matchMode === 'tokens' && tokenMatch(transcript, cmd, threshold)) {
            try { onCommand(); } catch (err) { console.error(err); }
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
  }, [onCommand, JSON.stringify(commands), JSON.stringify(options)]);
}
