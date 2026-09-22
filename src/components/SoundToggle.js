"use client";

import { useSyncExternalStore } from "react";
import { getMuted, setMuted, subscribeMuted } from "@/lib/sfx";
import styles from "./SoundToggle.module.css";

export default function SoundToggle() {
  const muted = useSyncExternalStore(subscribeMuted, getMuted, () => false);

  return (
    <button
      className={styles.toggle}
      aria-pressed={!muted}
      aria-label={muted ? "Turn sound effects on" : "Turn sound effects off"}
      title={muted ? "Sound is off" : "Sound is on"}
      onClick={() => setMuted(!muted)}
    >
      <span aria-hidden="true">{muted ? "🔇" : "🔊"}</span>
    </button>
  );
}
