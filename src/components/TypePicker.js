import { TYPES } from "@/data/types";
import styles from "./TypePicker.module.css";

// Grid of all 18 types as toggle buttons. The parent owns the selection.
// `compact` packs them into three tighter columns, for side-by-side layouts.
export default function TypePicker({ selected, onPick, compact = false }) {
  return (
    <div className={`${styles.picker} ${compact ? styles.compact : ""}`} role="group" aria-label="Types">
      {TYPES.map((t) => (
        <button
          key={t.id}
          aria-pressed={selected.includes(t.id)}
          data-sfx="none"
          className={styles.chip}
          style={{ "--type-color": t.color, "--type-ink": t.ink }}
          onClick={() => onPick(t.id)}
        >
          <span className={styles.emoji} aria-hidden="true">
            {t.emoji}
          </span>
          {t.name}
        </button>
      ))}
    </div>
  );
}
