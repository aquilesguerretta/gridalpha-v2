import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, ReactNode, ElementType } from 'react';

export function useInViewOnce<T extends HTMLElement>(threshold = 0.2) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

export function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const h = () => setReduced(mq.matches);
    mq.addEventListener?.('change', h);
    return () => mq.removeEventListener?.('change', h);
  }, []);
  return reduced;
}

type RevealProps = {
  children: ReactNode;
  delay?: number;
  as?: ElementType;
  style?: CSSProperties;
  className?: string;
};

export function Reveal({ children, delay = 0, as: As = 'div', style, className }: RevealProps) {
  const { ref, inView } = useInViewOnce<HTMLElement>(0.15);
  const reduced = useReducedMotion();
  const active = reduced ? true : inView;
  const Component = As as ElementType;
  return (
    <Component
      ref={ref as React.Ref<HTMLElement>}
      className={className}
      style={{
        ...style,
        opacity: active ? 1 : 0,
        transform: active ? 'translateY(0)' : 'translateY(16px)',
        transition: reduced
          ? 'none'
          : `opacity 400ms ease-out ${delay}ms, transform 400ms ease-out ${delay}ms`,
      }}
    >
      {children}
    </Component>
  );
}

export function CountUpInt({
  value,
  prefix = '',
  suffix = '',
  duration = 800,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
}) {
  const { ref, inView } = useInViewOnce<HTMLSpanElement>(0.4);
  const reduced = useReducedMotion();
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!inView) return;
    if (reduced) { setV(value); return; }
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setV(Math.round(eased * value));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value, duration, reduced]);
  return (
    <span ref={ref}>
      {prefix}
      {v.toLocaleString()}
      {suffix}
    </span>
  );
}
