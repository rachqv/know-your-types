"use client";

import { useState } from "react";
import { TYPES, TYPE_BY_ID, multiplier } from "@/data/types";
import { ORDER } from "@/data/route";
import { useProgress, progress } from "@/lib/progress";
import { buildRound } from "@/lib/quiz";
import { sfx } from "@/lib/sfx";
import { celebrate } from "@/lib/celebrate";
import Mascot from "./Mascot";
import TypeBadge from "./TypeBadge";
import MultPill from "./MultPill";
import QuizRound from "./QuizRound";
import styles from "./TypeCard.module.css";

const CHALLENGE_LENGTH = 5;
const PASS_MARK = 4;

// Attack tab: how this type's moves fare. Defend tab: how Pokémon of this type fare.
const TABS = {
  attack: {
    label: "⚔️ Attacking",
    intro: (name) => `When a ${name} move attacks…`,
    groups: [
      { mult: 2, title: "Super effective against" },
      { mult: 0.5, title: "Not very effective against" },
      { mult: 0, title: "Does nothing to" },
    ],
    who: (id, m) => TYPES.filter((t) => multiplier(id, t.id) === m),
  },
  defend: {
    label: "🛡️ Defending",
    intro: (name) => `When a ${name} Pokémon is attacked…`,
    groups: [
      { mult: 2, title: "Weak to" },
      { mult: 0.5, title: "Resists" },
      { mult: 0, title: "Immune to" },
    ],
    who: (id, m) => TYPES.filter((t) => multiplier(t.id, id) === m),
  },
};

export default function TypeCard({ id, onClose, onSelect }) {
  const type = TYPE_BY_ID[id];
  const { badges } = useProgress();
  const hasBadge = badges.includes(id);
  const nextId = ORDER[ORDER.indexOf(id) + 1]; // undefined on the last island

  const [tab, setTab] = useState("attack");
  const [game, setGame] = useState(null); // null | { phase: "playing", questions } | { phase: "done", score, passed, misses }

  function startChallenge() {
    setGame({ phase: "playing", questions: buildRound({ count: CHALLENGE_LENGTH, focus: id }) });
  }

  function finishChallenge({ score, misses }) {
    const passed = score >= PASS_MARK;
    if (passed) {
      progress.earnBadge(id);
      sfx.fanfare();
      celebrate();
    }
    // that badge completes the set if it's the only one still missing
    const champion = passed && !hasBadge && badges.length + 1 === ORDER.length;
    setGame({
      phase: "done",
      score,
      passed,
      misses,
      champion,
      unlockedNext: passed && !hasBadge && Boolean(nextId),
    });
  }

  const view = TABS[tab];

  return (
    <article
      className={`card ${styles.card}`}
      style={{ "--type-color": type.color, "--type-ink": type.ink }}
    >
      <header className={styles.banner}>
        <button className={styles.close} onClick={onClose} aria-label="Close card" data-sfx="none">
          ✕
        </button>
        <Mascot typeId={id} size={92} />
        <div className={styles.headText}>
          <h2>{type.name}</h2>
          <p>{type.vibe}</p>
          {hasBadge && <span className={styles.earned}>🏅 Badge earned</span>}
        </div>
      </header>

      <div className={styles.body}>
        {!game && (
          <>
            <div className={styles.tabs} role="tablist" aria-label="Matchup view">
              {Object.entries(TABS).map(([key, t]) => (
                <button
                  key={key}
                  role="tab"
                  aria-selected={tab === key}
                  className={styles.tab}
                  onClick={() => setTab(key)}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <p className={styles.intro}>{view.intro(type.name)}</p>

            <div key={tab} className={styles.groups}>
              {view.groups.map((g) => {
                const types = view.who(id, g.mult);
                return (
                  <section key={g.mult} className={styles.group}>
                    <h3>
                      <MultPill value={g.mult} />
                      {g.title}
                    </h3>
                    {types.length ? (
                      <ul className={styles.badges}>
                        {types.map((t, i) => (
                          <li key={t.id} style={{ "--i": i }}>
                            <TypeBadge
                              id={t.id}
                              size="sm"
                              label={`Go to the ${t.name} island`}
                              onClick={t.id === id ? undefined : () => onSelect(t.id)}
                            />
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className={styles.none}>Nothing</p>
                    )}
                  </section>
                );
              })}
            </div>

            <div className={styles.challenge}>
              <p>
                {hasBadge ? (
                  <>Want to sharpen up? Play the {type.name} challenge again.</>
                ) : (
                  <>
                    <strong>Earn the {type.name} badge!</strong> Answer {CHALLENGE_LENGTH} questions and
                    get {PASS_MARK} right.
                  </>
                )}
              </p>
              <button className="btn coral" onClick={startChallenge}>
                {hasBadge ? "Play again" : "Start challenge"}
              </button>
            </div>
          </>
        )}

        {game?.phase === "playing" && (
          <QuizRound
            questions={game.questions}
            onAnswer={(ok) => ok && progress.addXp(5)}
            onFinish={finishChallenge}
          />
        )}

        {game?.phase === "done" && (
          <div className={styles.result}>
            <p className={styles.resultEmoji} aria-hidden="true">
              {game.passed ? "🏅" : "💪"}
            </p>
            <h3>
              {game.score}/{CHALLENGE_LENGTH}
            </h3>
            <p>
              {game.passed
                ? `The ${type.name} badge is yours!`
                : `So close! You need ${PASS_MARK} to earn the badge. Peek at the card and try again.`}
            </p>
            {game.unlockedNext && (
              <p className={styles.unlock}>🔓 {TYPE_BY_ID[nextId].name} island unlocked!</p>
            )}
            {game.champion && (
              <p className={styles.unlock}>🏆 All 18 badges! You&apos;re a Type Champion!</p>
            )}
            {game.misses.length > 0 && (
              <ul className={styles.misses}>
                {game.misses.map((m) => (
                  <li key={`${m.attacker}-${m.defender}`}>
                    <TypeBadge id={m.attacker} size="sm" />
                    <span aria-hidden="true">→</span>
                    <TypeBadge id={m.defender} size="sm" />
                    <MultPill value={m.answer} />
                  </li>
                ))}
              </ul>
            )}
            <div className={styles.resultActions}>
              {game.passed && nextId ? (
                <button className="btn coral" onClick={() => onSelect(nextId)}>
                  Next: {TYPE_BY_ID[nextId].name} →
                </button>
              ) : (
                <button className="btn coral" onClick={startChallenge}>
                  Try again
                </button>
              )}
              <button className="btn ghost" onClick={() => setGame(null)}>
                Back to card
              </button>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
