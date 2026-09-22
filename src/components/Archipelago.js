import styles from "./Archipelago.module.css";

// Decorative outlying islands behind the map. x/y are percentages of the map area, w is the
// width in px (scaled down on small screens). Purely scenery: they're not interactive.
const SHAPES = [
  ["58% 42% 55% 45% / 52% 58% 42% 48%", "46% 54% 60% 40% / 44% 50% 50% 56%"],
  ["44% 56% 42% 58% / 56% 44% 56% 44%", "60% 40% 50% 50% / 48% 56% 44% 52%"],
  ["52% 48% 62% 38% / 42% 56% 44% 58%", "40% 60% 46% 54% / 58% 42% 58% 42%"],
];

const ISLANDS = [
  // west side
  { x: 8, y: 5, w: 190, kind: "grass", shape: 0, decor: [{ e: "🌴", x: 34, y: 34, s: 2.4 }, { e: "🌴", x: 62, y: 46, s: 1.9 }] },
  { x: 5, y: 17, w: 110, kind: "sand", shape: 1, decor: [{ e: "⛱️", x: 50, y: 42, s: 1.8 }] },
  { x: 12, y: 30, w: 230, kind: "grass", shape: 2, decor: [{ e: "🌲", x: 30, y: 38, s: 2.3 }, { e: "⛰️", x: 55, y: 32, s: 3 }, { e: "🌲", x: 72, y: 50, s: 2 }] },
  { x: 4, y: 44, w: 130, kind: "rock", shape: 0, decor: [{ e: "🪨", x: 40, y: 42, s: 2.2 }, { e: "🪨", x: 65, y: 55, s: 1.5 }] },
  { x: 11, y: 57, w: 210, kind: "volcano", shape: 1, decor: [{ e: "🌋", x: 50, y: 34, s: 3.6 }] },
  { x: 5, y: 71, w: 140, kind: "sand", shape: 2, decor: [{ e: "🌴", x: 48, y: 36, s: 2.4 }] },
  { x: 12, y: 86, w: 220, kind: "grass", shape: 0, decor: [{ e: "🌳", x: 32, y: 38, s: 2.3 }, { e: "⛺", x: 56, y: 46, s: 1.7 }, { e: "🌳", x: 70, y: 36, s: 2 }] },

  // east side
  { x: 92, y: 10, w: 200, kind: "grass", shape: 1, decor: [{ e: "🌴", x: 36, y: 36, s: 2.4 }, { e: "⛺", x: 58, y: 48, s: 1.7 }, { e: "🌴", x: 70, y: 34, s: 2 }] },
  { x: 95, y: 24, w: 110, kind: "sand", shape: 0, decor: [{ e: "⛱️", x: 50, y: 42, s: 1.7 }] },
  { x: 94, y: 38, w: 210, kind: "rock", shape: 2, decor: [{ e: "⛰️", x: 42, y: 34, s: 3.2 }, { e: "🪨", x: 68, y: 52, s: 1.8 }] },
  { x: 90, y: 54, w: 150, kind: "grass", shape: 1, decor: [{ e: "🌳", x: 38, y: 40, s: 2.2 }, { e: "🌳", x: 62, y: 46, s: 1.8 }] },
  { x: 95, y: 68, w: 190, kind: "sand", shape: 2, decor: [{ e: "🌴", x: 36, y: 38, s: 2.3 }, { e: "🌴", x: 62, y: 44, s: 2 }] },
  { x: 91, y: 82, w: 130, kind: "rock", shape: 0, decor: [{ e: "🪨", x: 48, y: 42, s: 2.2 }] },
  { x: 94, y: 94, w: 200, kind: "volcano", shape: 1, decor: [{ e: "🌋", x: 50, y: 34, s: 3.4 }] },
];

export default function Archipelago() {
  return (
    <div className={styles.archipelago} aria-hidden="true">
      {ISLANDS.map((isle, i) => {
        const [foam, land] = SHAPES[isle.shape];
        return (
          <span
            key={i}
            className={styles.isle}
            data-kind={isle.kind}
            style={{
              left: `${isle.x}%`,
              top: `${isle.y}%`,
              "--w": isle.w,
              "--foam-shape": foam,
              "--land-shape": land,
              "--i": i,
            }}
          >
            <span className={styles.foam} />
            <span className={styles.land} />
            {isle.decor.map((d, j) => (
              <span key={j} className={styles.decor} style={{ left: `${d.x}%`, top: `${d.y}%`, "--s": d.s }}>
                {d.e}
              </span>
            ))}
          </span>
        );
      })}
    </div>
  );
}
