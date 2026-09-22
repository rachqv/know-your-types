"use client";

import { useState } from "react";
import { TYPES } from "@/data/types";
import { useProgress, progress } from "@/lib/progress";
import TypeBadge from "./TypeBadge";
import MultPill from "./MultPill";
import styles from "./Welcome.module.css";

export default function Welcome({ className = "" }) {
  const { visited, badges } = useProgress();
  const [confirming, setConfirming] = useState(false);
  const started = visited.length > 0;

  return (
    <section className={`card ${styles.welcome} ${className}`}>
      <p className={styles.kicker}>{started ? "Welcome back!" : "New here?"}</p>
      <h2>{started ? "Keep exploring, trainer" : "Welcome, trainer!"}</h2>
      <p>
        Every Pokémon and every move has a <strong>type</strong>, and types decide who wins a
        battle. There are just 18. Tap an island to learn a type, then pass its challenge to earn a
        badge and unlock the next island.
      </p>

      <div className={styles.lesson}>
        <TypeBadge id="fire" size="sm" />
        <span aria-hidden="true">→</span>
        <TypeBadge id="grass" size="sm" />
        <MultPill value={2} showWord />
      </div>
      <p className={styles.lessonNote}>
        A Fire move hitting a Grass Pokémon does <strong>double damage</strong>. Learn the matchups
        and you&apos;ll always know what to send out.
      </p>

      <dl className={styles.stats}>
        <div>
          <dt>Explored</dt>
          <dd>
            {visited.length}/{TYPES.length}
          </dd>
        </div>
        <div>
          <dt>Badges</dt>
          <dd>
            {badges.length}/{TYPES.length}
          </dd>
        </div>
      </dl>

      {started && (
        <button
          className={styles.reset}
          onClick={() => {
            if (confirming) {
              progress.reset();
              setConfirming(false);
            } else {
              setConfirming(true);
            }
          }}
          onBlur={() => setConfirming(false)}
        >
          {confirming ? "Tap again to erase progress" : "Reset progress"}
        </button>
      )}
    </section>
  );
}
