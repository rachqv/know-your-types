"use client";

import { useState } from "react";
import { progress, useProgress } from "@/lib/progress";
import { buildBattles } from "@/lib/battle";
import { sfx } from "@/lib/sfx";
import { celebrate } from "@/lib/celebrate";
import PageTitle from "./PageTitle";
import BattleRound from "./BattleRound";
import PokemonArt from "./PokemonArt";
import TypeBadge from "./TypeBadge";
import styles from "./ArenaGame.module.css";

const BATTLES = 6;

function verdict(score) {
  if (score === BATTLES) return { emoji: "🏆", text: "Flawless! You're a battle master." };
  if (score >= BATTLES - 1) return { emoji: "🌟", text: "Great work, trainer! Almost perfect." };
  if (score >= BATTLES / 2) return { emoji: "👍", text: "Solid! A few more battles and you'll have it." };
  return { emoji: "🌱", text: "Everyone starts somewhere. Explore the map and try again!" };
}

export default function ArenaGame() {
  const [phase, setPhase] = useState("idle"); // idle | playing | done
  const [battles, setBattles] = useState([]);
  const [result, setResult] = useState(null);
  const [round, setRound] = useState(0);
  const { arena } = useProgress();

  function start() {
    setRound((r) => r + 1);
    setBattles(buildBattles(BATTLES));
    setResult(null);
    setPhase("playing");
  }

  function finish(r) {
    progress.recordArena({ score: r.score, streak: r.bestStreak });
    if (r.score >= BATTLES - 1) {
      sfx.fanfare();
      celebrate();
    }
    setResult(r);
    setPhase("done");
  }

  return (
    <main className="page">
      {phase !== "playing" && (
        <div className={styles.title}>
          <PageTitle emoji="⚔️" title="The Arena">
            Your rival sends out a Pokémon. Pick the best partner from your team. Every win earns 5
            XP.
          </PageTitle>
        </div>
      )}

      <div className={`card ${styles.board}`}>
        {phase === "idle" && (
          <div className={styles.center}>
            <p className={styles.bigEmoji} aria-hidden="true">🎯</p>
            <h2>Ready to battle?</h2>
            <ol className={styles.steps}>
              <li>
                <span>1</span> Your rival sends out a Pokémon. Check its types!
              </li>
              <li>
                <span>2</span> Pick who to send out from your party of three.
              </li>
              <li>
                <span>3</span> Watch the battle. The best pick hits hard and takes little damage.
              </li>
            </ol>
            {arena.rounds > 0 && (
              <dl className={styles.stats} aria-label="Your Arena record">
                <div>
                  <dt>Best round</dt>
                  <dd>
                    {arena.best}/{BATTLES}
                  </dd>
                </div>
                <div>
                  <dt>Battles won</dt>
                  <dd>{arena.wins}</dd>
                </div>
                <div>
                  <dt>Best streak</dt>
                  <dd>🔥 {arena.bestStreak}</dd>
                </div>
              </dl>
            )}
            <button className="btn coral" onClick={start}>
              Start battle
            </button>
          </div>
        )}

        {phase === "playing" && (
          <BattleRound
            key={round}
            battles={battles}
            onAnswer={(ok) => ok && progress.addXp(5)}
            onFinish={finish}
          />
        )}

        {phase === "done" && (
          <div className={styles.center}>
            <p className={styles.bigEmoji} aria-hidden="true">{verdict(result.score).emoji}</p>
            <h2 className={styles.score}>
              {result.score}/{BATTLES}
            </h2>
            <p>{verdict(result.score).text}</p>

            {result.misses.length > 0 && (
              <div className={styles.review}>
                <h3>Worth remembering</h3>
                <ul>
                  {result.misses.map((m) => (
                    <li key={m.foe.dex}>
                      <div className={styles.reviewMon}>
                        <PokemonArt pokemon={m.foe} size={44} />
                        <span>
                          <strong>{m.foe.name}</strong>
                          <span className={styles.reviewTypes}>
                            {m.foe.types.map((t) => (
                              <TypeBadge key={t} id={t} size="sm" />
                            ))}
                          </span>
                        </span>
                      </div>
                      <span aria-hidden="true">→</span>
                      <span className={styles.reviewBetter}>
                        Best pick: <strong>{m.best.name}</strong>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button className="btn coral" onClick={start}>
              Battle again
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
