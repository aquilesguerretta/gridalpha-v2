import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { C, F, R } from '@/design/tokens';
import { EDITORIAL_BG } from '@/design/editorial';
import { Eyebrow } from '@/components/editorial/Eyebrow';
import { DisplayHeading } from '@/components/editorial/DisplayHeading';
import { FormField } from '@/components/editorial/FormField';

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!email.includes('@')) next.email = 'Enter a valid email.';
    if (password.length < 1) next.password = 'Enter your password.';
    setErrors(next);
    if (Object.keys(next).length === 0) {
      // TODO: Replace with Supabase auth post-VPS migration
      navigate('/nest', { state: { fromAuth: true } });
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: 440 }}>
      <Eyebrow>SIGN IN</Eyebrow>
      <div style={{ marginTop: 16 }}>
        <DisplayHeading line1="Welcome back." />
      </div>
      <p
        style={{
          marginTop: 16,
          fontFamily: F.sans,
          fontSize: 15,
          lineHeight: 1.6,
          color: C.textSecondary,
        }}
      >
        Open the Terminal. Continue where you left off.
      </p>

      <form
        onSubmit={handleSubmit}
        style={{ marginTop: 48, display: 'flex', flexDirection: 'column', gap: 20 }}
      >
        <FormField
          label="Email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
        />
        <FormField
          label="Password"
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          rightLabel={
            <a
              href="#"
              style={{
                fontFamily: F.sans,
                fontSize: 12,
                color: C.electricBlue,
                textDecoration: 'none',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
              onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
            >
              Forgot password?
            </a>
          }
        />
        <PrimaryButton type="submit">Sign in</PrimaryButton>
      </form>

      <OrDivider />

      <div
        style={{
          marginTop: 20,
          textAlign: 'center',
          fontFamily: F.sans,
          fontSize: 14,
          color: C.textSecondary,
        }}
      >
        New to GridAlpha?{' '}
        <Link
          to="/signup"
          className="group inline-flex items-center gap-1"
          style={{ color: C.electricBlue, textDecoration: 'none' }}
        >
          <span>Create an account</span>
          <span className="transition-transform duration-150 group-hover:translate-x-1">→</span>
        </Link>
      </div>
    </div>
  );
}

export function PrimaryButton({
  children,
  onClick,
  type = 'button',
  disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  disabled?: boolean;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="group"
      style={{
        height: '48px',
        padding: '0 20px',
        background: disabled ? 'rgba(59,130,246,0.35)' : C.electricBlue,
        color: '#ffffff',
        border: 'none',
        borderRadius: R.lg,
        fontFamily: F.sans,
        fontSize: '15px',
        fontWeight: 500,
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        width: '100%',
        transition: 'filter 150ms ease-out',
        boxShadow: disabled
          ? 'none'
          : '0 0 0 1px rgba(59,130,246,0.4), 0 12px 24px -12px rgba(59,130,246,0.5)',
      }}
    >
      <span>{children}</span>
      <span
        aria-hidden
        style={{
          display: 'inline-block',
          transition: 'transform 150ms ease-out',
        }}
        className="group-hover:translate-x-1"
      >
        →
      </span>
    </button>
  );
}

function OrDivider() {
  return (
    <div
      style={{
        position: 'relative',
        marginTop: 32,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div style={{ width: '40%', height: 1, background: 'rgba(255,255,255,0.06)' }} />
      <span
        style={{
          position: 'absolute',
          background: EDITORIAL_BG,
          padding: '0 10px',
          fontFamily: F.mono,
          fontSize: 10,
          letterSpacing: '0.14em',
          color: C.textMuted,
        }}
      >
        OR
      </span>
    </div>
  );
}
