"use client";

import { useState } from "react";
import Image from "next/image";
import { TYPE_BY_ID, mascotUrl } from "@/data/types";
import styles from "./PokemonArt.module.css";

// Official artwork for a roster Pokémon. `size` is any CSS length (or a number of px).
// Falls back to the Pokémon's first type emoji if the image can't load.
export default function PokemonArt({ pokemon, size = 96 }) {
  const [failed, setFailed] = useState(false);
  const length = typeof size === "number" ? `${size}px` : size;

  return (
    <div className={styles.art} style={{ "--s": length }}>
      {failed ? (
        <span className={styles.fallback} role="img" aria-label={pokemon.name}>
          {TYPE_BY_ID[pokemon.types[0]].emoji}
        </span>
      ) : (
        <Image
          src={mascotUrl(pokemon.dex)}
          alt={pokemon.name}
          width={475}
          height={475}
          sizes="160px"
          className={styles.img}
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}
