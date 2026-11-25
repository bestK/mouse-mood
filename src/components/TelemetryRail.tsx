import { useMood, type ClassName, type FastKind } from '@/mood-recognition';
import type { CopyDict } from '@/i18n';
import { Badge } from '@/components/ui/badge';
import { KinematicCanvas } from './KinematicCanvas';
import { ShadowText } from './ShadowText';
import { cn } from '@/lib/utils';

type TelemetryRailProps = {
  copy: CopyDict;
};

const CLASS_ORDER: readonly ClassName[] = [
  'none',
  'blocked',
  'frustrated',
  'confused',
  'lost',
  'waiting',
];

const FAST_ORDER: readonly FastKind[] = ['shake', 'orbit', 'rage', 'disabled'];

const MOOD_BADGE_STYLE: Record<string, string> = {
  neutral: 'border-border bg-secondary/70 text-zinc-200',
  frustrated: 'border-rose-500/40 bg-rose-500/10 text-rose-400',
  confused: 'border-amber-500/40 bg-amber-500/10 text-amber-400',
  lost: 'border-sky-400/40 bg-sky-400/10 text-sky-300',
  away: 'border-border bg-muted text-zinc-500',
};

const MOOD_DOT_STYLE: Record<string, string> = {
  neutral: 'bg-zinc-200',
  frustrated: 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]',
  confused: 'bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]',
  lost: 'bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]',
  away: 'bg-zinc-600',
};

const METER_FILL_STYLE: Record<string, string> = {
  neutral: 'bg-zinc-200',
  frustrated: 'bg-rose-500',
  confused: 'bg-amber-400',
  lost: 'bg-sky-400',
  away: 'bg-zinc-600',
};

const CLASS_BAR_STYLE: Record<ClassName, string> = {
  none: 'bg-zinc-300',
  blocked: 'bg-rose-500',
  frustrated: 'bg-rose-400',
  confused: 'bg-amber-400',
  lost: 'bg-sky-400',
  waiting: 'bg-zinc-500',
};

export function TelemetryRail({ copy }: TelemetryRailProps) {
  const { mood, reaction, score, probabilities, fast, fastKind, isModelLoaded } = useMood();
  const moodKey = mood ?? 'neutral';
  const moodLabel = copy.moods[moodKey];

  return (
    <aside
      className="flex flex-col divide-y divide-border/70 rounded-lg border border-border bg-card lg:sticky lg:top-8"
      data-mood-ignore=""
      data-active-mood={moodKey}
    >
      {/* Active Mood & Score */}
      <div className="flex h-14 items-center justify-between gap-3 px-5">
        <Badge
          variant="outline"
          data-mood={moodKey}
          className={cn(
            'h-7 gap-2 rounded-md px-2.5 text-xs font-medium tracking-tight transition-colors',
            MOOD_BADGE_STYLE[moodKey],
          )}
        >
          <span className={cn('size-1.5 rounded-full transition-all', MOOD_DOT_STYLE[moodKey])} />
          <ShadowText value={moodLabel} />
        </Badge>

        <div className="flex items-baseline gap-3 font-mono tabular-nums">
          <span className="text-[11px] text-muted-foreground">
            --mood{' '}
            <ShadowText value={reaction.toFixed(2)} className="text-zinc-300" />
          </span>
          <ShadowText value={score.toFixed(2)} className="text-base font-semibold text-foreground" />
        </div>
      </div>

      {/* Vector Oscilloscope */}
      <div className="p-5">
        <div className="h-[124px] overflow-hidden rounded-md border border-border bg-[#070709]">
          <KinematicCanvas mood={mood} reaction={reaction} />
        </div>
      </div>

      {/* Calibrated Reaction Meter */}
      <div className="flex flex-col gap-2.5 px-5 py-4">
        <div className="flex items-center justify-between text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          <span>{copy.telemetry.reaction}</span>
          <ShadowText
            value={`${Math.round(reaction * 100)}%`}
            className="font-mono tabular-nums text-foreground"
          />
        </div>
        <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className={cn(
              'h-full w-full origin-left transition-transform duration-75 ease-linear',
              METER_FILL_STYLE[moodKey],
            )}
            style={{ transform: `scaleX(${Math.max(0, Math.min(1, reaction))})` }}
          />
          <span
            className="pointer-events-none absolute inset-y-0 w-px bg-zinc-500/70"
            style={{ left: '30%' }}
            aria-hidden="true"
          />
          <span
            className="pointer-events-none absolute inset-y-0 w-px bg-zinc-200/80"
            style={{ left: '65%' }}
            aria-hidden="true"
          />
        </div>
        <div className="relative h-3.5 font-mono text-[10px] tabular-nums text-zinc-500">
          <span className="absolute left-[30%] -translate-x-1/2">0.30</span>
          <span className="absolute left-[65%] -translate-x-1/2 text-zinc-400">0.65</span>
        </div>
      </div>

      {/* Instant Fast-Signal Matrix */}
      <div className="flex flex-col gap-2.5 px-5 py-4">
        <div className="flex items-center justify-between text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          <span>{copy.telemetry.fastSignals}</span>
          <ShadowText
            value={fast > 0 ? fast.toFixed(2) : '0.00'}
            className="font-mono tabular-nums text-foreground"
          />
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {FAST_ORDER.map((kind) => {
            const active = fastKind === kind && fast >= 0.15;
            const isOrbit = kind === 'orbit';
            return (
              <div
                key={kind}
                data-active={active ? 'true' : 'false'}
                data-kind={kind}
                className={cn(
                  'fast-chip flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors',
                  active
                    ? isOrbit
                      ? 'border-amber-500/40 bg-amber-500/10 text-amber-300'
                      : 'border-rose-500/40 bg-rose-500/10 text-rose-300'
                    : 'border-border bg-muted/60 text-muted-foreground',
                )}
              >
                <span
                  className={cn(
                    'size-1.5 rounded-full transition-all',
                    active
                      ? isOrbit
                        ? 'bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.9)]'
                        : 'bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.9)]'
                      : 'bg-zinc-700',
                  )}
                />
                <span>{copy.fast[kind]}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* GBDT 6-Class Distribution */}
      <div className="flex flex-col gap-3 px-5 py-4">
        <div className="flex items-center justify-between text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          <span>{copy.telemetry.probabilities}</span>
          <span className="mono-chip inline-flex items-center gap-1.5 font-mono text-[10px] normal-case tracking-normal text-emerald-400">
            <span className="size-1.5 rounded-full bg-emerald-400" />
            {isModelLoaded ? copy.telemetry.loaded : copy.telemetry.fallback}
          </span>
        </div>

        <div className="flex flex-col gap-2">
          {CLASS_ORDER.map((cls) => {
            const val = probabilities ? probabilities[cls] ?? 0 : 0;
            return (
              <div key={cls} className="grid grid-cols-[106px_1fr_34px] items-center gap-2.5 text-xs">
                <span className="truncate text-[11px] text-zinc-400">{copy.classes[cls]}</span>
                <div className="h-[3px] w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className={cn(
                      'h-full w-full origin-left transition-transform duration-75 ease-linear',
                      CLASS_BAR_STYLE[cls],
                    )}
                    style={{ transform: `scaleX(${Math.max(0, Math.min(1, val))})` }}
                  />
                </div>
                <ShadowText
                  value={`${Math.round(val * 100)}%`}
                  className="text-right font-mono text-[11px] tabular-nums text-zinc-400"
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Technical Spec Footer */}
      <div className="flex items-center justify-between px-5 py-3 font-mono text-[11px] text-zinc-500">
        <span>{copy.modelTag}</span>
        <span>{copy.telemetry.offline}</span>
      </div>
    </aside>
  );
}
