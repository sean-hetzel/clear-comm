import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

interface SpeechContextType {
  isSpeaking: boolean;
  setIsSpeaking: (speaking: boolean) => void;
}

const SpeechContext = createContext<SpeechContextType | undefined>(undefined);

export function SpeechProvider({ children }: { children: ReactNode }) {
  const [isSpeaking, setIsSpeaking] = useState(false);

  return (
    <SpeechContext.Provider value={{ isSpeaking, setIsSpeaking }}>
      {children}
    </SpeechContext.Provider>
  );
}

export function useSpeechContext() {
  const context = useContext(SpeechContext);
  if (!context) {
    throw new Error("useSpeechContext must be used within a SpeechProvider");
  }
  return context;
}
