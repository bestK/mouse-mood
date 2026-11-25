import { useEffect, useRef } from 'react';
import { useMood, type Mood } from '@/mood-recognition';

type CursorHudProps = {
  enabled: boolean;
};

type Vec2 = { x: number; y: number };
type RectBox = { x: number; y: number; w: number; h: number };
type OrbitSpot = { angle: number; offset: number; w: number; h: number };
type ScanUnit = { from: OrbitSpot; to: OrbitSpot; dir: number; start: number; dur: number; next: number };
type DustNode = { x: number; y: number; w: number; h: number; vx: number; vy: number; born: number; life: number };
type PressMark = { x: number; y: number; t: number; blocked: boolean };
type WaveSpark = { angle: number; r0: number; r1: number; delay: number; size: number; curve: number };
type ClickWave = { x: number; y: number; born: number; sparks: WaveSpark[] };

const SVG_NS = 'http://www.w3.org/2000/svg';
const PRESS_WINDOW_MS = 8000;
const KICK_MS = 220;
const WAVE_MS = 520;
const WAVE_LIMIT = 5;
const DUST_LIMIT = 12;

const SIGNAL_HEX: Record<Mood, string> = {
  frustrated: '#f43f5e',
  confused: '#f59e0b',
  lost: '#38bdf8',
  away: '#71717a',
};

const MOOD_TAG: Record<Mood | 'neutral', string> = {
  neutral: 'NEUTRAL',
  frustrated: 'FRUSTRATED',
  confused: 'CONFUSED',
  lost: 'LOST',
  away: 'AWAY',
};

const HUD_CSS = `
  :host {
    position: fixed;
    inset: 0;
    z-index: 60;
    pointer-events: none;
    contain: layout style paint;
  }
  .hud-wrap {
    --ink: #f4f4f5;
    --accent: #f4f4f5;
    --halo: rgba(9, 9, 11, 0.92);
    --paper: #09090b;
    position: fixed;
    inset: 0;
    overflow: hidden;
    pointer-events: none;
    color: var(--ink);
    font: 500 9.5px/12px 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    letter-spacing: 0.055em;
    text-transform: uppercase;
    opacity: 0;
    transition: opacity 150ms ease-out;
  }
  .hud-wrap.is-visible {
    opacity: 1;
  }
  .hud-svg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    overflow: visible;
  }
  .halo {
    fill: none;
    stroke: var(--halo);
    stroke-width: 2.5;
    stroke-linejoin: round;
  }
  .ink {
    fill: none;
    stroke: var(--ink);
    stroke-width: 1;
    stroke-linejoin: round;
    transition: stroke 180ms ease-out;
  }
  .layer-reticle { opacity: 0.56; }
  .layer-scan .ink,
  .layer-dust .ink { stroke-width: 0.75; }
  .layer-scan,
  .scan-dots { opacity: 0.8; }
  .scan-dots { fill: var(--ink); }
  .tie .ink { stroke-width: 0.5; }
  .tie .halo { stroke-width: 1.5; }
  .layer-press { opacity: 0.6; }
  .press-blocked { fill: #f43f5e; }
  .layer-wave .halo { stroke-width: 1.5; }
  .layer-wave .ink { fill: var(--ink); stroke: none; }

  .hud-card {
    position: absolute;
    top: 0;
    left: 0;
    display: grid;
    gap: 2px;
    white-space: nowrap;
    text-shadow: 0 0 3px var(--halo), 0 0 6px var(--halo);
    will-change: transform;
  }
  .hud-pill {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    width: max-content;
    margin-left: -3px;
    padding: 1.5px 6px 1.5px 5px;
    font-size: 11px;
    line-height: 14px;
    font-weight: 600;
    background: var(--ink);
    color: var(--paper);
    text-shadow: none;
    font-variant-numeric: tabular-nums;
  }
  .hud-square {
    width: 6px;
    height: 6px;
    border: 1px solid currentColor;
    box-sizing: border-box;
    transition: background-color 180ms ease-out, border-color 180ms ease-out;
  }
  .hud-card.is-mood .hud-square {
    background: var(--accent);
    border-color: var(--accent);
  }
  .hud-coords {
    opacity: 0.56;
    font-variant-numeric: tabular-nums;
  }
  .hud-metrics {
    display: flex;
    gap: 6px;
    font-variant-numeric: tabular-nums;
  }
  .hud-metrics span {
    display: inline-flex;
    gap: 1.5px;
  }
  .hud-metrics b {
    font-weight: 500;
    opacity: 0.45;
  }
  .hud-metrics em {
    font-style: normal;
    opacity: 0.58;
  }
  .hud-metrics em.hot {
    opacity: 1;
    color: var(--ink);
  }
  .hud-target {
    color: var(--accent);
    opacity: 0.95;
  }
  .hud-target[hidden] {
    display: none;
  }
  .hud-card.is-glitch .hud-pill {
    animation: hud-glitch 280ms steps(1) both;
  }
  @keyframes hud-glitch {
    0%   { clip-path: inset(0 0 58% 0); transform: translateX(-3px); }
    25%  { clip-path: inset(44% 0 12% 0); transform: translateX(2px); }
    50%  { clip-path: inset(68% 0 0 0); transform: translateX(-1px); }
    75%  { clip-path: inset(12% 0 46% 0); transform: translateX(2px); }
    100% { clip-path: inset(0); transform: none; }
  }
`;

class AdaptiveFilter {
  private prev: number | null = null;
  private deriv = 0;

  constructor(
    private minCutoff: number,
    private beta: number,
    private dCutoff = 1,
  ) {}

  private static alpha(cutoff: number, dt: number): number {
    const tau = 1 / (2 * Math.PI * cutoff);
    return 1 / (1 + tau / dt);
  }

  reset(): void {
    this.prev = null;
    this.deriv = 0;
  }

  next(value: number, dt: number): number {
    if (this.prev === null || dt <= 0) {
      if (this.prev === null) this.prev = value;
      return this.prev;
    }
    const rawD = (value - this.prev) / dt;
    this.deriv += AdaptiveFilter.alpha(this.dCutoff, dt) * (rawD - this.deriv);
    const cutoff = this.minCutoff + this.beta * Math.abs(this.deriv);
    this.prev += AdaptiveFilter.alpha(cutoff, dt) * (value - this.prev);
    return this.prev;
  }
}

const r1 = (n: number) => Math.round(n * 10) / 10;
const randRange = (a: number, b: number) => a + Math.random() * (b - a);
const easeCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const fmtProb = (v: number) => Math.min(0.99, Math.max(0, v)).toFixed(2).replace(/^0/, '');

function makeDualLayer(parent: SVGElement, cls: string) {
  const g = document.createElementNS(SVG_NS, 'g');
  g.setAttribute('class', cls);
  const halo = document.createElementNS(SVG_NS, 'path');
  halo.setAttribute('class', 'halo');
  const ink = document.createElementNS(SVG_NS, 'path');
  ink.setAttribute('class', 'ink');
  g.append(halo, ink);
  parent.append(g);
  return { g, halo, ink };
}

function setPath(layer: { halo: SVGPathElement; ink: SVGPathElement }, d: string) {
  layer.halo.setAttribute('d', d);
  layer.ink.setAttribute('d', d);
}

function cornersPath(b: RectBox, arm: number): string {
  const a = Math.min(arm, b.w / 2, b.h / 2);
  const x0 = r1(b.x);
  const y0 = r1(b.y);
  const x1 = r1(b.x + b.w);
  const y1 = r1(b.y + b.h);
  return (
    `M${x0} ${r1(y0 + a)}V${y0}H${r1(x0 + a)}` +
    `M${r1(x1 - a)} ${y0}H${x1}V${r1(y0 + a)}` +
    `M${x1} ${r1(y1 - a)}V${y1}H${r1(x1 - a)}` +
    `M${r1(x0 + a)} ${y1}H${x0}V${r1(y1 - a)}`
  );
}

function squarePath(x: number, y: number, w: number, h: number): string {
  return `M${r1(x)} ${r1(y)}h${r1(w)}v${r1(h)}h${r1(-w)}Z`;
}

function projectSquare(angle: number, halfSide: number): Vec2 {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  const m = Math.max(Math.abs(c), Math.abs(s));
  return { x: (c / m) * halfSide, y: (s / m) * halfSide };
}

function inspectElementTag(x: number, y: number): string | null {
  const stack = document.elementsFromPoint(x, y).filter((el) => !el.closest('[data-mood-ignore]'));
  const disabled = stack.find((el) => el.matches(':disabled, [aria-disabled="true"]'));
  if (disabled) return `${disabled.tagName}:DISABLED`;
  const invalid = stack.find((el) => el.getAttribute('aria-invalid') === 'true');
  if (invalid) return `${invalid.tagName}:INVALID`;
  const top = stack[0];
  const interactive = top?.closest('button, input, summary, a[href], [role="checkbox"], [role="switch"]');
  if (interactive) return interactive.tagName;
  return null;
}

export function CursorHud({ enabled }: CursorHudProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const reading = useMood();
  const readingRef = useRef(reading);
  readingRef.current = reading;

  useEffect(() => {
    const host = hostRef.current;
    if (!host || !enabled) return;

    const shadow = host.shadowRoot ?? host.attachShadow({ mode: 'open' });
    shadow.innerHTML = '';

    const style = document.createElement('style');
    style.textContent = HUD_CSS;

    const wrap = document.createElement('div');
    wrap.className = 'hud-wrap';

    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('class', 'hud-svg');

    const pressLayer = makeDualLayer(svg, 'layer-press');
    const pressBlocked = document.createElementNS(SVG_NS, 'path');
    pressBlocked.setAttribute('class', 'press-blocked');
    svg.append(pressBlocked);

    const waveSlots = Array.from({ length: WAVE_LIMIT }, () => {
      const l = makeDualLayer(svg, 'layer-wave');
      l.g.style.display = 'none';
      return l;
    });

    const dustGroup = document.createElementNS(SVG_NS, 'g');
    dustGroup.setAttribute('class', 'layer-dust');
    const dustSlots = Array.from({ length: DUST_LIMIT }, () => {
      const g = document.createElementNS(SVG_NS, 'g');
      const tie = makeDualLayer(g, 'tie');
      const halo = document.createElementNS(SVG_NS, 'rect');
      halo.setAttribute('class', 'halo');
      const ink = document.createElementNS(SVG_NS, 'rect');
      ink.setAttribute('class', 'ink');
      g.append(halo, ink);
      g.style.display = 'none';
      dustGroup.append(g);
      return { g, tie, halo, ink };
    });
    svg.append(dustGroup);

    const scanLayer = makeDualLayer(svg, 'layer-scan');
    const scanDots = document.createElementNS(SVG_NS, 'path');
    scanDots.setAttribute('class', 'scan-dots');
    svg.append(scanDots);

    const reticleLayer = makeDualLayer(svg, 'layer-reticle');
    const leaderLayer = makeDualLayer(svg, 'layer-leader');

    const card = document.createElement('div');
    card.className = 'hud-card';
    card.innerHTML = `
      <div class="hud-pill"><i class="hud-square"></i><span class="hud-title">NEUTRAL-0.00</span></div>
      <div class="hud-coords">X.000 Y.000</div>
      <div class="hud-metrics">
        <span><b>L</b><em>.00</em></span>
        <span><b>C</b><em>.00</em></span>
        <span><b>A</b><em>.00</em></span>
        <span><b>F</b><em>.00</em></span>
        <span><b>I</b><em>.00</em></span>
      </div>
      <div class="hud-target" hidden></div>
    `;

    const titleEl = card.querySelector<HTMLElement>('.hud-title')!;
    const coordsEl = card.querySelector<HTMLElement>('.hud-coords')!;
    const metricEls = Array.from(card.querySelectorAll<HTMLElement>('.hud-metrics em'));
    const targetEl = card.querySelector<HTMLElement>('.hud-target')!;

    wrap.append(svg, card);
    shadow.append(style, wrap);

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const filterX = new AdaptiveFilter(3, 0.02);
    const filterY = new AdaptiveFilter(3, 0.02);

    let rawX = -100;
    let rawY = -100;
    let fx = -100;
    let fy = -100;
    let visible = false;
    let lastTime = -1;
    let lastPressTime = -1000;
    let placeRight = true;
    let placeAbove = true;
    let wasAlert = false;
    let dustPrevX = 0;
    let dustPrevY = 0;
    let dustDist = 0;
    let dustSeeded = false;

    const presses: PressMark[] = [];
    const waves: ClickWave[] = [];
    const dustNodes: (DustNode | null)[] = Array.from({ length: DUST_LIMIT }, () => null);
    const scans: ScanUnit[] = [];

    const makeOrbitSpot = (angle: number, heat: number): OrbitSpot => ({
      angle,
      offset: randRange(6, 15 - heat * 6),
      w: randRange(5, 8.5),
      h: randRange(5, 8.5),
    });

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') {
        visible = false;
        return;
      }
      rawX = e.clientX;
      rawY = e.clientY;
      visible = true;
    };

    const onPointerLeave = () => {
      visible = false;
      filterX.reset();
      filterY.reset();
      dustSeeded = false;
    };

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      rawX = e.clientX;
      rawY = e.clientY;
      visible = true;
      const now = performance.now();
      lastPressTime = now;

      const target = e.target instanceof Element ? e.target : null;
      if (target && target.closest('[data-mood-ignore]')) return;

      const stack = document.elementsFromPoint(e.clientX, e.clientY);
      const blocked = stack.some((el) => el.matches(':disabled, [aria-disabled="true"]'));
      presses.push({ x: e.clientX, y: e.clientY, t: now, blocked });
      if (presses.length > 28) presses.shift();

      if (!reducedMotion.matches) {
        const sparks: WaveSpark[] = Array.from({ length: 7 }, (_, i) => ({
          angle: (i / 7) * Math.PI * 2 + randRange(-0.25, 0.25),
          r0: randRange(8, 13),
          r1: randRange(24, 38),
          delay: randRange(0, 75),
          size: randRange(1.6, 2.8),
          curve: randRange(-0.18, 0.18),
        }));
        waves.push({ x: e.clientX, y: e.clientY, born: now, sparks });
        if (waves.length > WAVE_LIMIT) waves.shift();
      }
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true, capture: true });
    window.addEventListener('pointerdown', onPointerDown, { passive: true, capture: true });
    document.documentElement.addEventListener('pointerleave', onPointerLeave);

    let rafId = 0;

    const tick = (now: number) => {
      const dt = lastTime < 0 ? 0.016 : Math.min(0.1, (now - lastTime) / 1000);
      lastTime = now;

      const r = readingRef.current;
      const isAway = r.mood === 'away';
      const show = visible && !isAway;
      wrap.classList.toggle('is-visible', show);

      if (!show) {
        rafId = requestAnimationFrame(tick);
        return;
      }

      fx = filterX.next(rawX, dt);
      fy = filterY.next(rawY, dt);

      const heat = Math.max(r.reaction, r.score);
      const mood = r.mood;
      const accent = mood ? SIGNAL_HEX[mood] : '#f4f4f5';
      wrap.style.setProperty('--accent', accent);

      // Click kick expansion
      const kickElapsed = now - lastPressTime;
      const kick = kickElapsed >= 0 && kickElapsed < KICK_MS
        ? Math.sin((kickElapsed / KICK_MS) * Math.PI) * 8
        : 0;

      // Reticle brackets tighten as score increases
      const size = Math.max(20, 32 - heat * 11) + kick;
      const half = size / 2;
      const rb: RectBox = { x: fx - half, y: fy - half, w: size, h: size };
      setPath(reticleLayer, cornersPath(rb, Math.max(4.5, size * 0.24)));

      // Edge-aware side flipping for readout label
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const labelW = 166;
      const labelH = 54;
      if (placeRight && fx + half + 26 + labelW > vw - 10) placeRight = false;
      else if (!placeRight && fx - half - 26 - labelW < 10) placeRight = true;
      if (placeAbove && fy - half - 18 - labelH < 8) placeAbove = false;
      else if (!placeAbove && fy + half + 18 + labelH > vh - 8) placeAbove = true;

      // Leader line from reticle corner
      const sx = placeRight ? rb.x + rb.w : rb.x;
      const sy = placeAbove ? rb.y : rb.y + rb.h;
      const ex = sx + (placeRight ? 14 : -14);
      const ey = sy + (placeAbove ? -14 : 14);
      const hx = ex + (placeRight ? 10 : -10);
      setPath(leaderLayer, `M${r1(sx)} ${r1(sy)}L${r1(ex)} ${r1(ey)}H${r1(hx)}`);

      const cardX = placeRight ? hx + 4 : hx - 4 - labelW;
      const cardY = placeAbove ? ey - 24 : ey - 4;
      card.style.transform = `translate3d(${r1(cardX)}px, ${r1(cardY)}px, 0)`;

      // Readout text
      const moodTag = mood ? MOOD_TAG[mood] : MOOD_TAG.neutral;
      titleEl.textContent = `${moodTag}-${r.score.toFixed(2)}`;
      card.classList.toggle('is-mood', mood !== null);

      const isAlert = r.score >= 0.65 && mood !== null;
      if (isAlert && !wasAlert && !reducedMotion.matches) {
        card.classList.remove('is-glitch');
        void card.offsetWidth;
        card.classList.add('is-glitch');
      }
      wasAlert = isAlert;

      coordsEl.textContent = `X.${String(Math.round(fx)).padStart(3, '0')} Y.${String(Math.round(fy)).padStart(3, '0')}`;

      const probs = r.probabilities;
      const pLost = probs?.lost ?? 0;
      const pConfused = probs?.confused ?? 0;
      const pAway = isAway ? r.score : 0;
      const pFrustrated = (probs?.frustrated ?? 0) + (probs?.blocked ?? 0);
      const pInstant = r.fast;
      const channels = [pLost, pConfused, pAway, pFrustrated, pInstant];
      for (let i = 0; i < 5; i++) {
        metricEls[i].textContent = fmtProb(channels[i]);
        metricEls[i].classList.toggle('hot', channels[i] >= 0.3);
      }

      if (isAlert) {
        const tag = inspectElementTag(rawX, rawY);
        if (tag) {
          targetEl.textContent = `AT ${tag}`;
          targetEl.hidden = false;
        }
      } else if (r.score < 0.45) {
        targetEl.hidden = true;
      }

      // Dynamic scan boxes & tethered dust motes (skipped if reduced motion)
      if (reducedMotion.matches) {
        setPath(scanLayer, '');
        scanDots.setAttribute('d', '');
        for (const s of dustSlots) s.g.style.display = 'none';
        for (const w of waveSlots) w.g.style.display = 'none';
      } else {
        // 1. Scan boxes orbiting reticle perimeter
        if (scans.length === 0) {
          for (let i = 0; i < 2; i++) {
            const a0 = i * Math.PI + randRange(-0.5, 0.5);
            const s0 = makeOrbitSpot(a0, heat);
            scans.push({ from: s0, to: s0, dir: i ? 1 : -1, start: now, dur: 1, next: now + 180 + i * 240 });
          }
        }
        let scanD = '';
        let dotD = '';
        for (const sc of scans) {
          if (now >= sc.next) {
            sc.from = sc.to;
            const turn = randRange(0.7, 2.2) * (Math.random() < 0.7 ? sc.dir : -sc.dir);
            sc.dir = Math.sign(turn) || 1;
            sc.to = makeOrbitSpot(sc.from.angle + turn, heat);
            sc.start = now;
            sc.dur = randRange(340, 680) * (1 - heat * 0.48);
            sc.next = now + sc.dur + randRange(120, 420) * (1 - heat * 0.55);
          }
          const prog = sc.dur > 0 ? Math.min(1, Math.max(0, (now - sc.start) / sc.dur)) : 1;
          const e = easeCubic(prog);
          const ang = sc.from.angle + (sc.to.angle - sc.from.angle) * e;
          const off = sc.from.offset + (sc.to.offset - sc.from.offset) * e;
          const bw = sc.from.w + (sc.to.w - sc.from.w) * e;
          const bh = sc.from.h + (sc.to.h - sc.from.h) * e;
          const pt = projectSquare(ang, half + off);
          const bx = fx + pt.x - bw / 2;
          const by = fy + pt.y - bh / 2;
          scanD += squarePath(bx, by, bw, bh);
          dotD += squarePath(bx + bw / 2 - 0.75, by + bh / 2 - 0.75, 1.5, 1.5);
        }
        setPath(scanLayer, scanD);
        scanDots.setAttribute('d', dotD);

        // 2. Tethered dust motes dropped along pointer motion
        if (!dustSeeded) {
          dustPrevX = fx;
          dustPrevY = fy;
          dustSeeded = true;
        } else {
          const stepPx = Math.hypot(fx - dustPrevX, fy - dustPrevY);
          if (stepPx < 220) {
            dustDist += stepPx;
            const threshold = 40 - heat * 18;
            if (dustDist >= threshold) {
              dustDist = 0;
              const slotIdx = dustNodes.findIndex((d) => d === null);
              if (slotIdx >= 0) {
                const sz = randRange(4.5, 7.5);
                dustNodes[slotIdx] = {
                  x: fx + randRange(-14, 14) - sz / 2,
                  y: fy + randRange(-14, 14) - sz / 2,
                  w: sz,
                  h: sz,
                  vx: randRange(-14, 14),
                  vy: randRange(-14, 14),
                  born: now,
                  life: randRange(460, 780),
                };
              }
            }
          }
          dustPrevX = fx;
          dustPrevY = fy;
        }

        const corners: Vec2[] = [
          { x: rb.x, y: rb.y },
          { x: rb.x + rb.w, y: rb.y },
          { x: rb.x + rb.w, y: rb.y + rb.h },
          { x: rb.x, y: rb.y + rb.h },
        ];

        for (let i = 0; i < DUST_LIMIT; i++) {
          const node = dustNodes[i];
          const slot = dustSlots[i];
          if (!node) {
            slot.g.style.display = 'none';
            continue;
          }
          const age = (now - node.born) / node.life;
          if (age >= 1) {
            dustNodes[i] = null;
            slot.g.style.display = 'none';
            continue;
          }
          node.x += node.vx * dt;
          node.y += node.vy * dt;
          const alpha = (age < 0.18 ? age / 0.18 : 1 - (age - 0.18) / 0.82) * 0.74;
          slot.g.style.display = '';
          slot.g.style.opacity = alpha.toFixed(2);
          for (const rectEl of [slot.halo, slot.ink]) {
            rectEl.setAttribute('x', String(r1(node.x)));
            rectEl.setAttribute('y', String(r1(node.y)));
            rectEl.setAttribute('width', String(r1(node.w)));
            rectEl.setAttribute('height', String(r1(node.h)));
          }

          // Tether hairline to nearest reticle corner
          const mcx = node.x + node.w / 2;
          const mcy = node.y + node.h / 2;
          let nearest = corners[0];
          let minD = Infinity;
          for (const c of corners) {
            const d = Math.hypot(mcx - c.x, mcy - c.y);
            if (d < minD) {
              minD = d;
              nearest = c;
            }
          }
          if (minD > 190 || minD < 12) {
            slot.tie.g.style.display = 'none';
          } else {
            const tieAlpha = minD < 90 ? 0.65 : ((190 - minD) / 100) * 0.65;
            slot.tie.g.style.display = '';
            slot.tie.g.style.opacity = tieAlpha.toFixed(2);
            setPath(slot.tie, `M${r1(nearest.x)} ${r1(nearest.y)}L${r1(mcx)} ${r1(mcy)}`);
          }
        }

        // 3. Click burst waves
        for (let i = waves.length - 1; i >= 0; i--) {
          if (now - waves[i].born >= WAVE_MS) waves.splice(i, 1);
        }
        for (let i = 0; i < WAVE_LIMIT; i++) {
          const w = waves[i];
          const slot = waveSlots[i];
          if (!w) {
            slot.g.style.display = 'none';
            continue;
          }
          let wd = '';
          let maxFade = 0;
          for (const sp of w.sparks) {
            const el = now - w.born - sp.delay;
            if (el < 0) continue;
            const p = Math.min(1, el / (WAVE_MS - sp.delay));
            if (p >= 1) continue;
            const e = 1 - Math.pow(1 - p, 3);
            const dist = sp.r0 + (sp.r1 - sp.r0) * e;
            const a = sp.angle + sp.curve * e;
            const px = w.x + Math.cos(a) * dist - sp.size / 2;
            const py = w.y + Math.sin(a) * dist - sp.size / 2;
            wd += squarePath(px, py, sp.size, sp.size);
            maxFade = Math.max(maxFade, 1 - p);
          }
          if (!wd) {
            slot.g.style.display = 'none';
          } else {
            slot.g.style.display = '';
            slot.g.style.opacity = (maxFade * 0.85).toFixed(2);
            setPath(slot, wd);
          }
        }
      }

      // Recent press markers within 8s model window
      while (presses.length > 0 && now - presses[0].t > PRESS_WINDOW_MS) presses.shift();
      let pD = '';
      let bD = '';
      for (const p of presses) {
        pD += squarePath(p.x - 2.5, p.y - 2.5, 5, 5);
        if (p.blocked) bD += squarePath(p.x - 1, p.y - 1, 2, 2);
      }
      setPath(pressLayer, pD);
      pressBlocked.setAttribute('d', bD);

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('pointermove', onPointerMove, { capture: true });
      window.removeEventListener('pointerdown', onPointerDown, { capture: true });
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);
      shadow.innerHTML = '';
    };
  }, [enabled]);

  if (!enabled) return null;
  return <div ref={hostRef} data-mood-ignore="" aria-hidden="true" />;
}
