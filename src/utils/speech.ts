/**
 * Web Speech API text-to-speech helper for English pronunciation
 */
export function playEnglishPronunciation(text: string): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    console.warn("Web Speech API is not supported in this browser.");
    return;
  }

  try {
    window.speechSynthesis.cancel(); // Stop any pending utterances

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.9; // slightly slower for optimal clarity

    const voices = window.speechSynthesis.getVoices();
    const enVoice =
      voices.find((v) => v.lang === "en-US" && (v.name.includes("Google") || v.name.includes("Natural") || v.name.includes("Samantha"))) ||
      voices.find((v) => v.lang.startsWith("en"));

    if (enVoice) {
      utterance.voice = enVoice;
    }

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.error("Speech synthesis error:", err);
  }
}
