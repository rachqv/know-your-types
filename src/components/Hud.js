"use client";

import Link from "next/link";
import { TYPES } from "@/data/types";
import { useProgress, levelInfo } from "@/lib/progress";
import Nav from "./Nav";
import SoundToggle from "./SoundToggle";
import styles from "./Hud.module.css";

export default function Hud() {
  const { xp, badges } = useProgress();
  const { level, title, into } = levelInfo(xp);

  return (
    <header className={styles.hud}>
      <Link href="/" className={styles.brand}>
        <span className="pokeball" aria-hidden="true" />
        <span className={styles.brandText}>Know Your Types</span>
      </Link>

      <Nav />

      <div className={styles.stats}>
        <div className={styles.level} title={`${into}/100 XP to next level`}>
          <span className={styles.lv}>LV {level}</span>
          <span className={styles.rank}>
            <span className={styles.title}>{title}</span>
            <span className={styles.bar} role="progressbar" aria-label="XP to next level" aria-valuenow={into} aria-valuemin={0} aria-valuemax={100}>
              <i style={{ width: `${into}%` }} />
            </span>
          </span>
        </div>
        <div className={styles.badges} title="Badges earned">
          <span aria-hidden="true">🏅</span>
          <span className={styles.count}>
            {badges.length}/{TYPES.length}
          </span>
          <span className="srOnly">badges earned</span>
        </div>
        <SoundToggle />
      </div>
    </header>
  );
}
