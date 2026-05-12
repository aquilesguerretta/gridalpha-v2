# Terminal typography

## The font lock

The terminal surface (Nest, Atlas, Analytics, Vault, and the shared
overlays that float above them) uses **Geist Mono** for labels, data,
badges, timestamps, prices, and section headers. There is no hedged
fallback stack on the terminal side — Geist Mono is loaded as a real
webfont through the `geist` npm package and is expected to be present.

```ts
import { F } from '@/design/tokens';
// F.mono = "'Geist Mono', 'Fira Code', monospace"
```

Inter (`F.sans`) belongs to the editorial / landing / auth surface
(`src/components/editorial/`). It does not appear on the terminal side.
Instrument Serif (`F.display`) is scoped to the `HeroNumber` primitive
and to `EditorialIdentity` (italic gray section identity lines). Nothing
else uses `F.display` in the terminal layer.

Forbidden on the terminal:
- `system-ui`, `-apple-system`, or any platform face
- Inter for terminal data or labels
- Generic fallback stacks like `'Inter', system-ui, sans-serif`
- Bare `monospace` without the Geist Mono primary

## Size scale

| Size | Use |
| --- | --- |
| **9px / 10px** | Metadata, axis tick labels, secondary unit suffixes. All-caps with letter-spacing 0.10em–0.18em. |
| **11px / 12px** | Body data, table cells, badge text. F.mono caps for labels (`textTransform: uppercase`, `letterSpacing: 0.12em`). |
| **13px** | Emphasis values, table primary column, inline data values. |
| **14px** | Section headers in `F.mono` caps. |
| **16px+** | Reserved for hero numbers only (`HeroNumber` primitive, sizes 32 / 56 / 96 / 160). |

Never invent an intermediate size (e.g. 13.5px, 15px). The scale stays
discrete.

## tabular-nums is required on numeric data

Every element that renders a number — LMP, MW, percent, count,
timestamp — sets `fontVariantNumeric: 'tabular-nums'`. This keeps
columns aligned and prevents jitter when a value updates by one digit
in the ones place.

```tsx
<span
  style={{
    fontFamily: F.mono,
    fontVariantNumeric: 'tabular-nums',
  }}
>
  {price.toFixed(2)}
</span>
```

A numeric value rendered without `tabular-nums` is a defect, not a
preference.

## Casing

| Context | Casing |
| --- | --- |
| Terminal labels, badges, section eyebrows | `UPPERCASE` with letter-spacing 0.10em–0.18em |
| Data values | Render as data (`$35.90`, `WEST HUB`, `2026-04-25`) |
| Prose body (rare on terminal) | Sentence case |
| Anywhere | **Never Title Case** for UI labels |

Title Case is a SaaS / marketing convention. It does not appear in the
terminal layer.

## Line height

| Element | line-height |
| --- | --- |
| Hero numbers (HeroNumber, MetricTile values) | 1.0–1.2 |
| Body prose | 1.4–1.5 |
| Small-caps labels | 1.0 |
| Editorial identity lines (italic gray serif) | 1.2 (hero) / 1.3 (section) |

## Numeric precision

| Quantity | Format |
| --- | --- |
| Dollars / $/MWh | Two decimals, no thousands separator below $1,000 (`$35.90`, `$612.40`). With separator above (`$4,250`). |
| Percent | One decimal (`14.3%`). Zero decimals when the value is a coarse status (`STALE 4m`). |
| MW / GW / MWh | Integer when ≥ 100. One decimal when smaller (`22.4 GW`, `145.4 GW`, `7 MW`). |
| σ (sigma) | One decimal with the σ glyph (`4.2σ`). Negative sign for downside (`-3.1σ`). |
| Time of day | `HH:MM` 24-hour, never AM/PM (`09:05`, `14:00`). |
| Date | ISO-8601 date (`2026-04-25`) on terminal data; the editorial layer may use prose dates. |
| Currency abbreviations | `$1.8B`, `$14.7B`, `$269.92/MW-day`. Use the trader convention. |

No scientific notation in UI. If a value is too large for its slot,
abbreviate (`$1.8B`) — never `1.8e9`.

## Reference surfaces

Three terminal surfaces that exemplify the rules above.

### 1. `HeroLMPBlock.tsx` — `src/components/nest/trader/HeroLMPBlock.tsx`

The Trader Nest hero. Lines 106–134 show the canonical pattern:
`F.mono` eyebrows ("WEST HUB · LMP" in caps), `fontVariantNumeric:
'tabular-nums'` on the live LMP value, the `HeroNumber` primitive at
size 96–160 for the dominant figure. The italic gray serif identity
line ("Live.") sits at ~26px Instrument Serif via `EditorialIdentity
size="hero"`.

### 2. `FuelMixTile.tsx` — `src/components/nest/trader/tiles/FuelMixTile.tsx`

The four-column small tile in the Trader Nest's lower row. Caps labels
("GAS", "NUCLEAR", "WIND") at 10px `F.mono` letter-spacing 0.10em.
Percentages render at 13px with `tabular-nums`. Zero whitespace between
related label/value pairs (4–8px gap, not 16px+).

### 3. `TimeTravelScrubber.tsx` — `src/components/atlas/TimeTravelScrubber.tsx`

The Grid Atlas time-travel control. Time labels, event-highlight
captions, and the "TIME TRAVEL ACTIVE" pill all use `F.mono` caps with
the established letter-spacing. The scrubber demonstrates that even
ephemeral controls follow the same typography lock.
