# Know Your Types

A playful, beginner-friendly guide to Pokémon type matchups. Instead of a wall of tables, it turns learning the 18 types into a small adventure: explore an island map, earn badges, and battle it out in the arena.

Built with [Next.js](https://nextjs.org) (App Router), React 19, and plain CSS Modules. There are no UI libraries, no backend and no audio files.

## Features

- **🗺️ Map:** the 18 types are islands on a winding sea path. Tap one to see what it's strong and weak against, both attacking and defending.
  - Each island has a 5-question challenge. Get 4 right to earn its badge and **unlock the next island**, so beginners are guided through the types in a sensible order (Fire, Water and Grass first).
  - Finished islands stay open for review or replay.
- **🧪 Combos:** pick one or two types and see how a dual-type Pokémon fares, with the combined multipliers (4×, 2×, ½×, ¼×, 0×). It includes one-tap examples like Charizard and Gengar.
- **📖 Journal:** the full 18×18 type chart. Hover or tap a square to highlight its row and column and read the matchup in plain language.
- **⚔️ Arena:** endless 10-question rounds with streaks, feedback after every answer, and a "worth remembering" list of the ones you missed.
- **Progress:** XP, levels and badges are saved in your browser's `localStorage`. No account is needed, and there's a reset button on the Map's welcome panel.
- **Polish:**
  - Sound effects are synthesized with the Web Audio API. Type chips play notes, quiz answers have their own sounds, and there's a mute button in the top bar.
  - A small emoji puff on click, and an emoji shower for big moments.
  - It respects `prefers-reduced-motion`.
  - It's responsive: the Map's type card becomes a bottom sheet on phones, and Combos and Journal fit on one screen on desktop.

## Getting started

You need Node.js 20.9 or newer (required by Next.js 16).

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

| Command         | What it does                     |
| --------------- | -------------------------------- |
| `npm run dev`   | Start the dev server             |
| `npm run build` | Create a production build        |
| `npm start`     | Serve the production build       |
| `npm run lint`  | Run ESLint                       |

## Project structure

```
src/
├── app/                 Routes and global styles
│   ├── layout.js        Fonts, top bar, click effects
│   ├── page.js          Map        (/)
│   ├── lab/             Combos     (/lab)
│   ├── journal/         Journal    (/journal)
│   ├── arena/           Arena      (/arena)
│   └── globals.css      Design tokens (colors, spacing, fonts) and shared classes
├── components/          UI components, each with a co-located .module.css
├── data/
│   ├── types.js         The 18 types, the effectiveness chart, and matchup helpers
│   └── route.js         The order islands unlock in
└── lib/
    ├── progress.js      XP / badge / visited state, persisted to localStorage
    ├── quiz.js          Question generation for the Arena and per-type challenges
    ├── sfx.js           Synthesized sound effects and the mute setting
    └── celebrate.js     Triggers the confetti shower
```

## How it works

- **Type data** lives in `src/data/types.js`. The chart is stored once as each attacking type's list of super effective (2×), not very effective (½×) and no effect (0×) targets. Everything else, including the Journal grid, dual-type results and quiz answers, is calculated from it with `multiplier()` and `multiplierAgainst()`.
- **Progress** is a small external store (`useSyncExternalStore`) so the top bar, map and cards all stay in sync without a state library.
- **Unlocking:** the current island is the first one without a badge. Everything up to it is open, and everything after it is locked.
- **Quiz rounds** are weighted so answers aren't mostly "normal damage". Per-type challenges only ask questions involving that type.
- **Sound effects** are built from oscillators at runtime. Browsers only allow audio after a user gesture, so the very first click is silent.

## Customizing

- **Change the unlock order:** edit the `ORDER` array in `src/data/route.js`.
- **Change the pass mark or challenge length:** see `PASS_MARK` and `CHALLENGE_LENGTH` at the top of `src/components/TypeCard.js`.
- **Retheme:** colors, radii and fonts are CSS variables at the top of `src/app/globals.css`.
- **Change the mascots:** each type's example Pokémon is set in `src/data/types.js` (`mascot` is its National Pokédex number).

## Credits and disclaimer

This is an unofficial fan project, made for learning. Pokémon and Pokémon character names are trademarks of Nintendo, Game Freak and The Pokémon Company. This project is not affiliated with or endorsed by them.

Pokémon artwork is loaded at runtime from the community-run [PokéAPI sprites](https://github.com/PokeAPI/sprites) repository. If it can't be reached, the app falls back to type emoji.

Fonts are [Bricolage Grotesque](https://fonts.google.com/specimen/Bricolage+Grotesque) and [Silkscreen](https://fonts.google.com/specimen/Silkscreen), loaded through `next/font`.
