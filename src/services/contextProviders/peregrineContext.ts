// ORACLE Wave 2 — Peregrine intelligence-feed context provider.
//
// Peregrine is the live news/intelligence destination. The article state
// lives inside PeregrineFullPage's own component tree — when an article is
// open, callers (e.g. ArticleAnalysis's InlineAITrigger) can pass article
// metadata via subContext.

import type { ContextProvider } from '../aiContext';

export const peregrineContextProvider: ContextProvider = (input) => {
  const zone = input.selectedZone ?? null;

  const description =
    `Peregrine intelligence feed. Live RSS from PJM operator notices, FERC ` +
    `filings, EIA releases, and curated energy press. The user is scanning ` +
    `headlines, may have an article open in the reader, and may be using ` +
    `the article-analysis layer to extract market implications.${
      zone ? ` Zone-of-interest filter: ${zone}.` : ''
    }`;

  return {
    surfaceLabel: 'Peregrine',
    selectedZone: zone,
    visibleData: {
      description,
      metrics: zone ? { zoneFilter: zone } : undefined,
    },
  };
};
