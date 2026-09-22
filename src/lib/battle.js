import { multiplierAgainst } from "@/data/types";
import { ROSTER } from "@/data/pokemon";

// Arena battles. Each Pokémon attacks with the best of its own types, so a battle
// between two Pokémon boils down to: how hard do I hit, and how hard do I get hit?

/** The move type (one of the attacker's own types) that hits the target hardest. */
export function bestAttack(attacker, target) {
  let best = { type: attacker.types[0], mult: -1 };
  for (const type of attacker.types) {
    const mult = multiplierAgainst(type, target.types);
    if (mult > best.mult) best = { type, mult };
  }
  return best;
}

/**
 * What happens when `mine` faces `foe`:
 *  out   - my best attack on the foe
 *  back  - the foe's best attack on me
 *  score - damage dealt minus damage taken (higher is a better matchup)
 */
export function resolve(mine, foe) {
  const out = bestAttack(mine, foe);
  const back = bestAttack(foe, mine);
  return { out, back, score: out.mult - back.mult };
}

/** How much of a Pokémon's HP bar a hit of this multiplier takes off (0 to 1). */
export function hpLoss(mult) {
  if (mult >= 4) return 1;
  if (mult >= 2) return 0.6;
  if (mult >= 1) return 0.35;
  if (mult >= 0.5) return 0.18;
  if (mult > 0) return 0.08;
  return 0;
}

const pick = (list) => list[Math.floor(Math.random() * list.length)];

function shuffle(list) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Builds `count` battles. Each has an opponent and a party of three, where exactly one
 * party member is clearly the best matchup: it wins the exchange, and each of the others
 * is at least a full point worse, so there's never an argument about the answer.
 */
export function buildBattles(count = 6) {
  const battles = [];
  const usedFoes = new Set();

  while (battles.length < count) {
    const foe = pick(ROSTER.filter((p) => !usedFoes.has(p.dex)));
    const scored = ROSTER.filter((p) => p.dex !== foe.dex).map((p) => ({ p, score: resolve(p, foe).score }));

    const best = pick(scored.filter((s) => s.score >= 1));
    if (!best) continue;
    const worse = scored.filter((s) => s.score <= best.score - 1);
    if (worse.length < 2) continue;

    const others = shuffle(worse).slice(0, 2);
    const party = shuffle([best, ...others]).map((s) => s.p);
    usedFoes.add(foe.dex);
    battles.push({ foe, party, bestIndex: party.indexOf(best.p) });
  }

  return battles;
}
