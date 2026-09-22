"use client";

import { useState } from "react";
import { TYPES, TYPE_BY_ID, MULTIPLIERS, multiplier } from "@/data/types";
import TypeBadge from "./TypeBadge";
import MultPill from "./MultPill";
import styles from "./MatchupChart.module.css";

const CELL_TEXT = { 2: "2", 0.5: "½", 0: "0", 1: "" };

// `header` and `footer` render in the side column next to the chart, so the whole page fits on one screen.
export default function MatchupChart({ header, footer }) {
  const [active, setActive] = useState(null); // { a: attackerId, d: defenderId }

  return (
    <div className={styles.layout}>
      <aside className={styles.side}>
        {header}

        <div className={`card ${styles.caption}`} aria-live="polite">
          {active ? (
            <>
              <TypeBadge id={active.a} size="sm" />
              <span aria-hidden="true">attacks</span>
              <TypeBadge id={active.d} size="sm" />
              <span aria-hidden="true">=</span>
              <MultPill value={multiplier(active.a, active.d)} showWord />
            </>
          ) : (
            <span className={styles.captionHint}>👆 Pick a square to see the matchup</span>
          )}
        </div>

        <div className={styles.legend} aria-hidden="true">
          <span><i className={styles.swatch} data-m="2" /> Super effective</span>
          <span><i className={styles.swatch} data-m="0.5" /> Not very effective</span>
          <span><i className={styles.swatch} data-m="0" /> No effect</span>
          <span><i className={styles.swatch} data-m="1" /> Normal</span>
        </div>

        {footer}
      </aside>

      <div className={`card ${styles.scroller}`}>
        <table className={styles.grid} onMouseLeave={() => setActive(null)}>
          <caption className="srOnly">
            Pokémon type effectiveness chart. Rows are attacking types, columns are defending types.
          </caption>
          <thead>
            <tr>
              <th className={styles.corner} scope="col">
                <span>ATK ↓</span>
                <span>DEF →</span>
              </th>
              {TYPES.map((t) => (
                <th
                  key={t.id}
                  scope="col"
                  className={`${styles.colHead} ${active?.d === t.id ? styles.hi : ""}`}
                  style={{ "--type-color": t.color }}
                  title={t.name}
                >
                  <span aria-hidden="true">{t.emoji}</span>
                  <span className="srOnly">{t.name}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TYPES.map((a) => (
              <tr key={a.id}>
                <th
                  scope="row"
                  className={`${styles.rowHead} ${active?.a === a.id ? styles.hi : ""}`}
                  style={{ "--type-color": a.color, "--type-ink": a.ink }}
                >
                  <span className={styles.rowInner}>
                    <span aria-hidden="true">{a.emoji}</span>
                    <span className={styles.rowName}>{a.name}</span>
                  </span>
                </th>
                {TYPES.map((d) => {
                  const m = multiplier(a.id, d.id);
                  const inCross = active && (active.a === a.id || active.d === d.id);
                  const isActive = active?.a === a.id && active?.d === d.id;
                  return (
                    <td
                      key={d.id}
                      data-m={m}
                      className={`${styles.cell} ${inCross ? styles.cross : ""} ${isActive ? styles.on : ""}`}
                      onMouseEnter={() => setActive({ a: a.id, d: d.id })}
                      onClick={() => setActive({ a: a.id, d: d.id })}
                      aria-label={`${a.name} attacking ${TYPE_BY_ID[d.id].name}: ${MULTIPLIERS[m].word}`}
                    >
                      {CELL_TEXT[m]}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
