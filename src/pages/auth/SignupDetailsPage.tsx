import { useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { C, F, R } from '@/design/tokens';
import { Eyebrow } from '@/components/editorial/Eyebrow';
import { DisplayHeading } from '@/components/editorial/DisplayHeading';
import { FormField } from '@/components/editorial/FormField';
import { useAuthStore, type ProfileType, type ProfileDetails } from '@/stores/authStore';
import { PrimaryButton } from './LoginPage';
import { ProgressDots } from './SignupCredentialsPage';

/* ─────────────────────── Option data ─────────────────────── */

type Option = { value: string; label: string; disabled?: boolean };

const PJM_ZONES: Option[] = [
  'WEST HUB', 'COMED', 'AEP', 'ATSI', 'DAY', 'DEOK', 'DUQ', 'DOMINION', 'DPL', 'EKPC',
  'PPL', 'PECO', 'PSEG', 'JCPL', 'PEPCO', 'BGE', 'METED', 'PENELEC', 'RECO', 'OVEC',
].map((z) => ({ value: z, label: z }));

const ZONES_WITH_COMING: Option[] = [
  ...PJM_ZONES,
  { value: 'MISO', label: 'MISO (coming soon)', disabled: true },
  { value: 'ERCOT', label: 'ERCOT (coming soon)', disabled: true },
  { value: 'CAISO', label: 'CAISO (coming soon)', disabled: true },
];

const toOpts = (xs: string[]): Option[] => xs.map((x) => ({ value: x, label: x }));

/* ─────────────────────── Inline Dropdown ─────────────────────── */

type DropdownProps = {
  label: string;
  value?: string;
  onChange: (v: string) => void;
  options: Option[];
  helperText?: string;
  error?: string;
  placeholder?: string;
};

function Dropdown({ label, value, onChange, options, helperText, error, placeholder = 'Select…' }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  const selected = options.find((o) => o.value === value);

  const borderColor = error
    ? C.alertCritical
    : focused || open
      ? C.electricBlue
      : 'rgba(255,255,255,0.10)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div
        style={{
          fontFamily: F.mono,
          fontSize: 11,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: C.textSecondary,
        }}
      >
        {label}
      </div>
      <div ref={ref} style={{ position: 'relative' }}>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false);
            setTimeout(() => setOpen(false), 120);
          }}
          style={{
            width: '100%',
            height: 48,
            padding: '0 14px',
            background: C.bgSurface,
            border: `1px solid ${borderColor}`,
            borderRadius: R.md,
            fontFamily: F.sans,
            fontSize: 15,
            color: selected ? C.textPrimary : C.textMuted,
            textAlign: 'left',
            cursor: 'pointer',
            outline: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: focused && !error ? `0 0 0 2px ${C.electricBlueWash}` : 'none',
            transition: 'border-color 150ms ease-out',
          }}
        >
          <span>{selected?.label ?? placeholder}</span>
          <span
            aria-hidden
            style={{
              fontFamily: F.mono,
              fontSize: 10,
              color: C.textSecondary,
              transform: open ? 'rotate(180deg)' : 'none',
              transition: 'transform 150ms ease-out',
            }}
          >
            ▾
          </span>
        </button>
        {open && (
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 4px)',
              left: 0,
              right: 0,
              maxHeight: 260,
              overflowY: 'auto',
              background: C.bgElevated,
              border: '1px solid rgba(255,255,255,0.10)',
              borderRadius: R.md,
              boxShadow: '0 18px 36px -18px rgba(0,0,0,0.6)',
              zIndex: 10,
              padding: 4,
            }}
          >
            {options.map((o) => {
              const isSelected = o.value === value;
              return (
                <button
                  key={o.value}
                  type="button"
                  disabled={o.disabled}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    if (o.disabled) return;
                    onChange(o.value);
                    setOpen(false);
                  }}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    background: isSelected ? 'rgba(59,130,246,0.10)' : 'transparent',
                    border: 'none',
                    borderRadius: R.sm,
                    color: o.disabled ? C.textMuted : C.textPrimary,
                    fontFamily: F.sans,
                    fontSize: 14,
                    textAlign: 'left',
                    cursor: o.disabled ? 'not-allowed' : 'pointer',
                    opacity: o.disabled ? 0.5 : 1,
                  }}
                >
                  {o.label}
                </button>
              );
            })}
          </div>
        )}
      </div>
      {(error || helperText) && (
        <div
          style={{
            fontFamily: F.sans,
            fontSize: 12,
            color: error ? C.alertCritical : C.textMuted,
          }}
        >
          {error || helperText}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────── Inline MultiSelect ─────────────────────── */

type MultiSelectProps = {
  label: string;
  values: string[];
  onChange: (v: string[]) => void;
  options: Option[];
  helperText?: string;
  error?: string;
};

function MultiSelect({ label, values, onChange, options, helperText, error }: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);

  const borderColor = error
    ? C.alertCritical
    : focused || open
      ? C.electricBlue
      : 'rgba(255,255,255,0.10)';

  const toggle = (v: string) => {
    if (values.includes(v)) onChange(values.filter((x) => x !== v));
    else onChange([...values, v]);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div
        style={{
          fontFamily: F.mono,
          fontSize: 11,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: C.textSecondary,
        }}
      >
        {label}
      </div>
      <div style={{ position: 'relative' }}>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false);
            setTimeout(() => setOpen(false), 120);
          }}
          style={{
            width: '100%',
            minHeight: 48,
            padding: values.length > 0 ? '8px 12px' : '0 14px',
            background: C.bgSurface,
            border: `1px solid ${borderColor}`,
            borderRadius: R.md,
            fontFamily: F.sans,
            fontSize: 15,
            color: values.length ? C.textPrimary : C.textMuted,
            textAlign: 'left',
            cursor: 'pointer',
            outline: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            flexWrap: 'wrap',
            boxShadow: focused && !error ? `0 0 0 2px ${C.electricBlueWash}` : 'none',
            transition: 'border-color 150ms ease-out',
          }}
        >
          {values.length === 0 && <span>Select all that apply…</span>}
          {values.map((v) => (
            <span
              key={v}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggle(v);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '3px 8px',
                background: 'rgba(59,130,246,0.12)',
                border: `1px solid ${C.electricBlue}`,
                borderRadius: R.sm,
                fontFamily: F.mono,
                fontSize: 11,
                letterSpacing: '0.08em',
                color: C.electricBlue,
              }}
            >
              {v}
              <span aria-hidden>×</span>
            </span>
          ))}
        </button>
        {open && (
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 4px)',
              left: 0,
              right: 0,
              maxHeight: 280,
              overflowY: 'auto',
              background: C.bgElevated,
              border: '1px solid rgba(255,255,255,0.10)',
              borderRadius: R.md,
              boxShadow: '0 18px 36px -18px rgba(0,0,0,0.6)',
              zIndex: 10,
              padding: 4,
            }}
          >
            {options.map((o) => {
              const isOn = values.includes(o.value);
              return (
                <button
                  key={o.value}
                  type="button"
                  disabled={o.disabled}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    if (o.disabled) return;
                    toggle(o.value);
                  }}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    background: isOn ? 'rgba(59,130,246,0.12)' : 'transparent',
                    border: 'none',
                    borderRadius: R.sm,
                    color: o.disabled ? C.textMuted : C.textPrimary,
                    fontFamily: F.sans,
                    fontSize: 14,
                    textAlign: 'left',
                    cursor: o.disabled ? 'not-allowed' : 'pointer',
                    opacity: o.disabled ? 0.5 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span>{o.label}</span>
                  {isOn && <span style={{ color: C.electricBlue, fontFamily: F.mono, fontSize: 12 }}>✓</span>}
                </button>
              );
            })}
          </div>
        )}
      </div>
      {(error || helperText) && (
        <div
          style={{
            fontFamily: F.sans,
            fontSize: 12,
            color: error ? C.alertCritical : C.textMuted,
          }}
        >
          {error || helperText}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────── Textarea ─────────────────────── */

function Textarea({
  label,
  value,
  onChange,
  placeholder,
  helperText,
  error,
  rows = 4,
}: {
  label: string;
  value?: string;
  onChange: (v: string) => void;
  placeholder?: string;
  helperText?: string;
  error?: string;
  rows?: number;
}) {
  const [focused, setFocused] = useState(false);
  const borderColor = error
    ? C.alertCritical
    : focused
      ? C.electricBlue
      : 'rgba(255,255,255,0.10)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div
        style={{
          fontFamily: F.mono,
          fontSize: 11,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: C.textSecondary,
        }}
      >
        {label}
      </div>
      <textarea
        value={value ?? ''}
        rows={rows}
        placeholder={placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: '100%',
          padding: '12px 14px',
          background: C.bgSurface,
          border: `1px solid ${borderColor}`,
          borderRadius: R.md,
          fontFamily: F.sans,
          fontSize: 15,
          lineHeight: 1.5,
          color: C.textPrimary,
          outline: 'none',
          resize: 'vertical',
          transition: 'border-color 150ms ease-out',
          boxShadow: focused && !error ? `0 0 0 2px ${C.electricBlueWash}` : 'none',
        }}
      />
      {(error || helperText) && (
        <div style={{ fontFamily: F.sans, fontSize: 12, color: error ? C.alertCritical : C.textMuted }}>
          {error || helperText}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────── Form variants ─────────────────────── */

type FormState = ProfileDetails;
type Errors = Record<string, string>;
type FormProps = {
  state: FormState;
  set: (patch: FormState) => void;
  errors: Errors;
};

const strVal = (s: FormState, key: string): string => {
  const v = s[key];
  return typeof v === 'string' ? v : '';
};

const arrVal = (s: FormState, key: string): string[] => {
  const v = s[key];
  return Array.isArray(v) ? v : [];
};

function EveryoneForm({ state, set, errors }: FormProps) {
  return (
    <>
      <FormField
        label="Organization (optional)"
        placeholder="Company or team"
        value={strVal(state, 'org')}
        onChange={(e) => set({ org: e.target.value })}
        helperText="Where you work, if it's relevant."
      />
      <FormField
        label="Location"
        placeholder="State College, USA"
        value={strVal(state, 'location')}
        onChange={(e) => set({ location: e.target.value })}
        helperText="City and country. Sets your time zone."
        error={errors.location}
      />
      <Textarea
        label="What are you hoping to watch?"
        placeholder="Describe what matters to you about energy markets. We use this to prioritize your default view."
        rows={5}
        value={strVal(state, 'watch')}
        onChange={(v) => set({ watch: v })}
      />
    </>
  );
}

function TraderForm({ state, set, errors }: FormProps) {
  return (
    <>
      <FormField
        label="Firm"
        placeholder="Your trading entity"
        value={strVal(state, 'firm')}
        onChange={(e) => set({ firm: e.target.value })}
        helperText="Your employer or trading entity. Private to you."
        error={errors.firm}
      />
      <Dropdown
        label="Seat"
        value={strVal(state, 'seat')}
        onChange={(v) => set({ seat: v })}
        options={toOpts(['Prop trader', 'Market maker', 'Hedge fund', 'Utility desk', 'Power marketer', 'Independent', 'Other'])}
        error={errors.seat}
      />
      <MultiSelect
        label="Zones you trade"
        values={arrVal(state, 'zones')}
        onChange={(v) => set({ zones: v })}
        options={ZONES_WITH_COMING}
        helperText="Select all that apply. These become your default basis dashboard."
        error={errors.zones}
      />
      <MultiSelect
        label="What you trade"
        values={arrVal(state, 'instruments')}
        onChange={(v) => set({ instruments: v })}
        options={toOpts(['Day-ahead energy', 'Real-time energy', 'Basis', 'Spark spread', 'Heat rate', 'FTRs', 'Capacity', 'Ancillary services'])}
      />
      <Dropdown
        label="Alert preference"
        value={strVal(state, 'alerts')}
        onChange={(v) => set({ alerts: v })}
        options={toOpts(['Every market move', 'Material moves only', 'Only my zones', 'Only my positions', 'Minimal'])}
      />
    </>
  );
}

function AnalystForm({ state, set, errors }: FormProps) {
  return (
    <>
      <FormField
        label="Organization"
        value={strVal(state, 'org')}
        onChange={(e) => set({ org: e.target.value })}
        helperText="Firm or university."
        error={errors.org}
      />
      <Dropdown
        label="Role"
        value={strVal(state, 'role')}
        onChange={(v) => set({ role: v })}
        options={toOpts(['Market analyst', 'Research analyst', 'Consultant', 'Academic', 'Journalist', 'Other'])}
        error={errors.role}
      />
      <MultiSelect
        label="Coverage areas"
        values={arrVal(state, 'coverage')}
        onChange={(v) => set({ coverage: v })}
        options={toOpts(['Wholesale power', 'Capacity markets', 'FTRs', 'Renewables', 'Storage', 'Gas-power nexus', 'Policy', 'Transmission'])}
      />
      <Dropdown
        label="Reporting cadence"
        value={strVal(state, 'cadence')}
        onChange={(v) => set({ cadence: v })}
        options={toOpts(['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Ad hoc'])}
      />
      <Dropdown
        label="Primary output"
        value={strVal(state, 'output')}
        onChange={(v) => set({ output: v })}
        options={toOpts(['PowerPoint decks', 'Written reports', 'Internal dashboards', 'Client memos', 'Academic papers', 'Other'])}
      />
    </>
  );
}

function StorageForm({ state, set, errors }: FormProps) {
  return (
    <>
      <FormField
        label="Organization"
        value={strVal(state, 'org')}
        onChange={(e) => set({ org: e.target.value })}
        error={errors.org}
      />
      <Dropdown
        label="Portfolio size"
        value={strVal(state, 'portfolio')}
        onChange={(v) => set({ portfolio: v })}
        options={toOpts(['1 asset', '2-5 assets', '6-20 assets', '21+ assets', 'Developing first project'])}
        error={errors.portfolio}
      />
      <FormField
        label="Total nameplate (MW)"
        type="number"
        value={strVal(state, 'nameplate')}
        onChange={(e) => set({ nameplate: e.target.value })}
        helperText="Across all assets. Approximate is fine."
      />
      <Dropdown
        label="Primary zone"
        value={strVal(state, 'zone')}
        onChange={(v) => set({ zone: v })}
        options={PJM_ZONES}
        helperText="Where most of your MW lives. You can add more assets later."
        error={errors.zone}
      />
      <Dropdown
        label="Dispatch strategy"
        value={strVal(state, 'strategy')}
        onChange={(v) => set({ strategy: v })}
        options={toOpts(['Energy arbitrage focus', 'Ancillary services focus', 'Capacity market focus', 'Blended'])}
      />
      <Dropdown
        label="Asset duration"
        value={strVal(state, 'duration')}
        onChange={(v) => set({ duration: v })}
        options={toOpts(['1 hour', '2 hour', '4 hour', '6 hour', '8+ hour', 'Mixed'])}
      />
    </>
  );
}

function IndustrialForm({ state, set, errors }: FormProps) {
  return (
    <>
      <FormField
        label="Company"
        value={strVal(state, 'company')}
        onChange={(e) => set({ company: e.target.value })}
        error={errors.company}
      />
      <Dropdown
        label="Industry"
        value={strVal(state, 'industry')}
        onChange={(v) => set({ industry: v })}
        options={toOpts(['Mining', 'Data center', 'Manufacturing', 'Agriculture', 'Cold storage', 'Cement', 'Steel', 'Chemicals', 'Other heavy industry', 'Other'])}
        error={errors.industry}
      />
      <FormField
        label="Facility location"
        value={strVal(state, 'location')}
        onChange={(e) => set({ location: e.target.value })}
        helperText="City and state. We map this to your grid region."
        error={errors.location}
      />
      <Dropdown
        label="Annual energy spend"
        value={strVal(state, 'spend')}
        onChange={(v) => set({ spend: v })}
        options={toOpts(['Under $500k', '$500k-$2M', '$2M-$10M', '$10M-$50M', '$50M+'])}
      />
      <FormField
        label="Peak demand (MW)"
        type="number"
        value={strVal(state, 'peak')}
        onChange={(e) => set({ peak: e.target.value })}
        helperText="Approximate. Helps us model your demand charge exposure."
      />
      <Dropdown
        label="Operational pattern"
        value={strVal(state, 'pattern')}
        onChange={(v) => set({ pattern: v })}
        options={toOpts(['24/7 steady load', 'Daytime shift', 'Seasonal', 'Batch process', 'Highly variable'])}
      />
      <MultiSelect
        label="Existing assets"
        values={arrVal(state, 'assets')}
        onChange={(v) => set({ assets: v })}
        options={toOpts(['Solar onsite', 'Battery storage', 'Backup generation', 'Demand response enrolled', 'None yet'])}
      />
    </>
  );
}

function StudentForm({ state, set, errors }: FormProps) {
  return (
    <>
      <FormField
        label="School"
        value={strVal(state, 'school')}
        onChange={(e) => set({ school: e.target.value })}
        helperText="University or program."
        error={errors.school}
      />
      <Dropdown
        label="Major"
        value={strVal(state, 'major')}
        onChange={(v) => set({ major: v })}
        options={toOpts(['Energy Business', 'Economics', 'Engineering (any)', 'Finance', 'Environmental Science', 'Mathematics', 'Computer Science', 'Public Policy', 'Other', 'Self-taught'])}
        error={errors.major}
      />
      <Dropdown
        label="Class year"
        value={strVal(state, 'year')}
        onChange={(v) => set({ year: v })}
        options={toOpts(['Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate', 'Recent grad', 'Other'])}
      />
      <Dropdown
        label="Target role"
        value={strVal(state, 'target')}
        onChange={(v) => set({ target: v })}
        options={toOpts(['Power trader', 'Energy analyst', 'Consulting', 'Utility planner', 'Developer / IPP', 'Research', 'Regulatory', 'Still exploring'])}
      />
      <Dropdown
        label="Experience level"
        value={strVal(state, 'experience')}
        onChange={(v) => set({ experience: v })}
        options={toOpts(['First energy course', 'Multiple courses', 'Internship experience', 'Professional experience in adjacent field', 'Career switcher'])}
      />
      <MultiSelect
        label="What you want from GridAlpha"
        values={arrVal(state, 'wants')}
        onChange={(v) => set({ wants: v })}
        options={toOpts(['Learn the basics', 'Interview prep', 'Real market intuition', 'Historical sandbox practice', 'Network with peers', 'Portfolio project material'])}
      />
    </>
  );
}

function DeveloperForm({ state, set, errors }: FormProps) {
  return (
    <>
      <FormField
        label="Organization"
        value={strVal(state, 'org')}
        onChange={(e) => set({ org: e.target.value })}
        error={errors.org}
      />
      <Dropdown
        label="Role"
        value={strVal(state, 'role')}
        onChange={(v) => set({ role: v })}
        options={toOpts(['Developer', 'Financing', 'Engineering', 'Asset management', 'Corporate strategy', 'Executive', 'Founder'])}
        error={errors.role}
      />
      <MultiSelect
        label="Technology focus"
        values={arrVal(state, 'tech')}
        onChange={(v) => set({ tech: v })}
        options={toOpts(['Battery storage', 'Solar', 'Wind', 'Hybrid solar+storage', 'Gas peakers', 'Nuclear', 'Transmission', 'Demand-side'])}
      />
      <Dropdown
        label="Pipeline size"
        value={strVal(state, 'pipeline')}
        onChange={(v) => set({ pipeline: v })}
        options={toOpts(['First project', '2-5 projects', '6-20 projects', '21+ projects', 'Portfolio acquisition'])}
      />
      <Dropdown
        label="Typical project MW"
        value={strVal(state, 'projectMw')}
        onChange={(v) => set({ projectMw: v })}
        options={toOpts(['Under 10 MW', '10-50 MW', '50-200 MW', '200-500 MW', '500+ MW'])}
      />
      <Dropdown
        label="Stage focus"
        value={strVal(state, 'stage')}
        onChange={(v) => set({ stage: v })}
        options={toOpts(['Early development', 'Interconnection queue', 'Permitting', 'Construction', 'Operations', 'Acquisitions'])}
      />
      <MultiSelect
        label="Target markets"
        values={arrVal(state, 'markets')}
        onChange={(v) => set({ markets: v })}
        options={ZONES_WITH_COMING}
      />
    </>
  );
}

/* ─────────────────────── Heads ─────────────────────── */

const HEADS: Record<ProfileType, { eyebrow: string; title: string; sub: string }> = {
  everyone: { eyebrow: 'EVERYONE', title: 'Tell us the basics.', sub: 'Just enough to shape your feed.' },
  trader: { eyebrow: 'TRADER', title: 'Set up your desk.', sub: "We'll tune alerts and the default layout to your position book." },
  analyst: { eyebrow: 'ANALYST', title: 'Set up your research.', sub: "We'll tailor exports and report templates to your workflow." },
  storage: { eyebrow: 'STORAGE OPERATOR', title: 'Register your fleet.', sub: 'The terminal optimizes around your actual assets. Add more later in settings.' },
  industrial: { eyebrow: 'INDUSTRIAL CONSUMER', title: 'Profile your facility.', sub: 'The terminal tracks your cost stack against live grid conditions. Add more facilities later.' },
  student: { eyebrow: 'STUDENT', title: 'Set up your study.', sub: "We'll tailor the explainer, sandbox, and interview prep to where you are in your journey." },
  developer: { eyebrow: 'DEVELOPER · IPP', title: "Tell us what you're building.", sub: 'The terminal surfaces zone economics, queue intelligence, and congestion patterns tuned to your pipeline.' },
};

/* ─────────────────────── Validation ─────────────────────── */

function validateForProfile(profile: ProfileType, d: FormState): Errors {
  const e: Errors = {};
  const req = (key: string, msg: string) => {
    const v = d[key];
    if (!v || (typeof v === 'string' && !v.trim())) e[key] = msg;
  };
  const reqArr = (key: string, msg: string) => {
    const v = d[key];
    if (!Array.isArray(v) || v.length === 0) e[key] = msg;
  };

  switch (profile) {
    case 'everyone':
      req('location', 'Location is required.');
      break;
    case 'trader':
      req('firm', 'Firm is required.');
      req('seat', 'Please select a seat.');
      reqArr('zones', 'Select at least one zone.');
      break;
    case 'analyst':
      req('org', 'Organization is required.');
      req('role', 'Please select a role.');
      break;
    case 'storage':
      req('org', 'Organization is required.');
      req('portfolio', 'Please select portfolio size.');
      req('zone', 'Please select primary zone.');
      break;
    case 'industrial':
      req('company', 'Company is required.');
      req('industry', 'Please select an industry.');
      req('location', 'Facility location is required.');
      break;
    case 'student':
      req('school', 'School is required.');
      req('major', 'Please select a major.');
      break;
    case 'developer':
      req('org', 'Organization is required.');
      req('role', 'Please select a role.');
      break;
  }
  return e;
}

/* ─────────────────────── Page ─────────────────────── */

export function SignupDetailsPage() {
  const navigate = useNavigate();
  const email = useAuthStore((s) => s.email);
  const selectedProfile = useAuthStore((s) => s.selectedProfile);
  const existingDetails = useAuthStore((s) => s.profileDetails);
  const setProfileDetails = useAuthStore((s) => s.setProfileDetails);

  const [state, setState] = useState<FormState>(existingDetails);
  const [errors, setErrors] = useState<Errors>({});

  // Guards — rendered before any further hooks run on later renders where
  // they return early so the hook order stays stable.
  if (email === '') return <Navigate to="/signup" replace />;
  if (!selectedProfile) return <Navigate to="/signup/profile" replace />;

  const profile: ProfileType = selectedProfile;

  const set = (patch: FormState) => {
    setState((s) => ({ ...s, ...patch }));
    setErrors((curr) => {
      const next = { ...curr };
      Object.keys(patch).forEach((k) => {
        if (next[k]) delete next[k];
      });
      return next;
    });
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next = validateForProfile(profile, state);
    setErrors(next);
    if (Object.keys(next).length === 0) {
      setProfileDetails(state);
      // TODO: POST profile to API post-VPS
      navigate('/signup/success');
    }
  };

  const head = HEADS[profile];

  const Form =
    profile === 'trader' ? TraderForm :
    profile === 'analyst' ? AnalystForm :
    profile === 'storage' ? StorageForm :
    profile === 'industrial' ? IndustrialForm :
    profile === 'student' ? StudentForm :
    profile === 'developer' ? DeveloperForm :
    EveryoneForm;

  return (
    <div style={{ width: '100%', maxWidth: 520 }}>
      <ProgressDots step={3} label="STEP 3 OF 3 · DETAILS" />

      <div style={{ marginTop: 40 }}>
        <Eyebrow>{head.eyebrow}</Eyebrow>
        <div style={{ marginTop: 16 }}>
          <DisplayHeading line1={head.title} />
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
          {head.sub}
        </p>
      </div>

      <form onSubmit={submit} style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 20 }}>
        <Form state={state} set={set} errors={errors} />

        <div
          className="flex items-center justify-between gap-4"
          style={{ marginTop: 12 }}
        >
          <GhostButton onClick={() => navigate('/signup/profile')}>Back</GhostButton>
          <div style={{ flex: 1 }}>
            <PrimaryButton type="submit">Enter the Terminal</PrimaryButton>
          </div>
        </div>
      </form>
    </div>
  );
}

function GhostButton({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  const style: CSSProperties = {
    height: 48,
    padding: '0 20px',
    background: 'transparent',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: R.lg,
    color: C.textSecondary,
    fontFamily: F.sans,
    fontSize: 15,
    cursor: 'pointer',
  };
  return (
    <button type="button" onClick={onClick} style={style}>
      {children}
    </button>
  );
}
