import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Check, KeyRound, RotateCcw, Terminal } from 'lucide-react';
import { useMood } from '@/mood-recognition';
import type { CopyDict } from '@/i18n';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

type StrictFormScenarioProps = {
  copy: CopyDict;
  resetSignal: number;
  onStateChange: (state: 1 | 2 | 3) => void;
};

const KEY_REGEX = /^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
const SAMPLE_KEY = 'A9F2-K4M8-7Q1X';

export function StrictFormScenario({ copy, resetSignal, onStateChange }: StrictFormScenarioProps) {
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

  const state: 1 | 2 | 3 = activated
    ? 1
    : mood === 'frustrated'
      ? 3
      : mood === 'confused' || mood === 'lost'
        ? 2
        : 1;

  useEffect(() => {
    onStateChange(state);
  }, [state, onStateChange]);

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
      <div className="flex w-full max-w-[440px] flex-col items-center gap-4 rounded-lg border border-border bg-card p-8 text-center">
        <div className="grid size-11 place-items-center rounded-md border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
          <Check className="size-5" />
        </div>
        <h2 className="text-base font-semibold tracking-tight">{copy.form.success}</h2>
        <Badge variant="outline" className="font-mono text-xs text-zinc-300">
          {value.trim()}
        </Badge>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-2"
          onClick={() => {
            setValue('');
            setInvalid(false);
            setActivated(false);
          }}
        >
          <RotateCcw className="size-3.5" />
          <span>{copy.form.resetKey}</span>
        </Button>
      </div>
    );
  }

  return (
    <form
      className="strict-stage strict-form flex w-full max-w-[440px] flex-col gap-5 rounded-lg border border-border bg-card p-6"
      data-state={state}
      onSubmit={handleSubmit}
      noValidate
    >
      <div className="flex items-center gap-3">
        <div
          className="grid size-9 place-items-center rounded-md border border-border bg-muted text-zinc-200"
          aria-hidden="true"
        >
          <KeyRound className="size-4" strokeWidth={1.7} />
        </div>
        <h2 className="text-sm font-semibold tracking-tight">{copy.form.heading}</h2>
      </div>

      <Separator />

      <div className="flex flex-col gap-2">
        <label htmlFor="serial-key-input" className="text-xs font-medium text-zinc-400">
          {copy.form.label}
        </label>
        <Input
          ref={inputRef}
          id="serial-key-input"
          type="text"
          value={value}
          required
          pattern="[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}"
          aria-invalid={invalid ? 'true' : 'false'}
          placeholder={copy.form.placeholder}
          autoComplete="off"
          spellCheck={false}
          className="h-10 bg-background font-mono text-sm tracking-wider"
          onChange={(e) => {
            setValue(e.target.value);
            if (invalid && KEY_REGEX.test(e.target.value.trim())) {
              setInvalid(false);
            }
          }}
        />
        <div className="min-h-[18px]">
          {invalid && (
            <p className="text-xs font-medium text-rose-400" role="alert">
              {copy.form.invalid}
            </p>
          )}
        </div>
      </div>

      {/* Reserved adaptive assist rail — fades in via --mood with zero layout shift */}
      <div
        data-active={assistActive ? 'true' : 'false'}
        className="strict-assist assist-bar flex items-center justify-between gap-3 rounded-md border border-amber-500/35 bg-amber-500/10 px-3 py-2"
      >
        <div className="flex items-center gap-2 font-mono text-xs text-zinc-100">
          <Terminal className="size-3.5 text-amber-400" />
          <span>{copy.form.formatHint}</span>
        </div>
        <Button
          type="button"
          variant="outline"
          size="xs"
          tabIndex={assistActive ? 0 : -1}
          onClick={() => {
            setValue(SAMPLE_KEY);
            setInvalid(false);
            inputRef.current?.focus();
          }}
        >
          {copy.form.fillSample}
        </Button>
      </div>

      <Button type="submit" size="lg" className="h-10 w-full">
        {copy.form.activate}
      </Button>
    </form>
  );
}
