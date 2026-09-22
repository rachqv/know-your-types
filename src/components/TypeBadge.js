import { TYPE_BY_ID } from "@/data/types";
import styles from "./TypeBadge.module.css";

export default function TypeBadge({ id, size = "md", style }) {
  const type = TYPE_BY_ID[id];
  return (
    <span
      className={`${styles.badge} ${styles[size]}`}
      style={{ "--type-color": type.color, "--type-ink": type.ink, ...style }}
    >
      <span aria-hidden="true">{type.emoji}</span>
      {type.name}
    </span>
  );
}
