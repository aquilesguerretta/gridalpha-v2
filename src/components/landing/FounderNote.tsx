import { C, F } from '@/design/tokens';
import { Reveal } from './Reveal';

export function FounderNote() {
  return (
    <section className="relative w-full px-8 py-32" style={{ maxWidth: '680px', margin: '0 auto' }}>
      <Reveal>
        <div className="flex flex-col items-center text-center">
          <div
            style={{
              width: 96,
              height: 96,
              borderRadius: '50%',
              border: '1px solid rgba(255,255,255,0.12)',
              background:
                'radial-gradient(circle at 35% 30%, rgba(59,130,246,0.15), rgba(10,10,15,0.8) 70%)',
            }}
          />
          <div
            style={{
              marginTop: 20,
              fontFamily: F.mono,
              fontSize: 11,
              letterSpacing: '0.12em',
              color: 'rgba(255,255,255,0.45)',
            }}
          >
            FOUNDER NOTE
          </div>
        </div>
      </Reveal>

      <Reveal delay={120}>
        <p
          style={{
            marginTop: 32,
            fontFamily: F.display,
            fontStyle: 'italic',
            fontSize: 24,
            lineHeight: 1.5,
            color: 'rgba(255,255,255,0.88)',
            textAlign: 'center',
          }}
        >
          &ldquo;I studied energy markets and realized the tools the industry runs on cost more
          than most people&rsquo;s salary. I wanted to watch the grid while I was learning how it
          worked, and the door was closed. So I built the door open. It turned out a lot of
          other people wanted the same thing.&rdquo;
        </p>
      </Reveal>

      <Reveal delay={240}>
        <div className="flex flex-col items-center text-center" style={{ marginTop: 48 }}>
          <div style={{ fontFamily: F.sans, fontSize: 14, color: C.textPrimary }}>
            Aquiles Guerretta
          </div>
          <div
            style={{
              marginTop: 6,
              fontFamily: F.mono,
              fontSize: 11,
              letterSpacing: '0.08em',
              color: 'rgba(255,255,255,0.45)',
            }}
          >
            FOUNDER · STATE COLLEGE, PENNSYLVANIA
          </div>
        </div>
      </Reveal>
    </section>
  );
}
