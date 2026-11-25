import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Check, LampDesk, Lock, RotateCcw } from 'lucide-react';
import { useMood } from '../../mood-recognition';
import type { CopyDict } from '../../i18n';

type CheckoutScenarioProps = {
  copy: CopyDict;
  resetSignal: number;
};

export function CheckoutScenario({ copy, resetSignal }: CheckoutScenarioProps) {
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

  // Canonical 3-state pattern:
  // 1 neutral / unlocked, 2 confused or lost (locked Pay steps back),
  // 3 frustrated (locked Pay steps back + unlocking Terms illuminates forward)
  const state =
    agreed || status !== 'idle'
      ? 1
      : mood === 'frustrated'
        ? 3
        : mood === 'confused' || mood === 'lost'
          ? 2
          : 1;

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
      <div className="stage-card checkout-paid">
        <div className="paid-icon">
          <Check size={24} strokeWidth={2.4} />
        </div>
        <h2 className="stage-title">{copy.checkout.paidTitle}</h2>
        <div className="mono-pill">{copy.checkout.orderId}</div>
        <button
          type="button"
          className="btn-secondary"
          onClick={() => {
            setAgreed(false);
            setStatus('idle');
          }}
        >
          <RotateCcw size={15} />
          <span>{copy.checkout.buyAgain}</span>
        </button>
      </div>
    );
  }

  return (
    <form
      className="stage-card checkout-form"
      data-state={state}
      aria-busy={status === 'processing'}
      onSubmit={handleSubmit}
    >
      <div className="product-row">
        <div className="product-thumb" aria-hidden="true">
          <LampDesk size={24} strokeWidth={1.75} />
        </div>
        <div className="product-meta">
          <h2 className="product-name">{copy.checkout.item}</h2>
          <div className="product-variant">{copy.checkout.variant}</div>
        </div>
        <div className="product-price mono-num">{copy.checkout.price}</div>
      </div>

      <div className="summary-lines">
        <div className="summary-line">
          <span>{copy.checkout.subtotal}</span>
          <span className="mono-num">{copy.checkout.price}</span>
        </div>
        <div className="summary-line">
          <span>{copy.checkout.shipping}</span>
          <span>{copy.checkout.free}</span>
        </div>
        <div className="summary-line summary-total">
          <span>{copy.checkout.total}</span>
          <span className="mono-num">{copy.checkout.price}</span>
        </div>
      </div>

      <div className="pay-stack">
        <button
          type="submit"
          className="btn-primary pay-btn"
          disabled={!agreed || status === 'processing'}
        >
          {status === 'processing' ? (
            <>
              <span className="spinner" aria-hidden="true" />
              <span>{copy.checkout.processing}</span>
            </>
          ) : (
            <>
              {!agreed && <Lock size={15} className="lock-glyph" />}
              <span>{copy.checkout.pay}</span>
            </>
          )}
        </button>

        <div className="wait-escape-slot" data-visible={waitEscapeVisible ? 'true' : 'false'}>
          <button
            type="button"
            className="link-escape"
            onClick={handleCancelWait}
            tabIndex={waitEscapeVisible ? 0 : -1}
          >
            {copy.checkout.cancelWait}
          </button>
        </div>
      </div>

      <label className="terms-box" data-agreed={agreed ? 'true' : 'false'}>
        <input
          type="checkbox"
          checked={agreed}
          disabled={status === 'processing'}
          onChange={(e) => setAgreed(e.target.checked)}
        />
        <span className="terms-text">{copy.checkout.terms}</span>
        <span className="terms-cue">{copy.checkout.unlockCue}</span>
      </label>

      <div className="checkout-foot" data-mood-ignore="">
        <label className="micro-toggle">
          <input
            type="checkbox"
            checked={slowMode}
            onChange={(e) => setSlowMode(e.target.checked)}
          />
          <span>{copy.checkout.slowToggle}</span>
        </label>
      </div>
    </form>
  );
}
