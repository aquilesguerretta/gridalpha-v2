"""primitive_lookup tool — parses src/components/terminal/ and serves
FOUNDRY primitive APIs through MCP.

FOUNDRY primitives follow a consistent shape:

    // <One-line summary>
    //
    // Longer description, visual notes, variants list, usage examples...
    //
    // <Component prop="value" />  ← inline JSX in comments

    interface Props { ... }   // or interface XxxProps for variant-per-interface
    export function Xxx(...) { ... }    // a single component
    // or
    export const Xxx = { Variant1, Variant2, ... }   // namespaced primitive

The parser extracts: name (from file + exports), description (leading
comment block), prop interfaces (all `interface Xxx { ... }` blocks),
variants (sub-components in namespaced objects), and usage examples
(JSX in the leading comment block).
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

from fastmcp import FastMCP


# ── Module-level cache (Phase 6 invalidates via watchdog) ───────────
_PRIMITIVE_CACHE: dict[Path, dict[str, "Primitive"]] = {}
_PRIMITIVE_CACHE_MTIME: dict[Path, float] = {}


@dataclass
class PropEntry:
    name: str
    type_: str
    required: bool
    description: str = ""

    def to_dict(self) -> dict[str, Any]:
        return {
            "name": self.name,
            "type": self.type_,
            "required": self.required,
            "description": self.description,
        }


@dataclass
class PropInterface:
    name: str  # "Props", "LineProps", "ChartProps", ...
    props: list[PropEntry] = field(default_factory=list)

    def to_dict(self) -> dict[str, Any]:
        return {
            "interface_name": self.name,
            "props": [p.to_dict() for p in self.props],
        }


@dataclass
class Primitive:
    name: str                       # canonical primitive name (e.g. "Skeleton")
    file_path: Path                 # absolute path on disk
    description: str = ""           # extracted leading comment block
    exports: list[str] = field(default_factory=list)
    variants: list[str] = field(default_factory=list)  # namespaced sub-components
    interfaces: list[PropInterface] = field(default_factory=list)
    usage_examples: list[str] = field(default_factory=list)  # JSX from comments
    default_export: str | None = None

    def to_dict(self, repo_root: Path) -> dict[str, Any]:
        try:
            rel = str(self.file_path.relative_to(repo_root))
        except ValueError:
            rel = str(self.file_path)
        return {
            "name": self.name,
            "file": rel,
            "description": self.description,
            "exports": self.exports,
            "default_export": self.default_export,
            "variants": self.variants,
            "interfaces": [i.to_dict() for i in self.interfaces],
            "usage_examples": self.usage_examples,
            "import_hint": _build_import_hint(self),
        }


def _build_import_hint(p: Primitive) -> str:
    """Produce a plausible TypeScript import line."""
    # Prefer named export matching the canonical name; fall back to default.
    rel_module = f"@/components/terminal/{p.file_path.stem}"
    if p.name in p.exports:
        return f"import {{ {p.name} }} from '{rel_module}'"
    if p.default_export:
        return f"import {p.default_export} from '{rel_module}'"
    if p.exports:
        return f"import {{ {p.exports[0]} }} from '{rel_module}'"
    return f"import {p.name} from '{rel_module}'"


# ── Parser regexes ──────────────────────────────────────────────────

_LEADING_COMMENT_LINE = re.compile(r"^\s*//\s?(.*)$")
_INTERFACE_OPEN = re.compile(r"^\s*interface\s+([A-Z]\w*)\s*\{\s*$")
_INTERFACE_CLOSE = re.compile(r"^\s*\}\s*$")
_PROP_LINE = re.compile(
    r"^\s*"
    r"(?P<name>[a-zA-Z_$][\w$]*)"        # prop name
    r"(?P<opt>\?)?"                       # optional marker
    r"\s*:\s*"
    r"(?P<type>[^;]+?)"                   # type — non-greedy until semicolon
    r"\s*;\s*$"
)
_EXPORT_FN_RE = re.compile(r"^\s*export\s+(default\s+)?function\s+([A-Z]\w*)")
_EXPORT_CONST_RE = re.compile(
    r"^\s*export\s+const\s+([A-Z]\w*)\s*(?::\s*[\w<>,\s]+)?\s*=\s*"
)
_EXPORT_NAMED_BLOCK = re.compile(
    r"^\s*export\s+\{\s*([^}]+)\s*\}"
)
_EXPORT_DEFAULT_RE = re.compile(r"^\s*export\s+default\s+([A-Z]\w*)\s*;?\s*$")
_JSX_USAGE_RE = re.compile(r"<([A-Z]\w*(?:\.[A-Z]\w*)?)\b[^>]*/?>")


def _extract_leading_comment(text: str) -> tuple[str, list[str]]:
    """Return (description, usage_examples) extracted from the leading
    `//` comment block at the top of the file."""
    lines = text.splitlines()
    comment_lines: list[str] = []
    for line in lines:
        stripped = line.strip()
        if not stripped:
            comment_lines.append("")
            continue
        m = _LEADING_COMMENT_LINE.match(line)
        if m:
            comment_lines.append(m.group(1))
        else:
            break

    description = "\n".join(comment_lines).strip()

    # Usage examples — lines that look like JSX tags
    examples: list[str] = []
    for raw in comment_lines:
        s = raw.strip()
        if s.startswith("<") and ("/>" in s or ">" in s):
            # Trim leading "//" remnants and trailing inline comments
            cleaned = re.sub(r"\s+//.*$", "", s).strip()
            if cleaned and cleaned not in examples:
                examples.append(cleaned)

    return description, examples


def _extract_interfaces(text: str) -> list[PropInterface]:
    """Pull out every `interface Foo { ... }` block, keeping JSDoc-style
    comments paired with each prop."""
    lines = text.splitlines()
    interfaces: list[PropInterface] = []
    i = 0
    while i < len(lines):
        m = _INTERFACE_OPEN.match(lines[i])
        if not m:
            i += 1
            continue
        iface = PropInterface(name=m.group(1))
        i += 1
        pending_comment: list[str] = []
        in_block_comment = False
        block_comment_lines: list[str] = []
        while i < len(lines):
            line = lines[i]
            stripped = line.strip()

            # End of interface
            if _INTERFACE_CLOSE.match(line):
                i += 1
                break

            # Block comment /** ... */
            if not in_block_comment and stripped.startswith("/**"):
                in_block_comment = True
                content = stripped[3:].rstrip()
                if content.endswith("*/"):
                    in_block_comment = False
                    content = content[:-2].strip().lstrip("*").strip()
                    pending_comment = [content] if content else []
                else:
                    block_comment_lines = []
                    content = content.lstrip("*").strip()
                    if content:
                        block_comment_lines.append(content)
                i += 1
                continue

            if in_block_comment:
                if stripped.endswith("*/"):
                    content = stripped[:-2].strip()
                    content = content.lstrip("*").strip()
                    if content:
                        block_comment_lines.append(content)
                    pending_comment = block_comment_lines
                    in_block_comment = False
                    block_comment_lines = []
                else:
                    content = stripped.lstrip("*").strip()
                    if content:
                        block_comment_lines.append(content)
                i += 1
                continue

            # Inline `//` comment line
            cm = _LEADING_COMMENT_LINE.match(line)
            if cm:
                pending_comment.append(cm.group(1).strip())
                i += 1
                continue

            # Prop line
            pm = _PROP_LINE.match(line)
            if pm:
                description = " ".join(c.strip() for c in pending_comment if c.strip())
                iface.props.append(
                    PropEntry(
                        name=pm.group("name"),
                        type_=pm.group("type").strip(),
                        required=pm.group("opt") is None,
                        description=description,
                    )
                )
                pending_comment = []
            else:
                # Reset pending comment if we hit a blank/unmatched line
                if not stripped:
                    pending_comment = []
            i += 1
        interfaces.append(iface)
    return interfaces


def _extract_exports(text: str) -> tuple[list[str], str | None, list[str]]:
    """Return (named_exports, default_export, variants).

    `variants` are the keys of any namespaced ``export const Xxx = { ... }``
    object — e.g. Skeleton's Line/Block/Circle/Chart/HeroNumber.
    """
    lines = text.splitlines()
    named: list[str] = []
    default: str | None = None
    variants: list[str] = []

    i = 0
    while i < len(lines):
        line = lines[i]

        # export function Foo
        m = _EXPORT_FN_RE.match(line)
        if m:
            is_default = bool(m.group(1))
            name = m.group(2)
            if is_default and default is None:
                default = name
            else:
                named.append(name)
            i += 1
            continue

        # export default Foo;
        m = _EXPORT_DEFAULT_RE.match(line)
        if m and default is None:
            default = m.group(1)
            i += 1
            continue

        # export const Foo = ...
        m = _EXPORT_CONST_RE.match(line)
        if m:
            name = m.group(1)
            named.append(name)
            # If the next chunk is an object literal, capture its keys
            tail = line[m.end():].strip()
            if tail.startswith("{"):
                # Object literal — accumulate until matching close
                body_lines = [tail]
                depth = tail.count("{") - tail.count("}")
                j = i + 1
                while j < len(lines) and depth > 0:
                    body_lines.append(lines[j])
                    depth += lines[j].count("{") - lines[j].count("}")
                    j += 1
                body = "\n".join(body_lines)
                # Strip the outer braces
                first = body.find("{")
                last = body.rfind("}")
                inner = body[first + 1:last]
                # Parse keys: "Key," or "Key: Mapped,"
                for entry in re.split(r",(?![^{(]*[)}])", inner):
                    e = entry.strip()
                    if not e:
                        continue
                    key_match = re.match(r"^([A-Za-z_$][\w$]*)\s*(?::|,|$)", e)
                    if key_match:
                        key = key_match.group(1)
                        if key and key not in variants:
                            variants.append(key)
                i = j
                continue

        # export { Foo, Bar }
        m = _EXPORT_NAMED_BLOCK.match(line)
        if m:
            for ident in m.group(1).split(","):
                ident = ident.strip().split(" as ")[0].strip()
                if ident and ident[:1].isupper():
                    named.append(ident)
            i += 1
            continue

        i += 1

    # Deduplicate while preserving order
    seen: set[str] = set()
    deduped: list[str] = []
    for n in named:
        if n not in seen:
            seen.add(n)
            deduped.append(n)

    return deduped, default, variants


def _derive_canonical_name(
    file_stem: str, exports: list[str], default_export: str | None
) -> str:
    """Choose the primitive's canonical name."""
    # Prefer the named export that matches the file stem.
    for e in exports:
        if e.lower() == file_stem.lower():
            return e
    # Then any default export.
    if default_export:
        return default_export
    # Then the first named export.
    if exports:
        return exports[0]
    return file_stem


def _parse_primitive_file(path: Path) -> Primitive:
    text = path.read_text(encoding="utf-8")
    description, usage_examples = _extract_leading_comment(text)
    interfaces = _extract_interfaces(text)
    exports, default, variants = _extract_exports(text)
    name = _derive_canonical_name(path.stem, exports, default)
    return Primitive(
        name=name,
        file_path=path,
        description=description,
        exports=exports,
        default_export=default,
        variants=variants,
        interfaces=interfaces,
        usage_examples=usage_examples,
    )


def _load_primitives(terminal_dir: Path) -> dict[str, Primitive]:
    """Walk src/components/terminal/ and parse every .tsx primitive,
    caching the result keyed by directory mtime."""
    if not terminal_dir.is_dir():
        return {}
    # Use the latest mtime across the directory tree as the cache key.
    latest_mtime = max(
        (p.stat().st_mtime for p in terminal_dir.glob("*.tsx")),
        default=0.0,
    )
    if (
        _PRIMITIVE_CACHE_MTIME.get(terminal_dir) == latest_mtime
        and terminal_dir in _PRIMITIVE_CACHE
    ):
        return _PRIMITIVE_CACHE[terminal_dir]

    primitives: dict[str, Primitive] = {}
    for file_path in sorted(terminal_dir.glob("*.tsx")):
        prim = _parse_primitive_file(file_path)
        primitives[prim.name.lower()] = prim

    _PRIMITIVE_CACHE[terminal_dir] = primitives
    _PRIMITIVE_CACHE_MTIME[terminal_dir] = latest_mtime
    return primitives


def register_primitive_lookup(mcp: FastMCP, *, repo_root: Path) -> None:
    """Attach the primitive_lookup tool to the given FastMCP instance."""

    terminal_dir = repo_root / "src" / "components" / "terminal"

    @mcp.tool(
        name="primitive_lookup",
        description=(
            "Look up a FOUNDRY primitive from src/components/terminal/. "
            "Pass the component name (e.g. \"Skeleton\", \"StaleBadge\", "
            "\"HeroNumber\"). Returns the primitive's description, "
            "exports, variants (for namespaced primitives like Skeleton), "
            "every prop interface with prop names + types + descriptions, "
            "JSX usage examples extracted from the leading comment block, "
            "and a TypeScript import hint.\n\n"
            "If `component` is empty or unrecognized, returns the full list "
            "of available primitive names so the caller can pick one."
        ),
    )
    def primitive_lookup(component: str = "") -> dict[str, Any]:
        primitives = _load_primitives(terminal_dir)
        if not primitives:
            return {
                "status": "error",
                "error": f"No primitives found at {terminal_dir}",
            }

        if not component or not component.strip():
            return {
                "status": "ok",
                "query": component,
                "available": sorted(p.name for p in primitives.values()),
                "hint": "Pass one of `available` to primitive_lookup.",
            }

        q = component.strip()
        # Exact case-insensitive
        prim = primitives.get(q.lower())
        if prim is None:
            # Substring fallback
            sub_matches = [
                p for p in primitives.values() if q.lower() in p.name.lower()
            ]
            if len(sub_matches) == 1:
                prim = sub_matches[0]
            elif len(sub_matches) > 1:
                return {
                    "status": "ambiguous",
                    "query": component,
                    "candidates": sorted(p.name for p in sub_matches),
                    "hint": "Refine the query to one of the candidates.",
                }

        if prim is None:
            return {
                "status": "not_found",
                "query": component,
                "available": sorted(p.name for p in primitives.values()),
                "hint": "Pass one of `available` to primitive_lookup.",
            }

        return {
            "status": "ok",
            "query": component,
            "primitive": prim.to_dict(repo_root),
        }
