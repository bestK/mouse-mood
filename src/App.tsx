import { useEffect, useState } from 'react';
import { CreditCard, KeyRound, RotateCcw, SlidersHorizontal } from 'lucide-react';
import { MoodProvider, useMood } from './mood-recognition';
import model from './mood-recognition/MoodRecognition.json';
import { COPY, detectInitialLang, saveLang, type Lang } from './i18n';
import { TelemetryRail } from './components/TelemetryRail';
import { CheckoutScenario } from './components/scenarios/CheckoutScenario';
import { StrictFormScenario } from './components/scenarios/StrictFormScenario';
import { DeepSettingsScenario } from './components/scenarios/DeepSettingsScenario';
import { ShadowText } from './components/ShadowText';

type ScenarioId = 'checkout' | 'form' | 'settings';

export function App() {
  return (
    <MoodProvider model={model}>
      <StudioShell />
    </MoodProvider>
  );
}

function StudioShell() {
  const [lang, setLang] = useState<Lang>(detectInitialLang);
  const [scenario, setScenario] = useState<ScenarioId>('checkout');
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
    <div className="app-shell" data-mood={moodKey}>
      <header className="top-bar" data-mood-ignore="">
        <div className="brand-cluster">
          <span className="brand-dot" data-mood={moodKey} />
          <span className="brand-name">{copy.brand}</span>
          <span className="brand-version">v0.4</span>
        </div>

        <div className="top-actions">
          <div className="top-mood-pill" data-mood={moodKey}>
            <ShadowText value={copy.moods[moodKey]} />
          </div>

          <button
            type="button"
            className="lang-toggle"
            onClick={toggleLang}
            aria-label={lang === 'zh' ? 'Switch to English' : '切换到中文'}
          >
            <span data-active={lang === 'zh' ? 'true' : 'false'}>中</span>
            <span className="lang-sep">/</span>
            <span data-active={lang === 'en' ? 'true' : 'false'}>EN</span>
          </button>

          <button
            type="button"
            className="icon-btn"
            onClick={() => setResetSignal((n) => n + 1)}
            title={copy.reset}
            aria-label={copy.reset}
          >
            <RotateCcw size={15} />
          </button>
        </div>
      </header>

      <main className="bench-grid">
        <section className="stage-column">
          <nav className="scenario-tabs" role="tablist" data-mood-ignore="">
            <button
              type="button"
              role="tab"
              aria-selected={scenario === 'checkout'}
              className="scenario-tab"
              onClick={() => setScenario('checkout')}
            >
              <CreditCard size={15} />
              <span>{copy.tabs.checkout}</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={scenario === 'form'}
              className="scenario-tab"
              onClick={() => setScenario('form')}
            >
              <KeyRound size={15} />
              <span>{copy.tabs.form}</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={scenario === 'settings'}
              className="scenario-tab"
              onClick={() => setScenario('settings')}
            >
              <SlidersHorizontal size={15} />
              <span>{copy.tabs.settings}</span>
            </button>
          </nav>

          <div className="stage-viewport">
            {scenario === 'checkout' && (
              <CheckoutScenario copy={copy} resetSignal={resetSignal} />
            )}
            {scenario === 'form' && (
              <StrictFormScenario copy={copy} resetSignal={resetSignal} />
            )}
            {scenario === 'settings' && (
              <DeepSettingsScenario copy={copy} resetSignal={resetSignal} />
            )}
          </div>
        </section>

        <TelemetryRail copy={copy} />
      </main>
    </div>
  );
}

export default App;
