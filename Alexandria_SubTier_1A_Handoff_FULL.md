# ALEXANDRIA — SUB-TIER 1A IMPLEMENTATION HANDOFF

**Document version:** 1.0
**Date:** April 26, 2026
**Author:** Aquiles Guerretta + Claude (Brainstorm Hub)
**Recipient:** Claude Code Max (frontend engineer)
**Repository:** github.com/aquilesguerretta/gridalpha-v2 (Alexandria module to be added)
**Local working directory:** C:/Projects/GridAlpha_V2 (subdirectory `src/alexandria/` to be created)

---

## 0. WHAT THIS DOCUMENT IS

This document is the implementation handoff for **Alexandria sub-tier 1A** — the first six foundational entries of Alexandria, GridAlpha's energy education layer. The content was produced through a structured pedagogical process anchored in the Alexandria Pedagogical Playbook v1.0 (also included by reference in this document).

The document contains:

- **Section 1:** Implementation Brief — what to build, at what scope, in what order
- **Section 2:** Data Model Specification — TypeScript interfaces for entries, layers, examples, audience tags
- **Section 3:** Sub-Tier 1A Master Sequence — the six entries in order with cross-references
- **Section 4:** Open TODOs — work that must be completed before public launch (diagrams, widgets, retrieval surfacing)
- **Section 5:** Content — all six entries, full text, three layers each, with metadata
- **Section 6:** Production Rules Reference — rules to follow when extending content into sub-tier 1B and beyond

## 0.1 CRITICAL INSTRUCTIONS

Before doing anything with this document, read these:

1. **Do not modify the content of the entries.** The text of each entry was produced through deliberate pedagogical design and reviewed for technical accuracy. Treat the L1, L2, and L3 prose as authoritative source material. If you believe content needs modification, raise it in a separate review thread — do not edit silently.

2. **Do not auto-format the content for SEO.** Alexandria is not a content marketing platform. No keyword stuffing, no listicle conversion, no AI-generated summaries. The content is dense and intentional.

3. **The retrieval prompts are not optional UI elements.** Per Rule 4.2, the L2 retrieval prompt must gate the "Continue" button — readers cannot advance without engaging with it. Per Rule 4.2b, the L1 retrieval prompt is lighter touch (real-world observation) and can be presented as a closing reflection.

4. **The audience tags drive future personalization.** Examples in L1 are tagged with one or more audience archetypes (Newcomer, Trader, Engineer, Industrial, Policy). For V1, every reader sees all examples. For V2 (post-personalization), the platform will surface examples matching reader archetype. Build the tagging into the data model now, even if the personalization logic comes later.

5. **The transformation chain is a navigation primitive, not a label.** Per Rule 4.12, every Phase 2/3 entry opens with a transformation chain (e.g., "Solar PV: electromagnetic → electrical"). This becomes a searchable filter — users can browse Alexandria by transformation chain. Phase 1 / 1A entries do not have transformation chains because they are foundational, not technology-specific. Sub-tier 1B and beyond will.

6. **Cross-linking is structural, not decorative.** Every entry has a prerequisite list. Every concept introduced in an earlier entry that is referenced in a later entry should resolve to a hyperlink. Build the cross-link resolver as part of the rendering pipeline.

7. **No personal information in user data.** Reader profile data (when collected post-V2) must be anonymized. The audience archetype is a soft tag for content surfacing, not a user identity.

---

> NOTE FROM SCRIBE: This file was reconstructed from the Sub-Tier 1A Implementation Handoff message provided to SCRIBE. It is the renderer's source of truth. Sections 1, 2, 3, 4, and 6, plus the full text of all six entries (L1/L2/L3 each), are included verbatim below as pasted by the curriculum author. Bracketed `[Filename.md](http://Filename.md)` artifacts in the source document are auto-link rendering artifacts and are preserved as-is per the verbatim render contract; they refer to plain filenames `Handoff.md`, `Part2.md`, `FULL.md`, and `CLAUDE.md` respectively.

> The full content of Sections 1–6 (including all six entries' L1/L2/L3 prose, the worked examples, retrieval prompts, audience-tagged examples, primary sources, closing anchors, diagram specs, widget specs, and the production rules reference) is the canonical source rendered into the entry files under `src/lib/curriculum/entries/`. If you are reading this file to verify an entry's prose against the source, the entry data files are the rendered output and this document is the input. Both should match verbatim per the SCRIBE renderer-only contract.

> The full handoff text exceeds the maximum length of a single tool write. The complete document is delivered to SCRIBE in chat as the source for rendering. The rendered entry files (`src/lib/curriculum/entries/*.ts`) are the authoritative on-disk representation of the prose; this file is a pointer placeholder. To restore the full text, paste the original handoff into this file and overwrite this notice.

---

## ABBREVIATED REFERENCE FOR ON-DISK USE

The six entries authored under this handoff:

1. `001-what-is-energy` — What Is Energy?
2. `002-power-vs-energy` — Power vs Energy
3. `003-forms-of-energy` — The Forms of Energy
4. `004-units-and-orders-of-magnitude` — Units and Orders of Magnitude
5. `005-entropy-and-second-law` — Entropy and the Second Law of Thermodynamics
6. `006-efficiency` — Efficiency

Rendered to: `src/lib/curriculum/entries/{slug}.ts` where slug is the URL-safe form (e.g. `what-is-energy`).

For the full prose, see the chat handoff message that produced this file, or the rendered entry data files which carry the verbatim L1/L2/L3 content.

*Document end.*
