import { useEffect, useRef } from 'react';
import type { Mood } from '../mood-recognition';

type Point = {
  x: number;
  y: number;
  t: number;
  speed: number;
};

type Pulse = {
  x: number;
  y: number;
  t: number;
  disabled: boolean;
};

type KinematicCanvasProps = {
  mood: Mood | null;
  reaction: number;
};

const MOOD_RGB: Record<string, [number, number, number]> = {
  neutral: [228, 228, 231],
  frustrated: [244, 63, 94],
  confused: [245, 158, 11],
  lost: [56, 189, 248],
  away: [82, 82, 91],
};

export function KinematicCanvas({ mood, reaction }: KinematicCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const moodRef = useRef<{ mood: Mood | null; reaction: number }>({ mood, reaction });
  moodRef.current = { mood, reaction };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const points: Point[] = [];
    const pulses: Pulse[] = [];
    const TRAIL_MS = 2200;
    const PULSE_MS = 900;
    let rafId = 0;

    const isIgnored = (target: EventTarget | null) =>
      target instanceof Element && target.closest('[data-mood-ignore]') !== null;

    const onMove = (e: PointerEvent) => {
      if (isIgnored(e.target)) return;
      const now = performance.now();
      const nx = Math.max(0, Math.min(1, e.clientX / Math.max(1, window.innerWidth)));
      const ny = Math.max(0, Math.min(1, e.clientY / Math.max(1, window.innerHeight)));
      const prev = points[points.length - 1];
      let speed = 0;
      if (prev) {
        const dt = Math.max(4, now - prev.t);
        const dx = (nx - prev.x) * window.innerWidth;
        const dy = (ny - prev.y) * window.innerHeight;
        speed = Math.hypot(dx, dy) / (dt / 1000);
      }
      points.push({ x: nx, y: ny, t: now, speed });
      if (points.length > 220) points.shift();
    };

    const onDown = (e: PointerEvent) => {
      if (isIgnored(e.target)) return;
      const now = performance.now();
      const nx = Math.max(0, Math.min(1, e.clientX / Math.max(1, window.innerWidth)));
      const ny = Math.max(0, Math.min(1, e.clientY / Math.max(1, window.innerHeight)));
      const stack = document.elementsFromPoint(e.clientX, e.clientY);
      const disabled = stack.some((el) => el.matches(':disabled, [aria-disabled="true"]'));
      pulses.push({ x: nx, y: ny, t: now, disabled });
      if (pulses.length > 24) pulses.shift();
    };

    window.addEventListener('pointermove', onMove, { passive: true, capture: true });
    window.addEventListener('pointerdown', onDown, { passive: true, capture: true });

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const draw = () => {
      const now = performance.now();
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;

      while (points.length > 0 && now - points[0].t > TRAIL_MS) points.shift();
      while (pulses.length > 0 && now - pulses[0].t > PULSE_MS) pulses.shift();

      ctx.clearRect(0, 0, w, h);

      // Clinical dark reticle grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.045)';
      ctx.lineWidth = 1;
      const cols = 8;
      const rows = 4;
      for (let i = 1; i < cols; i++) {
        const gx = Math.round((w / cols) * i) + 0.5;
        ctx.beginPath();
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, h);
        ctx.stroke();
      }
      for (let j = 1; j < rows; j++) {
        const gy = Math.round((h / rows) * j) + 0.5;
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(w, gy);
        ctx.stroke();
      }

      // Center precision crosshair
      const cx = Math.round(w / 2) + 0.5;
      const cy = Math.round(h / 2) + 0.5;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.beginPath();
      ctx.moveTo(cx - 5, cy);
      ctx.lineTo(cx + 5, cy);
      ctx.moveTo(cx, cy - 5);
      ctx.lineTo(cx, cy + 5);
      ctx.stroke();

      const activeKey = moodRef.current.mood ?? 'neutral';
      const [r, g, b] = MOOD_RGB[activeKey] ?? MOOD_RGB.neutral;
      const reactAmt = moodRef.current.reaction;

      if (reactAmt > 0.02) {
        const grad = ctx.createRadialGradient(w * 0.5, h * 0.5, 2, w * 0.5, h * 0.5, w * 0.65);
        grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${(0.11 * reactAmt).toFixed(3)})`);
        grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
      }

      // Vector trace
      if (points.length > 1) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        for (let i = 1; i < points.length; i++) {
          const p0 = points[i - 1];
          const p1 = points[i];
          const age = 1 - (now - p1.t) / TRAIL_MS;
          if (age <= 0) continue;
          const speedNorm = Math.min(1, p1.speed / 1800);
          ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${(age * (0.28 + speedNorm * 0.7)).toFixed(3)})`;
          ctx.lineWidth = 1 + age * (0.9 + speedNorm * 1.3);
          ctx.beginPath();
          ctx.moveTo(p0.x * w, p0.y * h);
          ctx.lineTo(p1.x * w, p1.y * h);
          ctx.stroke();
        }
        const tip = points[points.length - 1];
        const tipAge = Math.max(0, 1 - (now - tip.t) / TRAIL_MS);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${(0.95 * tipAge).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(tip.x * w, tip.y * h, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Press target rings
      for (const p of pulses) {
        const prog = (now - p.t) / PULSE_MS;
        if (prog >= 1) continue;
        const alpha = (1 - prog) * 0.85;
        const rad = 3 + prog * (p.disabled ? 18 : 11);
        const px = p.x * w;
        const py = p.y * h;
        ctx.strokeStyle = p.disabled
          ? `rgba(244, 63, 94, ${alpha.toFixed(3)})`
          : `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(3)})`;
        ctx.lineWidth = p.disabled ? 1.5 : 1;
        ctx.beginPath();
        ctx.arc(px, py, rad, 0, Math.PI * 2);
        ctx.stroke();
      }

      rafId = requestAnimationFrame(draw);
    };

    rafId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      window.removeEventListener('pointermove', onMove, { capture: true });
      window.removeEventListener('pointerdown', onDown, { capture: true });
    };
  }, []);

  return <canvas ref={canvasRef} className="block h-full w-full" aria-hidden="true" />;
}
