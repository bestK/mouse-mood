import { useEffect, useMemo, useState } from 'react';
import { Check, ChevronRight, Copy, Crosshair, Search } from 'lucide-react';
import { useMood } from '@/mood-recognition';
import type { CopyDict } from '@/i18n';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type DeepSettingsScenarioProps = {
  copy: CopyDict;
  resetSignal: number;
  onStateChange: (state: 1 | 2 | 3) => void;
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

export function DeepSettingsScenario({
  copy,
  resetSignal,
  onStateChange,
}: DeepSettingsScenarioProps) {
  const { mood, reaction } = useMood();
  const [query, setQuery] = useState('');
  const [copied, setCopied] = useState(false);
  const [openKey, setOpenKey] = useState<string>(String(resetSignal));

  useEffect(() => {
    setQuery('');
    setCopied(false);
    setOpenKey(String(resetSignal));
  }, [resetSignal]);

  const guideLevel: 1 | 2 | 3 = copied
    ? 1
    : mood === 'lost' || mood === 'frustrated'
      ? 3
      : mood === 'confused' || reaction >= 0.3
        ? 2
        : 1;

  useEffect(() => {
    onStateChange(guideLevel);
  }, [guideLevel, onStateChange]);

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
    <div
      className="settings-stage flex w-full max-w-[500px] flex-col gap-3.5 rounded-lg border border-border bg-card p-5"
      data-state={guideLevel}
    >
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between gap-2">
          <Badge
            variant="outline"
            className={cn(
              'h-6 gap-1.5 rounded-md px-2 text-xs font-medium',
              copied
                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                : 'border-border bg-muted text-zinc-200',
            )}
          >
            <Crosshair className="size-3 text-zinc-400" />
            <span className="text-zinc-500">{copy.settings.targetLabel}</span>
            <span>{copy.settings.targetValue}</span>
          </Badge>
        </div>

        <div className="relative">
          <Search
            className={cn(
              'pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 transition-colors',
              guideLevel === 3 ? 'text-sky-400' : 'text-zinc-500',
            )}
            aria-hidden="true"
          />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={copy.settings.searchPlaceholder}
            className="settings-search h-9 bg-background pl-8.5 text-xs transition-all duration-200"
          />
        </div>
      </div>

      <div className="settings-scroll flex max-h-[324px] flex-col gap-1.5 overflow-y-auto pr-1" key={openKey}>
        {filteredSections.map((section) => {
          const isTargetSection = section.key === 'security';
          return (
            <details
              key={section.key}
              data-target-section={isTargetSection ? 'true' : 'false'}
              open={Boolean(query.trim())}
              className="settings-group group rounded-md border border-border bg-muted/45 transition-all duration-200 open:bg-background/80"
            >
              <summary className="flex cursor-pointer list-none items-center gap-2 px-3 py-2.5 text-xs font-medium text-zinc-200 select-none [&::-webkit-details-marker]:hidden">
                <ChevronRight className="size-3.5 text-zinc-500 transition-transform duration-150 group-open:rotate-90" />
                <span>{section.title}</span>
              </summary>

              <div className="flex flex-col gap-1 border-t border-border/70 px-3 py-2">
                {section.items.map((item) => {
                  const isTarget = 'isTarget' in item && item.isTarget;
                  return (
                    <div
                      key={item.label}
                      data-target-row={isTarget ? 'true' : 'false'}
                      className={cn(
                        'flex items-center justify-between gap-2 rounded px-2 py-1.5 text-xs',
                        isTarget && 'bg-sky-400/10',
                      )}
                    >
                      <span className="text-zinc-300">{item.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] tabular-nums text-zinc-500">
                          {item.value}
                        </span>
                        {isTarget && (
                          <Button
                            type="button"
                            size="xs"
                            variant={copied ? 'secondary' : 'default'}
                            onClick={handleCopy}
                            className={cn(
                              copied && 'border border-emerald-500/30 bg-emerald-500/15 text-emerald-300',
                            )}
                          >
                            {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
                            <span>
                              {copied ? copy.settings.copiedBtn : copy.settings.copyBtn}
                            </span>
                          </Button>
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
