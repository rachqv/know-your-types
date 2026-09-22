"use client";

import { useEffect, useRef } from "react";
import { TYPES } from "@/data/types";
import { sfx } from "@/lib/sfx";
import styles from "./FunEffects.module.css";

const EMOJI = TYPES.map((t) => t.emoji);
const EMOJI_FONT = '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif';
const pick = (list) => list[Math.floor(Math.random() * list.length)];
const rand = (min, max) => min + Math.random() * (max - min);

// A tiny type-emoji puff on press, an emoji shower for big moments, and a "pop" sound on clickable things.
export default function FunEffects() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let particles = [];
    let raf = 0;
    let lastFrame = 0;
    let lastEmoji = "";

    // a random type emoji, never the same one twice in a row
    function nextEmoji() {
      let e;
      do {
        e = pick(EMOJI);
      } while (e === lastEmoji);
      lastEmoji = e;
      return e;
    }

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function frame(now) {
      const dt = Math.min((now - lastFrame) / 1000, 0.05);
      lastFrame = now;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      particles = particles.filter((p) => (p.age += dt) < p.life);
      for (const p of particles) {
        p.vy += p.gravity * dt;
        p.x += p.vx * dt + Math.sin(p.age * p.wobble) * p.sway * dt;
        p.y += p.vy * dt;
        p.rot += p.spin * dt;
        const t = p.age / p.life;
        // pop in with a little overshoot, hold at full size, then shrink away at the end
        const scale =
          t < 0.15 ? Math.sin((t / 0.15) * (Math.PI / 2)) * 1.15 : t < 0.6 ? 1 : 1 - ((t - 0.6) / 0.4) ** 2;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.globalAlpha = Math.max(0, Math.min(1, scale * 1.5)) * p.opacity;
        ctx.font = `${Math.max(1, p.size * scale)}px ${EMOJI_FONT}`;
        ctx.fillText(p.emoji, 0, 0);
        ctx.restore();
      }

      raf = particles.length ? requestAnimationFrame(frame) : 0;
    }

    function add(p) {
      particles.push({
        age: 0,
        rot: rand(-0.4, 0.4),
        spin: rand(-1.2, 1.2),
        wobble: rand(6, 10),
        sway: 0,
        opacity: 1,
        emoji: nextEmoji(),
        ...p,
      });
      if (!raf) {
        lastFrame = performance.now();
        raf = requestAnimationFrame(frame);
      }
    }

    function onDown(e) {
      // a tiny puff, not a firework
      const count = 4;
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2 + rand(-0.4, 0.4);
        const speed = rand(50, 90);
        add({
          x: e.clientX,
          y: e.clientY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 20,
          gravity: 120,
          spin: 0,
          rot: 0,
          life: 0.55,
          size: 15,
          opacity: 0.8,
        });
      }
    }

    function onClick(e) {
      const el = e.target.closest?.("button, a, [role=tab], td");
      if (!el || el.closest('[data-sfx="none"]')) return;
      sfx.pop();
    }

    // screen-wide emoji shower for big moments (badges, great scores)
    function onCelebrate() {
      for (let i = 0; i < 24; i++) {
        add({
          x: rand(0, window.innerWidth),
          y: rand(-50, -10),
          vx: 0,
          vy: rand(60, 140),
          gravity: 40,
          sway: rand(10, 30),
          spin: rand(-1, 1),
          life: rand(1.8, 2.6),
          size: rand(18, 26),
          opacity: 0.85,
        });
      }
    }

    resize();
    window.addEventListener("resize", resize);
    document.addEventListener("click", onClick);
    if (!reduceMotion) {
      window.addEventListener("pointerdown", onDown, { passive: true });
      window.addEventListener("kyt:celebrate", onCelebrate);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("click", onClick);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("kyt:celebrate", onCelebrate);
    };
  }, []);

  return <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />;
}
