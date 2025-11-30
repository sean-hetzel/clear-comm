// Utility: simple speech synthesis wrapper using Web Speech API
// This module exports a plain function `useSpeakText` that speaks a given
// string using the SpeechSynthesis API and returns a Promise that resolves
// when playback completes.

export type SpeakOptions = {
  voiceName?: string;
  rate?: number; // 0.1 to 10
  pitch?: number; // 0 to 2
  lang?: string; // e.g., 'en-US'
};

export function useSpeakText(text: string, opts?: SpeakOptions): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !(window as any).speechSynthesis) {
      reject(
        new Error("SpeechSynthesis API is not supported in this environment")
      );
      return;
    }

    try {
      const synth = (window as any).speechSynthesis as SpeechSynthesis;
      const utter = new SpeechSynthesisUtterance(text);

      // Set options
      if (opts?.lang) utter.lang = opts.lang;
      utter.rate = opts?.rate ?? 1;
      utter.pitch = opts?.pitch ?? 1;

      const voices = synth.getVoices();
      if (opts?.voiceName) {
        const v = voices.find((vv) => vv.name === opts.voiceName);
        if (v) utter.voice = v;
      } else if (voices.length > 0) {
        // prefer an English voice if available
        const enVoice = voices.find((v) => (v.lang || "").startsWith("en"));
        if (enVoice) utter.voice = enVoice;
      }

      utter.onend = () => {
        window.dispatchEvent(new CustomEvent("speechEnd"));
        resolve();
      };
      utter.onerror = (e) => {
        window.dispatchEvent(new CustomEvent("speechEnd"));
        reject(e);
      };

      try {
        window.dispatchEvent(new CustomEvent("speechStart"));
        synth.speak(utter);
      } catch (e) {
        window.dispatchEvent(new CustomEvent("speechEnd"));
        reject(e);
      }
    } catch (err) {
      reject(err);
    }
  });
}

export function stopSpeaking() {
  if (typeof window === "undefined" || !(window as any).speechSynthesis) return;
  const synth = (window as any).speechSynthesis as SpeechSynthesis;
  synth.cancel();
}
