"use client";

import { useEffect, useState } from "react";

type Props = {
  text: string;
  label: string;
  size?: "md" | "lg";
};

/** Chooses the voice from the script of the text, not the UI language. */
export function voiceLangFor(text: string): "hi-IN" | "en-IN" {
  return /[\u0900-\u097F]/.test(text) ? "hi-IN" : "en-IN";
}

/**
 * Speaker button for the audio-first classes (Nursery – Class 2).
 * Phase 1 uses the browser's built-in speech (Web Speech API); Phase 3 will
 * prefer pre-generated MP3 files and fall back to this.
 */
export function SpeakButton({ text, label, size = "md" }: Props) {
  const [supported, setSupported] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    setSupported(typeof window !== "undefined" && "speechSynthesis" in window);
    return () => {
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    };
  }, []);

  if (!supported) return null;

  function toggle(event: React.MouseEvent) {
    // The button often sits inside a link card; don't navigate when tapped.
    event.preventDefault();
    event.stopPropagation();
    const synth = window.speechSynthesis;
    if (speaking) {
      synth.cancel();
      setSpeaking(false);
      return;
    }
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = voiceLangFor(text);
    utterance.rate = 0.85;
    const voice = synth.getVoices().find((v) => v.lang === utterance.lang);
    if (voice) utterance.voice = voice;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    setSpeaking(true);
    synth.speak(utterance);
  }

  const dimension = size === "lg" ? "h-14 w-14 text-2xl" : "h-11 w-11 text-xl";
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`${label}: ${text}`}
      aria-pressed={speaking}
      className={`${dimension} inline-flex shrink-0 items-center justify-center rounded-full border-2 border-white bg-yellow-300 shadow-md transition hover:scale-105 active:scale-95 ${speaking ? "animate-pulse bg-yellow-400" : ""}`}
    >
      <span aria-hidden>{speaking ? "⏹️" : "🔊"}</span>
    </button>
  );
}
