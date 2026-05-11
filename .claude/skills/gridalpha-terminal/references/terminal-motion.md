# Terminal motion

## The default is no motion

A static terminal surface is the correct state. Motion is reserved for
**state changes** — never for decoration, never for "interest", never
for arrival.

## When motion is permitted

| Trigger | Example |
| --- | --- |
| Async state transition | Loading → loaded (Skeleton shimmer to data) |
| Live state shift | Live → stale → reconnecting (ConnectionStatusDot color + pulse) |
| Mode change in a single surface | Atlas live mode → time-travel mode → event-replay mode (the scrubber + map repaint) |
| Hover state on an interactive surface | Card border-top opacity 0.20 → 0.40 |
| Focus state on an input | Border color shift to `borderActive` |
| Disclosure | Overlay open → closed (AI Assistant, CommandPalette, AnnotationDrawer) |

Anything else — fade-in on page load, drift to draw attention, animated
hover scale, animated number tickers — is decorative and removed.

## Duration

| Class of change | Duration |
| --- | --- |
| Micro state (hover, focus, color shift) | **150ms** |
| Panel / overlay open or close | **200ms** |
| View transitions (route change, major mode swap) | **250–300ms** |

Never longer than 300ms for any single transition. Anything slower
reads as the system being unresponsive.

For ambient infinite animations (pulse, shimmer) the cycle length is
longer (1.5–2s) but the animation runs **only** when it communicates a
state. ConnectionStatusDot pulses when the connection is reconnecting;
when connected, it is static.

## Easing

`cubic-bezier(0.4, 0, 0.2, 1)` — Material-style ease-out. Use this
literal value everywhere. It is also acceptable to spell it `ease-out`
inline for terse cases (e.g. on the keyframes `animation` shorthand).

Forbidden easings:

- **spring**, **bounce**, **elastic** — too much character; reads as a consumer app
- **ease-in** alone (starts slow, ends fast) — feels delayed
- **ease-in-out** as the universal default — feels muddled; ease-out is sharper for state changes

## What can be animated

Animate only `opacity` and `transform`. Both compose cheaply on the
GPU and don't trigger layout. Specifically permitted:

- `opacity` for fades and pulses
- `transform: translate*` for slide-in panels
- `transform: scale` only for the hover state of a small icon button
  (rare; check whether a color shift achieves the same effect first)
- `background-color`, `border-color`, `color` for state-change tints
- `box-shadow` only for raised overlays (rare; CHROMA Wave 4 ships
  this on AnnotationDrawer)

Never animate `width`, `height`, `top`, `left`, `margin`, `padding`,
`grid-template-*`. Layout properties trigger reflow and don't read as
"snappy" — they read as the system struggling.

## Permitted ambient animations

Two infinite keyframes ship in `src/index.css`:

- `ga-skeleton-shimmer` — 1.6s linear-gradient sweep, used by every
  `Skeleton.*` primitive (line, block, circle, chart, hero number).
  Runs only while the underlying data is loading.
- `ga-connection-reconnect` — 1.2s ease-in-out alpha pulse 0.4 → 1
  → 0.4, used by `ConnectionStatusDot` only in its reconnecting state
  and reused by the simulator/optimizer loading-status dots.

A third `foundry-status-pulse` keyframe (defined inline in
`StatusDot.tsx`) pulses the `live` status dot on a 2s cycle.

These are the only ambient animations in the platform. Adding a new
infinite keyframe requires a state-change rationale.

## Anti-patterns

- **Entrance animations on page load.** No fade-in, no slide-up, no
  stagger. The page renders, the data appears.
- **Hover bounce on cards or buttons.** Hover communicates via color
  (border opacity, background) — not via geometry.
- **Scroll-triggered reveals (Framer Motion, Intersection Observer
  drift).** Distracting on a data-dense surface. The operator scrolls
  to read; revealing rows as they enter the viewport makes them
  unreadable.
- **Parallax.** Period.
- **Auto-scrolling carousels** of news, hero stories, anything.
- **Number tickers** that count up to the actual value. Render the
  value.
- **Slide-up confirmation toasts** that decorate. If a toast is
  needed, fade in (150ms) at a fixed position, fade out at 1.6s.
- **Loading spinners** that pre-empt the Skeleton primitive. Use
  Skeleton; loading state is data-shaped, not generic-spinner-shaped.

## Reference surfaces

### 1. `Skeleton.tsx` shimmer — `src/components/terminal/Skeleton.tsx`

The first-fetch placeholder primitive. Uses the `ga-skeleton-shimmer`
keyframes (defined in `src/index.css`) — an electric-blue band at 8%
alpha sweeping L→R at 1.6s on a `C.bgSurface` track. Runs only when
the underlying query is loading.

### 2. `ConnectionStatusDot.tsx` pulse — `src/components/terminal/ConnectionStatusDot.tsx`

The 8px global-header dot. Green (connected) is static. Amber
(reconnecting) pulses via `ga-connection-reconnect` keyframes — 1.2s
alpha pulse 0.4 → 1 → 0.4. Red (disconnected) is static. The animation
maps 1:1 onto an externally-driven state — it is not added for
"visual interest".
