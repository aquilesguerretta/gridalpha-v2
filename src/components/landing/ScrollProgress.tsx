import { useEffect, useState } from 'react';
import { C } from '@/design/tokens';

export function ScrollProgress() {
  const [p, setP] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const total = h.scrollHeight - h.clientHeight;
      setP(total > 0 ? h.scrollTop / total : 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <div
      aria-hidden
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 2,
        background: 'transparent',
        zIndex: 60,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          height: '100%',
          width: `${p * 100}%`,
          background: `${C.electricBlue}99`,
          transition: 'width 80ms linear',
        }}
      />
    </div>
  );
}
