"use client";

import { useEffect, useState } from "react";
import { sfx } from "@/lib/sfx";
import styles from "./LevelUpToast.module.css";

// Pops up when XP crosses a level boundary (the progress store fires "kyt:levelup").
export default function LevelUpToast() {
  const [toast, setToast] = useState(null);

  useEffect(() => {
    let hide = 0;
    function onLevelUp(e) {
      setToast(e.detail);
      sfx.levelUp();
      clearTimeout(hide);
      hide = setTimeout(() => setToast(null), 4500);
    }
    window.addEventListener("kyt:levelup", onLevelUp);
    return () => {
      window.removeEventListener("kyt:levelup", onLevelUp);
      clearTimeout(hide);
    };
  }, []);

  if (!toast) return null;

  return (
    <div className={styles.toast} role="status" key={toast.level}>
      <span className={styles.lv}>LV {toast.level}</span>
      <div>
        <strong>Level up!</strong>
        <p>You&apos;re now a {toast.title}.</p>
      </div>
      <button className={styles.close} onClick={() => setToast(null)} aria-label="Dismiss" data-sfx="none">
        ✕
      </button>
    </div>
  );
}
