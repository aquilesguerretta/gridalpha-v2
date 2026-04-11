export interface NewsItem {
  id:          string;
  source:      string;
  sourceFull:  string;
  sourceColor: string;
  priority:    'CRITICAL' | 'HIGH' | 'NORMAL' | 'INFO';
  title:       string;
  summary:     string;
  url:         string;
  category:    string;
  timeAgo:     string;
  publishedAt: string;
  videoId:     string | null;
  thumbnail:   string | null;
  contentType: 'article' | 'video';
}

import { useState, useEffect, useCallback } from 'react';

const API_BASE = import.meta.env.VITE_API_URL
  ?? 'https://gridalpha-v2-production.up.railway.app';

export function useNewsData(source?: string, category?: string) {
  const [items,     setItems]     = useState<NewsItem[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ limit: '40' });
      if (source)   params.set('source', source);
      if (category) params.set('category', category);
      const res  = await fetch(`${API_BASE}/api/news/feed?${params}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setItems(data.items);
      setLastFetch(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fetch failed');
    } finally {
      setLoading(false);
    }
  }, [source, category]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchData]);

  return { items, loading, error, lastFetch, refetch: fetchData };
}
