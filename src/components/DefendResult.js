import { TYPES, TYPE_BY_ID, MULTIPLIERS, multiplierAgainst } from "@/data/types";
import TypeBadge from "./TypeBadge";
import MultPill from "./MultPill";
import Mascot from "./Mascot";
import styles from "./Result.module.css";

const ORDER = [4, 2, 0.5, 0.25, 0];

function summarize(byMult) {
  const weak = [...(byMult[4] ?? []), ...(byMult[2] ?? [])];
  if (byMult[4]?.length) return "Careful! This combo is double-weak to something, so it takes a huge hit from it.";
  if (weak.length === 0) return "No weaknesses at all. That's a very sturdy combo.";
  if (weak.length >= 5) return "Lots of weaknesses. This one is glass-cannon territory.";
  return `Watch out for ${weak.map((t) => t.name).join(", ")} moves.`;
}

export default function DefendResult({ ids }) {
  const byMult = {};
  for (const t of TYPES) {
    const m = multiplierAgainst(t.id, ids);
    (byMult[m] ??= []).push(t);
  }
  const neutral = byMult[1] ?? [];

  return (
    <div className={styles.pop}>
      <div className={`card ${styles.intro}`}>
        <div className={styles.mascots}>
          {ids.map((id) => (
            <Mascot key={id} typeId={id} size={ids.length > 1 ? 76 : 88} />
          ))}
        </div>
        <div>
          <h3>
            {ids.map((id) => (
              <TypeBadge key={id} id={id} size="lg" />
            ))}{" "}
            Pokémon
          </h3>
          <p>{summarize(byMult)}</p>
          <p className={styles.mascotNote}>
            Pure-type examples: {ids.map((id) => TYPE_BY_ID[id].mascotName).join(" and ")}
          </p>
        </div>
      </div>

      <div className={styles.rows}>
        {ORDER.filter((m) => byMult[m]).map((m) => (
          <section key={m} className={`card ${styles.row}`}>
            <div className={styles.rowLabel}>
              <MultPill value={m} size="lg" />
              <span>{MULTIPLIERS[m].word}</span>
            </div>
            <ul className={styles.badges}>
              {byMult[m].map((t, i) => (
                <li key={t.id} style={{ "--i": i }}>
                  <TypeBadge id={t.id} />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <p className={styles.footnote}>
        The other {neutral.length} types deal normal damage (1×). With two types, the multipliers
        stack: 2× and 2× makes 4×, and ½× with 2× cancels out.
      </p>
    </div>
  );
}
