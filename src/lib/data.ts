// Client-safe data module
// This file provides types and convenience functions that can be used on both client and server
import { Topic, Category, Summary, ImagesMap, Semester, semesters } from './types';

// Re-export types and constants
export type { Topic, Category, Summary, ImagesMap, Semester };
export { semesters };

// For server components, import from './data-server' instead
// For client components, use the useData hook from './use-data'

// Client-side cache (populated by useData hook)
let clientCache: {
  topics: Topic[];
  categories: Category[];
  summary: Summary | null;
  imagesMap: ImagesMap;
} = {
  topics: [],
  categories: [],
  summary: null,
  imagesMap: {}
};

// Set cache (called by useData hook)
export function setClientCache(data: {
  topics: Topic[];
  categories: Category[];
  summary: Summary;
  imagesMap?: ImagesMap;
}) {
  clientCache = {
    topics: data.topics,
    categories: data.categories,
    summary: data.summary,
    imagesMap: data.imagesMap || {}
  };
}

// Get topic count (client-safe, uses cache)
export function getTopicCount(): number {
  return clientCache.summary?.totalTopics || 464;
}

// Get category count (client-safe, uses cache)
export function getCategoryCount(): number {
  return clientCache.categories.length || 15;
}

// Get image count (client-safe, uses cache)
export function getImageCount(): number {
  return clientCache.summary?.downloadedImages || 2985;
}

// Get local image path (client-safe, uses cache)
export function getLocalImagePath(originalUrl: string): string | undefined {
  const cleanUrl = originalUrl.replace(/&amp;/g, '&');
  return clientCache.imagesMap[cleanUrl] || clientCache.imagesMap[originalUrl];
}

// Get topics index (client-safe, uses cache)
export function getTopicsIndex(): Topic[] {
  return clientCache.topics;
}

// Get categories (client-safe, uses cache)
export function getCategories(): Category[] {
  return clientCache.categories;
}

// Get summary (client-safe, uses cache)
export function getSummary(): Summary {
  return clientCache.summary || {
    totalTopics: 0,
    totalImages: 0,
    downloadedImages: 0,
    categories: {},
    processedAt: ''
  };
}

// Get topic by ID (client-safe, uses cache)
export function getTopicById(id: string): Topic | undefined {
  return clientCache.topics.find(t => t.id === id);
}

// Get topic by slug (client-safe, uses cache)
export function getTopicBySlug(slug: string): Topic | undefined {
  return clientCache.topics.find(t => 
    t.id.replace(/-\d+$/, '') === slug || 
    t.filename?.replace('.html', '') === slug ||
    t.id === slug
  );
}

// Search topics (client-safe, uses cache)
export function searchTopics(query: string): Topic[] {
  const lowerQuery = query.toLowerCase();
  return clientCache.topics.filter(t => 
    t.title.toLowerCase().includes(lowerQuery) ||
    t.category.toLowerCase().includes(lowerQuery) ||
    t.description.toLowerCase().includes(lowerQuery)
  );
}

// Get featured topics (client-safe, uses cache)
export function getFeaturedTopics(count: number = 6): Topic[] {
  return clientCache.topics
    .filter(t => t.images && t.images.length > 2 && t.wordCount > 100)
    .sort((a, b) => b.wordCount - a.wordCount)
    .slice(0, count);
}

// Get topics by category (client-safe, uses cache)
export function getTopicsByCategory(categoryId: string): Topic[] {
  const category = clientCache.categories.find(c => c.id === categoryId);
  if (!category) return [];
  return clientCache.topics.filter(t => t.category === category.name);
}

// Get category stats (client-safe, uses cache)
export function getCategoryStats(): { category: Category; topicCount: number }[] {
  return clientCache.categories.map(cat => ({
    category: cat,
    topicCount: cat.count
  }));
}

// Get topics alphabetically (client-safe, uses cache)
export function getTopicsAlphabetically(): Topic[] {
  return [...clientCache.topics].sort((a, b) => a.title.localeCompare(b.title));
}

// For backward compatibility - these will be empty on initial client render
// but will be populated after data fetch
export const topicsIndex = clientCache.topics;
export const categories = clientCache.categories;
export const summary = clientCache.summary;
export const imagesMap = clientCache.imagesMap;
