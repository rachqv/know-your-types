"use client";

import { useEffect, useRef, useState } from "react";
import { TYPE_BY_ID, MULTIPLIERS } from "@/data/types";
import { resolve, hpLoss } from "@/lib/battle";
import { sfx } from "@/lib/sfx";
import PokemonArt from "./PokemonArt";
import TypeBadge from "./TypeBadge";
import MultPill from "./MultPill";
import styles from "./BattleRound.module.css";

// Timeline of a battle (seconds). The text boxes and HP bars use these as CSS delays,
// and the sounds are scheduled to match.
const T = { send: 0.15, hit: 0.85, counter: 1.75, verdict: 2.6 };

function effectText(mult, target) {
  if (mult === 0) return `It doesn't affect ${target}…`;
  if (mult > 1) return "It's super effective!";
  if (mult < 1) return "It's not very effective…";
  return "";
}

function hpLevel(fraction) {
  return fraction > 0.5 ? "good" : fraction > 0.2 ? "warn" : "low";
}

function Plate({ pokemon, hp, delay, side }) {
  return (
    <div className={`${styles.plate} ${side === "foe" ? styles.foePlate : styles.mePlate}`}>
      <div className={styles.nameRow}>
        <strong>{pokemon.name}</strong>
        <span className={styles.lv}>Lv 50</span>
      </div>
      <div className={styles.types}>
        {pokemon.types.map((t) => (
          <TypeBadge key={t} id={t} size="sm" />
        ))}
      </div>
      <div className={styles.hpRow}>
        <span className={styles.hpLabel}>HP</span>
        <span className={styles.hp} data-level={hpLevel(hp)}>
          <i style={{ width: `${Math.round(hp * 100)}%`, transitionDelay: `${delay}s` }} />
        </span>
      </div>
    </div>
  );
}

// Runs through a list of battles: the rival sends out a Pokémon, you pick who to send out,
// and the exchange plays out like the real games.
//
// Keyboard: 1-3 pick a Pokémon; Enter/Space skips the animation, then moves to the next battle.
export default function BattleRound({ battles, onAnswer, onFinish }) {
  const [index, setIndex] = useState(0);
  const [choice, setChoice] = useState(null); // index into the party, once picked
  const [revealed, setRevealed] = useState(false); // the verdict is showing
  const [fast, setFast] = useState(false); // the animation was skipped
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [misses, setMisses] = useState([]);
  const timers = useRef([]);
  const onKey = useRef(null);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  const { foe, party, bestIndex } = battles[index];
  const total = battles.length;
  const isLast = index + 1 >= total;
  const results = party.map((p) => resolve(p, foe));
  const picked = choice === null ? null : party[choice];
  const pickedResult = choice === null ? null : results[choice];
  const correct = choice === bestIndex;
  const best = party[bestIndex];

  const foeHp = pickedResult ? 1 - hpLoss(pickedResult.out.mult) : 1;
  const meHp = pickedResult ? 1 - hpLoss(pickedResult.back.mult) : 1;

  function clearTimers() {
    timers.current.forEach(clearTimeout);
    timers.current.length = 0;
  }

  function choose(i) {
    if (choice !== null) return;
    const r = results[i];
    const ok = i === bestIndex;
    const nextStreak = ok ? streak + 1 : 0;
    setChoice(i);
    setScore((s) => s + (ok ? 1 : 0));
    setStreak(nextStreak);
    setBestStreak((b) => Math.max(b, nextStreak));
    if (!ok) setMisses((m) => [...m, { foe, chosen: party[i], best }]);
    onAnswer?.(ok);

    sfx.send();
    const later = (seconds, fn) => timers.current.push(setTimeout(fn, seconds * 1000));
    later(T.hit, () => sfx.hit(r.out.mult));
    later(T.counter, () => sfx.hit(r.back.mult));
    later(T.verdict, () => {
      setRevealed(true);
      if (ok) sfx.correct();
      else sfx.wrong();
    });
  }

  // Jump straight to the verdict.
  function skip() {
    clearTimers();
    setFast(true);
    setRevealed(true);
    if (correct) sfx.correct();
    else sfx.wrong();
  }

  function next() {
    clearTimers();
    if (isLast) {
      onFinish({ score, misses, bestStreak });
    } else {
      setIndex((n) => n + 1);
      setChoice(null);
      setRevealed(false);
      setFast(false);
    }
  }

  // The latest handler lives in a ref, so the single window listener never goes stale.
  useEffect(() => {
    onKey.current = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (choice === null) {
        const n = Number(e.key);
        if (n >= 1 && n <= party.length) choose(n - 1);
        return;
      }
      // on a focused button, Enter/Space already click it
      const onControl = e.target instanceof Element && e.target.closest("button, a, input");
      if ((e.key === "Enter" || e.key === " ") && !onControl) {
        e.preventDefault();
        if (revealed) next();
        else skip();
      }
    };
  });

  useEffect(() => {
    const handler = (e) => onKey.current?.(e);
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div className={styles.round} data-fast={fast}>
      <div className={styles.status}>
        <span className={styles.count}>
          Battle {index + 1}/{total}
        </span>
        <span className={styles.streak} data-hot={streak >= 3}>
          🔥 {streak}
        </span>
      </div>

      <div className={styles.scene} key={index}>
        <Plate pokemon={foe} hp={foeHp} delay={T.hit + 0.1} side="foe" />

        <div className={styles.foePad} aria-hidden="true" />
        <div
          className={styles.foe}
          data-hit={pickedResult ? pickedResult.out.mult > 0 : undefined}
          data-faint={pickedResult ? foeHp === 0 : undefined}
        >
          <PokemonArt pokemon={foe} size="clamp(88px, 24vw, 130px)" />
        </div>

        <div className={styles.mePad} aria-hidden="true" />
        {picked ? (
          <>
            <div
              className={styles.me}
              data-hit={pickedResult.back.mult > 0}
              data-faint={meHp === 0}
            >
              <PokemonArt pokemon={picked} size="clamp(92px, 25vw, 136px)" />
            </div>
            <Plate pokemon={picked} hp={meHp} delay={T.counter + 0.1} side="me" />
          </>
        ) : (
          <span className={`pokeball ${styles.waiting}`} aria-hidden="true" />
        )}

        {pickedResult && (
          <>
            <span className={`${styles.pop} ${styles.foePop}`} style={{ animationDelay: `${T.hit}s` }}>
              <MultPill value={pickedResult.out.mult} size="lg" />
            </span>
            <span className={`${styles.pop} ${styles.mePop}`} style={{ animationDelay: `${T.counter}s` }}>
              <MultPill value={pickedResult.back.mult} size="lg" />
            </span>
          </>
        )}
      </div>

      <div className={styles.textbox} aria-live="polite">
        {picked !== null && !revealed && (
          <button className={styles.skip} onClick={skip} data-sfx="none">
            Skip ⏩
          </button>
        )}

        {picked === null ? (
          <div className={styles.lines}>
            <p>
              <strong>Your rival sent out {foe.name}!</strong>
            </p>
            <p className={styles.tip}>
              Choose the Pokémon that hits it hardest and takes the least damage. Keys 1–{party.length}{" "}
              work too!
            </p>
          </div>
        ) : (
          <div className={styles.lines}>
            <p style={{ "--d": `${T.send}s` }}>Go, {picked.name}!</p>
            <p style={{ "--d": `${T.hit}s` }}>
              {picked.name} used a {TYPE_BY_ID[pickedResult.out.type].name}-type move!{" "}
              {effectText(pickedResult.out.mult, foe.name)}
            </p>
            <p style={{ "--d": `${T.counter}s` }}>
              {foe.name} struck back with a {TYPE_BY_ID[pickedResult.back.type].name}-type move!{" "}
              {effectText(pickedResult.back.mult, picked.name)}
            </p>
            <div className={styles.verdict} data-correct={correct} style={{ "--d": `${T.verdict}s` }}>
              <p>
                {correct ? (
                  <>
                    <strong>Great pick! 🎉</strong> Best matchup in your party.
                  </>
                ) : (
                  <>
                    <strong>Not quite. 🤔</strong> {best.name} was the better pick.
                  </>
                )}
              </p>
              <button className="btn coral" onClick={next}>
                {isLast ? "Finish" : "Next battle →"}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className={styles.party} role="group" aria-label="Your party. Choose who to send out.">
        {party.map((p, i) => {
          const r = results[i];
          const state =
            choice === null ? "" : i === bestIndex ? "best" : i === choice ? "wrong" : "dim";
          return (
            <button
              key={p.dex}
              className={styles.mon}
              data-state={state}
              data-sfx="none"
              disabled={choice !== null}
              onClick={() => choose(i)}
            >
              <span className={styles.key} aria-hidden="true">
                {i + 1}
              </span>
              <PokemonArt pokemon={p} size="clamp(56px, 14vw, 76px)" />
              <span className={styles.monName}>{p.name}</span>
              <span className={styles.types}>
                {p.types.map((t) => (
                  <TypeBadge key={t} id={t} size="sm" />
                ))}
              </span>
              {choice !== null && (
                <span className={styles.calc}>
                  <span title="Damage it deals">⚔️ {MULTIPLIERS[r.out.mult].label}</span>
                  <span title="Damage it takes">🛡️ {MULTIPLIERS[r.back.mult].label}</span>
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
