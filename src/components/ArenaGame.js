"use client";

import { useState } from "react";
import { progress } from "@/lib/progress";
import { buildRound } from "@/lib/quiz";
import { sfx } from "@/lib/sfx";
import { celebrate } from "@/lib/celebrate";
import PageTitle from "./PageTitle";
import QuizRound from "./QuizRound";
import TypeBadge from "./TypeBadge";
import MultPill from "./MultPill";
import styles from "./ArenaGame.module.css";

const ROUND_LENGTH = 10;

function verdict(score) {
  if (score === ROUND_LENGTH) return { emoji: "🏆", text: "Perfect! You're a type master." };
  if (score >= 8) return { emoji: "🌟", text: "Great work, trainer! Almost flawless." };
  if (score >= 5) return { emoji: "👍", text: "Solid! A few more rounds and you'll have it." };
  return { emoji: "🌱", text: "Everyone starts somewhere. Explore the map and try again!" };
}

export default function ArenaGame() {
  const [phase, setPhase] = useState("idle"); // idle | playing | done
  const [questions, setQuestions] = useState([]);
  const [result, setResult] = useState(null);
  const [round, setRound] = useState(0);

  function start() {
    setRound((r) => r + 1);
    setQuestions(buildRound({ count: ROUND_LENGTH }));
    setResult(null);
    setPhase("playing");
  }

  function finish(r) {
    if (r.score >= 8) {
      sfx.fanfare();
      celebrate();
    }
    setResult(r);
    setPhase("done");
  }

  return (
    <main className="page">
      <PageTitle emoji="⚔️" title="The Arena">
        Ten quick battles. Trust your gut. Every right answer earns 5 XP.
      </PageTitle>

      <div className={`card ${styles.board}`}>
        {phase === "idle" && (
          <div className={styles.center}>
            <p className={styles.bigEmoji} aria-hidden="true">🎯</p>
            <h2>Ready, trainer?</h2>
            <p>Each question shows a move hitting a Pokémon. How much damage does it do?</p>
            <button className="btn coral" onClick={start}>
              Start round
            </button>
          </div>
        )}

        {phase === "playing" && (
          <QuizRound
            key={round}
            questions={questions}
            onAnswer={(ok) => ok && progress.addXp(5)}
            onFinish={finish}
          />
        )}

        {phase === "done" && (
          <div className={styles.center}>
            <p className={styles.bigEmoji} aria-hidden="true">{verdict(result.score).emoji}</p>
            <h2 className={styles.score}>
              {result.score}/{ROUND_LENGTH}
            </h2>
            <p>{verdict(result.score).text}</p>

            {result.misses.length > 0 && (
              <div className={styles.review}>
                <h3>Worth remembering</h3>
                <ul>
                  {result.misses.map((m) => (
                    <li key={`${m.attacker}-${m.defender}`}>
                      <TypeBadge id={m.attacker} size="sm" />
                      <span aria-hidden="true">→</span>
                      <TypeBadge id={m.defender} size="sm" />
                      <MultPill value={m.answer} />
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button className="btn coral" onClick={start}>
              Play again
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
