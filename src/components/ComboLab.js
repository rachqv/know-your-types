"use client";

import { useState } from "react";
import { TYPES } from "@/data/types";
import { ROSTER } from "@/data/pokemon";
import { sfx } from "@/lib/sfx";
import PageTitle from "./PageTitle";
import PokemonSearch from "./PokemonSearch";
import TypePicker from "./TypePicker";
import DefendResult from "./DefendResult";
import styles from "./ComboLab.module.css";

// Famous two-type Pokémon, as one-tap examples.
const FAMOUS = ["Bulbasaur", "Charizard", "Gyarados", "Gengar", "Lucario", "Dragonite"].map((name) =>
  ROSTER.find((p) => p.name === name),
);

export default function ComboLab() {
  const [ids, setIds] = useState(FAMOUS[0].types);
  const [pokemon, setPokemon] = useState(FAMOUS[0]); // set when the types came from a specific Pokémon

  function choosePokemon(p) {
    sfx.note(TYPES.findIndex((t) => t.id === p.types[0]));
    setPokemon(p);
    setIds(p.types);
  }

  function pickType(id) {
    sfx.note(TYPES.findIndex((t) => t.id === id));
    setPokemon(null);
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
            Many Pokémon have two types. Search one, or build a combo, and see what it&apos;s weak
            to. Types stack, so damage multiplies!
          </PageTitle>

          <PokemonSearch onPick={choosePokemon} />

          <div className={styles.famous}>
            <span className={styles.famousLabel}>Or try a famous one:</span>
            {FAMOUS.map((f) => (
              <button
                key={f.name}
                className={`btn ghost ${styles.famousBtn}`}
                data-sfx="none"
                onClick={() => choosePokemon(f)}
              >
                {f.name}
              </button>
            ))}
          </div>

          <div className={styles.picker}>
            <p className={styles.hint}>Or pick up to two types yourself:</p>
            <TypePicker selected={ids} onPick={pickType} compact />
          </div>
        </div>

        <div className={styles.result} aria-live="polite">
          <DefendResult key={ids.join("+") + (pokemon?.dex ?? "")} ids={ids} pokemon={pokemon} />
        </div>
      </div>
    </main>
  );
}
