import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { C, F, R } from '@/design/tokens';
import { Eyebrow } from '@/components/editorial/Eyebrow';
import { DisplayHeading } from '@/components/editorial/DisplayHeading';
import { useAuthStore, type ProfileType } from '@/stores/authStore';
import { PrimaryButton } from './LoginPage';
import { ProgressDots } from './SignupCredentialsPage';

type Card = {
  id: ProfileType;
  code: string;
  name: string;
  quote: string;
  body: string;
};

const CARDS: Card[] = [
  { id: 'everyone', code: '00 · EVERYONE', name: 'Everyone', quote: 'I want the full picture.', body: 'The default configuration. Live LMP, spark spread, Peregrine feed, everything.' },
  { id: 'trader', code: '01 · TRADER', name: 'Trader', quote: 'I need the edge before the print.', body: 'Live LMP, DA/RT spread, basis, outages, alerts.' },
  { id: 'analyst', code: '02 · ANALYST', name: 'Analyst', quote: 'My decks need defensible numbers.', body: 'Clean nodal data, reproducible queries, exports.' },
  { id: 'storage', code: '03 · STORAGE OPERATOR', name: 'Storage Operator', quote: 'Every dispatch is a revenue decision.', body: 'Asset registration, bid optimization, attribution.' },
  { id: 'industrial', code: '04 · INDUSTRIAL CONSUMER', name: 'Industrial Consumer', quote: 'The bill is the third-largest line on my P&L.', body: 'Facility profile, tariff, cost intelligence.' },
  { id: 'student', code: '05 · STUDENT', name: 'Student', quote: 'Textbooks never show a real market clearing.', body: 'Live explainer, interview prep, concept map.' },
  { id: 'developer', code: '06 · DEVELOPER · IPP', name: 'Developer / IPP', quote: 'Siting a project is a twenty-year bet on a node.', body: 'Revenue history, queue intel, PPA benchmarks.' },
];

export function SignupProfilePage() {
  const navigate = useNavigate();
  const email = useAuthStore((s) => s.email);
  const selectedProfile = useAuthStore((s) => s.selectedProfile);
  const setProfile = useAuthStore((s) => s.setProfile);
  const advanceStep = useAuthStore((s) => s.advanceStep);

  const [selected, setSelected] = useState<ProfileType | null>(selectedProfile);
  const [hover, setHover] = useState<ProfileType | null>(null);

  useEffect(() => {
    setSelected(selectedProfile);
  }, [selectedProfile]);

  // Render-time guard — no flash-of-unguarded-content.
  if (email === '') {
    return <Navigate to="/signup" replace />;
  }

  const handleContinue = () => {
    if (!selected) return;
    setProfile(selected);
    advanceStep();
    navigate('/signup/details');
  };

  return (
    <div style={{ width: '100%', maxWidth: 1080 }}>
      <ProgressDots step={2} label="STEP 2 OF 3 · PROFILE" />

      <div style={{ marginTop: 40 }}>
        <Eyebrow>CHOOSE YOUR WORK</Eyebrow>
        <div style={{ marginTop: 16 }}>
          <DisplayHeading line1="Who are you" line2="in the market?" size={56} />
        </div>
        <p
          style={{
            marginTop: 16,
            maxWidth: 640,
            fontFamily: F.sans,
            fontSize: 16,
            lineHeight: 1.6,
            color: C.textSecondary,
          }}
        >
          Pick the one closest to what you do. Your terminal, your alerts, your feed configure
          around it. You can change this later.
        </p>
      </div>

      <div
        className="grid"
        style={{
          marginTop: 64,
          gap: 20,
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        }}
      >
        {CARDS.map((c, i) => {
          const isSelected = selected === c.id;
          const isHover = hover === c.id;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setSelected(c.id)}
              onMouseEnter={() => setHover(c.id)}
              onMouseLeave={() => setHover(null)}
              style={{
                position: 'relative',
                textAlign: 'left',
                width: '100%',
                minHeight: 200,
                padding: 24,
                background: isSelected
                  ? 'rgba(59,130,246,0.06)'
                  : isHover
                    ? 'rgba(31,31,40,0.8)'
                    : 'rgba(31,31,40,0.5)',
                border: `${isSelected ? 1.5 : 1}px solid ${
                  isSelected
                    ? C.electricBlue
                    : isHover
                      ? 'rgba(255,255,255,0.20)'
                      : 'rgba(255,255,255,0.08)'
                }`,
                borderRadius: R.xl,
                cursor: 'pointer',
                transition: 'background 150ms ease-out, border-color 150ms ease-out',
                display: 'flex',
                flexDirection: 'column',
                opacity: 0,
                transform: 'translateY(8px)',
                animation: `ga-card-rise 400ms ease-out ${i * 60}ms forwards`,
              }}
            >
              {isSelected && (
                <span
                  style={{
                    position: 'absolute',
                    top: 14,
                    right: 14,
                    fontFamily: F.mono,
                    fontSize: 14,
                    color: C.electricBlue,
                  }}
                >
                  ✓
                </span>
              )}
              <div
                style={{
                  fontFamily: F.mono,
                  fontSize: 10,
                  letterSpacing: '0.14em',
                  color: C.textSecondary,
                }}
              >
                {c.code}
              </div>
              <div
                style={{
                  marginTop: 16,
                  fontFamily: F.display,
                  fontStyle: 'italic',
                  fontSize: 18,
                  lineHeight: 1.3,
                  color: C.textPrimary,
                }}
              >
                &ldquo;{c.quote}&rdquo;
              </div>
              <div
                style={{
                  marginTop: 12,
                  fontFamily: F.sans,
                  fontSize: 13,
                  lineHeight: 1.5,
                  color: C.textSecondary,
                }}
              >
                {c.body}
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col items-center" style={{ marginTop: 48 }}>
        <div style={{ width: '100%', maxWidth: 360 }}>
          <PrimaryButton onClick={handleContinue} disabled={!selected}>
            Continue
          </PrimaryButton>
        </div>
        <div
          style={{
            marginTop: 16,
            fontFamily: F.sans,
            fontSize: 13,
            color: C.textMuted,
            textAlign: 'center',
          }}
        >
          You can reconfigure your terminal anytime from settings.
        </div>
      </div>

      <style>{`
        @keyframes ga-card-rise {
          to { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          button[style*="ga-card-rise"] { animation: none !important; opacity: 1 !important; transform: none !important; }
        }
      `}</style>
    </div>
  );
}
