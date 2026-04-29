// ORACLE Wave 2 — context provider registry.
//
// Maps each SurfaceKey to its provider. Providers live in their own files
// under `./contextProviders/`. Each provider is a pure function and
// participates in tree-shaking — surfaces the user never visits stay
// out of the runtime working set apart from one symbol reference here.

import type { ContextProviderRegistry, SurfaceKey } from './aiContext';
import { traderNestContextProvider } from './contextProviders/traderNestContext';
import { analystNestContextProvider } from './contextProviders/analystNestContext';
import { storageNestContextProvider } from './contextProviders/storageNestContext';
import { industrialNestContextProvider } from './contextProviders/industrialNestContext';
import { studentNestContextProvider } from './contextProviders/studentNestContext';
import { developerNestContextProvider } from './contextProviders/developerNestContext';
import { everyoneNestContextProvider } from './contextProviders/everyoneNestContext';
import { atlasContextProvider } from './contextProviders/atlasContext';
import { analyticsContextProvider } from './contextProviders/analyticsContext';
import { peregrineContextProvider } from './contextProviders/peregrineContext';
import {
  vaultIndexContextProvider,
  vaultAlexandriaContextProvider,
  vaultLessonContextProvider,
  vaultEntryContextProvider,
  vaultCaseStudyContextProvider,
} from './contextProviders/vaultContext';

export const PROVIDER_REGISTRY: Partial<
  Record<SurfaceKey, ContextProviderRegistry[SurfaceKey]>
> = {
  'trader-nest':       traderNestContextProvider,
  'analyst-nest':      analystNestContextProvider,
  'storage-nest':      storageNestContextProvider,
  'industrial-nest':   industrialNestContextProvider,
  'student-nest':      studentNestContextProvider,
  'developer-nest':    developerNestContextProvider,
  'everyone-nest':     everyoneNestContextProvider,
  'atlas':             atlasContextProvider,
  'analytics':         analyticsContextProvider,
  'peregrine':         peregrineContextProvider,
  'vault-index':       vaultIndexContextProvider,
  'vault-alexandria':  vaultAlexandriaContextProvider,
  'vault-lesson':      vaultLessonContextProvider,
  'vault-entry':       vaultEntryContextProvider,
  'vault-case-study':  vaultCaseStudyContextProvider,
  // 'unknown' has no provider — captureContextSnapshot falls back to a
  // generic snapshot.
};
