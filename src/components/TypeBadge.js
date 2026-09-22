import { TYPE_BY_ID } from "@/data/types";
import styles from "./TypeBadge.module.css";

// A type pill. Pass `onClick` to make it a button (used to jump between islands).
export default function TypeBadge({ id, size = "md", style, onClick, label }) {
  const type = TYPE_BY_ID[id];
  const className = `${styles.badge} ${styles[size]}`;
  const vars = { "--type-color": type.color, "--type-ink": type.ink, ...style };
  const content = (
    <>
      <span aria-hidden="true">{type.emoji}</span>
      {type.name}
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        className={`${className} ${styles.clickable}`}
        style={vars}
        onClick={onClick}
        title={label}
        aria-label={label}
        data-sfx="none"
      >
        {content}
      </button>
    );
  }

  return (
    <span className={className} style={vars}>
      {content}
    </span>
  );
}
