import styles from "./PageTitle.module.css";

export default function PageTitle({ emoji, title, children }) {
  return (
    <header className={styles.title}>
      <span className={styles.emoji} aria-hidden="true">
        {emoji}
      </span>
      <div>
        <h1>{title}</h1>
        <p>{children}</p>
      </div>
    </header>
  );
}
