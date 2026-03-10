'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Topic, Category, Summary } from '@/lib/types';

interface UseDataResult {
  topics: Topic[];
  categories: Category[];
  summary: Summary;
  featured: Topic[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// Global cache for client-side data (persists across renders)
let globalDataCache: {
  topics: Topic[];
  categories: Category[];
  summary: Summary | null;
  featured: Topic[];
  loaded: boolean;
} = {
  topics: [],
  categories: [],
  summary: null,
  featured: [],
  loaded: false
};

let fetchInProgress: boolean = false;
let fetchPromise: Promise<void> | null = null;

export function useData(): UseDataResult {
  const [loading, setLoading] = useState(!globalDataCache.loaded);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const fetchData = useCallback(async () => {
    // Return cached data if already loaded
    if (globalDataCache.loaded) {
      setLoading(false);
      return;
    }

    // Wait for existing fetch if in progress
    if (fetchInProgress && fetchPromise) {
      await fetchPromise;
      return;
    }

    fetchInProgress = true;
    fetchPromise = (async () => {
      try {
        const response = await fetch('/api/data?action=all');
        const result = await response.json();
        
        if (result.success) {
          globalDataCache = {
            topics: result.data.topics || [],
            categories: result.data.categories || [],
            summary: result.data.summary || { totalTopics: 0, totalImages: 0, downloadedImages: 0, categories: {}, processedAt: '' },
            featured: result.data.featured || [],
            loaded: true
          };
        } else {
          throw new Error(result.error || 'Failed to load data');
        }
      } catch (err) {
        if (mountedRef.current) {
          setError(err instanceof Error ? err.message : 'Failed to load data');
        }
      } finally {
        fetchInProgress = false;
        fetchPromise = null;
      }
    })();

    await fetchPromise;
    if (mountedRef.current) {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    
    if (!globalDataCache.loaded && !fetchInProgress) {
      fetchData();
    }

    return () => {
      mountedRef.current = false;
    };
  }, [fetchData]);

  const refetch = useCallback(async () => {
    globalDataCache = {
      topics: [],
      categories: [],
      summary: null,
      featured: [],
      loaded: false
    };
    setLoading(true);
    setError(null);
    await fetchData();
  }, [fetchData]);

  return {
    topics: globalDataCache.topics,
    categories: globalDataCache.categories,
    summary: globalDataCache.summary || { totalTopics: 0, totalImages: 0, downloadedImages: 0, categories: {}, processedAt: '' },
    featured: globalDataCache.featured,
    loading,
    error,
    refetch
  };
}

// Hook for searching topics
export function useSearch() {
  const [results, setResults] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(false);

  const search = useCallback(async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/data?action=search&q=${encodeURIComponent(query)}`);
      const result = await response.json();
      if (result.success) {
        setResults(result.data);
      }
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  return { results, loading, search };
}

// Cache for individual topics
const topicCache = new Map<string, { topic: Topic | null; timestamp: number }>();
const TOPIC_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Hook for getting a single topic (loads only that topic)
export function useTopic(slug: string) {
  const [topic, setTopic] = useState<Topic | null>(() => {
    // Check cache first
    const cached = topicCache.get(slug);
    if (cached && Date.now() - cached.timestamp < TOPIC_CACHE_TTL) {
      return cached.topic;
    }
    return null;
  });
  const [loading, setLoading] = useState(!topicCache.has(slug));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }

    // Check cache
    const cached = topicCache.get(slug);
    if (cached && Date.now() - cached.timestamp < TOPIC_CACHE_TTL) {
      setTopic(cached.topic);
      setLoading(false);
      return;
    }

    const fetchTopic = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/topic/${slug}`);
        const result = await response.json();
        if (result.success) {
          setTopic(result.data);
          topicCache.set(slug, { topic: result.data, timestamp: Date.now() });
        } else {
          setError(result.error || 'Topic not found');
          topicCache.set(slug, { topic: null, timestamp: Date.now() });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load topic');
      } finally {
        setLoading(false);
      }
    };

    fetchTopic();
  }, [slug]);

  return { topic, loading, error };
}

// Convenience functions that use cached data
export function getTopicCount(): number {
  return globalDataCache.summary?.totalTopics || 464;
}

export function getCategoryCount(): number {
  return globalDataCache.categories.length || 15;
}

export function getImageCount(): number {
  return globalDataCache.summary?.downloadedImages || 2985;
}
