// Type data + matchup logic (current 18-type chart).

const RAW_TYPES = [
  { id: "normal", name: "Normal", emoji: "⚪", color: "#A8A77A", mascot: 133, mascotName: "Eevee", vibe: "The everyday all-rounder. Rarely flashy, rarely in trouble." },
  { id: "fire", name: "Fire", emoji: "🔥", color: "#EE8130", mascot: 4, mascotName: "Charmander", vibe: "Hot-headed and hungry. Burns through plants, ice, bugs and metal." },
  { id: "water", name: "Water", emoji: "💧", color: "#6390F0", mascot: 7, mascotName: "Squirtle", vibe: "Calm but powerful. Douses flames and washes over rock and earth." },
  { id: "electric", name: "Electric", emoji: "⚡", color: "#F7D02C", mascot: 25, mascotName: "Pikachu", vibe: "Fast and shocking. Loves soaking wet and airborne targets." },
  { id: "grass", name: "Grass", emoji: "🌿", color: "#7AC74C", mascot: 152, mascotName: "Chikorita", vibe: "Tough and tangled. Thrives against water, ground and rock." },
  { id: "ice", name: "Ice", emoji: "❄️", color: "#96D9D6", mascot: 471, mascotName: "Glaceon", vibe: "Cold and brittle. Freezes dragons solid, but shatters easily." },
  { id: "fighting", name: "Fighting", emoji: "👊", color: "#C22E28", mascot: 66, mascotName: "Machop", vibe: "Pure muscle. Punches through almost anything that isn't a ghost." },
  { id: "poison", name: "Poison", emoji: "☠️", color: "#A33EA1", mascot: 109, mascotName: "Koffing", vibe: "Sneaky and toxic. Wilts plants and fairies." },
  { id: "ground", name: "Ground", emoji: "🌍", color: "#E2BF65", mascot: 50, mascotName: "Diglett", vibe: "Down to earth. Shrugs off lightning and flyers can't touch it." },
  { id: "flying", name: "Flying", emoji: "🕊️", color: "#A98FF3", mascot: 641, mascotName: "Tornadus", vibe: "Head in the clouds. Swoops on plants, bugs and brawlers." },
  { id: "psychic", name: "Psychic", emoji: "🔮", color: "#F95587", mascot: 63, mascotName: "Abra", vibe: "Big-brain energy. Outsmarts fighters and poisoners." },
  { id: "bug", name: "Bug", emoji: "🐛", color: "#A6B91A", mascot: 10, mascotName: "Caterpie", vibe: "Small but scrappy. Nibbles at plants, minds and shadows." },
  { id: "rock", name: "Rock", emoji: "🪨", color: "#B6A136", mascot: 185, mascotName: "Sudowoodo", vibe: "Solid as a boulder. Smashes fire, ice, flyers and bugs." },
  { id: "ghost", name: "Ghost", emoji: "👻", color: "#735797", mascot: 200, mascotName: "Misdreavus", vibe: "Spooky. Normal and Fighting moves pass right through." },
  { id: "dragon", name: "Dragon", emoji: "🐉", color: "#6F35FC", mascot: 147, mascotName: "Dratini", vibe: "Mythic and mighty. Only fears ice, other dragons, and fairies." },
  { id: "dark", name: "Dark", emoji: "🌑", color: "#705746", mascot: 197, mascotName: "Umbreon", vibe: "Sly and shadowy. Tricks minds and spirits. Psychic can't touch it." },
  { id: "steel", name: "Steel", emoji: "⚙️", color: "#B7B7CE", mascot: 599, mascotName: "Klink", vibe: "Armored up. Resists more types than any other." },
  { id: "fairy", name: "Fairy", emoji: "🧚", color: "#D685AD", mascot: 175, mascotName: "Togepi", vibe: "Sparkly but sharp. Tames dragons and is immune to their moves." },
];

// Attacking type -> which defending types take 2x (strong), 0.5x (weak) or 0x (none).
const ATTACKS = {
  normal: { strong: [], weak: ["rock", "steel"], none: ["ghost"] },
  fire: { strong: ["grass", "ice", "bug", "steel"], weak: ["fire", "water", "rock", "dragon"], none: [] },
  water: { strong: ["fire", "ground", "rock"], weak: ["water", "grass", "dragon"], none: [] },
  electric: { strong: ["water", "flying"], weak: ["electric", "grass", "dragon"], none: ["ground"] },
  grass: { strong: ["water", "ground", "rock"], weak: ["fire", "grass", "poison", "flying", "bug", "dragon", "steel"], none: [] },
  ice: { strong: ["grass", "ground", "flying", "dragon"], weak: ["fire", "water", "ice", "steel"], none: [] },
  fighting: { strong: ["normal", "ice", "rock", "dark", "steel"], weak: ["poison", "flying", "psychic", "bug", "fairy"], none: ["ghost"] },
  poison: { strong: ["grass", "fairy"], weak: ["poison", "ground", "rock", "ghost"], none: ["steel"] },
  ground: { strong: ["fire", "electric", "poison", "rock", "steel"], weak: ["grass", "bug"], none: ["flying"] },
  flying: { strong: ["grass", "fighting", "bug"], weak: ["electric", "rock", "steel"], none: [] },
  psychic: { strong: ["fighting", "poison"], weak: ["psychic", "steel"], none: ["dark"] },
  bug: { strong: ["grass", "psychic", "dark"], weak: ["fire", "fighting", "poison", "flying", "ghost", "steel", "fairy"], none: [] },
  rock: { strong: ["fire", "ice", "flying", "bug"], weak: ["fighting", "ground", "steel"], none: [] },
  ghost: { strong: ["psychic", "ghost"], weak: ["dark"], none: ["normal"] },
  dragon: { strong: ["dragon"], weak: ["steel"], none: ["fairy"] },
  dark: { strong: ["psychic", "ghost"], weak: ["fighting", "dark", "fairy"], none: [] },
  steel: { strong: ["ice", "rock", "fairy"], weak: ["fire", "water", "electric", "steel"], none: [] },
  fairy: { strong: ["fighting", "dragon", "dark"], weak: ["fire", "poison", "steel"], none: [] },
};

// Picks white or dark text, whichever reads better on the given background.
function luminance(hex) {
  const [r, g, b] = [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function inkFor(hex) {
  const lum = luminance(hex);
  const whiteContrast = 1.05 / (lum + 0.05);
  const darkContrast = (lum + 0.05) / (luminance("#1d1633") + 0.05);
  return whiteContrast >= darkContrast ? "#ffffff" : "#1d1633";
}

export const TYPES = RAW_TYPES.map((t) => ({ ...t, ink: inkFor(t.color) }));
export const TYPE_BY_ID = Object.fromEntries(TYPES.map((t) => [t.id, t]));

export function mascotUrl(dexNumber) {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${dexNumber}.png`;
}

/** Damage multiplier for one attacking type hitting one defending type. */
export function multiplier(attackId, defendId) {
  const row = ATTACKS[attackId];
  if (row.strong.includes(defendId)) return 2;
  if (row.weak.includes(defendId)) return 0.5;
  if (row.none.includes(defendId)) return 0;
  return 1;
}

/** Damage multiplier for an attack type against a Pokémon with one or two types. */
export function multiplierAgainst(attackId, defendIds) {
  return defendIds.reduce((total, d) => total * multiplier(attackId, d), 1);
}

export const MULTIPLIERS = {
  4: { label: "4×", word: "Ultra effective", tone: "var(--m4)" },
  2: { label: "2×", word: "Super effective", tone: "var(--m2)" },
  1: { label: "1×", word: "Normal damage", tone: "var(--m1)" },
  0.5: { label: "½×", word: "Not very effective", tone: "var(--mh)" },
  0.25: { label: "¼×", word: "Barely a scratch", tone: "var(--mq)" },
  0: { label: "0×", word: "No effect", tone: "var(--m0)" },
};
