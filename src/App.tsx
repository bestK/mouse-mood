import { useEffect, useState } from 'react';
import { CreditCard, Crosshair, KeyRound, RotateCcw, SlidersHorizontal } from 'lucide-react';
import { MoodProvider, useMood } from '@/mood-recognition';
import model from '@/mood-recognition/MoodRecognition.json';
import { COPY, detectInitialLang, saveLang, type Lang } from '@/i18n';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TelemetryRail } from '@/components/TelemetryRail';
import { CursorHud } from '@/components/CursorHud';
import { CheckoutScenario } from '@/components/scenarios/CheckoutScenario';
import { StrictFormScenario } from '@/components/scenarios/StrictFormScenario';
import { DeepSettingsScenario } from '@/components/scenarios/DeepSettingsScenario';
import { ShadowText } from '@/components/ShadowText';
import { cn } from '@/lib/utils';

type ScenarioId = 'checkout' | 'form' | 'settings';

const HEADER_DOT_STYLE: Record<string, string> = {
  neutral: 'bg-zinc-200',
  frustrated: 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.85)]',
  confused: 'bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.85)]',
  lost: 'bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.85)]',
  away: 'bg-zinc-600',
};

export function App() {
  return (
    <MoodProvider model={model}>
      <InstrumentBench />
    </MoodProvider>
  );
}

function InstrumentBench() {
  const [lang, setLang] = useState<Lang>(detectInitialLang);
  const [scenario, setScenario] = useState<ScenarioId>('checkout');
  const [stageState, setStageState] = useState<1 | 2 | 3>(1);
  const [hudEnabled, setHudEnabled] = useState(true);
  const [resetSignal, setResetSignal] = useState(0);
  const { mood } = useMood();

  const copy = COPY[lang];
  const moodKey = mood ?? 'neutral';

  useEffect(() => {
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
    document.title = copy.pageTitle;
  }, [lang, copy.pageTitle]);

  const toggleLang = () => {
    const next: Lang = lang === 'zh' ? 'en' : 'zh';
    setLang(next);
    saveLang(next);
  };

  return (
    <div className="instrument-shell app-shell min-h-screen w-full" data-mood={moodKey}>
      <CursorHud enabled={hudEnabled} />

      <div className="mx-auto flex min-h-screen w-full max-w-[1160px] flex-col px-4 sm:px-6">
        {/* Clean Open Header */}
        <header
          className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-border/70"
          data-mood-ignore=""
        >
          <div className="flex items-center gap-2.5">
            <span
              className={cn(
                'size-2 shrink-0 rounded-full transition-all duration-200',
                HEADER_DOT_STYLE[moodKey],
              )}
            />
            <span className="whitespace-nowrap text-sm font-semibold tracking-tight text-foreground">
              {copy.brand}
            </span>
            <Badge
              variant="outline"
              className="hidden rounded-sm px-1.5 py-0 font-mono text-[10px] text-muted-foreground sm:inline-flex"
            >
              v0.4
            </Badge>
          </div>

          <div className="flex items-center gap-1.5">
            <Badge
              variant="outline"
              className="inline-flex h-7 whitespace-nowrap rounded-md px-2 text-xs text-zinc-300 lg:hidden"
            >
              <ShadowText value={copy.moods[moodKey]} />
            </Badge>

            <Button
              type="button"
              variant={hudEnabled ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => setHudEnabled((v) => !v)}
              aria-pressed={hudEnabled}
              className={cn(
                'hidden h-8 gap-1.5 px-2.5 font-mono text-xs sm:inline-flex',
                hudEnabled
                  ? 'border border-zinc-700 text-foreground'
                  : 'text-muted-foreground',
              )}
            >
              <Crosshair className="size-3.5" />
              <span>{copy.hud}</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={toggleLang}
              aria-label={lang === 'zh' ? 'Switch to English' : '切换到中文'}
              className="h-8 gap-1 px-2.5 font-mono text-xs"
            >
              <span className={lang === 'zh' ? 'text-foreground' : 'text-muted-foreground'}>中</span>
              <span className="text-zinc-600">/</span>
              <span className={lang === 'en' ? 'text-foreground' : 'text-muted-foreground'}>EN</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              onClick={() => setResetSignal((n) => n + 1)}
              title={copy.reset}
              aria-label={copy.reset}
              className="size-8"
            >
              <RotateCcw className="size-3.5" />
            </Button>
          </div>
        </header>

        {/* Open Two-Column Bench (zero extraneous vertical frame lines) */}
        <main className="grid flex-1 grid-cols-1 items-start gap-6 py-6 lg:grid-cols-[minmax(0,1fr)_356px] lg:gap-8 lg:py-8">
          {/* Interactive Stage Column */}
          <section className="flex min-w-0 flex-col gap-5">
            <div
              className="flex flex-wrap items-center justify-between gap-3"
              data-mood-ignore=""
            >
              <Tabs
                value={scenario}
                onValueChange={(v) => {
                  setScenario(v as ScenarioId);
                  setStageState(1);
                }}
              >
                <TabsList className="h-9 bg-muted p-1">
                  <TabsTrigger value="checkout" className="scenario-tab h-7 px-3 text-xs">
                    <CreditCard className="size-3.5" />
                    <span>{copy.tabs.checkout}</span>
                  </TabsTrigger>
                  <TabsTrigger value="form" className="scenario-tab h-7 px-3 text-xs">
                    <KeyRound className="size-3.5" />
                    <span>{copy.tabs.form}</span>
                  </TabsTrigger>
                  <TabsTrigger value="settings" className="scenario-tab h-7 px-3 text-xs">
                    <SlidersHorizontal className="size-3.5" />
                    <span>{copy.tabs.settings}</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {/* Self-Explanatory Live State Rail: S1 · S2 · S3 */}
              <div
                className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/60 p-0.5 font-mono text-[11px]"
                data-active-state={stageState}
              >
                {([1, 2, 3] as const).map((s) => {
                  const active = stageState === s;
                  return (
                    <span
                      key={s}
                      className={cn(
                        'rounded px-2 py-0.5 transition-colors',
                        active
                          ? s === 3
                            ? moodKey === 'lost'
                              ? 'bg-sky-400/15 text-sky-300'
                              : 'bg-rose-500/15 text-rose-400'
                            : s === 2
                              ? 'bg-amber-500/15 text-amber-300'
                              : 'bg-secondary text-foreground'
                          : 'text-zinc-600',
                      )}
                    >
                      {s === 1 ? copy.states.s1 : s === 2 ? copy.states.s2 : copy.states.s3}
                    </span>
                  );
                })}
              </div>
            </div>

            <div className="flex min-h-[480px] items-center justify-center rounded-lg border border-border/60 bg-card/30 p-5 sm:p-10">
              {scenario === 'checkout' && (
                <CheckoutScenario
                  copy={copy}
                  resetSignal={resetSignal}
                  onStateChange={setStageState}
                />
              )}
              {scenario === 'form' && (
                <StrictFormScenario
                  copy={copy}
                  resetSignal={resetSignal}
                  onStateChange={setStageState}
                />
              )}
              {scenario === 'settings' && (
                <DeepSettingsScenario
                  copy={copy}
                  resetSignal={resetSignal}
                  onStateChange={setStageState}
                />
              )}
            </div>
          </section>

          {/* Live GBDT Telemetry Card */}
          <TelemetryRail copy={copy} />
        </main>
      </div>
    </div>
  );
}

export default App;
