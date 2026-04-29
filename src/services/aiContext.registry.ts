// ORACLE Wave 2 — context provider registry.
//
// Maps each SurfaceKey to its provider. Filled in Phase 4 once the
// individual provider modules ship. Keeping this in its own file so
// `aiContext.ts` doesn't have a circular import with the providers
// (each provider imports types from aiContext.ts).

import type { ContextProviderRegistry, SurfaceKey } from './aiContext';

// Phase 4 will replace this empty registry with populated bindings —
// keeping it as `Partial` lets aiContext.ts type-check before the
// providers are added.
export const PROVIDER_REGISTRY: Partial<Record<SurfaceKey, ContextProviderRegistry[SurfaceKey]>> = {};
