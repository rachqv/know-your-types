import { useSyncExternalStore } from "react";

// Player progress, saved in localStorage.
//  visited: types whose island the player has opened
//  badges:  types whose challenge the player has passed

const STORAGE_KEY = "kyt-progress-v1";
const EMPTY = Object.freeze({ visited: [], badges: [], xp: 0 });
const LEVEL_TITLES = ["Rookie", "Explorer", "Trainer", "Ace", "Champion", "Master"];

let state = null;
const listeners = new Set();

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved) {
      return { visited: saved.visited ?? [], badges: saved.badges ?? [], xp: saved.xp ?? 0 };
    }
  } catch {}
  return EMPTY;
}

function getSnapshot() {
  if (state === null) state = load();
  return state;
}

function subscribe(cb) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function commit(next) {
  state = next;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {}
  listeners.forEach((cb) => cb());
}

export const progress = {
  /** Marks a type as explored (+10 XP the first time). */
  visit(id) {
    const s = getSnapshot();
    if (s.visited.includes(id)) return;
    commit({ ...s, visited: [...s.visited, id], xp: s.xp + 10 });
  },

  /** Awards a type's badge (+50 XP the first time). */
  earnBadge(id) {
    const s = getSnapshot();
    if (s.badges.includes(id)) return;
    commit({
      ...s,
      visited: s.visited.includes(id) ? s.visited : [...s.visited, id],
      badges: [...s.badges, id],
      xp: s.xp + 50,
    });
  },

  addXp(amount) {
    const s = getSnapshot();
    commit({ ...s, xp: s.xp + amount });
  },

  reset() {
    commit(EMPTY);
  },
};

export function useProgress() {
  return useSyncExternalStore(subscribe, getSnapshot, () => EMPTY);
}

export function levelInfo(xp) {
  const level = Math.floor(xp / 100) + 1;
  return {
    level,
    title: LEVEL_TITLES[Math.min(level - 1, LEVEL_TITLES.length - 1)],
    into: xp % 100,
  };
}
