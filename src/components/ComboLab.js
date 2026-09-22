"use client";

import { useState } from "react";
import { TYPES } from "@/data/types";
import { sfx } from "@/lib/sfx";
import PageTitle from "./PageTitle";
import TypePicker from "./TypePicker";
import DefendResult from "./DefendResult";
import styles from "./ComboLab.module.css";

// Famous two-type Pokémon, as one-tap examples.
const FAMOUS = [
  { name: "Bulbasaur", types: ["grass", "poison"] },
  { name: "Charizard", types: ["fire", "flying"] },
  { name: "Gyarados", types: ["water", "flying"] },
  { name: "Gengar", types: ["ghost", "poison"] },
  { name: "Lucario", types: ["fighting", "steel"] },
  { name: "Dragonite", types: ["dragon", "flying"] },
];

export default function ComboLab() {
  const [ids, setIds] = useState(FAMOUS[0].types);

  function pick(id) {
    sfx.note(TYPES.findIndex((t) => t.id === id));
    setIds((cur) => {
      if (cur.includes(id)) return cur.length > 1 ? cur.filter((d) => d !== id) : cur;
      return cur.length >= 2 ? [cur[1], id] : [...cur, id];
    });
  }

  return (
    <main className="page wide">
      <div className={styles.layout}>
        <div className={styles.controls}>
          <PageTitle emoji="🧪" title="Combo Lab">
            Many Pokémon have two types. Build a combo and see what it&apos;s weak to. Types stack,
            so damage multiplies!
          </PageTitle>

          <div className={styles.famous}>
            <span className={styles.famousLabel}>Try a famous one:</span>
            {FAMOUS.map((f) => (
              <button
                key={f.name}
                className={`btn ghost ${styles.famousBtn}`}
                onClick={() => setIds(f.types)}
              >
                {f.name}
              </button>
            ))}
          </div>

          <div className={styles.picker}>
            <p className={styles.hint}>Pick up to two types:</p>
            <TypePicker selected={ids} onPick={pick} compact />
          </div>
        </div>

        <div className={styles.result} aria-live="polite">
          <DefendResult key={ids.join("+")} ids={ids} />
        </div>
      </div>
    </main>
  );
}
