import { forwardRef, useState } from 'react';
import type { CSSProperties, InputHTMLAttributes, ReactNode } from 'react';
import { C, F, R } from '@/design/tokens';

type FormFieldProps = {
  label: string;
  rightLabel?: ReactNode;
  helperText?: string;
  error?: string;
  containerStyle?: CSSProperties;
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'className'>;

/**
 * Editorial form field. 48px input height, C.bgSurface background, 1px
 * C.borderDefault resting border, C.electricBlue focus ring, C.alertCritical
 * error state. Supports an optional `rightLabel` (used e.g. for the
 * forgot-password link on the login password row).
 */
export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(function FormField(
  { label, rightLabel, helperText, error, containerStyle, id, ...inputProps },
  ref,
) {
  const [focused, setFocused] = useState(false);
  const fieldId = id || `field-${label.replace(/\s+/g, '-').toLowerCase()}`;

  const borderColor = error
    ? C.alertCritical
    : focused
      ? C.electricBlue
      : 'rgba(255,255,255,0.10)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, ...containerStyle }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <label
          htmlFor={fieldId}
          style={{
            fontFamily: F.mono,
            fontSize: '11px',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: C.textSecondary,
          }}
        >
          {label}
        </label>
        {rightLabel && (
          <div
            style={{
              fontFamily: F.sans,
              fontSize: '12px',
              color: C.textSecondary,
            }}
          >
            {rightLabel}
          </div>
        )}
      </div>
      <input
        ref={ref}
        id={fieldId}
        onFocus={(e) => {
          setFocused(true);
          inputProps.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          inputProps.onBlur?.(e);
        }}
        {...inputProps}
        style={{
          height: '48px',
          padding: '0 14px',
          background: C.bgSurface,
          border: `1px solid ${borderColor}`,
          borderRadius: R.md,
          fontFamily: F.sans,
          fontSize: '15px',
          color: C.textPrimary,
          outline: 'none',
          transition: 'border-color 150ms ease-out',
          boxShadow: focused && !error ? `0 0 0 2px ${C.electricBlueWash}` : 'none',
        }}
      />
      {(error || helperText) && (
        <div
          style={{
            fontFamily: F.sans,
            fontSize: '12px',
            color: error ? C.alertCritical : C.textMuted,
          }}
        >
          {error || helperText}
        </div>
      )}
    </div>
  );
});
