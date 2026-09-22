"use client";

import { useEffect, useRef, useState } from "react";
import { TYPE_BY_ID } from "@/data/types";
import { ORDER } from "@/data/route";
import { useProgress, progress } from "@/lib/progress";
import { sfx } from "@/lib/sfx";
import Archipelago from "./Archipelago";
import TypeCard from "./TypeCard";
import Welcome from "./Welcome";
import styles from "./WorldMap.module.css";

// Map coordinates live in a 400-wide space; nodes wind down the map in an S-curve.
const W = 400;
const STEP = 132;
const TOP = 100;
const H = TOP * 2 + STEP * (ORDER.length - 1);
const POINTS = ORDER.map((id, i) => ({
  id,
  x: 200 + 105 * Math.sin(i * 0.95 + 0.3),
  y: TOP + i * STEP,
}));

// One path segment per hop (i -> i+1), so locked stretches can be styled separately.
const SEGMENTS = POINTS.slice(1).map((p, i) => {
  const prev = POINTS[i];
  return `M ${prev.x.toFixed(1)} ${prev.y} C ${prev.x.toFixed(1)} ${prev.y + STEP / 2}, ${p.x.toFixed(1)} ${p.y - STEP / 2}, ${p.x.toFixed(1)} ${p.y}`;
});

const BLOBS = [
  "58% 42% 55% 45% / 50% 58% 42% 50%",
  "45% 55% 40% 60% / 58% 44% 56% 42%",
  "52% 48% 60% 40% / 44% 55% 45% 56%",
];

// Scenery along the edges of the map (x/y in percent of the map).
const SCENERY = [
  { e: "🐋", x: 9, y: 4, s: 3.2 },
  { e: "☁️", x: 88, y: 9, s: 4.2 },
  { e: "⛵", x: 91, y: 22, s: 2.6 },
  { e: "🐚", x: 8, y: 30, s: 2 },
  { e: "☁️", x: 10, y: 40, s: 3.6 },
  { e: "🏝️", x: 90, y: 47, s: 3.4 },
  { e: "🐙", x: 8, y: 58, s: 2.8 },
  { e: "⛵", x: 89, y: 66, s: 2.4 },
  { e: "☁️", x: 91, y: 78, s: 4 },
  { e: "🐬", x: 9, y: 84, s: 2.8 },
  { e: "🌴", x: 90, y: 93, s: 2.6 },
];

const pctX = (x) => `${((x / W) * 100).toFixed(3)}%`;
const pctY = (y) => `${((y / H) * 100).toFixed(3)}%`;

export default function WorldMap() {
  const { visited, badges } = useProgress();
  const [selected, setSelected] = useState(null);
  const [nudge, setNudge] = useState(null); // id of a locked island the player just tapped
  const nudgeTimer = useRef(0);

  useEffect(() => () => clearTimeout(nudgeTimer.current), []);

  // The current island is the first one without a badge. Everything up to it is open;
  // anything already badged stays open too. Everything after it is locked.
  const firstOpen = ORDER.findIndex((id) => !badges.includes(id));
  const currentIndex = firstOpen === -1 ? ORDER.length - 1 : firstOpen;
  const isUnlocked = (i) => i <= currentIndex || badges.includes(ORDER[i]);
  const current = TYPE_BY_ID[ORDER[currentIndex]];

  const markerId = selected && isUnlocked(ORDER.indexOf(selected)) ? selected : ORDER[currentIndex];
  const marker = POINTS[ORDER.indexOf(markerId)];

  function select(id) {
    const i = ORDER.indexOf(id);
    if (!isUnlocked(i)) {
      sfx.locked();
      setNudge(id);
      clearTimeout(nudgeTimer.current);
      nudgeTimer.current = setTimeout(() => setNudge(null), 2400);
      return;
    }
    setNudge(null);
    progress.visit(id);
    sfx.note(i);
    setSelected(id);
    // on phones the card slides up over the bottom of the screen, so park the island near the top
    if (window.matchMedia("(max-width: 900px)").matches) {
      const el = document.getElementById(`node-${id}`);
      if (el) {
        window.scrollTo({
          top: el.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.16,
          behavior: "smooth",
        });
      }
    }
  }

  const openSegments = SEGMENTS.filter((_, k) => isUnlocked(k + 1));
  const lockedSegments = SEGMENTS.filter((_, k) => !isUnlocked(k + 1));
  const nudgePoint = nudge ? POINTS[ORDER.indexOf(nudge)] : null;

  return (
    <div className={styles.layout}>
      <Archipelago />
      <div className={styles.mapCol}>
        <Welcome className={styles.welcomeMobile} />

        <div className={styles.map} style={{ aspectRatio: `${W} / ${H}` }}>
          {SCENERY.map((s, i) => (
            <span
              key={i}
              className={styles.scenery}
              aria-hidden="true"
              style={{ left: `${s.x}%`, top: `${s.y}%`, fontSize: `${s.s}rem`, "--i": i }}
            >
              {s.e}
            </span>
          ))}

          {POINTS.map((p, i) => (
            <span
              key={p.id}
              className={styles.island}
              aria-hidden="true"
              data-locked={!isUnlocked(i)}
              style={{
                left: pctX(p.x),
                top: pctY(p.y),
                borderRadius: BLOBS[i % BLOBS.length],
                "--type-color": TYPE_BY_ID[p.id].color,
              }}
            />
          ))}

          <svg className={styles.path} viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
            <g>
              {openSegments.map((d) => <path key={`s${d}`} d={d} className={styles.sand} />)}
              {openSegments.map((d) => <path key={`d${d}`} d={d} className={styles.dashes} />)}
            </g>
            <g className={styles.lockedPath}>
              {lockedSegments.map((d) => <path key={`s${d}`} d={d} className={styles.sand} />)}
              {lockedSegments.map((d) => <path key={`d${d}`} d={d} className={styles.dashes} />)}
            </g>
          </svg>

          {!selected && visited.length === 0 && (
            <span
              className={styles.hint}
              style={{ left: pctX(POINTS[0].x), top: pctY(POINTS[0].y) }}
              aria-hidden="true"
            >
              Start here!
            </span>
          )}

          <span
            className={styles.marker}
            aria-hidden="true"
            style={{ left: pctX(marker.x), top: pctY(marker.y) }}
          >
            <span className={`pokeball ${styles.ball}`} />
          </span>

          {POINTS.map((p, i) => {
            const t = TYPE_BY_ID[p.id];
            const locked = !isUnlocked(i);
            const mastered = badges.includes(p.id);
            const seen = visited.includes(p.id);
            const state = locked ? "locked" : mastered ? "mastered" : seen ? "visited" : "new";
            return (
              <button
                key={p.id}
                id={`node-${p.id}`}
                className={styles.node}
                data-sfx="none"
                data-state={state}
                data-selected={selected === p.id}
                data-nudge={nudge === p.id}
                aria-pressed={locked ? undefined : selected === p.id}
                aria-disabled={locked || undefined}
                aria-label={`${t.name} type${locked ? ", locked" : mastered ? ", badge earned" : seen ? ", explored" : ""}`}
                style={{
                  left: pctX(p.x),
                  top: pctY(p.y),
                  "--type-color": t.color,
                  "--type-ink": t.ink,
                }}
                onClick={() => select(p.id)}
              >
                <span className={styles.medal}>
                  <span aria-hidden="true">{locked ? "🔒" : t.emoji}</span>
                </span>
                {mastered && (
                  <span className={styles.star} aria-hidden="true">
                    ⭐
                  </span>
                )}
                <span className={styles.label}>{t.name}</span>
              </button>
            );
          })}

          {nudgePoint && (
            <span
              role="status"
              className={`${styles.hint} ${styles.lockNote}`}
              style={{
                left: `clamp(110px, ${pctX(nudgePoint.x)}, calc(100% - 110px))`,
                top: pctY(nudgePoint.y),
              }}
            >
              🔒 Earn the {current.name} badge first!
            </span>
          )}
        </div>
      </div>

      <div className={styles.panelCol} data-open={selected !== null}>
        {selected ? (
          <TypeCard key={selected} id={selected} onClose={() => setSelected(null)} onSelect={select} />
        ) : (
          <Welcome />
        )}
      </div>
    </div>
  );
}
