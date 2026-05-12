# Brief Template — Screenshot Loop Phase Block

This is the canonical phase block any future brief should embed when
the work generates UI. FOUNDRY's Wave 3 brief template references this
file directly. The block is intentionally short and prescriptive — the
shorter it is, the less likely the receiving agent skips it.

## How to embed

In your brief, immediately after the phase that produces visible UI,
add the phase block below verbatim. Adjust the surface name and the
"design rules to check" line to match what the agent just built.

## The block

```markdown
PHASE N — Generate, screenshot, audit, iterate

After implementing the component above:

1. Run /screenshot-loop at 1440x900, 1920x1080, 3440x1440
2. List any visual issues found in each viewport against:
   - the task design intent (the brief above)
   - .claude/skills/gridalpha-terminal/references/terminal-antipatterns.md
   - .claude/skills/gridalpha-terminal/references/terminal-composition.md
   - .claude/skills/gridalpha-terminal/references/terminal-density.md
3. Revise the code to fix every issue identified
4. Run /screenshot-loop again
5. Repeat until all three viewports pass every check
6. Paste the final three screenshots into the turn before you commit
7. Reference them in the commit message

DO NOT declare the phase complete until step 5's condition is met.
```

## Why this block exists

The "Designing with Claude Code" guide observed that text-only feedback
underperforms visual feedback for visual quality. The model reads
markdown rules and generates code, but never sees what its code
renders to. The screenshot loop closes that gap.

Phase blocks that omit this step ship visually-defective UI that
CHROMA has to clean up on a downstream pass. With the block in every
UI-generating brief, the agent catches its own slop in-session.

## When to skip the block

Skip it when the phase does not produce a visible component or visible
state change. Examples where you should NOT include the block:

- Type-only changes (`*.types.ts`, type expansions to existing interfaces)
- Pure-data files (mock data, fixtures, configuration JSON)
- Tooling that has no UI surface (scripts, CLI tools, build steps)
- Backend wiring that doesn't change what the user sees

Include the block when the phase:

- Adds, modifies, or removes any rendered React component
- Changes layout, spacing, color, typography, or motion
- Wires new data into an existing UI surface (the rendered values
  change, and the agent needs to confirm the new content reads
  correctly)
- Adds a new route or destination

## Variant: smaller deliveries

If the phase only modifies a small slice (e.g., adjusts spacing in
one tile), the agent can scope the loop to just that surface — run
the steps but only at the viewport where the change is most visible.
Document the scope choice in step 2 ("Loop scoped to 1440×900 only
because the change is a fixed 1px padding tweak with no responsive
implications").
