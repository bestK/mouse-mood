import { useEffect, useRef } from 'react';

type ShadowTextProps = {
  value: string;
  className?: string;
};

/**
 * Renders high-frequency telemetry text inside an isolated shadow root so
 * 66 ms updates never trigger MutationObserver characterData records on
 * document.body (keeping the mood model's mut_rate feature unpolluted).
 */
export function ShadowText({ value, className }: ShadowTextProps) {
  const hostRef = useRef<HTMLSpanElement>(null);
  const shadowRef = useRef<ShadowRoot | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    if (!shadowRef.current) {
      shadowRef.current = host.shadowRoot ?? host.attachShadow({ mode: 'open' });
    }
    shadowRef.current.textContent = value;
  }, [value]);

  return <span ref={hostRef} className={className} aria-live="off" />;
}
