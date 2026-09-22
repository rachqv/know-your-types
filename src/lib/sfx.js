// Tiny synthesized sound effects (Web Audio), so there are no audio files to load.

const STORAGE_KEY = "kyt-muted";

let audio = null;
let muted = null; // null until first read from localStorage
const listeners = new Set();

export function subscribeMuted(cb) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function getMuted() {
  if (muted === null) {
    try {
      muted = localStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      muted = false;
    }
  }
  return muted;
}

export function setMuted(value) {
  muted = value;
  try {
    localStorage.setItem(STORAGE_KEY, value ? "1" : "0");
  } catch {}
  listeners.forEach((cb) => cb());
}

function context() {
  if (getMuted()) return null;
  if (!audio) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;
    audio = new AudioCtx();
  }
  if (audio.state === "suspended") audio.resume();
  return audio;
}

function tone({ freq, to, dur = 0.12, type = "sine", gain = 0.14, delay = 0 }) {
  const a = context();
  if (!a) return;
  const t = a.currentTime + delay;
  const osc = a.createOscillator();
  const amp = a.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (to) osc.frequency.exponentialRampToValueAtTime(to, t + dur);
  amp.gain.setValueAtTime(0.0001, t);
  amp.gain.exponentialRampToValueAtTime(gain, t + 0.01);
  amp.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(amp).connect(a.destination);
  osc.start(t);
  osc.stop(t + dur + 0.03);
}

const SCALE = [1, 9 / 8, 5 / 4, 3 / 2, 5 / 3, 2]; // major pentatonic-ish, always sounds happy

export const sfx = {
  /** Bubbly "pop" for any click, with a little random pitch so it never gets dull. */
  pop() {
    const f = 420 + Math.random() * 260;
    tone({ freq: f, to: f * 1.9, dur: 0.09, type: "triangle", gain: 0.16 });
  },

  /** A musical note per type chip, so picking types feels like playing a xylophone. */
  note(i) {
    const f = 220 * SCALE[i % SCALE.length] * 2 ** Math.floor(i / SCALE.length);
    tone({ freq: f * 2, dur: 0.28, type: "sine", gain: 0.18 });
    tone({ freq: f * 4, dur: 0.12, type: "triangle", gain: 0.05 });
  },

  correct() {
    [523.25, 659.25, 783.99].forEach((freq, i) =>
      tone({ freq, dur: 0.18, type: "triangle", gain: 0.16, delay: i * 0.07 }),
    );
  },

  /** A Poké Ball opening as your Pokémon is sent out. */
  send() {
    tone({ freq: 500, to: 900, dur: 0.09, type: "triangle", gain: 0.14 });
    tone({ freq: 900, to: 1400, dur: 0.12, type: "sine", gain: 0.1, delay: 0.08 });
  },

  /** The sound of a hit: punchy for super effective, soft for resisted, hollow for immune. */
  hit(mult) {
    if (mult === 0) {
      tone({ freq: 160, to: 90, dur: 0.22, type: "sine", gain: 0.1 });
    } else if (mult < 1) {
      tone({ freq: 240, to: 190, dur: 0.12, type: "triangle", gain: 0.1 });
    } else if (mult === 1) {
      tone({ freq: 320, to: 120, dur: 0.14, type: "square", gain: 0.08 });
    } else {
      tone({ freq: 420, to: 100, dur: 0.18, type: "sawtooth", gain: 0.11 });
      tone({ freq: 1000, to: 300, dur: 0.1, type: "square", gain: 0.06, delay: 0.03 });
    }
  },

  /** Two dull thuds: "nope, that one's locked". */
  locked() {
    tone({ freq: 190, to: 140, dur: 0.1, type: "square", gain: 0.06 });
    tone({ freq: 190, to: 140, dur: 0.1, type: "square", gain: 0.06, delay: 0.12 });
  },

  wrong() {
    tone({ freq: 300, to: 120, dur: 0.32, type: "sawtooth", gain: 0.08 });
  },

  levelUp() {
    [392, 523.25, 659.25, 783.99].forEach((freq, i) =>
      tone({ freq, dur: 0.16, type: "triangle", gain: 0.13, delay: i * 0.08 }),
    );
    tone({ freq: 1046.5, dur: 0.4, type: "sine", gain: 0.1, delay: 0.34 });
  },

  fanfare() {
    [523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5].forEach((freq, i) =>
      tone({ freq, dur: 0.22, type: "triangle", gain: 0.16, delay: i * 0.1 }),
    );
  },
};
