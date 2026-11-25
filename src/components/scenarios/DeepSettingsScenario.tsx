import { useEffect, useMemo, useState } from 'react';
import { Check, ChevronRight, Copy, Search, Target } from 'lucide-react';
import { useMood } from '../../mood-recognition';
import type { CopyDict } from '../../i18n';

type DeepSettingsScenarioProps = {
  copy: CopyDict;
  resetSignal: number;
};

type SectionKey =
  | 'profile'
  | 'appearance'
  | 'notifications'
  | 'sync'
  | 'billing'
  | 'security'
  | 'integrations';

const SECTION_KEYS: readonly SectionKey[] = [
  'profile',
  'appearance',
  'notifications',
  'sync',
  'billing',
  'security',
  'integrations',
];

export function DeepSettingsScenario({ copy, resetSignal }: DeepSettingsScenarioProps) {
  const { mood, reaction } = useMood();
  const [query, setQuery] = useState('');
  const [copied, setCopied] = useState(false);
  const [openKey, setOpenKey] = useState<string>(String(resetSignal));

  useEffect(() => {
    setQuery('');
    setCopied(false);
    setOpenKey(String(resetSignal));
  }, [resetSignal]);

  const guideLevel =
    copied
      ? 1
      : mood === 'lost' || mood === 'frustrated'
        ? 3
        : mood === 'confused' || reaction >= 0.3
          ? 2
          : 1;

  const filteredSections = useMemo(() => {
    const q = query.trim().toLowerCase();
    return SECTION_KEYS.map((key) => {
      const sec = copy.settings.sections[key];
      const items = sec.items.filter(
        (item) =>
          !q ||
          sec.title.toLowerCase().includes(q) ||
          item.label.toLowerCase().includes(q) ||
          item.value.toLowerCase().includes(q),
      );
      return { key, title: sec.title, items };
    }).filter((sec) => sec.items.length > 0);
  }, [copy, query]);

  const handleCopy = () => {
    navigator.clipboard?.writeText('whsec_9f2k4m8x1q7p81a4').catch(() => {});
    setCopied(true);
  };

  return (
    <div className="stage-card settings-stage" data-state={guideLevel}>
      <div className="settings-top">
        <div className="target-chip" data-found={copied ? 'true' : 'false'}>
          <Target size={14} />
          <span className="target-prefix">{copy.settings.targetLabel}</span>
          <span className="target-name">{copy.settings.targetValue}</span>
        </div>

        <div className="settings-search-wrap">
          <Search size={15} className="search-icon" aria-hidden="true" />
          <input
            type="search"
            className="settings-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={copy.settings.searchPlaceholder}
          />
        </div>
      </div>

      <div className="settings-scroll" key={openKey}>
        {filteredSections.map((section) => {
          const isTargetSection = section.key === 'security';
          return (
            <details
              key={section.key}
              className="settings-group"
              data-target-section={isTargetSection ? 'true' : 'false'}
              open={Boolean(query.trim())}
            >
              <summary className="settings-summary">
                <ChevronRight size={15} className="summary-chevron" />
                <span>{section.title}</span>
              </summary>
              <div className="settings-items">
                {section.items.map((item) => {
                  const isTarget = 'isTarget' in item && item.isTarget;
                  return (
                    <div
                      key={item.label}
                      className="settings-row"
                      data-target-row={isTarget ? 'true' : 'false'}
                    >
                      <span className="settings-row-label">{item.label}</span>
                      <div className="settings-row-right">
                        <span className="settings-row-value mono-num">{item.value}</span>
                        {isTarget && (
                          <button
                            type="button"
                            className="btn-copy"
                            data-copied={copied ? 'true' : 'false'}
                            onClick={handleCopy}
                          >
                            {copied ? <Check size={13} /> : <Copy size={13} />}
                            <span>
                              {copied ? copy.settings.copiedBtn : copy.settings.copyBtn}
                            </span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </details>
          );
        })}
      </div>
    </div>
  );
}
