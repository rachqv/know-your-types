"use client";

import { useState } from "react";
import { ROSTER } from "@/data/pokemon";
import PokemonArt from "./PokemonArt";
import TypeBadge from "./TypeBadge";
import styles from "./PokemonSearch.module.css";

const MAX_RESULTS = 5;

// Type-ahead search over the Arena roster. Calls onPick(pokemon) when one is chosen.
export default function PokemonSearch({ onPick }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const q = query.trim().toLowerCase();
  const matches = q
    ? ROSTER.filter((p) => p.name.toLowerCase().includes(q))
        .sort((a, b) => Number(b.name.toLowerCase().startsWith(q)) - Number(a.name.toLowerCase().startsWith(q)))
        .slice(0, MAX_RESULTS)
    : [];

  function pick(pokemon) {
    onPick(pokemon);
    setQuery("");
    setOpen(false);
  }

  return (
    <div
      className={styles.search}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false);
      }}
    >
      <label className="srOnly" htmlFor="pokemon-search">
        Search for a Pokémon
      </label>
      <span className={styles.icon} aria-hidden="true">🔎</span>
      <input
        id="pokemon-search"
        className={styles.input}
        value={query}
        placeholder="Search a Pokémon (try Gengar)"
        autoComplete="off"
        role="combobox"
        aria-expanded={open && q !== ""}
        aria-controls="pokemon-results"
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && matches[0]) pick(matches[0]);
          if (e.key === "Escape") setOpen(false);
        }}
      />

      {open && q !== "" && (
        <ul id="pokemon-results" role="listbox" className={styles.results}>
          {matches.map((p) => (
            <li key={p.dex} role="option" aria-selected="false">
              <button type="button" className={styles.result} onClick={() => pick(p)}>
                <PokemonArt pokemon={p} size={36} />
                <strong>{p.name}</strong>
                <span className={styles.types}>
                  {p.types.map((t) => (
                    <TypeBadge key={t} id={t} size="sm" />
                  ))}
                </span>
              </button>
            </li>
          ))}
          {matches.length === 0 && (
            <li className={styles.none}>No match yet. We only know about {ROSTER.length} Pokémon so far!</li>
          )}
        </ul>
      )}
    </div>
  );
}
