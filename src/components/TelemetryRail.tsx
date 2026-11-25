import { useMood, type ClassName, type FastKind } from '../mood-recognition';
import type { CopyDict } from '../i18n';
import { KinematicCanvas } from './KinematicCanvas';
import { ShadowText } from './ShadowText';

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

export function TelemetryRail({ copy }: TelemetryRailProps) {
  const { mood, reaction, score, probabilities, fast, fastKind, isModelLoaded } = useMood();
  const moodKey = mood ?? 'neutral';
  const moodLabel = copy.moods[moodKey];

  return (
    <aside className="telemetry-rail" data-mood-ignore="" data-active-mood={moodKey}>
      <div className="telemetry-head">
        <div className="mood-badge" data-mood={moodKey}>
          <span className="mood-dot" />
          <ShadowText value={moodLabel} className="mood-badge-text" />
        </div>
        <div className="score-readout">
          <ShadowText value={score.toFixed(2)} className="mono-num" />
        </div>
      </div>

      <div className="kinematic-frame">
        <KinematicCanvas mood={mood} reaction={reaction} />
      </div>

      <div className="telemetry-section">
        <div className="section-row">
          <span className="section-key">{copy.telemetry.reaction}</span>
          <ShadowText value={`${Math.round(reaction * 100)}%`} className="mono-num section-val" />
        </div>
        <div className="meter-track">
          <div
            className="meter-fill"
            data-mood={moodKey}
            style={{ transform: `scaleX(${Math.max(0, Math.min(1, reaction))})` }}
          />
          <span className="meter-threshold" style={{ left: '65%' }} aria-hidden="true" />
        </div>
      </div>

      <div className="telemetry-section">
        <div className="section-row">
          <span className="section-key">{copy.telemetry.fastSignals}</span>
          <ShadowText
            value={fast > 0 ? fast.toFixed(2) : '0.00'}
            className="mono-num section-val"
          />
        </div>
        <div className="fast-grid">
          {FAST_ORDER.map((kind) => {
            const active = fastKind === kind && fast >= 0.15;
            return (
              <div
                key={kind}
                className="fast-chip"
                data-active={active ? 'true' : 'false'}
                data-kind={kind}
              >
                <span className="fast-led" />
                <span>{copy.fast[kind]}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="telemetry-section">
        <div className="section-row">
          <span className="section-key">{copy.telemetry.probabilities}</span>
          <span className="mono-chip">
            {isModelLoaded ? copy.telemetry.loaded : copy.telemetry.fallback}
          </span>
        </div>
        <div className="prob-list">
          {CLASS_ORDER.map((cls) => {
            const val = probabilities ? probabilities[cls] ?? 0 : 0;
            return (
              <div key={cls} className="prob-row" data-cls={cls}>
                <span className="prob-label">{copy.classes[cls]}</span>
                <div className="prob-bar-track">
                  <div
                    className="prob-bar-fill"
                    data-cls={cls}
                    style={{ transform: `scaleX(${Math.max(0, Math.min(1, val))})` }}
                  />
                </div>
                <ShadowText value={`${Math.round(val * 100)}%`} className="mono-num prob-pct" />
              </div>
            );
          })}
        </div>
      </div>

      <div className="telemetry-footer">
        <span>{copy.modelTag}</span>
        <span>{copy.telemetry.offline}</span>
      </div>
    </aside>
  );
}
