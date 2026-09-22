"use client";

import { useState } from "react";
import { TYPE_BY_ID, MULTIPLIERS } from "@/data/types";
import { sfx } from "@/lib/sfx";
import TypeBadge from "./TypeBadge";
import MultPill from "./MultPill";
import styles from "./QuizRound.module.css";

const CHOICES = [
  { value: 2, emoji: "💥" },
  { value: 1, emoji: "😐" },
  { value: 0.5, emoji: "🛡️" },
  { value: 0, emoji: "🚫" },
];

// Runs through a list of questions. The parent decides what happens at the end.
export default function QuizRound({ questions, onAnswer, onFinish }) {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState(null); // the player's choice, once answered
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [misses, setMisses] = useState([]);

  const q = questions[index];
  const total = questions.length;
  const correct = picked !== null && picked === q.answer;
  const isLast = index + 1 >= total;

  function answer(value) {
    if (picked !== null) return;
    setPicked(value);
    const ok = value === q.answer;
    if (ok) {
      sfx.correct();
      setScore((s) => s + 1);
      setStreak((s) => s + 1);
    } else {
      sfx.wrong();
      setStreak(0);
      setMisses((m) => [...m, q]);
    }
    onAnswer?.(ok);
  }

  function next() {
    if (isLast) {
      onFinish({ score, misses });
    } else {
      setIndex((i) => i + 1);
      setPicked(null);
    }
  }

  return (
    <div className={styles.round}>
      <div className={styles.status}>
        <span className={styles.count}>
          {index + 1}/{total}
        </span>
        <span className={styles.streak} data-hot={streak >= 3}>
          🔥 {streak}
        </span>
      </div>
      <div className={styles.progress} aria-hidden="true">
        {questions.map((_, i) => (
          <i key={i} data-state={i < index ? "done" : i === index ? "now" : "todo"} />
        ))}
      </div>

      <div className={styles.matchup} key={index}>
        <div>
          <small>A move of type</small>
          <TypeBadge id={q.attacker} size="lg" />
        </div>
        <span className={styles.vs} aria-hidden="true">💢</span>
        <div>
          <small>hits a Pokémon of type</small>
          <TypeBadge id={q.defender} size="lg" />
        </div>
      </div>

      <div className={styles.choices} role="group" aria-label="How effective is it?">
        {CHOICES.map((c) => {
          const state =
            picked === null ? "" : c.value === q.answer ? "right" : c.value === picked ? "wrong" : "dim";
          return (
            <button
              key={c.value}
              className={styles.choice}
              data-state={state}
              data-sfx="none"
              disabled={picked !== null}
              onClick={() => answer(c.value)}
            >
              <span className={styles.choiceEmoji} aria-hidden="true">{c.emoji}</span>
              <span>{MULTIPLIERS[c.value].word}</span>
              <small>{MULTIPLIERS[c.value].label}</small>
            </button>
          );
        })}
      </div>

      <div className={styles.feedbackSlot} aria-live="polite">
        {picked !== null && (
          <div className={styles.feedback} data-correct={correct}>
            <p>
              <strong>{correct ? "Correct! 🎉" : "Not quite. 🤔"}</strong>{" "}
              {TYPE_BY_ID[q.attacker].name} moves vs {TYPE_BY_ID[q.defender].name} Pokémon:{" "}
              <MultPill value={q.answer} showWord />
            </p>
            <button className="btn coral" onClick={next} autoFocus>
              {isLast ? "Finish" : "Next →"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
