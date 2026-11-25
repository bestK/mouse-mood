import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Check, KeyRound, RotateCcw, Sparkles } from 'lucide-react';
import { useMood } from '../../mood-recognition';
import type { CopyDict } from '../../i18n';

type StrictFormScenarioProps = {
  copy: CopyDict;
  resetSignal: number;
};

const KEY_REGEX = /^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
const SAMPLE_KEY = 'A9F2-K4M8-7Q1X';

export function StrictFormScenario({ copy, resetSignal }: StrictFormScenarioProps) {
  const { mood, reaction } = useMood();
  const [value, setValue] = useState('');
  const [invalid, setInvalid] = useState(false);
  const [activated, setActivated] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setValue('');
    setInvalid(false);
    setActivated(false);
  }, [resetSignal]);

  const state = activated
    ? 1
    : mood === 'frustrated'
      ? 3
      : mood === 'confused' || mood === 'lost'
        ? 2
        : 1;

  const assistActive = !activated && (state >= 2 || reaction >= 0.25);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!KEY_REGEX.test(trimmed)) {
      setInvalid(true);
      inputRef.current?.dispatchEvent(new Event('invalid', { bubbles: false, cancelable: true }));
      inputRef.current?.focus();
      return;
    }
    setInvalid(false);
    setActivated(true);
  };

  if (activated) {
    return (
      <div className="stage-card checkout-paid">
        <div className="paid-icon">
          <Check size={24} strokeWidth={2.4} />
        </div>
        <h2 className="stage-title">{copy.form.success}</h2>
        <div className="mono-pill">{value.trim()}</div>
        <button
          type="button"
          className="btn-secondary"
          onClick={() => {
            setValue('');
            setInvalid(false);
            setActivated(false);
          }}
        >
          <RotateCcw size={15} />
          <span>{copy.form.resetKey}</span>
        </button>
      </div>
    );
  }

  return (
    <form className="stage-card strict-form" data-state={state} onSubmit={handleSubmit} noValidate>
      <div className="form-head">
        <div className="form-icon" aria-hidden="true">
          <KeyRound size={20} strokeWidth={1.85} />
        </div>
        <h2 className="stage-title">{copy.form.heading}</h2>
      </div>

      <div className="field-group">
        <label className="field-label" htmlFor="serial-key-input">
          {copy.form.label}
        </label>
        <input
          ref={inputRef}
          id="serial-key-input"
          className="field-input mono-input"
          type="text"
          value={value}
          required
          pattern="[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}"
          aria-invalid={invalid ? 'true' : 'false'}
          placeholder={copy.form.placeholder}
          autoComplete="off"
          spellCheck={false}
          onChange={(e) => {
            setValue(e.target.value);
            if (invalid && KEY_REGEX.test(e.target.value.trim())) {
              setInvalid(false);
            }
          }}
        />

        <div className="field-feedback-slot">
          {invalid && (
            <div className="field-error" role="alert">
              {copy.form.invalid}
            </div>
          )}
        </div>
      </div>

      <div className="assist-bar" data-active={assistActive ? 'true' : 'false'}>
        <div className="assist-pattern">
          <Sparkles size={14} />
          <span className="mono-num">{copy.form.formatHint}</span>
        </div>
        <button
          type="button"
          className="btn-ghost-accent"
          tabIndex={assistActive ? 0 : -1}
          onClick={() => {
            setValue(SAMPLE_KEY);
            setInvalid(false);
            inputRef.current?.focus();
          }}
        >
          {copy.form.fillSample}
        </button>
      </div>

      <button type="submit" className="btn-primary">
        {copy.form.activate}
      </button>
    </form>
  );
}
