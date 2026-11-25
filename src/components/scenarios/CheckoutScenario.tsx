import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Check, LampDesk, Lock, RotateCcw } from 'lucide-react';
import { useMood } from '@/mood-recognition';
import type { CopyDict } from '@/i18n';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

type CheckoutScenarioProps = {
  copy: CopyDict;
  resetSignal: number;
  onStateChange: (state: 1 | 2 | 3) => void;
};

export function CheckoutScenario({ copy, resetSignal, onStateChange }: CheckoutScenarioProps) {
  const { mood, reaction } = useMood();
  const [agreed, setAgreed] = useState(false);
  const [slowMode, setSlowMode] = useState(false);
  const [status, setStatus] = useState<'idle' | 'processing' | 'paid'>('idle');
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setAgreed(false);
    setStatus('idle');
  }, [resetSignal]);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  const state: 1 | 2 | 3 =
    agreed || status !== 'idle'
      ? 1
      : mood === 'frustrated'
        ? 3
        : mood === 'confused' || mood === 'lost'
          ? 2
          : 1;

  useEffect(() => {
    onStateChange(state);
  }, [state, onStateChange]);

  const waitEscapeVisible = status === 'processing' && (mood === 'frustrated' || reaction >= 0.35);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!agreed || status !== 'idle') return;
    if (slowMode) {
      setStatus('processing');
      timerRef.current = window.setTimeout(() => {
        setStatus('paid');
        timerRef.current = null;
      }, 7000);
    } else {
      setStatus('paid');
    }
  };

  const handleCancelWait = () => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setStatus('idle');
  };

  if (status === 'paid') {
    return (
      <div className="flex w-full max-w-[440px] flex-col items-center gap-4 rounded-lg border border-border bg-card p-8 text-center">
        <div className="grid size-11 place-items-center rounded-md border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
          <Check className="size-5" />
        </div>
        <h2 className="text-base font-semibold tracking-tight">{copy.checkout.paidTitle}</h2>
        <Badge variant="outline" className="font-mono text-xs text-zinc-400">
          {copy.checkout.orderId}
        </Badge>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-2"
          onClick={() => {
            setAgreed(false);
            setStatus('idle');
          }}
        >
          <RotateCcw className="size-3.5" />
          <span>{copy.checkout.buyAgain}</span>
        </Button>
      </div>
    );
  }

  return (
    <form
      className="checkout-stage flex w-full max-w-[440px] flex-col gap-5 rounded-lg border border-border bg-card p-6"
      data-state={state}
      aria-busy={status === 'processing'}
      onSubmit={handleSubmit}
    >
      {/* Product Row */}
      <div className="flex items-center gap-3.5">
        <div
          className="grid size-11 shrink-0 place-items-center rounded-md border border-border bg-muted text-zinc-200"
          aria-hidden="true"
        >
          <LampDesk className="size-5" strokeWidth={1.6} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="truncate text-sm font-semibold tracking-tight text-foreground">
              {copy.checkout.item}
            </h2>
            <span className="font-mono text-[10px] text-zinc-500">{copy.checkout.sku}</span>
          </div>
          <div className="mt-0.5 truncate text-xs text-muted-foreground">
            {copy.checkout.variant}
          </div>
        </div>
        <div className="font-mono text-sm font-semibold tabular-nums text-foreground">
          {copy.checkout.price}
        </div>
      </div>

      <Separator />

      {/* Tabular Summary */}
      <div className="flex flex-col gap-2 text-xs">
        <div className="flex items-center justify-between text-muted-foreground">
          <span>{copy.checkout.subtotal}</span>
          <span className="font-mono tabular-nums">{copy.checkout.price}</span>
        </div>
        <div className="flex items-center justify-between text-muted-foreground">
          <span>{copy.checkout.shipping}</span>
          <span>{copy.checkout.free}</span>
        </div>
        <Separator className="my-1" />
        <div className="flex items-center justify-between text-sm font-semibold text-foreground">
          <span>{copy.checkout.total}</span>
          <span className="font-mono tabular-nums">{copy.checkout.price}</span>
        </div>
      </div>

      {/* Primary Action (pointer-events-auto when disabled so MoodRecognition reads blocked presses) */}
      <div className="flex flex-col gap-1.5">
        <Button
          type="submit"
          size="lg"
          disabled={!agreed || status === 'processing'}
          className={cn(
            'checkout-pay pay-btn h-11 w-full font-medium transition-opacity duration-200',
            'disabled:pointer-events-auto disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-950 disabled:opacity-55',
          )}
        >
          {status === 'processing' ? (
            <>
              <span className="spinner-ring" aria-hidden="true" />
              <span>{copy.checkout.processing}</span>
            </>
          ) : (
            <>
              {!agreed && <Lock className="size-3.5" />}
              <span>{copy.checkout.pay}</span>
            </>
          )}
        </Button>

        <div
          className={cn(
            'flex min-h-[22px] items-center justify-center transition-opacity duration-200',
            waitEscapeVisible ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0',
          )}
        >
          <button
            type="button"
            onClick={handleCancelWait}
            tabIndex={waitEscapeVisible ? 0 : -1}
            className="text-xs font-medium text-rose-400 underline-offset-4 hover:underline"
          >
            {copy.checkout.cancelWait}
          </button>
        </div>
      </div>

      {/* Unlocking Terms Control */}
      <label
        htmlFor="checkout-terms-cb"
        data-agreed={agreed ? 'true' : 'false'}
        className={cn(
          'checkout-terms flex cursor-pointer items-center gap-3 rounded-md border px-3.5 py-3 text-xs transition-all duration-200',
          agreed
            ? 'border-emerald-500/35 bg-emerald-500/5 text-zinc-100'
            : 'border-border bg-muted/60 text-zinc-400 hover:border-zinc-700',
        )}
      >
        <Checkbox
          id="checkout-terms-cb"
          checked={agreed}
          disabled={status === 'processing'}
          onCheckedChange={(checked) => setAgreed(checked === true)}
        />
        <span className="flex-1 leading-snug">{copy.checkout.terms}</span>
        <Badge
          variant="outline"
          className="checkout-cue shrink-0 border-rose-500/40 bg-rose-500/15 px-1.5 py-0 text-[10px] font-medium text-rose-300 opacity-0 transition-opacity duration-200"
        >
          {copy.checkout.unlockCue}
        </Badge>
      </label>

      {/* Slow Gateway Simulation Switch (excluded from mood reader) */}
      <div className="flex items-center justify-end gap-2 pt-1" data-mood-ignore="">
        <label
          htmlFor="slow-gateway-switch"
          className="cursor-pointer text-[11px] text-muted-foreground"
        >
          {copy.checkout.slowToggle}
        </label>
        <Switch
          id="slow-gateway-switch"
          checked={slowMode}
          onCheckedChange={setSlowMode}
        />
      </div>
    </form>
  );
}
