import { MULTIPLIERS } from "@/data/types";
import styles from "./MultPill.module.css";

export default function MultPill({ value, showWord = false, size = "md" }) {
  const m = MULTIPLIERS[value];
  return (
    <span className={`${styles.pill} ${styles[size]}`} style={{ "--tone": m.tone }}>
      <strong>{m.label}</strong>
      {showWord && <span>{m.word}</span>}
    </span>
  );
}
