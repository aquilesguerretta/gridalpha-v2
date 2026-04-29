// ORACLE Wave 2 — Developer / IPP Nest context provider.

import type { ContextProvider } from '../aiContext';
import {
  PROJECT_PIPELINE,
  INTERCONNECTION_QUEUE,
  POLICY_TRACKER,
} from '@/lib/mock/developer-mock';

export const developerNestContextProvider: ContextProvider = (input) => {
  const zone = input.selectedZone ?? null;

  const totalMw = PROJECT_PIPELINE.reduce((sum, p) => sum + p.mw, 0);
  const stages = [...new Set(PROJECT_PIPELINE.map((p) => p.stage))];

  const description =
    `Developer / IPP Nest. Project pipeline shows ${PROJECT_PIPELINE.length} ` +
    `assets totalling ${Math.round(totalMw)} MW across stages: ${stages.join(', ')}. ` +
    `24-month zone revenue history, ${INTERCONNECTION_QUEUE.length} ` +
    `interconnection-queue entries, binding constraints, PPA benchmarks, ` +
    `and a policy tracker with ${POLICY_TRACKER.length} active items. ` +
    `The user manages siting, financing, and policy intelligence for new builds.`;

  return {
    surfaceLabel: 'Developer Nest',
    selectedZone: zone,
    visibleData: {
      description,
      metrics: {
        projectsInPipeline: PROJECT_PIPELINE.length,
        totalPipelineMw: Math.round(totalMw),
        queueDepth: INTERCONNECTION_QUEUE.length,
        policyItems: POLICY_TRACKER.length,
      },
    },
  };
};
