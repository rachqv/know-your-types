import { TYPES, multiplier } from "@/data/types";

// Every attacker/defender pair with its correct answer.
const ALL_PAIRS = TYPES.flatMap((a) =>
  TYPES.map((d) => ({ attacker: a.id, defender: d.id, answer: multiplier(a.id, d.id) })),
);

// Outcome mix per round, so rounds aren't 60% "normal damage".
const ARENA_MIX = [2, 2, 2, 0.5, 0.5, 0.5, 1, 1, 0, 0];
const CHALLENGE_MIX = [2, 0.5, 2, 0.5, 1];

function shuffle(list) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Builds a round of questions. With `focus`, every question involves that type
 * (as attacker or defender), which is what the per-type badge challenges use.
 */
export function buildRound({ count = 10, focus = null } = {}) {
  const pool = focus ? ALL_PAIRS.filter((p) => p.attacker === focus || p.defender === focus) : ALL_PAIRS;
  const used = new Set();

  const take = (candidates) => {
    const fresh = candidates.filter((p) => !used.has(p));
    if (!fresh.length) return null;
    const pick = fresh[Math.floor(Math.random() * fresh.length)];
    used.add(pick);
    return pick;
  };

  const mix = shuffle(focus ? CHALLENGE_MIX : ARENA_MIX).slice(0, count);
  return mix.map((outcome) => {
    const pair = take(pool.filter((p) => p.answer === outcome)) ?? take(pool);
    return { ...pair };
  });
}
