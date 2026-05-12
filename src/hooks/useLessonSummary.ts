// ORACLE Wave 3 — lesson summary hook.
//
// Generates and caches an AI summary per (entrySlug, layer). The cache
// lives in gradingStore.lessonSummaries — survives reloads. The hook
// exposes { summary, isGenerating, error, generate, regenerate }.

import { useCallback, useState } from 'react';
import { useGradingStore } from '@/stores/gradingStore';
import { generateLessonSummary } from '@/services/lessonSummary/generateSummary';
import type { LayerKey } from '@/lib/types/curriculum';
import type { LessonSummary } from '@/lib/types/grading';

export interface UseLessonSummary {
  summary: LessonSummary | undefined;
  isGenerating: boolean;
  error: string | null;
  /** Generate a fresh summary if none cached. No-op if one exists. */
  generate: () => Promise<void>;
  /** Force regeneration regardless of cache. */
  regenerate: () => Promise<void>;
}

export function useLessonSummary(
  entrySlug: string,
  layer: LayerKey,
): UseLessonSummary {
  const key = `${entrySlug}:${layer}`;
  const summary = useGradingStore((s) => s.lessonSummaries[key]);
  const setLessonSummary = useGradingStore((s) => s.setLessonSummary);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const callApi = useCallback(async () => {
    setError(null);
    setIsGenerating(true);
    try {
      const result = await generateLessonSummary({ entrySlug, layer });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      const record: LessonSummary = {
        text:        result.text,
        generatedAt: new Date().toISOString(),
        layer,
        entrySlug,
      };
      setLessonSummary(key, record);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown summary error.');
    } finally {
      setIsGenerating(false);
    }
  }, [entrySlug, layer, key, setLessonSummary]);

  const generate = useCallback(async () => {
    if (summary || isGenerating) return;
    await callApi();
  }, [summary, isGenerating, callApi]);

  const regenerate = useCallback(async () => {
    if (isGenerating) return;
    await callApi();
  }, [isGenerating, callApi]);

  return { summary, isGenerating, error, generate, regenerate };
}
