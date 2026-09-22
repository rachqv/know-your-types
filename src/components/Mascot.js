"use client";

import { useState } from "react";
import Image from "next/image";
import { TYPE_BY_ID, mascotUrl } from "@/data/types";
import styles from "./Mascot.module.css";

// Official artwork of a Pokémon that's a pure example of the type.
// Falls back to the type's emoji if the image can't load (offline, etc.).
export default function Mascot({ typeId, size = 140, priority = false }) {
  const [failed, setFailed] = useState(false);
  const type = TYPE_BY_ID[typeId];

  return (
    <div
      className={styles.frame}
      style={{ "--type-color": type.color, width: size, height: size }}
    >
      {failed ? (
        <span className={styles.fallback} style={{ fontSize: size * 0.5 }} role="img" aria-label={`${type.name} type`}>
          {type.emoji}
        </span>
      ) : (
        <Image
          src={mascotUrl(type.mascot)}
          alt={type.mascotName}
          width={475}
          height={475}
          sizes={`${size}px`}
          priority={priority}
          className={styles.img}
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}
